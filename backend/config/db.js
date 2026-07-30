const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

/**
 * MySQL Connection Pool Setup using mysql2 promise wrapper
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'shopmaster_db',

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

/**
 * Test DB Connection Health
 */
const testDbConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL Database Connection Established Successfully.');
    connection.release();
  } catch (error) {
    console.error('❌ Database Connection Error:', error.message);
  }
};

module.exports = {
  pool,
  testDbConnection
};