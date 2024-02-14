import React from 'react';
import { Box, Col, Row, Content, SimpleTable } from 'adminlte-2-react';
import { LiquidFillGauge } from '../NativeFillGauge.js';
import '../OpClock.css';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts/highstock';
import highchartsMore from "highcharts/highcharts-more";
import { MyGauge, MyGaugeSVGContents } from '../Components/MyGauge.jsx';
import StockTickerChart from '../Components/HighChartComps/StockTicker.js';
import './Dashboard.css';
import { LiquidFillGaugeWrapper, TreatmentSystem, ArrowPolyLine } from '../Components/DetailedDash/DetailedDashComponents.jsx';
import GaugeChart from '../Components/HighChartComps/GaugeChart.js';
highchartsMore(Highcharts);


//import { Gauge } from './Gauge.js';

const options =
{

    chart: {
        type: 'gauge',
        plotBackgroundColor: null,
        plotBackgroundImage: null,
        plotBorderWidth: 0,
        plotShadow: false,
        height: '80%'
    },

    title: {
        text: 'Speedometer'
    },

    pane: {
        startAngle: -90,
        endAngle: 89.9,
        background: null,
        center: ['50%', '75%'],
        size: '110%'
    },

    // the value axis
    yAxis: {
        min: 0,
        max: 200,
        tickPixelInterval: 72,
        tickPosition: 'inside',
        tickColor: Highcharts.defaultOptions.chart.backgroundColor || '#FFFFFF',
        tickLength: 20,
        tickWidth: 2,
        minorTickInterval: null,
        labels: {
            distance: 20,
            style: {
                fontSize: '14px'
            }
        },
        plotBands: [{
            from: 0,
            to: 120,
            color: '#55BF3B', // green
            thickness: 20
        }, {
            from: 120,
            to: 160,
            color: '#DDDF0D', // yellow
            thickness: 20
        }, {
            from: 160,
            to: 200,
            color: '#DF5353', // red
            thickness: 20
        }]
    },

    series: [{
        name: 'Speed',
        data: [80],
        tooltip: {
            valueSuffix: ' km/h'
        },
        dataLabels: {
            format: '{y} km/h',
            borderWidth: 0,
            color: (
                Highcharts.defaultOptions.title &&
                Highcharts.defaultOptions.title.style &&
                Highcharts.defaultOptions.title.style.color
            ) || '#333333',
            style: {
                fontSize: '16px'
            }
        },
        dial: {
            radius: '80%',
            backgroundColor: 'gray',
            baseWidth: 12,
            baseLength: '0%',
            rearLength: '0%'
        },
        pivot: {
            backgroundColor: 'gray',
            radius: 6
        }

    }]

}

function SystemDescription(props) {
    return <Box title={props.systemName + " System Description"}>
        {props.description}
    </Box>
}


function OperationalTime({ OperationalTime, label = "days:hours:minutes" }) {
    function reformat(number) {
        const strNum = number + '';
        return strNum.length <= 1 ? '0' + strNum : strNum;
    }
    const { days, hours, mins } = OperationalTime;
    return (
        <Row>
            <div className='timer'>
                {reformat(days)}:{reformat(hours)}:{reformat(mins)}
                {label !== "" && <div className='timerlabel'>
                    {label}
                </div>}
            </div>
        </Row>
    );
}

function SystemStatus() {

    return (
        <Box title="System Status">
            <h3>RO Standby</h3>
            <p>System will remain operational for the next</p>
            <OperationalTime OperationalTime={{ days: 0, hours: 0, mins: 0 }}></OperationalTime>
        </Box>

    );
}



