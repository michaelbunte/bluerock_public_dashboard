const express = require("express");
const app = express();
const cors = require("cors");
const format = require('pg-format');
const pool = require("./db");

function resizeArray(originalArray, newSize) {
    if (newSize >= originalArray.length) {
        return originalArray;
    }
    
    const ratio = Math.floor(originalArray.length / newSize);

    const resizedArray = originalArray.filter(function (_, i) {
        return i % ratio === 0;
    })

    return resizedArray;
}

function reformat_sites_info(sites_info_unformatted) {
    let formatted = {};
    for (let i = 0; i < sites_info_unformatted.length; i++) {
        formatted[sites_info_unformatted[i]["site_name"]] = sites_info_unformatted[i];
    }
    return formatted;
}

function isValidPostgresColumnList(name) {
    // Define the regex pattern
    const pattern = /^[a-zA-Z_][a-zA-Z0-9_,]*$/;

    // Test the name against the pattern
    return pattern.test(name);
}

const SOMETHING_WENT_WRONG = { "result": "SOMETHING WENT WRONG" };

let sites_info;
async function setup() {
    let site_info_query_results = await pool.query(
        `SELECT * FROM site_table_names;`
    );
    sites_info = reformat_sites_info(site_info_query_results.rows);
    console.log(sites_info)
}

