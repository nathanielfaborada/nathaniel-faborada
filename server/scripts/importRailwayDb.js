import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function importSchema() {
  console.log('🚀 Connecting to Railway MySQL Database...');
  console.log(`Host: ${process.env.DB_HOST}`);
  console.log(`Port: ${process.env.DB_PORT}`);
  console.log(`User: ${process.env.DB_USER}`);
  console.log(`Database: ${process.env.DB_NAME}`);

  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    console.log('✅ Connection established with Railway MySQL instance!');

    // Read local schema.sql
    const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
    let sql = fs.readFileSync(schemaPath, 'utf8');

    // Remove CREATE DATABASE and USE portfolio_db statements so it executes in current database
    sql = sql
      .replace(/CREATE DATABASE IF NOT EXISTS\s+[^;]+;/gi, '')
      .replace(/USE\s+[^;]+;/gi, '');

    console.log('📦 Executing schema & initial seeds...');
    await connection.query(sql);

    console.log('✨ Schema & Seed Data imported successfully!');

    // Verify row counts
    const [userRows] = await connection.query('SELECT COUNT(*) as count FROM users');
    const [creationRows] = await connection.query('SELECT COUNT(*) as count FROM creations');
    const [orgRows] = await connection.query('SELECT COUNT(*) as count FROM organizations');
    const [expRows] = await connection.query('SELECT COUNT(*) as count FROM work_experiences');

    console.log('📊 Railway Database Summary:');
    console.log(`  - Users: ${userRows[0].count}`);
    console.log(`  - Creations: ${creationRows[0].count}`);
    console.log(`  - Organizations: ${orgRows[0].count}`);
    console.log(`  - Work Experiences: ${expRows[0].count}`);

    await connection.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error importing schema to Railway:', err);
    if (connection) await connection.end();
    process.exit(1);
  }
}

importSchema();
