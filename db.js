// db.js
const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'darshuser',
  password: 'strongpassword',
  database: 'postgres'
});
module.exports = pool;

