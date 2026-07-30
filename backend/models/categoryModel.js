const { pool } = require('../config/db');

/**
 * Category Data Access Model (SQL Prepared Statements)
 */
class CategoryModel {
  /**
   * Fetch Paginated Categories with Search and Status Filter
   */
  static async findAll({ page = 1, limit = 10, search = '', status = '' }) {
    const offset = (page - 1) * limit;
    let whereClauses = [];
    let params = [];

    if (search) {
      whereClauses.push('(c.name LIKE ? OR c.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (status === 'active') {
      whereClauses.push('c.is_active = 1');
    } else if (status === 'inactive') {
      whereClauses.push('c.is_active = 0');
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Count Total Records
    const countSql = `SELECT COUNT(*) AS total FROM categories c ${whereSql}`;
    const [countRows] = await pool.execute(countSql, params);
    const total = countRows[0]?.total || 0;

    // Fetch Paginated Records with Joined Parent Category Name
    const sql = `
      SELECT 
        c.id, c.parent_id, c.name, c.slug, c.description, c.image_url, c.is_active, c.created_at, c.updated_at,
        p.name AS parent_name
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.id
      ${whereSql}
      ORDER BY c.id DESC
      LIMIT ? OFFSET ?
    `;
    
    // Pass limit and offset as strings/numbers for prepared statement binding
    const [rows] = await pool.execute(sql, [...params, String(limit), String(offset)]);

    return {
      categories: rows,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Find Category by ID
   */
  static async findById(id) {
    const sql = `
      SELECT c.*, p.name AS parent_name
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.id
      WHERE c.id = ?
      LIMIT 1
    `;
    const [rows] = await pool.execute(sql, [id]);
    return rows[0] || null;
  }

  /**
   * Find Category by Name
   */
  static async findByName(name) {
    const sql = `SELECT * FROM categories WHERE name = ? LIMIT 1`;
    const [rows] = await pool.execute(sql, [name]);
    return rows[0] || null;
  }

  /**
   * Find Category by Slug
   */
  static async findBySlug(slug) {
    const sql = `SELECT * FROM categories WHERE slug = ? LIMIT 1`;
    const [rows] = await pool.execute(sql, [slug]);
    return rows[0] || null;
  }

  /**
   * Create Category
   */
  static async create({ parentId, name, slug, description, imageUrl }) {
    const sql = `
      INSERT INTO categories (parent_id, name, slug, description, image_url)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(sql, [parentId || null, name, slug, description || null, imageUrl || null]);
    return result.insertId;
  }

  /**
   * Update Category
   */
  static async update(id, { parentId, name, slug, description, imageUrl, isActive }) {
    const sql = `
      UPDATE categories
      SET parent_id = ?, name = ?, slug = ?, description = ?, image_url = ?, is_active = ?
      WHERE id = ?
    `;
    await pool.execute(sql, [
      parentId || null,
      name,
      slug,
      description || null,
      imageUrl || null,
      isActive !== undefined ? isActive : 1,
      id
    ]);
  }

  /**
   * Delete Category
   */
  static async delete(id) {
    const sql = `DELETE FROM categories WHERE id = ?`;
    await pool.execute(sql, [id]);
  }

  /**
   * Check if category has associated products (Data integrity guard)
   */
  static async hasAssociatedProducts(categoryId) {
    try {
      const sql = `SELECT COUNT(*) AS count FROM products WHERE category_id = ?`;
      const [rows] = await pool.execute(sql, [categoryId]);
      return (rows[0]?.count || 0) > 0;
    } catch (err) {
      return false;
    }
  }
}

module.exports = CategoryModel;
