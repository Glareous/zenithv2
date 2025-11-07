'use client'

import React from 'react'

import dynamic from 'next/dynamic'

import { ApexOptions } from 'apexcharts'

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
})

interface PolarChartsProps {
  chartId: React.MutableRefObject<null>
}

const MonochromePolarAreaChart = ({ chartId }: PolarChartsProps) => {
  const series = [42, 47, 52, 58, 65]
  const labels = ['Rose A', 'Rose B', 'Rose C', 'Rose D', 'Rose E']

  const options: ApexOptions = {
    chart: {
      height: 300,
      type: 'polarArea',
    },
    labels: labels,
    fill: {
      opacity: 1,
    },
    stroke: {
      width: 1,
      colors: undefined,
    },
    yaxis: {
      show: false,
    },
    legend: {
      position: 'bottom',
    },
    plotOptions: {
      polarArea: {
        rings: {
          strokeWidth: 0,
        },
        spokes: {
          strokeWidth: 0,
        },
      },
    },
    theme: {
      monochrome: {
        enabled: true,
        shadeTo: 'light',
        shadeIntensity: 0.6,
      },
    },
  }
  return (
    <React.Fragment>
      <ReactApexChart
        className="!min-h-full"
        options={options}
        series={series}
        type="polarArea"
        chartId={chartId}
        height={300}
        width="100%"
      />
    </React.Fragment>
  )
}

export default MonochromePolarAreaChart
