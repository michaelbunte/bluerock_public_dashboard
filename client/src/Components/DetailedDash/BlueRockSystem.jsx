import {
    LIGHTGREYCOLOR, LIGHTBLUECOLOR, BLUECOLOR, WHITECOLOR, GREENCOLOR,
    PINKCOLOR, REDCOLOR, DARKBLUECOLOR,
    titleProps, normalTextProps, smallTextProps,
    getFlowColor, getAngle, getDirection,
    PumpSymbol, SensorIndicator, ValveIndicator, VariableValveIndicator,
    StaticRelativeText, RelativeText, ThreeWayValveIndicator, MultiMediaFilter,
    CheckValve, ArrowPolyLine, ChemicalFeed, SingleFilter, DoubleFilter,
    PressureTank, ROVessel, TextArray, Drain, KeyElementWrapper, Key,
    LiquidFillGaugeWrapper, DevToolsDisplay, AnimatedPipe, RebuiltModal,
    TreatmentSystem, VariablePieValveIndicator
} from "./DetailedDashComponents.jsx"

import { Box, Col, Row, Content, SimpleTable, Inputs, Badge, Tabs, TabContent } from 'adminlte-2-react';
import '../../OpClock.css';
import React, { useState, useEffect } from 'react';
import {
    create_modal_table,
    initialize_modal_table_dict,
    update_modal_table_current_values,
    get_value_unit_string,
    reformat_js_date_string,
    SpeedButton,
    cache_data_if_needed,
    binary_search_cache,
    useInterval,
    play_back_speeds,
    mapRange
} from "./detailedDashHelperFuncs.js";
import { WideModal } from "../WideModal.js";
import { MyGauge } from "../MyGauge.jsx";
import StockTickerChart from "../HighChartComps/StockTicker.js";

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import MyChart from "../MyChart.js";
import dayjs, { Dayjs } from 'dayjs';

let host_string = "ec2-54-215-192-153.us-west-1.compute.amazonaws.com:5001";


function FeedTankSystem({ md }) {
    return (
        <g>
            {/* svg rectangle in the upper-right corner with class bg-yellow disabled color-palatte */}
            <rect rx="10" x="220" y="10" width="210px" height="250px" fill="#ffcc9c" />
            <text x="240" y="40" {...titleProps}>
                FEED TANK SYSTEM
            </text>
            <AnimatedPipe
                paths={[[[265.5, 214], [265.5, 124], [350.5, 124]]]}
                pipeOn={md.get("wellpumprun", "current_value")}
            />
            <SensorIndicator
                x="370"
                y="79"
                line="down"
                textDir="left"
                innerText={md.get("feedtanklevel", "abbreviated_name")}
                on_click={md.get("feedtanklevel", "on_click")}
                outerText={get_value_unit_string("feedtanklevel", md)}
            />
            <LiquidFillGaugeWrapper
                dir="down" x="385" y="141" text="Feed Tank" textDir="down"
                fillLevel={md.get("feedtanklevel", "current_value")}
            />
            <PumpSymbol
                x="265.5" y="214"
                innerText={md.get("wellpumprun", "abbreviated_name")}
                flow={md.get("wellpumprun", "current_value")}
                on_click={md.get("wellpumprun", "on_click")}
            />
            <SensorIndicator WaterScope x="265.5" y="164" innerText="100" outerText='12345' />
        </g>
    );
}

