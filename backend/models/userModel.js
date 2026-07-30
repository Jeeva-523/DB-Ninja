const { pool } = require('../config/db');

/**
 * User Data Access Layer (SQL Prepared Statements)
 */
class UserModel {
  /**
   * Find User by Email (with joined role information)
   */
  static async findByEmail(email) {
    const sql = `
      SELECT u.id, u.name, u.email, u.password_hash, u.is_active, u.role_id, r.name as role_name
      FROM users u
      INNER JOIN roles r ON u.role_id = r.id
      WHERE u.email = ?
      LIMIT 1
    `;
    const [rows] = await pool.execute(sql, [email]);
    return rows[0] || null;
  }

  /**
   * Find User by ID
   */
  static async findById(id) {
    const sql = `
      SELECT u.id, u.name, u.email, u.is_active, u.last_login_at, u.created_at, r.id as role_id, r.name as role_name
      FROM users u
      INNER JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
      LIMIT 1
    `;
    const [rows] = await pool.execute(sql, [id]);
    return rows[0] || null;
  }

  /**
   * Create New User
   */
  static async create({ roleId, name, email, passwordHash }) {
    const sql = `
      INSERT INTO users (role_id, name, email, password_hash)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await pool.execute(sql, [roleId, name, email, passwordHash]);
    return result.insertId;
  }

  /**
   * Update User Last Login Timestamp
   */
  static async updateLastLogin(id) {
    const sql = `UPDATE users SET last_login_at = NOW() WHERE id = ?`;
    await pool.execute(sql, [id]);
  }

  /**
   * Store Refresh Token
   */
  static async saveRefreshToken(userId, token, expiresAt) {
    const sql = `
      INSERT INTO refresh_tokens (user_id, token, expires_at)
      VALUES (?, ?, ?)
    `;
    await pool.execute(sql, [userId, token, expiresAt]);
  }

  /**
   * Find Refresh Token
   */
  static async findRefreshToken(token) {
    const sql = `SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW() LIMIT 1`;
    const [rows] = await pool.execute(sql, [token]);
    return rows[0] || null;
  }

  /**
   * Delete Refresh Token (Logout)
   */
  static async deleteRefreshToken(token) {
    const sql = `DELETE FROM refresh_tokens WHERE token = ?`;
    await pool.execute(sql, [token]);
  }
}

module.exports = UserModel;