setup().then(() => {
    // middleware
    app.use(cors());
    app.use(express.json()); // allows us to use express.body json data


    const js_to_pg_date_string = (js_date_string) => {
        let date = new Date(js_date_string);
        let isoDateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
        return isoDateTime.replace('T', ' ').replace('Z', '');
    };

    const reformat_to_simple = (unformatted_query_response, sensor_name) => {
        return unformatted_query_response.rows.map(
            row => [row["plctime"].getTime(), row[sensor_name]]);
    }

    const query_plc_database = (
        system,
        single_sensor = true,
        is_date_range = true,
        low_res_data = false,
        most_recent = false,
        reformat_simple = true
    ) => {

        let this_site_info = sites_info[system]

        if (this_site_info === undefined) {
            throw new Error("Site not found in site_table_names table");
        }

        if (reformat_simple && single_sensor === false) {
            throw new Error("Cannot reformat if no sensor is provided");
        }

        let from_clause = "";
        if (low_res_data) {
            from_clause = `FROM ${this_site_info["low_res_table"]}`
        } else {
            from_clause = `FROM ${this_site_info["data_sensor_table"]}`
        }



        let order_by_clause;
        let limit_clause;
        if (most_recent) {
            order_by_clause = "ORDER BY plctime DESC";
            limit_clause = "LIMIT 1";
        } else {
            order_by_clause = "ORDER BY plctime ASC";
            limit_clause = "";
        }


        return async (req, res) => {
            let where_clause = "";
            if (is_date_range) {
                const { start_date, end_date } = req.params;

                const start_date_string = js_to_pg_date_string(start_date);
                const end_date_string = js_to_pg_date_string(end_date);
                where_clause = `WHERE (plctime AT TIME ZONE 'America/Los_Angeles')`
                    + ` >= '${start_date_string}' AND`
                    + ` (plctime AT TIME ZONE 'America/Los_Angeles')`
                    + ` <= '${end_date_string}'`;
            }
            let select_clause = "";
            if (single_sensor) {
                select_clause =
                    `SELECT *, `
                    + `(plctime AT TIME ZONE 'America/Los_Angeles')`;
            }
            else {
                select_clause =
                    `SELECT ${single_sensor}, `
                    + `(plctime AT TIME ZONE 'America/Los_Angeles')`;
            }

            let query_string = [
                select_clause,
                from_clause,
                where_clause,
                order_by_clause,
                limit_clause, ';'].join(' ');
        };
    }

    app.listen(5001, async () => {
        console.log("server has started on port 5001");
    })


    // OLD - remove
    app.get("/bluerock/most_recent", async (req, res) => {
        try {
            let result = await pool.query(
                `SELECT * FROM bluerock_plc_data 
            ORDER BY plctime DESC
            LIMIT 1 ;`
            );
            res.json(result.rows);
        } catch (err) {
            res.json()
            console.error(err);
        }
    });

    // OLD - remove
    // expects two Date.toString() variables in PST 
    app.get(
        "/bluerock/date_range/:start_date/:end_date",
        query_plc_database(
            "bluerock",
            "recycleflow"
        )
    );

    // OLD - remove
    app.get(
        "/bluerock/sensor_date_range/:sensor_name/:start_date/:end_date",
        async (req, res) => {
            const { sensor_name, start_date, end_date } = req.params;
            const start_date_string = js_to_pg_date_string(start_date);
            const end_date_string = js_to_pg_date_string(end_date);

            try {
                let result = await pool.query(
                    `SELECT ${sensor_name}, `
                    + `(plctime AT TIME ZONE 'America/Los_Angeles') `
                    + `FROM bluerock_plc_data `
                    + `WHERE `
                    + `(plctime AT TIME ZONE 'America/Los_Angeles') >= `
                    + `'${start_date_string}' AND `
                    + `(plctime AT TIME ZONE 'America/Los_Angeles') <= `
                    + `'${end_date_string}' `
                    + 'ORDER BY plctime ASC;'
                );
                let reformatted_result = reformat_to_simple(result, sensor_name);
                res.json(reformatted_result);
            } catch (e) {
                console.error(e);
            }
        }
    );

    // OLD - updated
    // Returns entire range of data, in low resolution format
    // However, if the selected range has a width of < one month, we 
    // substitute the selected range in a higher resolution format
    app.get(
        "/bluerock/adaptive_all_history/:sensor_name/:start_date/:end_date",
        async (req, res) => {
            const { sensor_name, start_date, end_date } = req.params;
            const start_date_string = js_to_pg_date_string(start_date);
            const end_date_string = js_to_pg_date_string(end_date);

            try {
                let low_res_result = await pool.query(
                    `SELECT ${sensor_name}, `
                    + `(plctime AT TIME ZONE 'America/Los_Angeles') `
                    + `FROM bluerock_low_res_plc_data `
                    + 'ORDER BY plctime ASC;'
                );

                let reformatted_low_res_result = reformat_to_simple(low_res_result, sensor_name);
                let final_result = reformatted_low_res_result;

                // if range of dates is less than 4 months, then inject high res data
                if (new Date(end_date) - new Date(start_date) < (4 * 60 * 60 * 24 * 1000 * 31)) {
                    console.log("high res data requested")
                    let high_res_result = await pool.query(
                        `SELECT ${sensor_name}, `
                        + `(plctime AT TIME ZONE 'America/Los_Angeles') `
                        + `FROM bluerock_plc_data `
                        + `WHERE `
                        + `(plctime AT TIME ZONE 'America/Los_Angeles') >= `
                        + `'${start_date_string}' AND `
                        + `(plctime AT TIME ZONE 'America/Los_Angeles') <= `
                        + `'${end_date_string}' `
                        + 'ORDER BY plctime ASC;'
                    );
                    let reformatted_high_res_result = resizeArray(
                        reformat_to_simple(high_res_result, sensor_name), 2000);
                    let first_date = reformatted_high_res_result[0][0];
                    let last_date = reformatted_high_res_result[reformatted_high_res_result.length - 1][0];
                    let final_result_start = reformatted_low_res_result.filter((row) => row[0] < first_date);
                    let final_result_end = reformatted_low_res_result.filter((row) => row[0] > last_date);
                    final_result = [].concat(
                        final_result_start,
                        reformatted_high_res_result,
                        final_result_end
                    );
                }
                res.json(final_result);
            } catch (e) {
                console.error(e);
            }
        }
    );

    // OLD - updated
    app.get(
        "/bluerock/adaptive_all_sensors/:start_date/:end_date",
        async (req, res) => {
            const { start_date, end_date } = req.params;
            const start_date_string = js_to_pg_date_string(start_date);
            const end_date_string = js_to_pg_date_string(end_date);
            const ADAPTIVE_LIMIT_SIZE = 1000;
            try {
                let query = `SELECT *, (plctime AT TIME ZONE 'America/Los_Angeles') `
                    + `FROM bluerock_plc_data `
                    + `WHERE `
                    + `(plctime AT TIME ZONE 'America/Los_Angeles') >= '${start_date_string}' AND `
                    + `(plctime AT TIME ZONE 'America/Los_Angeles') <= '${end_date_string}' `
                    + 'ORDER BY plctime ASC;'
                let result = await pool.query(query);
                if (result.rows.length === 0) {
                    res.json(result.rows);
                    return;
                }

                let output = [];
                let step_size = Math.max(result.rows.length / ADAPTIVE_LIMIT_SIZE, 1);
                for (let i = 0; i < result.rows.length; i += step_size) {
                    output.push(result.rows[Math.floor(i)]);
                }
                res.json(output);
            } catch (e) {
                console.error(e);
            }
        }
    )


    // OLD - removed
    app.get(
        "/bluerock/all_sensors_range/:start_date/:end_date",
        async (req, res) => {
            const { start_date, end_date } = req.params;
            const start_date_string = js_to_pg_date_string(start_date);
            const end_date_string = js_to_pg_date_string(end_date);

            try {
                let query = `SELECT *, (plctime AT TIME ZONE 'America/Los_Angeles') `
                    + `FROM bluerock_plc_data `
                    + `WHERE `
                    + `(plctime AT TIME ZONE 'America/Los_Angeles') >= '${start_date_string}' AND `
                    + `(plctime AT TIME ZONE 'America/Los_Angeles') <= '${end_date_string}' `
                    + 'ORDER BY plctime ASC;'

                let result = await pool.query(query);
                res.json(result.rows);
            } catch (e) {
                console.error(e);
            }
        }
    );

    // OLD - removed
    app.get(
        "/bluerock/all_sensors_around/:date/:range",
        async (req, res) => {
            const { date, range } = req.params;
            const date_string = js_to_pg_date_string(date);

            try {
                let query = `
            (SELECT *, (plctime AT TIME ZONE 'America/Los_Angeles') 
            FROM bluerock_plc_data 
            WHERE 
                (plctime AT TIME ZONE 'America/Los_Angeles') > '${date_string}'
            ORDER BY plctime ASC limit ${range})
            UNION
            (
                SELECT *, (plctime AT TIME ZONE 'America/Los_Angeles') 
                FROM bluerock_plc_data 
                WHERE 
                (plctime AT TIME ZONE 'America/Los_Angeles') <= '${date_string}'
                ORDER BY plctime DESC limit ${range}
            ) ORDER BY plctime ASC;
            `;
                let result = await pool.query(query);
                res.json(result.rows);
            } catch (e) {
                console.error(e);
            }
        }
    );

    // OLD - removed
    app.get(
        "/bluerock/sensor_all/:sensor_name",
        async (req, res) => {
            const { sensor_name } = req.params;
            try {
                let result = await pool.query(
                    `SELECT ${sensor_name}, `
                    + `(plctime AT TIME ZONE 'America/Los_Angeles') `
                    + `FROM bluerock_plc_data `
                    + 'ORDER BY plctime ASC;'
                );
                let reformatted_result = reformat_to_simple(result, sensor_name);
                res.json(reformatted_result);
            } catch (e) {
                console.error(e);
            }
        }
    );

    // OLD - removed
    app.get(
        "/bluerock/sensor_most_recent/:sensor_name",
        async (req, res) => {
            const { sensor_name } = req.params;

            try {
                let result = await pool.query(
                    `SELECT ${sensor_name}, `
                    + `(plctime AT TIME ZONE 'America/Los_Angeles') `
                    + `FROM bluerock_plc_data `
                    + 'ORDER BY plctime DESC '
                    + 'LIMIT 1;'
                );
                let reformatted_result = reformat_to_simple(result, sensor_name);

                let time = undefined;
                let value = undefined;
                try {
                    time = reformatted_result[0][0];
                    value = reformatted_result[0][1];
                } catch (e) { }

                res.json({
                    time: time,
                    value: value
                });
            } catch (e) {https://www.ncbi.nlm.nih.gov/core/lw/2.0/html/tileshop_pmc/tileshop_pmc_inline.html?title=Click%20on%20image%20to%20zoom&p=PMC3&id=7828932_45-4-279f2.jpg
                console.error(e);
            }
        }
    );

    // OLD - removed
    app.get(
        "/bluerock/system_image/:search_time",
        async (req, res) => {
            try {
                let { search_time } = req.params;
                let reformatted_search_time = js_to_pg_date_string(search_time);
                let query =
                    `SELECT *, (plctime AT TIME ZONE 'America/Los_Angeles') `
                    + `FROM bluerock_plc_data `
                    + `WHERE (plctime AT TIME ZONE 'America/Los_Angeles') `
                    + `<= '${reformatted_search_time}' `
                    + `ORDER BY plctime DESC LIMIT 1;`;

                let result = await pool.query(query);
                res.json(result.rows)
            } catch (e) {
                console.error(e);
            }
        }
    )

    // OLD - updated
    app.get(
        "/bluerock/sensor_info_table",
        async (req, res) => {
            try {
                let result = await pool.query("SELECT * FROM bluerock_sensor_info;");
                res.json(result.rows);
            } catch (e) {
                console.error(e);
            }
        }
    );

    // OLD - updated
    app.get(
        "/bluerock/specific_sensors_range/:sensors/:start_date/:end_date",
        async (req, res) => {
            const { sensors, start_date, end_date } = req.params;
            const start_date_string = js_to_pg_date_string(start_date);
            const end_date_string = js_to_pg_date_string(end_date);
            try {
                let query = `SELECT (plctime AT TIME ZONE 'America/Los_Angeles'),${sensors} `
                    + `FROM bluerock_plc_data `
                    + `WHERE `
                    + `(plctime AT TIME ZONE 'America/Los_Angeles') >= '${start_date_string}' AND `
                    + `(plctime AT TIME ZONE 'America/Los_Angeles') <= '${end_date_string}' `
                    + 'ORDER BY plctime ASC;';
                let result = await pool.query(query);
                res.json(result.rows);
            } catch (e) {
                console.error(e);
            }
        }
    )

    // ===================================================== 
    // NEW

    app.get(
        "/sensor_info_table/:site_name",
        async (req, res) => {
            try {
                const { site_name } = req.params;
                const sensor_info_table_name = sites_info[site_name]["sensor_info_table"];
                let query = format('SELECT * FROM %I;', sensor_info_table_name);
                let result = await pool.query(query);
                res.json(result.rows);
            } catch (e) {
                console.error(req.url);
                console.error(e);
            }
        }
    );

    app.get(
        "/adaptive_all_sensors/:site_name/:start_date/:end_date",
        async (req, res) => {
            try {
                const { start_date, end_date, site_name } = req.params;
                
                const site_plc_table_name = sites_info[site_name]["data_sensor_table"];
                const start_date_string = js_to_pg_date_string(start_date);
                const end_date_string = js_to_pg_date_string(end_date);
                const ADAPTIVE_LIMIT_SIZE = 1000;
                let query = format(
                    `SELECT *`
                    + `FROM %I `
                    + `WHERE plctime >= %L AND plctime <= %L `
                    + 'ORDER BY plctime ASC;', site_plc_table_name, start_date_string, end_date_string
                )
                let result = await pool.query(query);
                if (result.rows.length === 0) {
                    res.json(result.rows);
                    return;
                }

                let output = [];
                let step_size = Math.max(result.rows.length / ADAPTIVE_LIMIT_SIZE, 1);
                for (let i = 0; i < result.rows.length; i += step_size) {
                    output.push(result.rows[Math.floor(i)]);
                }
                res.json(output);
            } catch (e) {
                console.error(req.url);
                console.error(e)
                res.json(SOMETHING_WENT_WRONG)
            }
        }
    )

    app.get(
        "/specific_sensors_range/:site_name/:sensors/:start_date/:end_date",
        async (req, res) => {
            try {
                const { site_name, sensors, start_date, end_date } = req.params;
                if (!isValidPostgresColumnList(sensors)) { throw Error(); }

                const site_plc_table_name = sites_info[site_name]["data_sensor_table"];
                const start_date_string = js_to_pg_date_string(start_date);
                const end_date_string = js_to_pg_date_string(end_date);
                let query = format(`SELECT plctime, ${sensors} `
                    + `FROM %I WHERE `
                    + `plctime  >= %L AND plctime <= %L `
                    + 'ORDER BY plctime ASC;', site_plc_table_name, start_date_string, end_date_string);
                let result = await pool.query(query);
                res.json(result.rows);
            } catch (e) {
                console.error(e);
                res.json(SOMETHING_WENT_WRONG)
            }
        }
    )

    // Returns entire range of data, in low resolution format
    // However, if the selected range has a width of < one month, we 
    // substitute the selected range in a higher resolution format
    app.get(
        "/adaptive_all_history/:site_name/:sensor_name/:start_date/:end_date",
        async (req, res) => {
            
            try {
                const { sensor_name, start_date, end_date, site_name } = req.params;
                const start_date_string = js_to_pg_date_string(start_date);
                const end_date_string = js_to_pg_date_string(end_date);
    
                const low_res_plc_table_name = sites_info[site_name]["low_res_table"];
                const med_res_plc_table_name = sites_info[site_name]["med_res_table"];
                const high_res_plc_table_name = sites_info[site_name]["data_sensor_table"];

                let low_res_query = format(
                    `SELECT %I, plctime FROM %I `
                    + 'ORDER BY plctime ASC;', sensor_name, low_res_plc_table_name
                )

                let low_res_result = await pool.query(low_res_query);

                let reformatted_low_res_result = reformat_to_simple(low_res_result, sensor_name);
                let final_result = reformatted_low_res_result;

                let higher_res_query = "";
                if (new Date(end_date) - new Date(start_date) < (12 * 24 * 60 * 60  * 1000)) { // less than 12 days
                    higher_res_query = format(
                        `SELECT %I, plctime FROM %I `
                        + `WHERE plctime >= %L AND `
                        + `plctime  <= %L `
                        + 'ORDER BY plctime ASC;', 
                        sensor_name, high_res_plc_table_name, start_date_string, end_date_string
                    );
                } else if (new Date(end_date) - new Date(start_date) < (4 * 31 * 24 * 60 * 60  * 1000)) { // less than 4 months
                    higher_res_query = format(
                        `SELECT %I, plctime FROM %I `
                        + `WHERE plctime >= %L AND `
                        + `plctime  <= %L `
                        + 'ORDER BY plctime ASC;', 
                        sensor_name, med_res_plc_table_name, start_date_string, end_date_string
                    );
                }

                // if range of dates is less than 4 months, then inject higher res data
                if (higher_res_query !== "") {
                    let high_res_result = await pool.query(higher_res_query);
                    let reformatted_high_res_result = resizeArray(
                        reformat_to_simple(high_res_result, sensor_name), 2000);
                    let first_date = reformatted_high_res_result[0][0];
                    let last_date = reformatted_high_res_result[reformatted_high_res_result.length - 1][0];
                    let final_result_start = reformatted_low_res_result.filter((row) => row[0] < first_date);
                    let final_result_end = reformatted_low_res_result.filter((row) => row[0] > last_date);
                    final_result = [].concat(
                        final_result_start,
                        reformatted_high_res_result,
                        final_result_end
                    );
                }
                res.json(final_result);
            } catch (e) {
                console.error(req.url);
                console.error(e);
                // res.json(SOMETHING_WENT_WRONG)
                res.json([])
            }
        }
    );
});