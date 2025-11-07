'use client'

import React from 'react'

import dynamic from 'next/dynamic'

import useChartColors from '@src/hooks/useChartColors'
import { ApexOptions } from 'apexcharts'

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
})

interface TreemapChartsProps {
  chartColors: string
  chartDarkColors: string
  chartId: React.MutableRefObject<null>
}

const DistributedTreemapChart = ({
  chartColors,
  chartDarkColors,
  chartId,
}: TreemapChartsProps) => {
  // Pass both chartColors and chartDarkColors to the hook
  const chartsColor = useChartColors({ chartColors, chartDarkColors })
  const series = [
    {
      data: [
        {
          x: 'New Delhi',
          y: 218,
        },
        {
          x: 'Kolkata',
          y: 149,
        },
        {
          x: 'Mumbai',
          y: 184,
        },
        {
          x: 'Ahmedabad',
          y: 55,
        },
        {
          x: 'Bangaluru',
          y: 84,
        },
        {
          x: 'Pune',
          y: 31,
        },
        {
          x: 'Chennai',
          y: 70,
        },
        {
          x: 'Jaipur',
          y: 30,
        },
        {
          x: 'Surat',
          y: 44,
        },
        {
          x: 'Hyderabad',
          y: 68,
        },
        {
          x: 'Lucknow',
          y: 28,
        },
        {
          x: 'Indore',
          y: 19,
        },
        {
          x: 'Kanpur',
          y: 29,
        },
      ],
    },
  ]

  const options: ApexOptions = {
    chart: {
      height: 300,
      type: 'treemap',
    },
    legend: {
      show: false,
    },
    title: {
      text: 'Distibuted Treemap (different color for each cell)',
      align: 'center',
    },
    colors: chartsColor,
    plotOptions: {
      treemap: {
        distributed: true,
        enableShades: false,
      },
    },
  }
  return (
    <React.Fragment>
      <ReactApexChart
        className="!min-h-full"
        options={options}
        series={series}
        type="treemap"
        data-chart-colors="[bg-primary-500, bg-green-500, bg-yellow-500, bg-purple-500, bg-sky-500, bg-red-500]"
        chartId={chartId}
        height={300}
        width="100%"
      />
    </React.Fragment>
  )
}

export default DistributedTreemapChart
