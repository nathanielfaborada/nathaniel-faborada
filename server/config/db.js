import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Create MySQL connection pool
const isRemoteHost = Boolean(
  (process.env.DB_HOST && !['localhost', '127.0.0.1'].includes(process.env.DB_HOST)) ||
  (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost') && !process.env.DATABASE_URL.includes('127.0.0.1'))
);

const poolConfig = process.env.DATABASE_URL
  ? {
      uri: process.env.DATABASE_URL,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      decimalNumbers: true,
      ...(isRemoteHost ? { ssl: { rejectUnauthorized: false } } : {}),
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'portfolio_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      decimalNumbers: true,
      ...(isRemoteHost ? { ssl: { rejectUnauthorized: false } } : {}),
    };

export const pool = mysql.createPool(poolConfig);

// Helper function to test DB connection on startup and ensure schema columns
export async function testDbConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database successfully.');
    connection.release();

    // Auto-migrate reset_password fields if they do not exist
    try {
      const [cols] = await pool.query(
        "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'reset_password_token'"
      );
      if (cols.length === 0) {
        await pool.query(
          'ALTER TABLE users ADD COLUMN reset_password_token VARCHAR(255) NULL, ADD COLUMN reset_password_expires DATETIME NULL'
        );
        console.log('✅ Added reset_password_token and reset_password_expires columns to users table.');
      }

      // Auto-migrate project_date column in creations table
      const [creationCols] = await pool.query(
        "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'creations' AND COLUMN_NAME = 'project_date'"
      );
      if (creationCols.length === 0) {
        await pool.query(
          'ALTER TABLE creations ADD COLUMN project_date VARCHAR(50) NULL AFTER category'
        );
        console.log('✅ Added project_date column to creations table.');
      }
    } catch (schemaErr) {
      // Ignore if table doesn't exist yet or already altered
    }

    return true;
  } catch (error) {
    console.error('❌ Failed to connect to MySQL database:', error.message);
    return false;
  }
}

export default pool;