function ROSystem({ md }) {
    let p1_val = md.get("feedpumprun", "current_value");
    let av1_val = md.get("inletrun", "current_value");
    let p2_val = md.get("ropumprun", "current_value");
    let av2_val = md.get("runflush", "current_value");
    let p3_val = md.get("deliveryrun", "current_value");
    let av5_on = md.get("concbypassrun", "current_value");
    let ft5_on = md.get("concentrateflow", "current_value") > 0;
    let av4_on = md.get("recyclevalveposition", "current_value") > 0;
    let ft3_flowing = md.get("permeateflow", "current_value") > 0;
    let av3_on = md.get("ropressctrlvalveposition", "current_value") > 0;

    let p1_to_av1 = p1_val && av1_val && p2_val;
    let permeate_flush = av2_val && p3_val;
    let permeate_feed_junction_to_p2 = p1_to_av1 || permeate_flush;
    let ro_to_av6 = ft3_flowing && permeate_feed_junction_to_p2;
    let pt4_to_av5 = permeate_feed_junction_to_p2 && av5_on && ft5_on;
    let pt4_to_av3 = permeate_feed_junction_to_p2 && av3_on && ft5_on;
    let pt4_to_av4 = permeate_feed_junction_to_p2 && av4_on;
    let av3_av5_junction = pt4_to_av5 || pt4_to_av3;
    let av6_to_av7 = !md.get("proddiversionrun", "current_value") && ro_to_av6;
    let av6_to_product_tank = md.get("proddiversionrun", "current_value") && ro_to_av6;
    let junction_to_av7 = av6_to_product_tank || av3_av5_junction;
    let to_septic_tank = !md.get("residtankvalverun", "current_value") && junction_to_av7;
    let to_residual_tank = md.get("residtankvalverun", "current_value") && junction_to_av7;

    return (
        <g>
            {/* large light blue rectangle to the right of this that goes lower */}
            <rect rx="10" x="440" y="10" width="670px" height="770px" fill="#d6dce5" />

            <text x="860" y="40"{...titleProps}>REVERSE OSMOSIS SYSTEM</text>
            <text x="200" y="30"{...normalTextProps}></text>
            <text y="55" textAnchor="end" {...smallTextProps}>
                <TextArray
                    textArray={["Permeate", "Flush"]}
                    x="550"
                />
            </text>
            <AnimatedPipe
                stroke={LIGHTBLUECOLOR} paths={[[[697.5, 734.5], [560, 734.5], [560, 618.5]]]}
                pipeOn={av6_to_av7}
            />
            <AnimatedPipe
                stroke={PINKCOLOR} paths={[[[544, 364.5], [544, 342]]]}
                pipeOn={pt4_to_av4}
            />


            <AnimatedPipe
                stroke={LIGHTBLUECOLOR}
                paths={[[[618.5, 61], [693.5, 61]]]}
                pipeOn={permeate_flush}
            />
            <AnimatedPipe
                stroke={LIGHTBLUECOLOR}
                paths={[[[554.5, 61], [581, 61]]]} noarr
                pipeOn={permeate_flush}
            />
            <AnimatedPipe
                noarr paths={[[[507, 161], [547.5, 161]]]}
                pipeOn={p1_to_av1}
            />
            <AnimatedPipe
                paths={[[[585, 161], [775, 161]]]}
                pipeOn={p1_to_av1}
            />
            <AnimatedPipe
                paths={[[[957.5, 161], [1017.5, 161], [1017.5, 261], [487.5, 261], [487.5, 331], [532, 331]]]}
                pipeOn={permeate_feed_junction_to_p2}
            />
            <AnimatedPipe
                paths={[[[863, 161], [886.5, 161]]]}
                junctionPositions={[[863, 161]]}
                pipeOn={permeate_feed_junction_to_p2}
            />
            <AnimatedPipe
                noarr
                paths={[[[840, 161], [863, 161]]]}
                junctionPositions={[[863, 161]]}
                pipeOn={p1_to_av1}
            />
            <AnimatedPipe
                stroke={LIGHTBLUECOLOR}
                paths={[[[733, 61], [863, 61], [863, 150]]]}
                pipeOn={permeate_flush}
            />

            <AnimatedPipe
                paths={[[[416.5, 150], [456.5, 150], [456.5, 160.5], [471, 160.5]]]}
                pipeOn={p1_to_av1}
            />

            <AnimatedPipe
                stroke={PINKCOLOR}
                paths={[[[893.5, 508], [749.5, 508]]]}
                junctionPositions={[[893.5, 508]]}
                pipeOn={pt4_to_av4}
            />
            <AnimatedPipe
                noarr
                stroke={PINKCOLOR}
                paths={[[[689.5, 508], [544, 508], [544, 401.5]]]}
                pipeOn={pt4_to_av4}
            />
            <AnimatedPipe
                stroke={PINKCOLOR} paths={[[[893.5, 460.5], [893.5, 497.5]]]}
                pipeOn={permeate_feed_junction_to_p2}
            />
            <AnimatedPipe
                paths={[[[540.5, 331], [893.5, 331], [893.5, 374.5]]]}
                junctionPositions={[[544, 331]]}
                pipeOn={permeate_feed_junction_to_p2}
                stroke={PINKCOLOR}
            />
            <AnimatedPipe
                stroke={LIGHTBLUECOLOR}
                paths={[[[912.5, 446], [936.5, 446], [936.5, 424], [1027, 424], [1027, 517.5]]]}
                junctionPositions={[[936.5, 424]]}
                pipeOn={ro_to_av6}
            />
            <AnimatedPipe
                stroke={LIGHTBLUECOLOR}
                paths={[[[913.5, 402.5], [937, 402.5], [937, 424]]]}
                pipeOn={ro_to_av6}
                noarr />
            <AnimatedPipe
                stroke={PINKCOLOR}
                paths={[[[894, 577.5], [848.5, 577.5]]]}
                junctionPositions={[[894, 577.5]]}
                pipeOn={pt4_to_av3}
            />
            <AnimatedPipe
                stroke={PINKCOLOR} paths={[[[894, 507.5], [894, 566]]]}
                pipeOn={av3_av5_junction}
            />
            <AnimatedPipe
                stroke={PINKCOLOR}
                paths={[[[654, 607.5], [529.5, 607.5]]]}
                junctionPositions={[[560, 607.5], [654, 607.5]]}
                pipeOn={av3_av5_junction}
            />
            <AnimatedPipe
                noarr
                stroke={PINKCOLOR}
                paths={[[[784, 577.5], [654, 577.5], [654, 607.5]]]}
                pipeOn={pt4_to_av3}
            />
            <AnimatedPipe
                noarr
                pipeOn={pt4_to_av5}
                stroke={PINKCOLOR}
                paths={[[[714, 637.5], [654, 637.5], [654, 607.5]]]} />
            <AnimatedPipe
                stroke={PINKCOLOR}
                paths={[[[894, 577.5], [894, 637.5], [749.5, 637.5]]]}
                pipeOn={pt4_to_av5}
            />
            <AnimatedPipe
                stroke={PINKCOLOR}
                paths={[[[492, 587.5], [492, 507.5], [408.5, 507.5]]]}
                pipeOn={to_residual_tank}
            />
            <AnimatedPipe
                stroke={PINKCOLOR}
                paths={[[[492, 627.5], [492, 670], [312, 670], [312, 690]]]}
                pipeOn={to_septic_tank}
            />
            <AnimatedPipe
                stroke={LIGHTBLUECOLOR}
                paths={[[[1027.5, 540], [1027.5, 680], [817.5, 680], [817.5, 698]]]}
                pipeOn={ro_to_av6}
            />
            <AnimatedPipe
                noarr
                stroke={LIGHTBLUECOLOR}
                paths={[[[810, 733.5], [736, 733.5]]]}
                pipeOn={av6_to_av7}
            />
            <AnimatedPipe
                stroke={LIGHTBLUECOLOR}
                paths={[[[847.5, 733.5], [1147.5, 733.5], [1147.5, 703.5], [1187.5, 703.5]]]}
                pipeOn={av6_to_product_tank}
            />

            <SingleFilter x="660" y="81" innerText1='C' innerText1Large outerText='Carbon Filter' textDir='down' />
            <ValveIndicator
                x="730" y="61"
                innerText={md.get("runflush", "abbreviated_name")}
                flow={md.get("runflush", "current_value")}
                on_click={md.get("runflush", "on_click")}
            />
            <PumpSymbol
                x="498" y="161"
                innerText={md.get("feedpumprun", "abbreviated_name")}
                flow={md.get("feedpumprun", "current_value")}
                on_click={md.get("feedpumprun", "on_click")}
            />
            <CheckValve x="600" y="61" />
            <MultiMediaFilter x="731" y="181"
                textDir='down'
                outerText={<TextArray textArray={["MultiMedia", "Filter (MMF)"]} />} />
            <SensorIndicator
                x="638"
                y="161"
                innerText={md.get("inletpressure", "abbreviated_name")}
                on_click={md.get("inletpressure", "on_click")}
                outerText={get_value_unit_string("inletpressure", md)}
                textDir='down'
            />
            <CheckValve x="566.5" y="159" />
            <ValveIndicator
                x="810" y="161"
                innerText={md.get("inletrun", "abbreviated_name")}
                flow={md.get("inletrun", "current_value")}
                on_click={md.get("inletrun", "on_click")}
            />
            <DoubleFilter
                x="928.5" y="181.5"
                innerText1='20'
                innerText2='mM'
                innerText3='5'
                innerText4='mM'
                outerText='Cartridge Filter'
                outerTextDir='down'
            />
            <SensorIndicator
                x="993.5"
                y="127"
                line="down"
                innerText={md.get("feedpressure", "abbreviated_name")}
                on_click={md.get("feedpressure", "on_click")}
                outerText={get_value_unit_string("feedpressure", md)}
            />
            <SensorIndicator
                x="552.5"
                y="261.5"
                innerText={md.get("feedtds", "abbreviated_name")}
                on_click={md.get("feedtds", "on_click")}
                textDir='up'
                outerText={get_value_unit_string("feedtds", md)}
            />
            {/* <SensorIndicator
                x="632.5" y="261.5" textDir='up'
                innerText={md.get("feedflow", "abbreviated_name")}
                on_click={md.get("feedflow", "on_click")}
                outerText={get_value_unit_string("feedflow", md)}
            /> */}
            <SensorIndicator
                x="650" y="331.5" textDir="down"
                outerText={get_value_unit_string("inletflow", md)}
                innerText={md.get("inletflow", "abbreviated_name")}
                on_click={md.get("inletflow", "on_click")}
            />
            <PumpSymbol
                x="800" y="331.5"
                innerText={md.get("ropumprun", "abbreviated_name")}
                flow={md.get("ropumprun", "current_value")}
                on_click={md.get("ropumprun", "on_click")}
            />
            <ArrowPolyLine stroke="black" points="998,268 998,304 1042.5,304" />
            <ChemicalFeed
                x="1063.5"
                y="287"
                text={<TextArray textArray={["Antiscalant", "Dosing"]} />}
                textDir='down' />
            <ROVessel
                x="843.5"
                y="402.5"
                innerText='RO Vessel 1'
                nubPositions={[[50, -17], [-50, 17]]}
            />
            <ROVessel
                x="843.5"
                y="446"
                innerText='RO Vessel 2'
                nubPositions={[[-50, -17], [50, 17]]}
            />
            <SensorIndicator
                x="854.5" y="296.5" line="down"
                innerText={md.get("ropressure", "abbreviated_name")}
                on_click={md.get("ropressure", "on_click")}
                outerText={get_value_unit_string("ropressure", md)}
            />
            <CheckValve dir="up" x="544.5" y="381.5" />
            <SensorIndicator
                dir="up" x="544.5" y="455"
                innerText={md.get("recycleflow", "abbreviated_name")}
                on_click={md.get("recycleflow", "on_click")}
                outerText={get_value_unit_string("recycleflow", md)}
            />
            <VariablePieValveIndicator
                x="713.5" y="508" textDir='up'
                outerText={
                    `${md.get("recyclevalveposition", "abbreviated_name")} `
                    + `(${md.get("recyclevalveposition", "current_value")}`
                    + `%)`
                }
                percentOpen={md.get("recyclevalveposition", "current_value")}
                on_click={md.get("recyclevalveposition", "on_click")}
            />
            <SensorIndicator
                x="933" y="508" line="left"
                innerText={md.get("concentratepressure", "abbreviated_name")}
                on_click={md.get("concentratepressure", "on_click")}
                outerText={get_value_unit_string("concentratepressure", md)}
            />
            <VariablePieValveIndicator
                x="813" y="578" textDir='up'
                outerText={
                    `${md.get("ropressctrlvalveposition", "abbreviated_name")} `
                    + `(${md.get("ropressctrlvalveposition", "current_value")}`
                    + `%)`
                }
                percentOpen={md.get("ropressctrlvalveposition", "current_value")}
                on_click={md.get("ropressctrlvalveposition", "on_click")}
            />
            <ValveIndicator
                x="713.5" y="636.5"
                innerText={md.get("concbypassrun", "abbreviated_name")}
                flow={md.get("concbypassrun", "current_value")}
                on_click={md.get("concbypassrun", "on_click")}
            />
            <SensorIndicator
                x="610" y="606.5" textDir='up'
                innerText={md.get("concentrateflow", "abbreviated_name")}
                on_click={md.get("concentrateflow", "on_click")}
                outerText={get_value_unit_string("concentrateflow", md)}
            />
            <ThreeWayValveIndicator
                dir="down" x="493" y="607"
                innerText={md.get("residtankvalverun", "abbreviated_name")}
                east={md.get("residtankvalverun", "current_value")}
                north={true}
                west={!md.get("residtankvalverun", "current_value")}
                on_click={md.get("residtankvalverun", "on_click")}
            />
            <LiquidFillGaugeWrapper
                dir="down" x="373" y="497" textDir='down' text='Residual'
                fillLevel={md.get("residualtanklevel", "current_value")}
            />
            <SensorIndicator
                x="372" y="431" line="down" textDir='up'
                innerText={md.get("residualtanklevel", "abbreviated_name")}
                on_click={md.get("residualtanklevel", "on_click")}
                outerText={get_value_unit_string("residualtanklevel", md)}
            />
            <SensorIndicator
                WaterScope x="307" y="525.5" line="right" innerText='400' outerText='12345' textDir='left' />
            <Drain x="312" y="717.5" text="To Septic Tank" textDir="left" />
            <SensorIndicator WaterScope x="492" y="707.5" line="up" innerText='200' textDir='left' outerText='123456' />
            <SensorIndicator
                x="1027.5" y="544.5" textDir='left'
                innerText={md.get("permtemp", "abbreviated_name")}
                on_click={md.get("permtemp", "on_click")}
                outerText={get_value_unit_string("permtemp", md)}
            />
            <SensorIndicator
                x="1027.5" y="594.5" textDir='left'
                innerText={md.get("permeateflow", "abbreviated_name")}
                on_click={md.get("permeateflow", "on_click")}
                outerText={get_value_unit_string("permeateflow", md)}
            />
            <SensorIndicator
                x="1027.5" y="644.5" textDir='left'
                innerText={md.get("permnitrate", "abbreviated_name")}
                on_click={md.get("permnitrate", "on_click")}
                outerText={get_value_unit_string("permnitrate", md)}
            />
            <SensorIndicator
                x="965" y="388.5" line="down" textDir='up'
                innerText={md.get("permtds", "abbreviated_name")}
                on_click={md.get("permtds", "on_click")}
                outerText={get_value_unit_string("permtds", md)}
            />
            <SensorIndicator
                x="1027" y="424" textDir='up'
                innerText={md.get("permeatepressure", "abbreviated_name")}
                on_click={md.get("permeatepressure", "on_click")}
                outerText={get_value_unit_string("permeatepressure", md)}
            />
            <ThreeWayValveIndicator
                x="817" y="734"
                innerText={md.get("proddiversionrun", "abbreviated_name")}
                east={!md.get("proddiversionrun", "current_value")}
                north={true}
                west={md.get("proddiversionrun", "current_value")}
                on_click={md.get("proddiversionrun", "on_click")}
            />
            <CheckValve dir="left" x="717" y="734" />
            {/* <SensorIndicator
                x="902" y="734" textDir='up'
                innerText={md.get("???", "abbreviated_name")}
                on_click={md.get("???", "on_click")}
                outerText='hook'
            />
            <SensorIndicator
                x="972" y="734" textDir='down'
                innerText={md.get("???", "abbreviated_name")}
                on_click={md.get("???", "on_click")}
                outerText='NTP'
            />
            <SensorIndicator
                x="1042" y="734" textDir='up'
                innerText={md.get("???", "abbreviated_name")}
                on_click={md.get("???", "on_click")}
                outerText='FTP'
            /> */}
        </g>
    )
}

