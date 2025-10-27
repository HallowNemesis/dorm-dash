import fs from 'fs'
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  // ssl: { 
  //   ca: fs.readFileSync('./certs/server-ca.pem'),
  //   key: fs.readFileSync('./certs/client-key.pem'),
  //   cert: fs.readFileSync('./certs/client-cert.pem'),
  // },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
