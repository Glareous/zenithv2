'use client'

import React from 'react'

import dynamic from 'next/dynamic'

import de from '@assets/images/flag/de.svg'
import us from '@assets/images/flag/us.svg'
import { ApexOptions } from 'apexcharts'

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
})

interface ScatterChartsProps {
  chartId: React.MutableRefObject<null>
}

const ImagesScatterChart = ({ chartId }: ScatterChartsProps) => {
  const series = [
    {
      name: 'Messenger',
      data: [
        [16.4, 5.4],
        [21.7, 4],
        [25.4, 3],
        [19, 2],
        [10.9, 1],
        [13.6, 3.2],
        [10.9, 7],
        [10.9, 8.2],
        [16.4, 4],
        [13.6, 4.3],
        [13.6, 12],
        [29.9, 3],
        [10.9, 5.2],
        [16.4, 6.5],
        [10.9, 8],
        [24.5, 7.1],
        [10.9, 7],
        [8.1, 4.7],
        [19, 10],
        [27.1, 10],
        [24.5, 8],
        [27.1, 3],
        [29.9, 11.5],
        [27.1, 0.8],
        [22.1, 2],
      ],
    },
    {
      name: 'Instagram',
      data: [
        [6.4, 5.4],
        [11.7, 4],
        [15.4, 3],
        [9, 2],
        [10.9, 11],
        [20.9, 7],
        [12.9, 8.2],
        [6.4, 14],
        [11.6, 12],
      ],
    },
  ]

  const options: ApexOptions = {
    chart: {
      height: 300,
      type: 'scatter',
      animations: {
        enabled: false,
      },
      zoom: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
    },
    colors: ['#056BF6', '#D2376A'],
    xaxis: {
      tickAmount: 10,
      min: 0,
      max: 40,
    },
    yaxis: {
      tickAmount: 7,
    },
    markers: {
      size: 20,
    },
    fill: {
      type: 'image',
      opacity: 1,
      image: {
        src: [us.src, de.src],
        width: 40,
        height: 40,
      },
    },
    legend: {
      labels: {
        useSeriesColors: true,
      },
    },
  }
  return (
    <React.Fragment>
      <ReactApexChart
        className="!min-h-full"
        options={options}
        series={series}
        type="scatter"
        chartId={chartId}
        height={300}
        width="100%"
      />
    </React.Fragment>
  )
}

export default ImagesScatterChart
