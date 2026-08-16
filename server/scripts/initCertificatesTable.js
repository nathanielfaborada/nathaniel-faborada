import { pool } from '../config/db.js';

async function init() {
  try {
    console.log('Connecting to Railway MySQL database...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS certificates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        display_type ENUM('iframe', 'image') NOT NULL DEFAULT 'iframe',
        credential_url TEXT,
        image_url TEXT,
        issuer VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ certificates table successfully created/verified on Railway MySQL database!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to initialize certificates table:', err);
    process.exit(1);
  }
}

init();
