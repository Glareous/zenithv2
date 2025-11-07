'use client'

import React from 'react'

import dynamic from 'next/dynamic'

import useChartColors from '@src/hooks/useChartColors'
import { ApexOptions } from 'apexcharts'

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
})

interface RadarChartsProps {
  chartColors: string
  chartDarkColors: string
  chartId: React.MutableRefObject<null>
}

const PolygonfillChart = ({
  chartColors,
  chartDarkColors,
  chartId,
}: RadarChartsProps) => {
  // Pass both chartColors and chartDarkColors to the hook
  const chartsColor = useChartColors({ chartColors, chartDarkColors })

  const series = [
    {
      name: 'Series 1',
      data: [20, 100, 40, 30, 50, 80, 33],
    },
  ]
  const labels = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ]
  const options: ApexOptions = {
    chart: {
      height: 330,
      type: 'radar',
      dropShadow: {
        enabled: true,
        blur: 1,
        left: 1,
        top: 1,
      },
    },
    dataLabels: {
      enabled: true,
    },
    plotOptions: {
      radar: {
        size: 140,
        polygons: {
          strokeColors: '#e9e9e9',
          fill: {
            colors: ['#f8f8f8', '#fff'],
          },
        },
      },
    },
    title: {
      text: 'Radar with Polygon Fill',
    },
    colors: chartsColor,
    markers: {
      size: 4,
      colors: ['#fff'],
      strokeColors: '#FF4560',
      strokeWidth: 2,
    },
    tooltip: {
      y: {
        formatter: function (val: number): string {
          return `${val}`
        },
      },
    },
    xaxis: {
      categories: labels,
    },
    yaxis: {
      tickAmount: 7,
      labels: {
        formatter: function (val: number, i: number): string {
          return i % 2 === 0 ? `${val}` : ''
        },
      },
    },
  }
  return (
    <React.Fragment>
      <ReactApexChart
        className="!min-h-full"
        options={options}
        series={series}
        type="radar"
        data-chart-colors="[bg-red-500]"
        chartId={chartId}
        height={300}
        width="100%"
      />
    </React.Fragment>
  )
}

export default PolygonfillChart
