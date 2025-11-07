'use client'

import React from 'react'

import dynamic from 'next/dynamic'

import useChartColors from '@src/hooks/useChartColors'
import { ApexOptions } from 'apexcharts'

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
})

interface LineChartsProps {
  chartColors: string
  chartDarkColors: string
  chartId: React.MutableRefObject<null>
}

const BasicLineChart = ({
  chartColors,
  chartDarkColors,
  chartId,
}: LineChartsProps) => {
  // Pass both chartColors and chartDarkColors to the hook
  const chartsColor = useChartColors({ chartColors, chartDarkColors })

  const values = [10, 41, 35, 51, 49, 62, 69, 91, 148]
  const labels = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]

  const formatCurrency = (x: number) => {
    return '$' + x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }

  const series = [
    {
      name: 'Series name',
      data: values,
    },
  ]
  const options: ApexOptions = {
    chart: {
      defaultLocale: 'en',
      height: 300,
      type: 'line',
      zoom: {
        enabled: true,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'straight',
    },
    grid: {
      row: {
        colors: ['transparent'],
        opacity: 0.5,
      },
      padding: {
        top: 0,
        right: 5,
        bottom: 0,
      },
    },
    xaxis: {
      title: {
        text: 'Xaxis',
      },
      categories: labels,
    },
    tooltip: {
      x: {
        show: true,
      },
      y: {
        formatter: (val) => formatCurrency(val),
      },
    },
    colors: chartsColor,
  }
  return (
    <React.Fragment>
      <ReactApexChart
        className="!min-h-full"
        options={options}
        series={series}
        type="line"
        data-chart-colors="[bg-primary-500]"
        chartId={chartId}
        height={300}
        width="100%"
      />
    </React.Fragment>
  )
}

export default BasicLineChart
