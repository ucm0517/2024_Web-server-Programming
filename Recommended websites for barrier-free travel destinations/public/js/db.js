const mysql = require('mysql2');

const pool = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '0517',
  database: 'webserver3',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;