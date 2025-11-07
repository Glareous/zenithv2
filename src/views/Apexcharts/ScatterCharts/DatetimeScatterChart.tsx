'use client'

import React from 'react'

import dynamic from 'next/dynamic'

import useChartColors from '@src/hooks/useChartColors'
import { ApexOptions } from 'apexcharts'

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
})

interface ScatterChartsProps {
  chartColors: string
  chartDarkColors: string
  chartId: React.MutableRefObject<null>
}

function generateDayWiseTimeSeries(
  baseval: number,
  count: number,
  yrange: { max: number; min: number }
) {
  let i = 0
  const series = []
  while (i < count) {
    const y =
      Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min

    series.push([baseval, y])
    baseval += 86400000
    i++
  }
  return series
}

const DatetimeScatterChart = ({
  chartColors,
  chartDarkColors,
  chartId,
}: ScatterChartsProps) => {
  // Pass both chartColors and chartDarkColors to the hook
  const chartsColor = useChartColors({ chartColors, chartDarkColors })

  const series = [
    {
      name: 'TEAM 1',
      data: generateDayWiseTimeSeries(
        new Date('11 Feb 2017 GMT').getTime(),
        20,
        {
          min: 10,
          max: 60,
        }
      ),
    },
    {
      name: 'TEAM 2',
      data: generateDayWiseTimeSeries(
        new Date('11 Feb 2017 GMT').getTime(),
        20,
        {
          min: 10,
          max: 60,
        }
      ),
    },
    {
      name: 'TEAM 3',
      data: generateDayWiseTimeSeries(
        new Date('11 Feb 2017 GMT').getTime(),
        30,
        {
          min: 10,
          max: 60,
        }
      ),
    },
    {
      name: 'TEAM 4',
      data: generateDayWiseTimeSeries(
        new Date('11 Feb 2017 GMT').getTime(),
        10,
        {
          min: 10,
          max: 60,
        }
      ),
    },
    {
      name: 'TEAM 5',
      data: generateDayWiseTimeSeries(
        new Date('11 Feb 2017 GMT').getTime(),
        30,
        {
          min: 10,
          max: 60,
        }
      ),
    },
  ]

  const options: ApexOptions = {
    chart: {
      height: 300,
      type: 'scatter',
      zoom: {
        type: 'xy',
      },
    },
    dataLabels: {
      enabled: false,
    },
    colors: chartsColor,
    grid: {
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    xaxis: {
      type: 'datetime',
    },
    yaxis: {
      max: 70,
    },
  }

  return (
    <React.Fragment>
      <ReactApexChart
        className="!min-h-full"
        options={options}
        series={series}
        type="scatter"
        data-chart-colors="[bg-primary-500, bg-green-500, bg-purple-500, bg-orange-500, bg-red-500]"
        chartId={chartId}
        height={300}
        width="100%"
      />
    </React.Fragment>
  )
}

export default DatetimeScatterChart
