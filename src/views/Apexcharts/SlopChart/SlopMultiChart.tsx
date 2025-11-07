'use client'

import React from 'react'

import dynamic from 'next/dynamic'

import useChartColors from '@src/hooks/useChartColors'
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

const SlopeMultiChart = ({
  chartColors,
  chartDarkColors,
  chartId,
}: SlopeChartsProps) => {
  // Pass both chartColors and chartDarkColors to the hook
  const chartsColor = useChartColors({ chartColors, chartDarkColors })

  const series = [
    {
      name: 'Blue',
      data: [
        {
          x: 'Category 1',
          y: 503,
        },
        {
          x: 'Category 2',
          y: 580,
        },
        {
          x: 'Category 3',
          y: 135,
        },
      ],
    },
    {
      name: 'Green',
      data: [
        {
          x: 'Category 1',
          y: 733,
        },
        {
          x: 'Category 2',
          y: 385,
        },
        {
          x: 'Category 3',
          y: 715,
        },
      ],
    },
    {
      name: 'Orange',
      data: [
        {
          x: 'Category 1',
          y: 255,
        },
        {
          x: 'Category 2',
          y: 211,
        },
        {
          x: 'Category 3',
          y: 441,
        },
      ],
    },
    {
      name: 'Red',
      data: [
        {
          x: 'Category 1',
          y: 428,
        },
        {
          x: 'Category 2',
          y: 749,
        },
        {
          x: 'Category 3',
          y: 559,
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
    tooltip: {
      followCursor: true,
      intersect: false,
      shared: true,
    },
    colors: chartsColor,
    dataLabels: {
      background: {
        enabled: true,
      },
      formatter(val, opts) {
        const seriesName = opts.w.config.series[opts.seriesIndex].name
        return val !== null ? seriesName : ''
      },
    },
    yaxis: {
      show: true,
      labels: {
        show: true,
      },
    },
    xaxis: {
      position: 'bottom',
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'left',
    },
    stroke: {
      width: [2, 3, 4, 2],
      dashArray: [0, 0, 5, 2],
      curve: 'smooth',
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

export default SlopeMultiChart
