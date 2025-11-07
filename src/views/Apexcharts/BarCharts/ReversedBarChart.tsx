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

const ReversedBarChart = ({
  chartColors,
  chartDarkColors,
  chartId,
}: AreaChartsProps) => {
  // Pass both chartColors and chartDarkColors to the hook
  const chartsColor = useChartColors({ chartColors, chartDarkColors })

  const series = [
    {
      data: [400, 430, 448, 470, 540, 580, 690],
    },
  ]
  const options: ApexOptions = {
    chart: {
      height: 300,
      type: 'bar',
    },
    annotations: {
      xaxis: [
        {
          x: 500,
          borderColor: '#00E396',
          label: {
            borderColor: '#00E396',
            style: {
              color: '#fff',
              background: '#00E396',
            },
            text: 'X annotation',
          },
        },
      ],
      yaxis: [
        {
          y: 'July',
          y2: 'September',
          label: {
            text: 'Y annotation',
          },
        },
      ],
    },
    colors: chartsColor,
    plotOptions: {
      bar: {
        horizontal: true,
      },
    },
    dataLabels: {
      enabled: true,
    },
    xaxis: {
      categories: [
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ],
    },
    grid: {
      xaxis: {
        lines: {
          show: true,
        },
      },
    },
    yaxis: {
      reversed: true,
      axisTicks: {
        show: true,
      },
    },
  }

  return (
    <React.Fragment>
      <ReactApexChart
        className="!min-h-full"
        options={options}
        series={series}
        data-chart-colors="[bg-primary-500]"
        type="bar"
        chartId={chartId}
        height={300}
        width="100%"
      />
    </React.Fragment>
  )
}

export default ReversedBarChart
