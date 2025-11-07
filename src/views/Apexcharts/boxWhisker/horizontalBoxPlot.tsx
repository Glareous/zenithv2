'use client'

import React from 'react'

import dynamic from 'next/dynamic'

import { ApexOptions } from 'apexcharts'

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
})

interface AreaChartsProps {
  chartId: string
}

const HorizontalBoxPlot = ({ chartId }: AreaChartsProps) => {
  const series = [
    {
      data: [
        {
          x: 'Category A',
          y: [54, 66, 69, 75, 88],
        },
        {
          x: 'Category B',
          y: [43, 65, 69, 76, 81],
        },
        {
          x: 'Category C',
          y: [31, 39, 45, 51, 59],
        },
        {
          x: 'Category D',
          y: [39, 46, 55, 65, 71],
        },
        {
          x: 'Category E',
          y: [29, 31, 35, 39, 44],
        },
        {
          x: 'Category F',
          y: [41, 49, 58, 61, 67],
        },
        {
          x: 'Category G',
          y: [54, 59, 66, 71, 88],
        },
      ],
    },
  ]
  const options: ApexOptions = {
    chart: {
      height: 300,
      type: 'boxPlot',
    },
    title: {
      text: 'Horizontal BoxPlot Chart',
      align: 'left',
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '50%',
      },
      boxPlot: {
        colors: {
          upper: '#e9ecef',
          lower: '#f8f9fa',
        },
      },
    },
    stroke: {
      colors: ['#6c757d'],
    },
  }
  return (
    <React.Fragment>
      <ReactApexChart
        className="!min-h-full"
        options={options}
        series={series}
        type="boxPlot"
        chartId={chartId}
        height={300}
        width="100%"
      />
    </React.Fragment>
  )
}

export default HorizontalBoxPlot