function WaterDeliverSystem({ md }) {
    let to_permeate_flush = md.get("runflush", "current_value") && md.get("deliveryrun", "current_value");
    let ft4_to_pressure_tank = md.get("deliveryflow", "current_value") > 0 && md.get("deliveryrun", "current_value");

    let leaving_product_tank = to_permeate_flush || ft4_to_pressure_tank;

    return (
        <g>
            <rect rx="10" x="1120" y="80" width="300px" height="700px" fill="#e2f0d9" />
            <text x="1130" y="110"{...titleProps}>WATER DELIVERY</text>
            <text x="1130" y="130"{...titleProps}>SYSTEM</text>
            <AnimatedPipe
                noarr
                stroke={LIGHTBLUECOLOR}
                paths={[[[1246, 700.5], [1382.5, 700.5], [1382.5, 666.5]]]}
                pipeOn={leaving_product_tank}
            />
            <AnimatedPipe
                noarr
                stroke={LIGHTBLUECOLOR}
                paths={[[[1382, 600.5], [1382, 395.5], [1336.5, 395.5]]]}
                pipeOn={ft4_to_pressure_tank}
            />
            <AnimatedPipe
                noarr
                stroke={LIGHTBLUECOLOR}
                paths={[[[1382, 627.5], [1382, 595]]]}
                pipeOn={leaving_product_tank}
            />
            <AnimatedPipe
                stroke={LIGHTBLUECOLOR}
                paths={[[[1298.5, 395.5], [1262, 395.5]]]}
                pipeOn={ft4_to_pressure_tank}
            />
            <AnimatedPipe
                junctionPositions={[[1382, 595.5]]}
                stroke={LIGHTBLUECOLOR}
                paths={[[[1382, 595.5], [1322, 595.5]]]}
                pipeOn={to_permeate_flush}
            />
            <AnimatedPipe
                stroke={LIGHTBLUECOLOR}
                paths={[[[1232, 395.5], [1169.5, 395.5], [1169.5, 173.5], [1211, 173.5]]]}
                pipeOn={ft4_to_pressure_tank}
            />
            <AnimatedPipe
                stroke={LIGHTBLUECOLOR}
                paths={[[[1251, 173.5], [1329.5, 173.5], [1329.5, 53.5]]]} />

            <LiquidFillGaugeWrapper
                x="1225" y="710" textDir='down'
                text="Product Tank"
            />
            <SensorIndicator
                x="1224" y="644.5" line="down" textDir='up'
                innerText={md.get("prodtanklevel", "abbreviated_name")}
                on_click={md.get("prodtanklevel", "on_click")}
                outerText={get_value_unit_string("prodtanklevel", md)}
            />
            <ArrowPolyLine stroke="black" points="1150.5,695 1150.5,565 1173.5,565" />
            <ChemicalFeed
                x="1194"
                y="544.5"
                text={<TextArray textArray={["Chlorine", "Dosing"]} />} />
            <PumpSymbol
                x="1332"
                y="700.5"
                innerText={md.get("deliveryrun", "abbreviated_name")}
                flow={md.get("deliveryrun", "current_value")}
                on_click={md.get("deliveryrun", "on_click")}
            />
            <CheckValve dir="up" x="1382" y="645.5" />
            <text y="592" textAnchor="end" {...smallTextProps}>
                <TextArray
                    textArray={["Permeate", "Flush"]}
                    x="1310"
                />
            </text>
            <SensorIndicator
                x="1382" y="538.5" textDir='left'
                innerText={md.get("deliveryflow", "abbreviated_name")}
                on_click={md.get("deliveryflow", "on_click")}
                outerText={get_value_unit_string("deliveryflow", md)}
            />
            {/* <SensorIndicator
                x="1382" y="468.5" textDir='left'
                innerText={md.get("???", "abbreviated_name")}
                on_click={md.get("???", "on_click")}
                outerText='PT7'
            /> */}
            <CheckValve dir="left" x="1317.5" y="395.5" />
            <SensorIndicator
                x="1169" y="245.5" textDir='right'
                innerText={md.get("deliverypressure", "abbreviated_name")}
                on_click={md.get("deliverypressure", "on_click")}
                outerText={get_value_unit_string("deliverypressure", md)}
            />
            <MultiMediaFilter x="1237.5" y="425.5" textDir="down" outerText='Remineralizer' />
            <PressureTank x="1239" y="175.5" text='Pressure Tank' textDir='down' />
            <text x="1329" y="38" {...smallTextProps} textAnchor='middle'>
                Water Delivery
            </text>
            <SensorIndicator WaterScope x="1329" y="172.5" innerText="300" outerText="123456" textDir='down' />
        </g>
    )
}


