'use client'

import React from 'react'

import dynamic from 'next/dynamic'

import useChartColors from '@src/hooks/useChartColors'
import { ApexOptions } from 'apexcharts'

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
})

interface FunnelChartsProps {
  chartColors: string
  chartDarkColors: string
  chartId: React.MutableRefObject<null>
}

const FunnelChart = ({
  chartColors,
  chartDarkColors,
  chartId,
}: FunnelChartsProps) => {
  // Pass both chartColors and chartDarkColors to the hook
  const chartsColor = useChartColors({ chartColors, chartDarkColors })

  const series = [
    {
      name: '',
      data: [1380, 1100, 990, 880, 740, 548, 330, 200],
    },
  ]

  const labels = [
    'Sourced',
    'Screened',
    'Assessed',
    'HR Interview',
    'Technical',
    'Verify',
    'Offered',
    'Hired',
  ]

  const options: ApexOptions = {
    chart: {
      height: 300,
      type: 'bar',
    },
    plotOptions: {
      bar: {
        borderRadius: 0,
        horizontal: true,
        barHeight: '80%',
        isFunnel: true,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val, opt) => {
        return `${labels[opt.dataPointIndex]}: ${val}`
      },
      dropShadow: {
        enabled: true,
      },
    },
    colors: chartsColor,
    title: {
      text: 'Recruitment Funnel',
      align: 'center',
    },
    xaxis: {
      categories: labels,
    },
    legend: {
      show: false,
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
        data-chart-colors="[bg-primary-500]"
        type="bar"
        chartId={chartId}
        height={300}
        width="100%"
      />
    </React.Fragment>
  )
}

export default FunnelChart
