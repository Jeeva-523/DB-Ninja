const { pool } = require('../config/db');

/**
 * System Settings & Audit Logs Data Access Layer
 */
class SettingModel {
  /**
   * Get Active System Settings
   */
  static async getSettings() {
    try {
      const [rows] = await pool.execute('SELECT * FROM settings WHERE id = 1 LIMIT 1');
      return rows[0] || {
        store_name: 'ShopMaster Enterprise',
        support_email: 'support@shopmaster.com',
        currency: 'USD',
        tax_rate: 8.50,
        shipping_fee: 15.00
      };
    } catch (err) {
      return {
        store_name: 'ShopMaster Enterprise',
        support_email: 'support@shopmaster.com',
        currency: 'USD',
        tax_rate: 8.50,
        shipping_fee: 15.00
      };
    }
  }

  /**
   * Update System Settings
   */
  static async updateSettings({ storeName, supportEmail, currency, taxRate, shippingFee }) {
    const sql = `
      INSERT INTO settings (id, store_name, support_email, currency, tax_rate, shipping_fee)
      VALUES (1, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        store_name = VALUES(store_name),
        support_email = VALUES(support_email),
        currency = VALUES(currency),
        tax_rate = VALUES(tax_rate),
        shipping_fee = VALUES(shipping_fee)
    `;
    await pool.execute(sql, [storeName, supportEmail, currency || 'USD', taxRate || 8.50, shippingFee || 15.00]);
  }

  /**
   * Fetch System Inventory Audit Logs
   */
  static async getAuditLogs({ page = 1, limit = 15 }) {
    const offset = (page - 1) * limit;
    try {
      const countSql = `SELECT COUNT(*) AS total FROM inventory_logs`;
      const [countRows] = await pool.execute(countSql);
      const total = countRows[0]?.total || 0;

      const sql = `
        SELECT 
          il.id, il.product_id, il.change_type, il.quantity_changed, il.new_stock_quantity, il.note, il.created_at,
          p.title AS product_name, p.sku,
          u.name AS user_name
        FROM inventory_logs il
        LEFT JOIN products p ON il.product_id = p.id
        LEFT JOIN users u ON il.user_id = u.id
        ORDER BY il.id DESC
        LIMIT ? OFFSET ?
      `;
      const [rows] = await pool.execute(sql, [String(limit), String(offset)]);

      return {
        logs: rows,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (err) {
      return {
        logs: [],
        pagination: { total: 0, page: 1, limit, totalPages: 1 }
      };
    }
  }
}

module.exports = SettingModel;