export default function BlueRockSystem() {
    const CACHE_SIZE = 300;
    
    const [current_modal, set_current_modal] = useState("");
    const [current_modal_data, set_current_modal_data] = useState([]);
    const [modal_table_dict, set_modal_table_dict] = useState(initialize_modal_table_dict());
    const [play_speed_index, set_play_speed_index] = useState(0);
    const [playing, set_playing] = useState(false);
    const [time_reversed, set_time_reversed] = useState(false);
    const [x_pos_brush_1, set_x_pos_brush_1] = useState(100);
    const [x_pos_brush_2, set_x_pos_brush_2] = useState(200);
    const [chart_width, set_chart_width] = useState(700);
    const [cached_data, set_cached_data] = useState([]);
    const [need_to_recache, set_need_to_recache] = useState(true);
    const [data, set_data] = useState([[1613404800000, 0],[1613404805000, 0]]);
    const [loading_chart, set_loading_chart] = useState(false);
    const [navbar_x_to_time, set_navbar_x_to_time] = useState(()=>(x)=>mapRange(x, 0, chart_width, 1613965353, 1613965353));
    const [time_to_navbar_x, set_time_to_navbar_x] = useState(()=>(time)=>mapRange(time, 1613965353, 1613965353, 0, chart_width));


    //==========================================================================
    // Initial Setup

    useEffect(()=> {
        async function fetch_data() {
            set_loading_chart(true);
            let fetch_string = `http://${host_string}/bluerock/sensor_info_table`;
            let response = await fetch(fetch_string);
            let sensor_info_table = await response.json();
            create_modal_table(
                "bluerock",
                sensor_info_table,
                set_current_modal,
                set_current_modal_data
            )
            
            fetch_string = `http://${host_string}/bluerock/adaptive_all_history/permeateflow/${new Date('2021-01-03').toISOString()}/${new Date('2021-01-05').toISOString()}`;
            response = await fetch(fetch_string);
            let response_json = await response.json();
            set_loading_chart(false);
            set_data(response_json);
        }
        fetch_data();
    },[]); // empty dependency array means only runs once 




    // let data = [[1613404800000, 93], [1613404801000, 75], [1613404802000, 69], [1613404803000, 66], [1613404804000, 1], [1613404805000, 52], [1613404806000, 82], [1613404807000, 24], [1613404808000, 29], [1613404809000, 74], [1613404810000, 92], [1613404811000, 63], [1613404812000, 47], [1613404813000, 78], [1613404814000, 82], [1613404815000, 87], [1613404816000, 56], [1613404817000, 56], [1613404818000, 48], [1613404819000, 16], [1613404820000, 22], [1613404821000, 16], [1613404822000, 93], [1613404823000, 15], [1613404824000, 14], [1613404825000, 17], [1613404826000, 62], [1613404827000, 61], [1613404828000, 70], [1613404829000, 99], [1613404830000, 94], [1613404831000, 73], [1613404832000, 41], [1613404833000, 16], [1613404834000, 74], [1613404835000, 86], [1613404836000, 70], [1613404837000, 21], [1613404838000, 7], [1613404839000, 69], [1613404840000, 21], [1613404841000, 39], [1613404842000, 77], [1613404843000, 70], [1613404844000, 60], [1613404845000, 72], [1613404846000, 20], [1613404847000, 32], [1613404848000, 5], [1613404849000, 30], [1613404850000, 8], [1613404851000, 55], [1613404852000, 47], [1613404853000, 13], [1613404854000, 79], [1613404855000, 98], [1613404856000, 94], [1613404857000, 100], [1613404858000, 73], [1613404859000, 96], [1613404860000, 97], [1613404861000, 55], [1613404862000, 85], [1613404863000, 5], [1613404864000, 23], [1613404865000, 32], [1613404866000, 43], [1613404867000, 2], [1613404868000, 18], [1613404869000, 33], [1613404870000, 11], [1613404871000, 30], [1613404872000, 95], [1613404873000, 35], [1613404874000, 3], [1613404875000, 33], [1613404876000, 30], [1613404877000, 73], [1613404878000, 80], [1613404879000, 41], [1613404880000, 16], [1613404881000, 43], [1613404882000, 88], [1613404883000, 84], [1613404884000, 61], [1613404885000, 1], [1613404886000, 100], [1613404887000, 64], [1613404888000, 72], [1613404889000, 95], [1613404890000, 37], [1613404891000, 83], [1613404892000, 48], [1613404893000, 80], [1613404894000, 31], [1613404895000, 83], [1613404896000, 91], [1613404897000, 20], [1613404898000, 12], [1613404899000, 97], [1613404900000, 44], [1613404901000, 44], [1613404902000, 100], [1613404903000, 65], [1613404904000, 17], [1613404905000, 70], [1613404906000, 75], [1613404907000, 24], [1613404908000, 78], [1613404909000, 9], [1613404910000, 89], [1613404911000, 55], [1613404912000, 26], [1613404913000, 93], [1613404914000, 24], [1613404915000, 3], [1613404916000, 18], [1613404917000, 38], [1613404918000, 69], [1613404919000, 42], [1613404920000, 4], [1613404921000, 47], [1613404922000, 72], [1613404923000, 40], [1613404924000, 51], [1613404925000, 59], [1613404926000, 50], [1613404927000, 77], [1613404928000, 49], [1613404929000, 4], [1613404930000, 61], [1613404931000, 59], [1613404932000, 0], [1613404933000, 81], [1613404934000, 10], [1613404935000, 69], [1613404936000, 77], [1613404937000, 79], [1613404938000, 69], [1613404939000, 1], [1613404940000, 28], [1613404941000, 71], [1613404942000, 40], [1613404943000, 16], [1613404944000, 78], [1613404945000, 27], [1613404946000, 46], [1613404947000, 96], [1613404948000, 60], [1613404949000, 2], [1613404950000, 27], [1613404951000, 10], [1613404952000, 82], [1613404953000, 30], [1613404954000, 70], [1613404955000, 0], [1613404956000, 37], [1613404957000, 67], [1613404958000, 26], [1613404959000, 24], [1613404960000, 42], [1613404961000, 0], [1613404962000, 84], [1613404963000, 62], [1613404964000, 90], [1613404965000, 90], [1613404966000, 44], [1613404967000, 10], [1613404968000, 26], [1613404969000, 8], [1613404970000, 53], [1613404971000, 89], [1613404972000, 24], [1613404973000, 9], [1613404974000, 90], [1613404975000, 54], [1613404976000, 3], [1613404977000, 88], [1613404978000, 97], [1613404979000, 80], [1613404980000, 65], [1613404981000, 84], [1613404982000, 21], [1613404983000, 72], [1613404984000, 44], [1613404985000, 31], [1613404986000, 17], [1613404987000, 4], [1613404988000, 43], [1613404989000, 38], [1613404990000, 87], [1613404991000, 17], [1613404992000, 50], [1613404993000, 66], [1613404994000, 23], [1613404995000, 69], [1613404996000, 34], [1613404997000, 47], [1613404998000, 62], [1613404999000, 19], [1613405000000, 40], [1613405001000, 22], [1613405002000, 83], [1613405003000, 80], [1613405004000, 11], [1613405005000, 9], [1613405006000, 93], [1613405007000, 61], [1613405008000, 6], [1613405009000, 38], [1613405010000, 47], [1613405011000, 43], [1613405012000, 77], [1613405013000, 19], [1613405014000, 54], [1613405015000, 64], [1613405016000, 37], [1613405017000, 55], [1613405018000, 65], [1613405019000, 66], [1613405020000, 90], [1613405021000, 70], [1613405022000, 66], [1613405023000, 11], [1613405024000, 16], [1613405025000, 27], [1613405026000, 70], [1613405027000, 18], [1613405028000, 54], [1613405029000, 25], [1613405030000, 31], [1613405031000, 74], [1613405032000, 12], [1613405033000, 36], [1613405034000, 85], [1613405035000, 38], [1613405036000, 62], [1613405037000, 61], [1613405038000, 4], [1613405039000, 58], [1613405040000, 49], [1613405041000, 62], [1613405042000, 69], [1613405043000, 2], [1613405044000, 40], [1613405045000, 87], [1613405046000, 36], [1613405047000, 86], [1613405048000, 6], [1613405049000, 65], [1613405050000, 12], [1613405051000, 38], [1613405052000, 70], [1613405053000, 60], [1613405054000, 9], [1613405055000, 84], [1613405056000, 45], [1613405057000, 53], [1613405058000, 95], [1613405059000, 69], [1613405060000, 68], [1613405061000, 82], [1613405062000, 35], [1613405063000, 24], [1613405064000, 98], [1613405065000, 8], [1613405066000, 39], [1613405067000, 10], [1613405068000, 5], [1613405069000, 92], [1613405070000, 45], [1613405071000, 62], [1613405072000, 63], [1613405073000, 94], [1613405074000, 35], [1613405075000, 26], [1613405076000, 69], [1613405077000, 50], [1613405078000, 83], [1613405079000, 47], [1613405080000, 70], [1613405081000, 50], [1613405082000, 23], [1613405083000, 91], [1613405084000, 31], [1613405085000, 24], [1613405086000, 79], [1613405087000, 88], [1613405088000, 52], [1613405089000, 44], [1613405090000, 12], [1613405091000, 88], [1613405092000, 15], [1613405093000, 6], [1613405094000, 91], [1613405095000, 11], [1613405096000, 61], [1613405097000, 97], [1613405098000, 99], [1613405099000, 61], [1613405100000, 30], [1613405101000, 12], [1613405102000, 52], [1613405103000, 96], [1613405104000, 50], [1613405105000, 20], [1613405106000, 96], [1613405107000, 47], [1613405108000, 25], [1613405109000, 26], [1613405110000, 20], [1613405111000, 57], [1613405112000, 21], [1613405113000, 45], [1613405114000, 24], [1613405115000, 19], [1613405116000, 28], [1613405117000, 47], [1613405118000, 40], [1613405119000, 4], [1613405120000, 27], [1613405121000, 81], [1613405122000, 98], [1613405123000, 94], [1613405124000, 11], [1613405125000, 73], [1613405126000, 57], [1613405127000, 2], [1613405128000, 57], [1613405129000, 80], [1613405130000, 70], [1613405131000, 23], [1613405132000, 77], [1613405133000, 76], [1613405134000, 84], [1613405135000, 36], [1613405136000, 23], [1613405137000, 28], [1613405138000, 3], [1613405139000, 30], [1613405140000, 33], [1613405141000, 60], [1613405142000, 40], [1613405143000, 72], [1613405144000, 89], [1613405145000, 67], [1613405146000, 22], [1613405147000, 74], [1613405148000, 79], [1613405149000, 52], [1613405150000, 17], [1613405151000, 97], [1613405152000, 19], [1613405153000, 37], [1613405154000, 14], [1613405155000, 18], [1613405156000, 6], [1613405157000, 38], [1613405158000, 18], [1613405159000, 50], [1613405160000, 88], [1613405161000, 92], [1613405162000, 18], [1613405163000, 15], [1613405164000, 23], [1613405165000, 90], [1613405166000, 13], [1613405167000, 11], [1613405168000, 36], [1613405169000, 65], [1613405170000, 98], [1613405171000, 87], [1613405172000, 79], [1613405173000, 27], [1613405174000, 85], [1613405175000, 49], [1613405176000, 96], [1613405177000, 9], [1613405178000, 94], [1613405179000, 72], [1613405180000, 50], [1613405181000, 60], [1613405182000, 47], [1613405183000, 47], [1613405184000, 16], [1613405185000, 62], [1613405186000, 35], [1613405187000, 97], [1613405188000, 53], [1613405189000, 82], [1613405190000, 97], [1613405191000, 89], [1613405192000, 38], [1613405193000, 59], [1613405194000, 14], [1613405195000, 85], [1613405196000, 7], [1613405197000, 60], [1613405198000, 41], [1613405199000, 62], [1613405200000, 85], [1613405201000, 93], [1613405202000, 0], [1613405203000, 70], [1613405204000, 49], [1613405205000, 61], [1613405206000, 60], [1613405207000, 57], [1613405208000, 37], [1613405209000, 74], [1613405210000, 1], [1613405211000, 93], [1613405212000, 84], [1613405213000, 69], [1613405214000, 94], [1613405215000, 83], [1613405216000, 91], [1613405217000, 42], [1613405218000, 78], [1613405219000, 37], [1613405220000, 48], [1613405221000, 18], [1613405222000, 99], [1613405223000, 79], [1613405224000, 64], [1613405225000, 63], [1613405226000, 98], [1613405227000, 71], [1613405228000, 6], [1613405229000, 74], [1613405230000, 8], [1613405231000, 37], [1613405232000, 81], [1613405233000, 48], [1613405234000, 72], [1613405235000, 92], [1613405236000, 60], [1613405237000, 90], [1613405238000, 31], [1613405239000, 4], [1613405240000, 70], [1613405241000, 65], [1613405242000, 87], [1613405243000, 21], [1613405244000, 2], [1613405245000, 90], [1613405246000, 58], [1613405247000, 2], [1613405248000, 77], [1613405249000, 97], [1613405250000, 30], [1613405251000, 39], [1613405252000, 85], [1613405253000, 25], [1613405254000, 27]];

    const current_time = navbar_x_to_time((x_pos_brush_1 + x_pos_brush_2) / 2);
    
    useEffect(()=>{
        if( ! need_to_recache) {
            return ()=>{};
        }
        set_need_to_recache(false);
        async function fetch_data() {
            // let connection_string = `http://${host_string}/bluerock/all_sensors_around/${new Date(current_time).toISOString()}/${Math.floor(CACHE_SIZE/2)}`;
            let connection_string = "http://ec2-54-215-192-153.us-west-1.compute.amazonaws.com:5001/bluerock/most_recent";
            let response = await fetch(connection_string);
            let response_json = await response.json();
        }
        fetch_data();
        return ()=>{}
    }, [x_pos_brush_1])

    return (
        <>
            <MyChart
                width={chart_width}
                data={data}
                x_pos_brush_1={x_pos_brush_1}
                x_pos_brush_2={x_pos_brush_2}
                set_x_pos_brush_1={set_x_pos_brush_1}
                set_x_pos_brush_2={set_x_pos_brush_2}
                loading={loading_chart}
            />

            <svg width="100%" height="100%" viewBox="0 0 1420 780">
                <FeedTankSystem
                    md={modal_table_dict}
                />
                <WaterDeliverSystem
                    md={modal_table_dict}
                />
                <ROSystem
                    md={modal_table_dict}
                />
                <Key />
            </svg>
            {/* {current_modal !== null && <WideModal
                header={current_modal}
                isOn={true}
                onHide={() => set_current_modal(null)}
                isLoading={current_modal_data["loading"]}
                body={
                    <Row style={{ "position": "relative" }}>
                        <Col xs={12}>
                            <StockTickerChart
                                onWindowChange={async (e) => {
                                    const { chart } = e.target;
                                    chart.showLoading('Loading data from server...');
                                    const current_modal_inner_data_name =
                                        Object.values(modal_table_dict).filter(value => typeof value === "object").filter(value => value["human_readible_name"] === current_modal)[0]["internal_data_name"];
                                    let response = await fetch(`http://${host_string}/bluerock/adaptive_all_history/${current_modal_inner_data_name}/${new Date(e.min)}/${new Date(e.max)}`);

                                    let response_json = await response.json();
                                    chart.hideLoading();
                                    console.log(response_json)
                                    set_current_modal_data((prev) => ({
                                        ...prev,
                                        time_series_data: response_json
                                    }))
                                }}
                                data={current_modal_data["time_series_data"]}
                                yAxisTitle={modal_table_dict.get(current_modal, "units")} />
                        </Col>
                        {current_modal_data["current_data"]["value"] === undefined && <div style={{
                            "position": "absolute",
                            "top": "0",
                            "left": "0",
                            "background": "rgba(255,255,255,0.7)",
                            "width": "100%",
                            "height": "100%"
                        }}>
                            <div style={{
                                "position": "absolute",
                                "top": "50%",
                                "left": "50%",
                                "fontSize": "4rem",
                                "transform": "translate(-50%, -50%)"
                            }}>
                                Loading Data
                            </div>
                        </div>}
                    </Row>
                }
            />} */}

            <div
                style={{
                    "display": "flex",
                    "alignItems": "center",
                    "gap": "20px",
                    "flexWrap": "wrap",
                    "justifyContent": "center",
                    "background": "#e8f4ff",
                    "padding": "20px 10px 10px 10px",
                    "borderRadius": "8px"
                }}
            >
                <div style={{
                    "background": "white",
                    'borderRadius': "5px"
                }}>
                </div>
                <div
                    style={{
                        "fontSize": "1.5rem",
                        "fontWeight": "bold",
                        "width": "160px"
                    }}
                >
                    {/* <div style={{ "marginBottom": "-5px" }}> Displayed Time: </div>
                    {displayed_date} */}
                </div>

                <div style={{
                    "borderRadius": "2px",
                    "border": "2px solid grey",
                    "padding": "7px",
                    "display": "flex",
                    "flexDirection": "column",
                    "alignItems": "center",
                    "background": "white"
                }}>
                    <div style={{
                        "position": "absolute",
                        "height": "3px",
                        "background": "white",
                        "marginTop": "-9px",
                    }}>
                        <div style={{
                            "textShadow": '1px 0 white, 0 -1px white, -1px 0 white, 0 1px white, 1px 1px white, -1px -1px white, -1px 1px white, 1px -1px white',
                            "marginTop": "-10px"
                        }}>
                            {playing ? play_back_speeds[play_speed_index][1] : "paused"}
                            {time_reversed && " (reverse)"}
                        </div>
                    </div>
                    <div
                        style={{
                            "display": "flex",
                            "alignItems": "center",
                            "gap": "1px",
                        }}
                    >
                        <SpeedButton
                            text=""
                            ffwd={true}
                            width="60px"
                            flip={true}
                            selected={playing && time_reversed}
                            on_click={() => {
                                if (!playing) {
                                    set_playing(true);
                                } else if (time_reversed) {
                                    set_play_speed_index((old) => {
                                        return (old + 1) % (play_back_speeds.length)
                                    });
                                }
                                set_time_reversed(true);
                            }}
                        />
                        <SpeedButton
                            pause={playing}
                            arrowLength={5}
                            width="50px"
                            on_click={() => {
                                set_time_reversed(false);
                                set_playing((old) => !old);
                            }}
                        />
                        <SpeedButton
                            text=""
                            ffwd={true}
                            width="60px"
                            selected={playing && !time_reversed}
                            on_click={() => {
                                if (!playing) {
                                    set_playing(true);
                                } else if (!time_reversed) {
                                    set_play_speed_index((old) => {
                                        return (old + 1) % (play_back_speeds.length)
                                    });
                                }
                                set_time_reversed(false);
                            }}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}