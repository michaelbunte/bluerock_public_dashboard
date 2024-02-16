import React, { useEffect } from 'react';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import { tree } from 'd3';

const StockTickerChart = ({ 
        data, 
        title="", 
        yAxisTitle="",
        onWindowChange=(e)=>{console.log(e.min)} // can access e.min and e.max
    }) => {

    const options =
    {
        navigator: {
            adaptToUpdatedData: false
        },
        scrollbar: {
            liveRedraw: false
        },
        chart: {
            zooming: {
                type: 'x',
                pinchType: 'x'
            },
            width: null
        }, credits: {
            enabled: false
        }, title: {
            text: title
        },
        xAxis: {
            type: 'datetime',
            title: { text: 'Time', style: { fontWeight: 'bold' } },
            dateTimeLabelFormats: {
                hour: '%l %p'
            },
            events: {
                afterSetExtremes: onWindowChange
            },
            ordinal: false
        },
        yAxis: {
            title: {
                text: yAxisTitle, style: { fontWeight: 'bold' }
            },
            min: 0
        },
        legend: {
            enabled: false
        },
        plotOptions: {
            area: {
                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [
                        [0, '#4db8ff'],
                        [1, '#4db8ff'],
                        // [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    ]
                },
                marker: {
                    fillColor: '#3c8dbc',
                    lineColor: '#3c8dbc',
                    radius: 2
                },
                lineWidth: 1,
                states: {
                    hover: {
                        lineWidth: 3
                    }
                },
                threshold: null
            }
        },
        series: [{
            type: 'area',
            name: yAxisTitle,
            data: data,
            color: '#2977ab',
            pointStart: Date.UTC(2020, 8, 20),
            pointInterval: 1
        }]
    }
    return <div style={{margin: "0px 20px"}}>
        <HighchartsReact
            containerProps={{ style: { width: "100%" } }}
            highcharts={Highcharts}
            options={options}
            constructorType={'stockChart'}
        />
    </div>;
};

export default StockTickerChart;
