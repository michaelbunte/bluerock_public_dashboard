import React, { useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsMore from 'highcharts/highcharts-more';
import HighchartsReact from 'highcharts-react-official';

HighchartsMore(Highcharts);

const GaugeChart = ({ value, title="", unit=""}) => {
  useEffect(() => {
    const options = {
      chart: {
        type: 'gauge',
      },
      title: {
        text: title,
      },
      pane: {
        startAngle: -150,
        endAngle: 150,
        background: [
          {
            backgroundColor: {
              linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
              stops: [
                [0, '#FFF'],
                [1, '#333'],
              ],
            },
            borderWidth: 0,
            outerRadius: '19%',
          },
          {
            backgroundColor: {
              linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
              stops: [
                [0, '#333'],
                [1, '#FFF'],
              ],
            },
            borderWidth: 1,
            outerRadius: '107%',
          },
          {
            // default background
          },
          {
            backgroundColor: '#DDD',
            borderWidth: 0,
            outerRadius: '105%',
            innerRadius: '103%',
          },
        ],
      },
      // Additional Highcharts configurations here (e.g., yAxis, plotOptions, etc.)
      yAxis: {
        min: 0,
        max: 100,
        plotBands: [
          {
            from: 0,
            to: 50,
            color: '#DF5353', // Red
          },
          {
            from: 50,
            to: 80,
            color: '#FFA500', // Orange
          },
          {
            from: 80,
            to: 100,
            color: '#55BF3B', // Green
          },
        ],
      },
      series: [
        {
          name: 'Value',
          data: [value],
          tooltip: {
            valueSuffix: `  ${unit}`,
          },
        },
      ],
    };

    const chart = Highcharts.chart('gauge-chart-container', options);

    return () => {
      // Destroy the chart instance on unmounting to avoid memory leaks
      chart.destroy();
    };
  }, [value]);

  return <div id="gauge-chart-container"></div>;
};

export default GaugeChart;