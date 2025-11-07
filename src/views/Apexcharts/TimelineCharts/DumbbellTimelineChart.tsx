'use client'

import React from 'react'

import dynamic from 'next/dynamic'

import useChartColors from '@src/hooks/useChartColors'
import { ApexOptions } from 'apexcharts'

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
})

interface TimelineChartsProps {
  chartColors: string
  chartDarkColors: string
  chartId: React.MutableRefObject<null>
}

const DumbbellTimelineChart = ({
  chartColors,
  chartDarkColors,
  chartId,
}: TimelineChartsProps) => {
  // Pass both chartColors and chartDarkColors to the hook
  const chartsColor = useChartColors({ chartColors, chartDarkColors })

  const series = [
    {
      data: [
        {
          x: 'Operations',
          y: [2800, 4500],
        },
        {
          x: 'Customer Success',
          y: [3200, 4100],
        },
        {
          x: 'Engineering',
          y: [2950, 7800],
        },
        {
          x: 'Marketing',
          y: [3000, 4600],
        },
        {
          x: 'Product',
          y: [3500, 4100],
        },
        {
          x: 'Data Science',
          y: [4500, 6500],
        },
        {
          x: 'Sales',
          y: [4100, 5600],
        },
      ],
    },
  ]

  const options: ApexOptions = {
    chart: {
      height: 300,
      type: 'rangeBar',
      zoom: {
        enabled: false,
      },
    },
    colors: chartsColor,
    plotOptions: {
      bar: {
        horizontal: true,
        isDumbbell: true,
        dumbbellColors: chartsColor as unknown as string[][],
      },
    },
    title: {
      text: 'Paygap Disparity',
    },
    legend: {
      show: true,
      showForSingleSeries: true,
      position: 'top',
      horizontalAlign: 'left',
      customLegendItems: ['Female', 'Male'],
    },
    fill: {
      type: 'gradient',
      gradient: {
        gradientToColors: ['#36BDCB'],
        inverseColors: false,
        stops: [0, 100],
      },
    },
    grid: {
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: false,
        },
      },
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
        type="rangeBar"
        data-chart-colors="[bg-primary-500, bg-green-500]"
        chartId={chartId}
        height={300}
        width="100%"
      />
    </React.Fragment>
  )
}

export default DumbbellTimelineChart
