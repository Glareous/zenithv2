'use client'

import React from 'react'

import dynamic from 'next/dynamic'

import useChartColors from '@src/hooks/useChartColors'
import { ApexOptions } from 'apexcharts'

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
})

interface HeatmapChartsProps {
  chartColors: string
  chartDarkColors: string
  chartId: React.MutableRefObject<null>
}

const generateData = (count: number, yrange: { max: number; min: number }) => {
  const series = []
  for (let i = 0; i < count; i++) {
    const x = (i + 1).toString()
    const y =
      Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min

    series.push({
      x: x,
      y: y,
    })
  }
  return series
}

const MultipleColorsFlippedHeatChart = ({
  chartColors,
  chartDarkColors,
  chartId,
}: HeatmapChartsProps) => {
  // Pass both chartColors and chartDarkColors to the hook
  const chartsColor = useChartColors({ chartColors, chartDarkColors })

  const series = [
    { name: 'Jan', data: generateData(20, { min: -30, max: 55 }) },
    { name: 'Feb', data: generateData(20, { min: -30, max: 55 }) },
    { name: 'Mar', data: generateData(20, { min: -30, max: 55 }) },
    { name: 'Apr', data: generateData(20, { min: -30, max: 55 }) },
    { name: 'May', data: generateData(20, { min: -30, max: 55 }) },
    { name: 'Jun', data: generateData(20, { min: -30, max: 55 }) },
    { name: 'Jul', data: generateData(20, { min: -30, max: 55 }) },
    { name: 'Aug', data: generateData(20, { min: -30, max: 55 }) },
    { name: 'Sep', data: generateData(20, { min: -30, max: 55 }) },
  ]

  // Chart options
  const options: ApexOptions = {
    chart: {
      height: 300,
      type: 'heatmap',
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      heatmap: {
        colorScale: {
          inverse: true,
        },
      },
    },
    colors: chartsColor,
    xaxis: {
      type: 'category',
      categories: [
        'P1',
        'P2',
        'P3',
        'P4',
        'P5',
        'P6',
        'P7',
        'P8',
        'P9',
        'P10',
        'P11',
        'P12',
        'P13',
        'P14',
        'P15',
        'P16',
        'P17',
        'P18',
        'P19',
        'P20',
      ],
    },
    title: {
      text: 'Color Scales flipped Vertically',
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
        data-chart-colors="[bg-primary-500, bg-green-500, bg-pink-500, bg-sky-500, bg-indigo-500, bg-purple-500, bg-orange-500, bg-yellow-500]"
        type="heatmap"
        chartId={chartId}
        height={300}
        width="100%"
      />
    </React.Fragment>
  )
}

export default MultipleColorsFlippedHeatChart
