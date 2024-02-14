import {
    LIGHTGREYCOLOR, LIGHTBLUECOLOR, BLUECOLOR, WHITECOLOR, GREENCOLOR,
    PINKCOLOR, REDCOLOR, DARKBLUECOLOR,
    titleProps, normalTextProps, smallTextProps,
    getFlowColor, getAngle, getDirection,
    PumpSymbol, SensorIndicator, ValveIndicator, VariableValveIndicator,
    StaticRelativeText, RelativeText, ThreeWayValveIndicator, MultiMediaFilter,
    CheckValve, ArrowPolyLine, ChemicalFeed, SingleFilter, DoubleFilter,
    PressureTank, ROVessel, TextArray, Drain, KeyElementWrapper, Key,
    LiquidFillGaugeWrapper, DevToolsDisplay, AnimatedPipe, RebuiltModal
} from "../Components/DetailedDash/DetailedDashComponents.jsx"

import { Box, Col, Row, Content, SimpleTable, Inputs, Badge, Tabs, TabContent } from 'adminlte-2-react';
import '../OpClock.css';
import {MyModal} from "../Components/MyModal.js";
import { motion } from "framer-motion"
import MyCheckBox from "../Components/MyCheckBox.js";
import React, { useState, useEffect, useContext } from 'react';
import BlueRockSystem from "../Components/DetailedDash/BlueRockSystem.jsx";
import PryorFarmsSystem from "../Components/DetailedDash/PryorFarmsSystem.jsx";
import SantaTeresaSystem from "../Components/DetailedDash/SantaTeresa.jsx";
import StockTickerChart from "../Components/HighChartComps/StockTicker.js";
import GaugeChart from "../Components/HighChartComps/GaugeChart.js";
import { SystemContext } from "../App.js";
import { WideModal } from "../Components/WideModal.js";
import { MyGauge } from "../Components/MyGauge.jsx";



const { Date: InputDate } = Inputs;

function DetailedDash() {

    const appContext = useContext( SystemContext );

    const data = [
        { sensor: "RO Status", status: <Badge text="RO Running" color="green" /> },
        { sensor: "Well Pump", status: <Badge text="Not Running" color="red" /> },
        { sensor: "P1 Feed Pump", status: <Badge text="Running" color="green" /> },
        { sensor: "AV1 Inlet Valve", status: <Badge text="Open" color="green" /> },
        { sensor: "P2 RO Pump", status: <Badge text="Running" color="green" /> },
        { sensor: "AV6 ProductDiversion Valve", status: <Badge text="Fill Product Tank" color="green" /> },
        { sensor: "P3 Delivery Pump", status: <Badge text="Not Running" color="red" /> }
    ];

    const columns = [
        { data: 'sensor', title: "Sensor" },
        { data: 'status', title: "Status" }
    ];

    return (
        <>
            <Row>
                <Col md={12}>
                    <Box>
                        <div style={{ display: "flex" }}>
                            <div style={{ padding: "7px 40px 0px 20px", display: "flex" }}>
                                <MyCheckBox text="Live Data" />
                            </div>
                            <InputDate
                                labelPosition="none"
                                iconLeft="fas-calendar"
                            />
                        </div>
                    </Box>
                </Col>
            </Row>
            <Row>
                <Col md={12}>
                    <Box>
                        <div style={{ maxWidth: "1300px", width: "100%", margin: "0 auto" }}>
                            {appContext["system"] === "bluerock" && <BlueRockSystem />}
                            {appContext["system"]=== "pryorfarms" && <PryorFarmsSystem />}
                            {appContext["system"]=== "santateresa" && <SantaTeresaSystem />}
                        </div>
                        <div style={{ fontSize: "1rem", textAlign: "right"}}>
                            Press ` to enable devtools
                        </div>
                    </Box>
                </Col>
            </Row>
            <Row>
                <Col md={6}>
                    <Box title="Current Warnings">
                        <ul>
                            <li>Apple</li>
                            <li>Orange</li>
                        </ul>
                    </Box>
                </Col>
                <Col md={6}>
                    <Box>
                        <SimpleTable
                            data={data}
                            columns={columns}
                            width="20px"
                            border
                            responsive
                        />
                    </Box>
                </Col>
            </Row>
            <Row>
                <Col md={12}>
                    <Tabs defaultActiveKey="tab1">
                        <TabContent eventKey="tab1" title="Feed System">
                            Dummy Text
                        </TabContent>
                        <TabContent eventKey="tab2" title="RO Treatment">
                            Dummy Text
                        </TabContent>
                        <TabContent eventKey="tab3" title="Delivery Status">
                            Dummy Text
                        </TabContent>
                    </Tabs>
                </Col>
            </Row>
        </>
    )
}

const run_get = async () => {
    console.log("running run_get()");
    let date1 = new Date("2020-07-05T05:10:10.000Z");
    let date2 = new Date("2020-07-20T05:10:10.000Z");
    let datestring1 = date1.toString();
    let datestring2 = date2.toString();
    try {
      const response = await fetch(`http://localhost:5001/bluerock/date_range/${datestring1}/${datestring2}`);
      const jsonData = await response.json();
      return jsonData;
    } catch (err) {
      console.error(err.message);
    }
};


 

function DetailedDashPage() {
    const [dummyData, setDummyData] = useState([]);

    useEffect( () => {
        const update_data = async () => {
            let json_data = await run_get();
            setDummyData(json_data);
        };
        update_data();
    }, []);

    return (
        <Content title="Detailed Dashboard" subTitle="View detailed dashboard Data" browserTitle="Hello World">
            <DetailedDash />
        </Content>
    );
}

export default DetailedDashPage;