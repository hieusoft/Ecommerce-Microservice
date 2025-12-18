/** SQL Server database connection (using mssql). */
import sql from 'mssql';
import { config } from './config.js';

let pool = null;

const sqlConfig = {
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  server: config.DB_SERVER,
  port: config.DB_PORT,
  options: {
    encrypt: config.DB_ENCRYPT,
    trustServerCertificate: !config.DB_ENCRYPT
  }
};

export const getDB = async () => {
  if (pool) {
    return pool;
  }

  try {
    pool = await sql.connect(sqlConfig);
    console.log('✅ SQL Server connected successfully');
    return pool;
  } catch (error) {
    console.error('❌ SQL Server connection error:', error);
    throw error;
  }
};

// Giữ API tương tự connectDB cho app.js
export const connectDB = async () => {
  await getDB();
};

export { sql };

