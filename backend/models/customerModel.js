const { pool } = require('../config/db');

/**
 * Customer & Address Data Access Layer (SQL Prepared Statements)
 */
class CustomerModel {
  /**
   * Fetch Paginated Customers with Order Count & Lifetime Revenue Aggregation
   */
  static async findAll({ page = 1, limit = 10, search = '', status = '' }) {
    const offset = (page - 1) * limit;
    let whereClauses = ["r.name = 'customer'"];
    let params = [];

    if (search) {
      whereClauses.push('(u.name LIKE ? OR u.email LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (status === 'active') {
      whereClauses.push('u.is_active = 1');
    } else if (status === 'blocked') {
      whereClauses.push('u.is_active = 0');
    }

    const whereSql = `WHERE ${whereClauses.join(' AND ')}`;

    // Count Total Customers
    const countSql = `
      SELECT COUNT(*) AS total
      FROM users u
      INNER JOIN roles r ON u.role_id = r.id
      ${whereSql}
    `;
    const [countRows] = await pool.execute(countSql, params);
    const total = countRows[0]?.total || 0;

    // Fetch Paginated Customer List with Joined Aggregated Orders Data
    const sql = `
      SELECT 
        u.id, u.name, u.email, u.is_active, u.created_at, u.last_login_at,
        COUNT(o.id) AS total_orders,
        COALESCE(SUM(o.total_amount), 0) AS lifetime_spend
      FROM users u
      INNER JOIN roles r ON u.role_id = r.id
      LEFT JOIN orders o ON u.id = o.customer_id
      ${whereSql}
      GROUP BY u.id
      ORDER BY u.id DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.execute(sql, [...params, String(limit), String(offset)]);

    return {
      customers: rows,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Find Customer by ID
   */
  static async findById(id) {
    const sql = `
      SELECT 
        u.id, u.name, u.email, u.is_active, u.created_at, u.last_login_at,
        COUNT(o.id) AS total_orders,
        COALESCE(SUM(o.total_amount), 0) AS lifetime_spend
      FROM users u
      INNER JOIN roles r ON u.role_id = r.id
      LEFT JOIN orders o ON u.id = o.customer_id
      WHERE u.id = ? AND r.name = 'customer'
      GROUP BY u.id
      LIMIT 1
    `;
    const [rows] = await pool.execute(sql, [id]);
    return rows[0] || null;
  }

  /**
   * Toggle Customer Active/Blocked Status
   */
  static async toggleStatus(id, isActive) {
    const sql = `UPDATE users SET is_active = ? WHERE id = ?`;
    await pool.execute(sql, [isActive ? 1 : 0, id]);
  }

  /**
   * Get Addresses for Customer
   */
  static async getAddresses(userId) {
    const sql = `SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC`;
    const [rows] = await pool.execute(sql, [userId]);
    return rows;
  }

  /**
   * Add Customer Address
   */
  static async addAddress(userId, addressData) {
    const sql = `
      INSERT INTO addresses (user_id, address_type, address_line1, address_line2, city, state, postal_code, country, is_default)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(sql, [
      userId,
      addressData.addressType || 'shipping',
      addressData.addressLine1,
      addressData.addressLine2 || null,
      addressData.city,
      addressData.state,
      addressData.postalCode,
      addressData.country || 'USA',
      addressData.isDefault ? 1 : 0
    ]);
    return result.insertId;
  }
}

module.exports = CustomerModel;
