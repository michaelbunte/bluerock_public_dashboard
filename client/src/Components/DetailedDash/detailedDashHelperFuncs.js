import { AnimatedPipe } from "./DetailedDashComponents";
import React, { useState, useEffect, useRef } from 'react';

const initialize_modal_table_dict = () => {
    let modal_table_dict = {
        get: function (sensorname, field) {
            if (this === undefined || this[sensorname] === undefined) {
                return field === "on_click" ? () => { } : "";
            }
            return this[sensorname][field]
        }
    }
    return modal_table_dict;
}

const create_modal_table = (
    system_name,
    sensor_data_table,
    set_current_modal,
    set_current_modal_data
) => {
    const modal_table_dict = initialize_modal_table_dict();
    sensor_data_table.forEach(row => {
        modal_table_dict[row["internal_data_name"]] = {
            internal_data_name: row["internal_data_name"],
            human_readible_name: row["human_readible_name"],
            description: row["description"],
            abbreviated_name: row["abbreviated_name"],
            current_value: undefined,
            units: row["units"],
            on_click: async () => {
                set_current_modal(row["human_readible_name"]);
                try {
                    set_current_modal_data( prev => ({
                        ...prev,
                        loading: true
                    }));

                    let response = await fetch(
                        `http://localhost:5001/${system_name}/sensor_all/${row["internal_data_name"]}`);
                    let current = await fetch(
                        `http://localhost:5001/${system_name}/sensor_most_recent/${row["internal_data_name"]}`);
                    let response_json = await response.json();
                    let current_json = await current.json();
                    

                    set_current_modal_data({
                        loading: false,
                        time_series_data: response_json,
                        current_data: current_json,
                        description: row["description"],
                        units: row["units"]
                    });
                } catch (e) {
                    console.error(e);
                }
            }
        };
    });
    return modal_table_dict;
}

const update_modal_table_current_values = async (
    image,
    set_modal_table_dict,
) => {

    try {
        const response_dict = image;
        set_modal_table_dict((old_modal_table_dict) => {
            let new_modal_table_dict = { ...old_modal_table_dict };
            for (const [sensor_name, sensor_value] of Object.entries(response_dict)) {
                try {
                    new_modal_table_dict[sensor_name]["current_value"] = sensor_value;
                } catch (e) { }
            }
            return new_modal_table_dict;
        });

        return response_dict;
    } catch (e) { }
}

const get_value_unit_string = (sensor_name, modal_table_dict) => {
    const current_value = modal_table_dict.get(sensor_name, "current_value");
    return `${current_value === undefined ? "" : current_value} `
        + `${modal_table_dict.get(sensor_name, "units")}`
}

const reformat_js_date_string = (js_date_string) => {
    let date_obj = new Date(js_date_string);
    let date = date_obj.toString().split(' ').slice(0, 4).join(" ");
    let time = date_obj.toString().split(' ').slice(4, 5).join(" ");
    return `${time}, ${date}`;
};

const SpeedButton = ({
    arrowLength = 20,
    text = "",
    skip = false,
    flip = false,
    ffwd = false,
    pause = false,
    width = null,
    on_click = () => { }
}) => {

    const [hovered, set_hovered] = useState(false);
    const right_pad = skip ? 11 : 7;
    const flip_style = flip ? { transform: 'scaleX(-1)' } : {};

    let svg_width = ffwd ? 23 : arrowLength + right_pad;
    svg_width = pause ? 20 : svg_width;
    
    let contents = ffwd ? 
    <g>
        <AnimatedPipe
            paths={[[[0, 7], [5, 7]]]}
            animated={false}
            stroke="#000000"
        />
        <AnimatedPipe
            paths={[[[11, 7], [16, 7]]]}
            animated={false}
            stroke="#000000"
        />
    </g>
        :
    <g>
        <AnimatedPipe
            paths={[[[0, 7], [arrowLength, 7]]]}
            animated={false}
            stroke="#000000"
        />
        {
            skip && <rect
                x={`${arrowLength + 5}`} y="0"
                width="5" height="15"
                fill="black"
            />
        }
    </g>;

    contents = pause ? <g>
        <rect
            x="3" y="0"
            width="5" height="15"
            fill="black"
        />
        <rect
            x="11" y="0"
            width="5" height="15"
            fill="black"
        />
    </g> : contents;

    let upper_text = text == "" ? <div style={{height:'5px'}}/> : <div>{text}</div>;

    return (
        <div
            onMouseEnter={() => set_hovered(true)}
            onMouseLeave={() => set_hovered(false)}
            onClick={on_click}
            style={{
                "border": "2px solid lightgrey",
                "margin": "0px",
                "padding": "3px 6px 3px 6px",
                "borderRadius": "4px",
                "display": "flex",
                "flexDirection": "column",
                "alignItems": "center",
                "justifyContent" : "center",
                "background": hovered ? "#eaeaea" : "#ffffff",
                "height" : "51px",
                "userSelect": "none",
                "width" : width === null ? "auto" : `${width}`
            }}
        >
            {upper_text}
            <div
                style={flip_style}
            >
                <svg height="15px" viewBox={`0 0 ${svg_width} 13`}>
                    {contents}
                </svg>
            </div>
        </div>)
}

async function cache_data_if_needed(
    system_name,
    time,
    cached_data,
    set_cached_data
) {
    async function reset_cached_data() {
        let start_time = time.add(-120, "minute");
        let end_time = time.add(120, "minute");
        let start_time_iso = new Date(start_time).toISOString();
        let end_time_iso = new Date(end_time).toISOString();
        
        let response = await fetch(
            `http://localhost:5001/${system_name}/all_sensors_range/${start_time_iso}/${end_time_iso}`);
        let responsejson = await response.json();
        set_cached_data(responsejson);
    }

    if(cached_data.length === 0) {
        await reset_cached_data();
        return;
    }
}

function binary_search_cache(
        cache, 
        target_date // should be an ISO string
    ) {

    if (cache.length  ===  0 ) { return -1; }

    let start_i = 0;
    let end_i = cache.length - 1;
    let target_date_obj = new Date(target_date);
    while (Math.abs(start_i - end_i) > 1) {
        let middle_i = Math.floor((start_i + end_i) / 2);
        let middle_i_date = new Date(cache[middle_i]["plctime"]);
        
        if (middle_i_date <= target_date_obj) {
            start_i = middle_i;
        } else {
            end_i = middle_i;
        }
    }
    return start_i < 2 || start_i > cache.length - 3 ? -1 : start_i;
}

// FROM
// https://stackoverflow.com/questions/58400851/can-not-update-state-inside-setinterval-in-react-hook
function useInterval(callback, delay) {
    const savedCallback = useRef();
  
    // Remember the latest callback.
    useEffect(() => {
      savedCallback.current = callback;
    }, [callback]);
  
    // Set up the interval.
    useEffect(() => {
      function tick() {
        savedCallback.current();
      }
      if (delay !== null) {
        let id = setInterval(tick, delay);
        return () => clearInterval(id);
      }
    }, [delay]);
}

const play_back_speeds = [
    [ 1000, "Real Time"],
    [ 10000, "10 seconds / second"],
    [ 60000, "1 minute / second"],
    [ 600000, "10 minutes / second"],
]

export {
    create_modal_table,
    initialize_modal_table_dict,
    update_modal_table_current_values,
    get_value_unit_string,
    reformat_js_date_string,
    SpeedButton,
    cache_data_if_needed,
    binary_search_cache,
    useInterval,
    play_back_speeds
};