const mysql = require('mysql2/promise'); // ⬅️ Gunakan yang versi promise

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'cerahati'
});

module.exports = pool;
