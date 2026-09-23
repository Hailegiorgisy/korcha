import mysql from 'mysql2/promise';
import 'dotenv/config';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'korcha_user',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'korcha_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;