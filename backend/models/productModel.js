const { pool } = require('../config/db');

/**
 * Product & Inventory Data Access Model (Prepared Statements & Transactions)
 */
class ProductModel {
  /**
   * Fetch Paginated Products with Search, Category Filter, and Sorting
   */
  static async findAll({ page = 1, limit = 10, search = '', categoryId = '', lowStock = false, sortBy = 'id', sortOrder = 'DESC' }) {
    const offset = (page - 1) * limit;
    let whereClauses = [];
    let params = [];

    if (search) {
      whereClauses.push('(p.title LIKE ? OR p.sku LIKE ? OR p.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (categoryId) {
      whereClauses.push('p.category_id = ?');
      params.push(categoryId);
    }

    if (lowStock) {
      whereClauses.push('p.stock_quantity <= p.low_stock_threshold');
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Allowed Sorting Columns (Sanitization against SQL Injection)
    const allowedSortColumns = ['id', 'title', 'price', 'stock_quantity', 'created_at'];
    const safeSortBy = allowedSortColumns.includes(sortBy) ? `p.${sortBy}` : 'p.id';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Count Query
    const countSql = `SELECT COUNT(*) AS total FROM products p ${whereSql}`;
    const [countRows] = await pool.execute(countSql, params);
    const total = countRows[0]?.total || 0;

    // Data Query
    const sql = `
      SELECT 
        p.id, p.category_id, p.title, p.slug, p.sku, p.description, p.price, p.sale_price, p.cost_price,
        p.stock_quantity, p.low_stock_threshold, p.image_url, p.is_active, p.created_at, p.updated_at,
        c.name AS category_name
      FROM products p
      INNER JOIN categories c ON p.category_id = c.id
      ${whereSql}
      ORDER BY ${safeSortBy} ${safeSortOrder}
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.execute(sql, [...params, String(limit), String(offset)]);

    return {
      products: rows,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Find Product by ID
   */
  static async findById(id) {
    const sql = `
      SELECT p.*, c.name AS category_name
      FROM products p
      INNER JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
      LIMIT 1
    `;
    const [rows] = await pool.execute(sql, [id]);
    return rows[0] || null;
  }

  /**
   * Find Product by SKU
   */
  static async findBySku(sku) {
    const sql = `SELECT * FROM products WHERE sku = ? LIMIT 1`;
    const [rows] = await pool.execute(sql, [sku]);
    return rows[0] || null;
  }

  /**
   * Find Product by Slug
   */
  static async findBySlug(slug) {
    const sql = `SELECT * FROM products WHERE slug = ? LIMIT 1`;
    const [rows] = await pool.execute(sql, [slug]);
    return rows[0] || null;
  }

  /**
   * Create Product (with initial inventory log)
   */
  static async create(productData, userId) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const sql = `
        INSERT INTO products (category_id, title, slug, sku, description, price, sale_price, cost_price, stock_quantity, low_stock_threshold, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const [result] = await connection.execute(sql, [
        productData.categoryId,
        productData.title,
        productData.slug,
        productData.sku,
        productData.description || null,
        productData.price,
        productData.salePrice || null,
        productData.costPrice || null,
        productData.stockQuantity || 0,
        productData.lowStockThreshold || 10,
        productData.imageUrl || null
      ]);

      const productId = result.insertId;

      // Log initial inventory
      if (productData.stockQuantity > 0) {
        const logSql = `
          INSERT INTO inventory_logs (product_id, user_id, change_type, quantity_changed, new_stock_quantity, note)
          VALUES (?, ?, 'restock', ?, ?, 'Initial inventory deposit')
        `;
        await connection.execute(logSql, [productId, userId || null, productData.stockQuantity, productData.stockQuantity]);
      }

      await connection.commit();
      return productId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Update Product
   */
  static async update(id, productData) {
    const sql = `
      UPDATE products
      SET category_id = ?, title = ?, slug = ?, sku = ?, description = ?, price = ?, sale_price = ?, cost_price = ?, low_stock_threshold = ?, image_url = ?, is_active = ?
      WHERE id = ?
    `;
    await pool.execute(sql, [
      productData.categoryId,
      productData.title,
      productData.slug,
      productData.sku,
      productData.description || null,
      productData.price,
      productData.salePrice || null,
      productData.costPrice || null,
      productData.lowStockThreshold || 10,
      productData.imageUrl,
      productData.isActive !== undefined ? productData.isActive : 1,
      id
    ]);
  }

  /**
   * Transactional Stock Level Adjustment & Audit Log
   */
  static async adjustStock(id, { quantityChanged, changeType, note, userId }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Lock and fetch current stock
      const [rows] = await connection.execute('SELECT stock_quantity FROM products WHERE id = ? FOR UPDATE', [id]);
      if (rows.length === 0) throw new Error('Product not found');

      const currentStock = rows[0].stock_quantity;
      const newStock = Math.max(0, currentStock + Number(quantityChanged));

      // 2. Update Product Stock Quantity
      await connection.execute('UPDATE products SET stock_quantity = ? WHERE id = ?', [newStock, id]);

      // 3. Write Inventory Audit Log
      const logSql = `
        INSERT INTO inventory_logs (product_id, user_id, change_type, quantity_changed, new_stock_quantity, note)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      await connection.execute(logSql, [id, userId || null, changeType || 'adjustment', quantityChanged, newStock, note || 'Manual stock adjustment']);

      await connection.commit();
      return newStock;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Delete Product
   */
  static async delete(id) {
    const sql = `DELETE FROM products WHERE id = ?`;
    await pool.execute(sql, [id]);
  }
}

module.exports = ProductModel;
