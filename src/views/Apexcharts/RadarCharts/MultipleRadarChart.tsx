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

const MultipleRadarChart = ({
  chartColors,
  chartDarkColors,
  chartId,
}: RadarChartsProps) => {
  // Pass both chartColors and chartDarkColors to the hook
  const chartsColor = useChartColors({ chartColors, chartDarkColors })

  const series = [
    {
      name: 'Series 1',
      data: [80, 50, 30, 40, 100, 20],
    },
    {
      name: 'Series 2',
      data: [20, 30, 40, 80, 20, 80],
    },
    {
      name: 'Series 3',
      data: [44, 76, 78, 13, 43, 10],
    },
  ]
  const labels = ['2011', '2012', '2013', '2014', '2015', '2016']
  const options: ApexOptions = {
    chart: {
      height: 370,
      type: 'radar',
      dropShadow: {
        enabled: true,
        blur: 1,
        left: 1,
        top: 1,
      },
    },
    title: {
      text: 'Radar Chart - Multi Series',
    },
    colors: chartsColor,
    stroke: {
      width: 2,
    },
    fill: {
      opacity: 0.1,
    },
    markers: {
      size: 0,
    },
    xaxis: {
      categories: labels,
    },
  }
  return (
    <React.Fragment>
      <ReactApexChart
        className="!min-h-full"
        options={options}
        series={series}
        type="radar"
        data-chart-colors="[bg-primary-500, bg-yellow-500, bg-green-500]"
        chartId={chartId}
        height={300}
        width="100%"
      />
    </React.Fragment>
  )
}

export default MultipleRadarChart
