const { Pool } = require("pg");

const pool = new Pool({
    // user: 'michaelbunte',
    // host: 'localhost',
    database: 'waterexp',
    // port: 5432,
});

module.exports = pool;
