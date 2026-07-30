const { pool } = require('../config/db');

/**
 * Payment & Transaction Data Access Model
 */
class PaymentModel {
  /**
   * Fetch Paginated Payment Transactions
   */
  static async findAll({ page = 1, limit = 10, search = '', status = '' }) {
    const offset = (page - 1) * limit;
    let whereClauses = [];
    let params = [];

    if (search) {
      whereClauses.push('(p.transaction_id LIKE ? OR p.order_id = ? OR u.name LIKE ?)');
      params.push(`%${search}%`, isNaN(search) ? -1 : search, `%${search}%`);
    }

    if (status) {
      whereClauses.push('p.status = ?');
      params.push(status);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Count Query
    const countSql = `
      SELECT COUNT(*) AS total
      FROM payments p
      INNER JOIN users u ON p.user_id = u.id
      ${whereSql}
    `;
    const [countRows] = await pool.execute(countSql, params);
    const total = countRows[0]?.total || 0;

    // Data Query
    const sql = `
      SELECT 
        p.id, p.order_id, p.user_id, p.payment_method, p.transaction_id, p.amount,
        p.currency, p.status, p.payment_gateway, p.created_at,
        u.name AS payer_name, u.email AS payer_email
      FROM payments p
      INNER JOIN users u ON p.user_id = u.id
      ${whereSql}
      ORDER BY p.id DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.execute(sql, [...params, String(limit), String(offset)]);

    return {
      payments: rows,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Find Payment by ID
   */
  static async findById(id) {
    const sql = `
      SELECT p.*, u.name AS payer_name, u.email AS payer_email
      FROM payments p
      INNER JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
      LIMIT 1
    `;
    const [rows] = await pool.execute(sql, [id]);
    return rows[0] || null;
  }

  /**
   * Transactional Payment Processing
   */
  static async processPayment({ orderId, userId, paymentMethod, transactionId, amount, gateway, rawResponse }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Verify Order exists
      const [orderRows] = await connection.execute('SELECT * FROM orders WHERE id = ? FOR UPDATE', [orderId]);
      if (orderRows.length === 0) throw new Error('Order not found');

      // 2. Insert Payment Record
      const paySql = `
        INSERT INTO payments (order_id, user_id, payment_method, transaction_id, amount, status, payment_gateway, raw_response)
        VALUES (?, ?, ?, ?, ?, 'completed', ?, ?)
      `;
      const [payResult] = await connection.execute(paySql, [
        orderId,
        userId,
        paymentMethod || 'credit_card',
        transactionId,
        amount,
        gateway || 'stripe',
        rawResponse ? JSON.stringify(rawResponse) : null
      ]);

      // 3. Update Order Payment Status to 'paid'
      await connection.execute("UPDATE orders SET payment_status = 'paid' WHERE id = ?", [orderId]);

      await connection.commit();
      return payResult.insertId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Transactional Refund Processing
   */
  static async issueRefund(paymentId) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [payRows] = await connection.execute('SELECT * FROM payments WHERE id = ? FOR UPDATE', [paymentId]);
      if (payRows.length === 0) throw new Error('Payment transaction not found');

      const payment = payRows[0];
      if (payment.status === 'refunded') throw new Error('Payment has already been refunded');

      // 1. Update Payment status
      await connection.execute("UPDATE payments SET status = 'refunded' WHERE id = ?", [paymentId]);

      // 2. Update Order payment status
      await connection.execute("UPDATE orders SET payment_status = 'refunded' WHERE id = ?", [payment.order_id]);

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = PaymentModel;
