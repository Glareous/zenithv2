'use client'

import React from 'react'

import dynamic from 'next/dynamic'

import useChartColors from '@src/hooks/useChartColors'
import { ApexOptions } from 'apexcharts'

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
})

interface ColumnChartsProps {
  chartColors: string
  chartDarkColors: string
  chartId: React.MutableRefObject<null>
}

const StackedColumn100Chart = ({
  chartColors,
  chartDarkColors,
  chartId,
}: ColumnChartsProps) => {
  // Pass both chartColors and chartDarkColors to the hook
  const chartsColor = useChartColors({ chartColors, chartDarkColors })

  const series = [
    {
      name: 'PRODUCT A',
      data: [44, 55, 41, 67, 22, 43, 21, 49],
    },
    {
      name: 'PRODUCT B',
      data: [13, 23, 20, 8, 13, 27, 33, 12],
    },
    {
      name: 'PRODUCT C',
      data: [11, 17, 15, 15, 21, 14, 15, 13],
    },
  ]
  const labels = [
    '2024 Q1',
    '2024 Q2',
    '2024 Q3',
    '2024 Q4',
    '2025 Q1',
    '2025 Q2',
    '2025 Q3',
    '2025 Q4',
  ]

  const options: ApexOptions = {
    chart: {
      height: 300,
      type: 'bar',
      stacked: true,
      stackType: '100%',
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            position: 'bottom',
            offsetX: -10,
            offsetY: 0,
          },
        },
      },
    ],
    colors: chartsColor,
    xaxis: {
      categories: labels,
    },
    fill: {
      opacity: 1,
    },
    legend: {
      position: 'right',
      offsetX: 0,
      offsetY: 50,
    },
  }

  return (
    <React.Fragment>
      <ReactApexChart
        className="!min-h-full"
        options={options}
        series={series}
        type="bar"
        data-chart-colors="[bg-primary-500, bg-green-500, bg-yellow-500]"
        chartId={chartId}
        height={300}
        width="100%"
      />
    </React.Fragment>
  )
}

export default StackedColumn100Chart
