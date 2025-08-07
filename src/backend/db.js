const mysql = require('mysql2');
const pool = mysql.createPool({
  host: 'database-2.cr2ue6u44sny.eu-north-1.rds.amazonaws.com',
  user: 'admin',
  password: 'ramchin123',
  database: 'myecommerce',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool.promise();
