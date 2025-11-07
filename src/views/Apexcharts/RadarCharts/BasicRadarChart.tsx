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

const BasicRadarChart = ({
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
  ]
  const labels = ['January', 'February', 'March', 'April', 'May', 'June']

  const options: ApexOptions = {
    chart: {
      height: 370,
      type: 'radar',
    },
    colors: chartsColor,
    title: {
      text: 'Basic Radar Chart',
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
        data-chart-colors="[bg-primary-500, bg-green-500, bg-yellow-500, bg-purple-500, bg-red-500]"
        chartId={chartId}
        height={300}
        width="100%"
      />
    </React.Fragment>
  )
}

export default BasicRadarChart
