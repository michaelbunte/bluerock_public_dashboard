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
    play_back_speeds
} from "./detailedDashHelperFuncs.js";
import { WideModal } from "../WideModal.js";
import { MyGauge } from "../MyGauge.jsx";
import StockTickerChart from "../HighChartComps/StockTicker.js";

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

import dayjs, { Dayjs } from 'dayjs';


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
    let av6_to_av7 = ! md.get("proddiversionrun", "current_value") && ro_to_av6;
    let av6_to_product_tank = md.get("proddiversionrun", "current_value") && ro_to_av6;
    let junction_to_av7 = av6_to_product_tank || av3_av5_junction;
    let to_septic_tank = ! md.get("residtankvalverun", "current_value") && junction_to_av7;
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
                junctionPositions={[[544,331]]} 
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
                paths={[[[847.5,733.5],[1147.5,733.5],[1147.5,703.5],[1187.5,703.5]]]} 
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
                paths={[[[1382,627.5],[1382,595]]]}
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

    async function handle_date_change(
        new_date
    ) {
        let date_obj = new Date(new_date.toISOString());

        function update_display_values(input_cache) {
            let target_index = binary_search_cache(
                input_cache,
                date_obj.toISOString()
            )

            if (target_index === -1) {
                console.log("target time does not exist in cache");
                return;
            }

            let target_image = input_cache[target_index];

            update_modal_table_current_values(
                target_image,
                set_modal_table_dict
            );

            set_current_date_time(new_date);
            set_displayed_date(new Date(target_image["plctime"]).toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
        }

        async function reupdate_cache() {
            console.log("reupdating cache")
            let start_time = new_date.clone().toISOString();
            let response = await fetch(`http://localhost:5001/bluerock/all_sensors_around/${start_time}/1000`);
            let response_json = await response.json();
            set_cached_data(response_json);
            update_display_values(response_json);
        }

        if (cached_data.length === 0) {
            await reupdate_cache();
            return;
        }

        let ten_perc_date = new Date(cached_data[Math.floor((cached_data.length - 1) * 0.125)]["plctime"]);
        let ninety_perc_date = new Date(cached_data[Math.floor((cached_data.length - 1) * 0.875)]["plctime"]);

        if (date_obj <= ten_perc_date || date_obj >= ninety_perc_date) {
            await reupdate_cache();
            return;
        }

        update_display_values(cached_data);
    }

    // string representing which modal we want to show.
    // null if no modal should be shown right now
    const [current_modal, set_current_modal] = useState(null);

    // dictionary holding 
    const [modal_table_dict, set_modal_table_dict] = useState(initialize_modal_table_dict());

    const [cached_data, set_cached_data] = useState([]);
    const [displayed_date, set_displayed_date] = useState("");

    const [play_speed_index, set_play_speed_index] = useState(0);
    const [playing, set_playing] = useState(false);
    const [time_reversed, set_time_reversed] = useState(false);

    const [current_modal_data, set_current_modal_data] = useState(
        {
            loading: false,
            time_series_data: [],
            current_data: { time: undefined, value: undefined },
            description: "No Description",
            units: ""
        }
    );

    const [
        current_date_time,
        set_current_date_time
    ] = React.useState(dayjs('2020-07-20T15:30'));

    useEffect(() => {
        const get_sensor_data = async () => {
            try {
                const response =
                    await fetch("http://localhost:5001/bluerock/sensor_info_table");
                const sensor_data_table = await response.json();
                const modal_table = create_modal_table(
                    "bluerock",
                    sensor_data_table,
                    set_current_modal,
                    set_current_modal_data
                );
                set_modal_table_dict(modal_table);
                handle_date_change(current_date_time);
            } catch (e) {
                console.error(e);
            }
        }
        get_sensor_data().then(async () =>
            await update_modal_table_current_values(
                modal_table_dict,
                "bluerock",
                new Date(current_date_time).toISOString()
            )
        );
    }, []);

    useInterval(() => {
        if (playing) {
            let current_date_time_copy = current_date_time.clone();
            let speed = play_back_speeds[play_speed_index][0]/10;
            if (time_reversed) {
                speed = speed * -1;
            }
            handle_date_change(current_date_time_copy.add(speed, "millisecond"));
        }
    }, 100);

    return (
        <>
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
            {current_modal !== null && <WideModal
                header={current_modal}
                isOn={true}
                onHide={() => set_current_modal(null)}
                isLoading={current_modal_data["loading"]}
                body={
                    <Row style={{ "position": "relative" }}>
                        <Col xs={12}>
                            <StockTickerChart
                                onWindowChange={async (e)=>{
                                    const { chart } = e.target;
                                    chart.showLoading('Loading data from server...');
                                    const current_modal_inner_data_name = 
                                        Object.values(modal_table_dict).filter( value => typeof value === "object").filter(value => value["human_readible_name"] === current_modal)[0]["internal_data_name"];
                                    let response = await fetch(`http://localhost:5001/bluerock/adaptive_all_history/${current_modal_inner_data_name}/${new Date(e.min)}/${new Date(e.max)}`);
                                    
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
            />}

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
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateTimePicker
                            label="Select System Time"
                            value={current_date_time}
                            onChange={handle_date_change}
                            sx={{
                                fontSize: 50,
                                fontWeight: "bold"
                            }}
                        />
                    </LocalizationProvider>
                </div>
                <div
                    style={{
                        "fontSize": "1.5rem",
                        "fontWeight": "bold",
                        "width": "160px"
                    }}
                >
                    <div style={{ "marginBottom": "-5px" }}> Displayed Time: </div>
                    {displayed_date}
                </div>
                <div
                    style={{
                        "borderRadius": "2px",
                        "display": "flex",
                        "alignItems": "center",
                        "gap": "1px",
                        "border": "2px solid grey",
                        "padding": "7px",
                        "background": "white"
                    }}
                >
                    <SpeedButton
                        text="1 day" arrowLength={24} skip={true} flip={true}
                        on_click={() => handle_date_change(current_date_time.add(-1, 'day'))}
                    />
                    <SpeedButton
                        text="1 hour" arrowLength={19} skip={true} flip={true}
                        on_click={() => handle_date_change(current_date_time.add(-1, 'hour'))}
                    />
                    <SpeedButton
                        text="15 mins" arrowLength={15} skip={true} flip={true}
                        on_click={() => handle_date_change(current_date_time.add(-15, 'minute'))}
                    />
                    <SpeedButton
                        text="1 min" arrowLength={13} skip={true} flip={true}
                        on_click={() => handle_date_change(current_date_time.add(-1, 'minute'))}
                    />
                    <SpeedButton
                        text="1 min" arrowLength={13} skip={true}
                        on_click={() => handle_date_change(current_date_time.add(1, 'minute'))}
                    />
                    <SpeedButton
                        text="15 mins" arrowLength={15} skip={true}
                        on_click={() => handle_date_change(current_date_time.add(15, 'minute'))}
                    />
                    <SpeedButton
                        text="1 hour" arrowLength={19} skip={true}
                        on_click={() => handle_date_change(current_date_time.add(1, 'hour'))}
                    />
                    <SpeedButton
                        text="1 day" arrowLength={24} skip={true}
                        on_click={() => handle_date_change(current_date_time.add(1, 'day'))}
                    />
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
            <div>
                <select value="" >
                    <option value="2">Production</option>
                    <option value="3">Standby</option>
                    <option value="4">Feed Flush</option>
                    <option value="5">Permeate Flush</option>
                </select>
            </div>
        </>
    )
}