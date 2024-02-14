const Pool = require('pg').Pool;

const pool = new Pool({
    connectionString: 'postgresql://read_only@postgres.svwaternet.org:5432/tsdb',
});

const getBluerockNow = () => {
    return new Promise(function (resolve, reject) {
        pool.query(
            'select * from bluerock_plc_values order by plctime desc limit 1;', 
            (error, results) => {
            if (error) {
                reject(error)
            }
            resolve(results.rows);
        })
    })
}
module.exports = { getBluerockNow }