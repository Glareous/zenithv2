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

const GroupLabelChart = ({
  chartColors,
  chartDarkColors,
  chartId,
}: ColumnChartsProps) => {
  // Pass both chartColors and chartDarkColors to the hook
  const chartsColor = useChartColors({ chartColors, chartDarkColors })

  const series = [
    {
      name: 'sales',
      data: [
        {
          x: '2023/01/01',
          y: 400,
        },
        {
          x: '2023/04/01',
          y: 430,
        },
        {
          x: '2023/07/01',
          y: 448,
        },
        {
          x: '2023/10/01',
          y: 470,
        },
        {
          x: '2024/01/01',
          y: 540,
        },
        {
          x: '2024/04/01',
          y: 580,
        },
        {
          x: '2024/07/01',
          y: 690,
        },
        {
          x: '2024/10/01',
          y: 690,
        },
      ],
    },
  ]

  const options: ApexOptions = {
    chart: {
      height: 300,
      type: 'bar',
    },
    xaxis: {
      type: 'category',
      labels: {
        formatter: function (val) {
          const month = new Date(val).getMonth() // Get the month (0-11)
          const quarter = Math.floor(month / 3) + 1 // Calculate the quarter (1-4)

          return `Q${quarter}`
          // return "Q" + dayjs(val).quarter()
        },
      },
      group: {
        style: {
          fontSize: '10px',
          fontWeight: 700,
        },
        groups: [
          { title: '2019', cols: 4 },
          { title: '2020', cols: 4 },
        ],
      },
    },
    colors: chartsColor,
    title: {
      text: 'Grouped Labels on the X-axis',
    },
    tooltip: {
      x: {
        formatter: function (val) {
          const month = new Date(val).getMonth() // Get the month (0-11)
          const year = new Date(val).getFullYear() // Get the year

          const quarter = Math.floor(month / 3) + 1 // Calculate the quarter (1-4)

          return `Q${quarter} ${year}`
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
        type="bar"
        data-chart-colors="[bg-primary-500]"
        chartId={chartId}
        height={300}
        width="100%"
      />
    </React.Fragment>
  )
}

export default GroupLabelChart
