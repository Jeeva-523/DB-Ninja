const { pool } = require('../config/db');

/**
 * Order Processing & Fulfillment Data Access Model (SQL Transactions)
 */
class OrderModel {
  /**
   * Fetch Paginated Orders with Search & Status Filters
   */
  static async findAll({ page = 1, limit = 10, search = '', status = '' }) {
    const offset = (page - 1) * limit;
    let whereClauses = [];
    let params = [];

    if (search) {
      whereClauses.push('(o.id = ? OR u.name LIKE ? OR u.email LIKE ?)');
      params.push(isNaN(search) ? -1 : search, `%${search}%`, `%${search}%`);
    }

    if (status) {
      whereClauses.push('o.status = ?');
      params.push(status);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Count Total Orders
    const countSql = `
      SELECT COUNT(*) AS total
      FROM orders o
      INNER JOIN users u ON o.customer_id = u.id
      ${whereSql}
    `;
    const [countRows] = await pool.execute(countSql, params);
    const total = countRows[0]?.total || 0;

    // Fetch Orders List
    const sql = `
      SELECT 
        o.id, o.customer_id, o.status, o.subtotal, o.tax_amount, o.shipping_cost, o.total_amount,
        o.payment_status, o.notes, o.created_at,
        u.name AS customer_name, u.email AS customer_email
      FROM orders o
      INNER JOIN users u ON o.customer_id = u.id
      ${whereSql}
      ORDER BY o.id DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.execute(sql, [...params, String(limit), String(offset)]);

    return {
      orders: rows,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Find Order Details with Items Array
   */
  static async findById(id) {
    const orderSql = `
      SELECT 
        o.*,
        u.name AS customer_name, u.email AS customer_email,
        a.address_line1, a.city, a.state, a.postal_code, a.country
      FROM orders o
      INNER JOIN users u ON o.customer_id = u.id
      LEFT JOIN addresses a ON o.shipping_address_id = a.id
      WHERE o.id = ?
      LIMIT 1
    `;
    const [orderRows] = await pool.execute(orderSql, [id]);
    if (orderRows.length === 0) return null;

    const order = orderRows[0];

    // Fetch Order Line Items
    const itemsSql = `
      SELECT oi.*, p.image_url
      FROM order_items oi
      INNER JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `;
    const [itemRows] = await pool.execute(itemsSql, [id]);

    order.items = itemRows;
    return order;
  }

  /**
   * Transactional Order Creation (Validates Stock, Deducts Inventory, Saves Order & Line Items)
   */
  static async createOrder({ customerId, shippingAddressId, items, shippingCost = 0, taxAmount = 0, notes }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      let subtotal = 0;
      const verifiedItems = [];

      // 1. Lock and verify products stock
      for (const item of items) {
        const [prodRows] = await connection.execute('SELECT * FROM products WHERE id = ? FOR UPDATE', [item.productId]);
        if (prodRows.length === 0) {
          throw new Error(`Product ID ${item.productId} not found`);
        }

        const product = prodRows[0];
        if (product.stock_quantity < item.quantity) {
          throw new Error(`Insufficient stock for product '${product.title}'. Requested: ${item.quantity}, Available: ${product.stock_quantity}`);
        }

        const itemPrice = product.sale_price ? Number(product.sale_price) : Number(product.price);
        const itemTotal = itemPrice * item.quantity;
        subtotal += itemTotal;

        verifiedItems.push({
          productId: product.id,
          productName: product.title,
          sku: product.sku,
          unitPrice: itemPrice,
          quantity: item.quantity,
          totalPrice: itemTotal
        });

        // Deduct Inventory
        const newStock = product.stock_quantity - item.quantity;
        await connection.execute('UPDATE products SET stock_quantity = ? WHERE id = ?', [newStock, product.id]);

        // Write Inventory Audit Log
        await connection.execute(
          `INSERT INTO inventory_logs (product_id, change_type, quantity_changed, new_stock_quantity, note)
           VALUES (?, 'sale', ?, ?, 'Order placement inventory deduction')`,
          [product.id, -item.quantity, newStock]
        );
      }

      const totalAmount = subtotal + Number(taxAmount) + Number(shippingCost);

      // 2. Insert Order Record
      const orderSql = `
        INSERT INTO orders (customer_id, shipping_address_id, status, subtotal, tax_amount, shipping_cost, total_amount, payment_status, notes)
        VALUES (?, ?, 'pending', ?, ?, ?, ?, 'unpaid', ?)
      `;
      const [orderResult] = await connection.execute(orderSql, [
        customerId,
        shippingAddressId || null,
        subtotal,
        taxAmount,
        shippingCost,
        totalAmount,
        notes || null
      ]);

      const orderId = orderResult.insertId;

      // 3. Insert Line Items
      for (const vItem of verifiedItems) {
        const itemSql = `
          INSERT INTO order_items (order_id, product_id, product_name, sku, unit_price, quantity, total_price)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        await connection.execute(itemSql, [
          orderId,
          vItem.productId,
          vItem.productName,
          vItem.sku,
          vItem.unitPrice,
          vItem.quantity,
          vItem.totalPrice
        ]);
      }

      await connection.commit();
      return orderId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Update Order Status (With transactional stock restoration on cancellation)
   */
  static async updateStatus(orderId, newStatus) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [orderRows] = await connection.execute('SELECT * FROM orders WHERE id = ? FOR UPDATE', [orderId]);
      if (orderRows.length === 0) throw new Error('Order not found');

      const currentOrder = orderRows[0];
      const previousStatus = currentOrder.status;

      // Update Order Status
      await connection.execute('UPDATE orders SET status = ? WHERE id = ?', [newStatus, orderId]);

      // If transitioning to 'cancelled' from a active state, restore inventory
      if (newStatus === 'cancelled' && previousStatus !== 'cancelled') {
        const [items] = await connection.execute('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
        for (const item of items) {
          const [prodRows] = await connection.execute('SELECT stock_quantity FROM products WHERE id = ? FOR UPDATE', [item.product_id]);
          if (prodRows.length > 0) {
            const newStock = prodRows[0].stock_quantity + item.quantity;
            await connection.execute('UPDATE products SET stock_quantity = ? WHERE id = ?', [newStock, item.product_id]);
            await connection.execute(
              `INSERT INTO inventory_logs (product_id, change_type, quantity_changed, new_stock_quantity, note)
               VALUES (?, 'return', ?, ?, 'Order cancellation inventory restoration')`,
              [item.product_id, item.quantity, newStock]
            );
          }
        }
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = OrderModel;
