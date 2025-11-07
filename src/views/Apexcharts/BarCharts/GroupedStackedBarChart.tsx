'use client'

import React from 'react'

import dynamic from 'next/dynamic'

import useChartColors from '@src/hooks/useChartColors'
import { ApexOptions } from 'apexcharts'

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
})

interface AreaChartsProps {
  chartColors: string
  chartDarkColors: string
  chartId: string
}

const GroupedStackedBarChart = ({
  chartColors,
  chartDarkColors,
  chartId,
}: AreaChartsProps) => {
  // Pass both chartColors and chartDarkColors to the hook
  const chartsColor = useChartColors({ chartColors, chartDarkColors })

  const series = [
    {
      name: 'Q1 Budget',
      group: 'budget',
      data: [44000, 55000, 41000, 67000, 22000],
    },
    {
      name: 'Q1 Actual',
      group: 'actual',
      data: [48000, 50000, 40000, 65000, 25000],
    },
    {
      name: 'Q2 Budget',
      group: 'budget',
      data: [13000, 36000, 20000, 8000, 13000],
    },
    {
      name: 'Q2 Actual',
      group: 'actual',
      data: [20000, 40000, 25000, 10000, 12000],
    },
  ]
  const options: ApexOptions = {
    chart: {
      height: 300,
      type: 'bar',
      stacked: true,
    },
    stroke: {
      width: 1,
      colors: ['#fff'],
    },
    dataLabels: {
      formatter: (val: number) => `${val / 1000}K`,
    },
    plotOptions: {
      bar: {
        horizontal: true,
      },
    },
    xaxis: {
      categories: [
        'Online advertising',
        'Sales Training',
        'Print advertising',
        'Catalogs',
        'Meetings',
      ],
      labels: {
        formatter: (val: string) => {
          const numericVal = parseFloat(val)
          return numericVal / 1000 + 'K'
        },
      },
    },
    fill: {
      opacity: 1,
    },
    colors: chartsColor,
    legend: {
      position: 'top',
      horizontalAlign: 'left',
    },
    grid: {
      padding: {
        right: 0,
        bottom: -10,
      },
    },
  }

  return (
    <React.Fragment>
      <ReactApexChart
        className="!min-h-full"
        options={options}
        series={series}
        data-chart-colors="[bg-primary-500, bg-green-500, bg-primary-300, bg-green-400]"
        type="bar"
        chartId={chartId}
        height={315}
        width="100%"
      />
    </React.Fragment>
  )
}

export default GroupedStackedBarChart
