'use client'

import React from 'react'

import dynamic from 'next/dynamic'

import useChartColors from '@src/hooks/useChartColors'
import { ApexOptions } from 'apexcharts'

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
})

interface RadialChartsProps {
  chartColors: string
  chartDarkColors: string
  chartId: React.MutableRefObject<null>
}

const BasicRadialbarChart = ({
  chartColors,
  chartDarkColors,
  chartId,
}: RadialChartsProps) => {
  // Pass both chartColors and chartDarkColors to the hook
  const chartsColor = useChartColors({ chartColors, chartDarkColors })

  const series = [70]
  const labels = ['Cricket']

  const options: ApexOptions = {
    chart: {
      height: 180,
      type: 'radialBar',
    },
    colors: chartsColor,
    plotOptions: {
      radialBar: {
        hollow: {
          size: '70%',
        },
      },
    },
    labels: labels,
  }

  return (
    <React.Fragment>
      <ReactApexChart
        className="!min-h-full"
        options={options}
        series={series}
        type="radialBar"
        data-chart-colors="[bg-primary-500]"
        chartId={chartId}
        height={180}
        width="100%"
      />
    </React.Fragment>
  )
}

export default BasicRadialbarChart
