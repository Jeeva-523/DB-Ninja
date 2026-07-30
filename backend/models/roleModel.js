const { pool } = require('../config/db');

/**
 * Role Data Access Layer
 */
class RoleModel {
  static async findAll() {
    const [rows] = await pool.execute('SELECT * FROM roles ORDER BY id ASC');
    return rows;
  }

  static async findByName(name) {
    const [rows] = await pool.execute('SELECT * FROM roles WHERE name = ? LIMIT 1', [name]);
    return rows[0] || null;
  }
}

module.exports = RoleModel;
