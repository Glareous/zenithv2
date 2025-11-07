'use client'

import React from 'react'

import dynamic from 'next/dynamic'

import useChartColors from '@src/hooks/useChartColors'
import { ApexOptions } from 'apexcharts'

const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
})

interface AreaChartsProps {
  chartColors: string
  chartDarkColors: string
  chartId: string
}

const generateDayWiseTimeSeries = (
  baseval: number,
  count: number,
  yrange: { min: number; max: number }
) => {
  const series = []
  let i = 0
  while (i < count) {
    const x = baseval
    const y =
      Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min

    series.push([x, y])
    baseval += 86400000 // 86400000 ms in a day
    i++
  }
  return series
}

const StackedAreaChart = ({
  chartColors,
  chartDarkColors,
  chartId,
}: AreaChartsProps) => {
  // Pass both chartColors and chartDarkColors to the hook
  const chartsColor = useChartColors({ chartColors, chartDarkColors })

  const series = [
    {
      name: 'South',
      data: generateDayWiseTimeSeries(
        new Date('11 Feb 2024 GMT').getTime(),
        20,
        {
          min: 10,
          max: 60,
        }
      ),
    },
    {
      name: 'North',
      data: generateDayWiseTimeSeries(
        new Date('11 Feb 2024 GMT').getTime(),
        20,
        {
          min: 10,
          max: 20,
        }
      ),
    },
    {
      name: 'Central',
      data: generateDayWiseTimeSeries(
        new Date('11 Feb 2024 GMT').getTime(),
        20,
        {
          min: 10,
          max: 15,
        }
      ),
    },
  ]
  const options: ApexOptions = {
    chart: {
      height: 300,
      type: 'area',
      stacked: true,
      events: {
        selection: function () {},
      },
    },
    colors: chartsColor,
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
    },
    fill: {
      type: 'gradient',
      gradient: {
        opacityFrom: 0.6,
        opacityTo: 0.8,
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left',
    },
    xaxis: {
      type: 'datetime',
    },
  }

  return (
    <React.Fragment>
      <ReactApexChart
        dir="ltr"
        className="!min-h-full"
        options={options}
        series={series}
        data-chart-colors="[bg-primary-500, bg-green-500, bg-gray-200]"
        data-chart-dark-colors="[bg-primary-500, bg-green-500, bg-dark-700]"
        type="area"
        height={380}
        chartId={chartId}
        width="100%"
      />
    </React.Fragment>
  )
}

export default StackedAreaChart
