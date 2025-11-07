'use client'

import React from 'react'

import dynamic from 'next/dynamic'

import { ApexOptions } from 'apexcharts'

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
})

interface SlopeChartsProps {
  chartColors: string
  chartDarkColors: string
  chartId: React.MutableRefObject<null>
}

const SlopeBasicChart = ({ chartId }: SlopeChartsProps) => {
  // Pass both chartColors and chartDarkColors to the hook

  const series = [
    {
      name: 'Blue',
      data: [
        {
          x: 'Jan',
          y: 43,
        },
        {
          x: 'Feb',
          y: 58,
        },
      ],
    },
    {
      name: 'Green',
      data: [
        {
          x: 'Jan',
          y: 33,
        },
        {
          x: 'Feb',
          y: 38,
        },
      ],
    },
    {
      name: 'Red',
      data: [
        {
          x: 'Jan',
          y: 55,
        },
        {
          x: 'Feb',
          y: 21,
        },
      ],
    },
  ]

  const options: ApexOptions = {
    chart: {
      height: 300,
      type: 'line',
    },
    plotOptions: {
      line: {
        isSlopeChart: true,
      },
    },
    grid: {
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
      },
    },
  }
  return (
    <React.Fragment>
      <ReactApexChart
        className="!min-h-full"
        options={options}
        series={series}
        type="line"
        data-chart-colors="[bg-primary-500, bg-purple-500, bg-red-500, bg-green-500]"
        chartId={chartId}
        height={300}
        width="100%"
      />
    </React.Fragment>
  )
}

export default SlopeBasicChart
