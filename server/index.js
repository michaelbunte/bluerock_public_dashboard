const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");

function resizeArray(originalArray, newSize) {
    if (newSize >= originalArray.length) {
      return originalArray;
    }
  
    const ratio = Math.floor(originalArray.length / newSize);
  
    const resizedArray = originalArray.filter(function(_, i) {
        return i % ratio === 0;
      })
  
    return resizedArray;
  }
  


let sites_info;
async function setup() {
    let site_info_query_results = await pool.query(
        `SELECT * FROM site_table_names;`
    );
    sites_info = site_info_query_results.rows;
}

setup().then(()=>{
// middleware
app.use(cors());
app.use(express.json()); // allows us to use express.body json data


const js_to_pg_date_string = (js_date_string) => {
    let date = new Date(js_date_string);
    let isoDateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
    return isoDateTime.replace('T',' ').replace('Z','');
}; 

const reformat_to_simple = (unformatted_query_response, sensor_name) => {
    return unformatted_query_response.rows.map (
        row => [row["timezone"].getTime(), row[sensor_name]]);
} 

const query_plc_database = (  
    system,
    single_sensor=true, 
    is_date_range=true,
    low_res_data=false,
    most_recent=false,
    reformat_simple=true
) => {

    let this_site_info = 
        sites_info.find( site_info => site_info["site_name"] === system);

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
    if(most_recent) {
        order_by_clause = "ORDER BY plctime DESC";
        limit_clause = "LIMIT 1";
    } else {
        order_by_clause = "ORDER BY plctime ASC";
        limit_clause = "";
    }


    return async ( req, res ) => {
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
        


        // try {
        //     let result = await pool.query(query_string);
        //     if(reformat_simple) {
        //         const reformatted_result = result.rows.map(
        //             row => [row["timezone"].getTime(), row[sensor_name]]);
        //         res.json(reformatted_result);
        //     } else {
        //         res.json(result.rows);
        //     }
        // } catch (e){
        //     console.error(e);
        // }
    };
}

app.listen(5001, async () => {
    console.log("server has started on port 5001");
})
 

app.get("/bluerock/most_recent", async (req, res) => {
    try {
        let result = await pool.query(
            `SELECT * FROM bluerock_plc_data 
            ORDER BY plctime DESC
            LIMIT 1 ;`
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
    }
});

// expects two Date.toString() variables in PST 
app.get(
    "/bluerock/date_range/:start_date/:end_date", 
    query_plc_database(
        "bluerock",
        "recycleflow"
    )
);

/*
SELECT recycleflow, (plctime AT TIME ZONE 'America/Los_Angeles') 
FROM 
bluerock_plc_data WHERE (plctime AT TIME ZONE 'America/Los_Angeles') >= 
'2020-07-05 05:10:10.000' AND (plctime AT TIME ZONE 'America/Los_Angeles') <= 
'2020-07-05 06:10:10.000' ORDER BY plctime ASC  ;
*/


app.get(
    "/bluerock/sensor_date_range/:sensor_name/:start_date/:end_date", 
    async (req, res) => {
        const {sensor_name, start_date, end_date } = req.params;
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

// Returns entire range of data, in low resolution format
// However, if the selected range has a width of < one month, we 
// substitute the selected range in a higher resolution format
app.get(
    "/bluerock/adaptive_all_history/:sensor_name/:start_date/:end_date",
    async (req, res) => {
        const {sensor_name, start_date, end_date } = req.params;
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

app.get(
    "/bluerock/adaptive_all_sensors/:start_date/:end_date",
    async (req, res) => {
        const {start_date, end_date} = req.params;
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
            if(result.rows.length === 0) {
                res.json(result.rows);
                return;
            }

            let output = [];
            let step_size = Math.max(result.rows.length / ADAPTIVE_LIMIT_SIZE, 1);
            for(let i = 0; i < result.rows.length; i+= step_size) {
                output.push(result.rows[Math.floor(i)]);
            }
            res.json(output);
        } catch (e) {
            console.error(e);
        }
    }
)



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

app.get(
    "/bluerock/sensor_all/:sensor_name", 
    async (req, res) => {
        const {sensor_name} = req.params;
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

app.get(
    "/bluerock/sensor_most_recent/:sensor_name", 
    async (req, res) => {
        const {sensor_name} = req.params;

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
        } catch (e) {
            console.error(e);
        }
    }
);

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
                +   `<= '${reformatted_search_time}' `
                + `ORDER BY plctime DESC LIMIT 1;`;

            let result = await pool.query(query);
            res.json(result.rows)
        } catch (e) {
            console.error(e);
        }
    }
)


app.get(
    "/bluerock/sensor_info_table",
    async ( req, res ) => {
        try {
            let result = await pool.query("SELECT * FROM bluerock_sensor_info;");
            res.json(result.rows);
        } catch (e) {
            console.error(e);
        }
    }
); 

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

});