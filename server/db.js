const { Pool } = require("pg");

const pool = new Pool({
    user: 'michaelbunte',
    host: 'localhost',
    database: 'water_exp',
    port: 5432,
});

module.exports = pool;
