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

const SteplineLineChart = ({
  chartColors,
  chartDarkColors,
  chartId,
}: LineChartsProps) => {
  // Pass both chartColors and chartDarkColors to the hook
  const chartsColor = useChartColors({ chartColors, chartDarkColors })

  const values = [34, 44, 54, 21, 12, 43, 33, 23, 66, 66, 58]

  const series = [
    {
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
    stroke: {
      curve: 'stepline',
    },
    dataLabels: {
      enabled: false,
    },
    title: {
      text: 'Stepline Chart',
      align: 'left',
    },
    markers: {
      hover: {
        sizeOffset: 4,
      },
    },
    colors: chartsColor,
    grid: {
      padding: {
        top: 0,
        right: 5,
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
        data-chart-colors="[bg-green-500]"
        chartId={chartId}
        height={300}
        width="100%"
      />
    </React.Fragment>
  )
}

export default SteplineLineChart