function SimplfiedDashboard() {
    return (
        <Box title="Simplified Dashboard">
            <svg viewBox='0 0 300 250'>
                <ArrowPolyLine stroke='black' points="175,48 70.5,48" />
                <ArrowPolyLine stroke='black' points="40,124.5 40,104.5 220,104.5 220,54.5" />
                <ArrowPolyLine noarr stroke='black' points="122,144.5 122,104.5" />
                <ArrowPolyLine noarr stroke='black' points="207,144.5 207,104.5" />
                <LiquidFillGaugeWrapper x="40" y="50" textDir='up' text='Feed tank' />
                <LiquidFillGaugeWrapper x="40" y="160" textDir='down' text="Product Tank" />
                <TreatmentSystem x="220.5" y="48" text='Treatment System' textDir='up' />
                <g transform="scale(0.5) translate(144.5,220)">
                    <MyGaugeSVGContents textScalar={1.4} val={3} />
                </g>
                <g transform="scale(0.5) translate(314,280)">
                    <MyGaugeSVGContents />
                </g>
            </svg>
        </Box>);
}

function DailyValueBox() {

    const columns = [{ title: '#', data: 'no', width: '10px' }];
    const data = [{
        no: '1.', task: 'Update software', progress: { value: 55, type: 'danger' }, label: 'red',
    }];


    return (
        <Box title="Daily Operational Metrics from 12:00AM PST to now:">

            <SimpleTable columns={columns} data={data}>
            </SimpleTable>
        </Box>
    );
}

function SensorGauge(props) {
    let poptions = {
        chart: {
            type: "gauge",
            height: '75%'
        },
        title: {
            text: "Gauge"
        },
        pane: {
            startAngle: -150,
            endAngle: 150,
            size: 150,
            background: [{
                backgroundColor: '#ffffff',
                borderWidth: 0,
                outerRadius: '109%'
            }, {
                backgroundColor: '#dddddd',
                borderWidth: 1,
                outerRadius: '107%'
            }, {
                // default background
            }, {
                backgroundColor: '#DDD',
                borderWidth: 0,
                outerRadius: '105%',
                innerRadius: '103%'
            }]
        },
        yAxis: {
            min: 0,
            max: 100,
            title: {

                text: props.unit,
            },

            plotBands: [{
                thickness: "7",
                from: 0,
                to: 75,
                color: '#00a65a' // green
            }, {
                thickness: "7",
                from: 75,
                to: 100,
                color: '#dd4b39' // red
            }]

        },
        series: [
            {
                data: [props.value]
            }]
    }
    return (
        <HighchartsReact highcharts={Highcharts} options={poptions} />
    );
}

/*
Component to contain gauges with various sensor statuses
*/
function SensorStatuses() {
    return (
        <Box title="Sensor Statuses">
            <Row>
                <Col >
                    <MyGauge/>
                </Col>
            </Row>
        </Box>
    );
}

function SystemOverview() {
    return (
        <Row>
            <Col md={3}>
                <SystemDescription systemName="Bluerock" description="This is the most recent operational state of the Bluerock Apartments Water Treatment system on W Market Circle in Salinas, CA."></SystemDescription>
                <SystemStatus></SystemStatus>
            </Col>
            <Col md={5}>
                <SimplfiedDashboard></SimplfiedDashboard>
            </Col>
            <Col md={3}>
                <DailyValueBox></DailyValueBox>
            </Col>
            <Col md={10}>
                <SensorStatuses></SensorStatuses>
            </Col>
        </Row>
    );
}

const run_get = async () => {
    console.log("running run_get()");
    let datestring1 = new Date("2020-07-05T05:10:10.000Z").toString();
    let datestring2 = new Date("2020-07-05T06:10:10.000Z").toString();
    try {
      const response = await fetch(`http://localhost:5001/bluerock/sensor_date_range/recycleflow/${datestring1}/${datestring2}`);
      const jsonData = await response.json();
      console.log(jsonData);
    } catch (err) {
      console.error(err.message);
    }
};

function DashboardPage() {
    return (
        <Content title="Dashboard" subTitle="View live site data" browserTitle="Hello World">
            <button onClick={run_get}>Default</button>;
            <SystemOverview></SystemOverview>
        </Content>
    );
}


export default DashboardPage;