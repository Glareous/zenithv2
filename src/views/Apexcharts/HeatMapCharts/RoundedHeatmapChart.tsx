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

const RoundedHeatmapChart = ({
  chartColors,
  chartDarkColors,
  chartId,
}: HeatmapChartsProps) => {
  // Pass both chartColors and chartDarkColors to the hook
  const chartsColor = useChartColors({ chartColors, chartDarkColors })

  const series = [
    { name: 'Metric1', data: generateData(20, { min: 0, max: 90 }) },
    { name: 'Metric2', data: generateData(20, { min: 0, max: 90 }) },
    { name: 'Metric3', data: generateData(20, { min: 0, max: 90 }) },
    { name: 'Metric4', data: generateData(20, { min: 0, max: 90 }) },
    { name: 'Metric5', data: generateData(20, { min: 0, max: 90 }) },
    { name: 'Metric6', data: generateData(20, { min: 0, max: 90 }) },
    { name: 'Metric7', data: generateData(20, { min: 0, max: 90 }) },
    { name: 'Metric8', data: generateData(20, { min: 0, max: 90 }) },
    { name: 'Metric9', data: generateData(20, { min: 0, max: 90 }) },
  ]

  const options: ApexOptions = {
    chart: {
      height: 300,
      type: 'heatmap',
    },
    stroke: {
      width: 0,
    },
    plotOptions: {
      heatmap: {
        radius: 30,
        enableShades: false,
        colorScale: {
          ranges: [
            { from: 0, to: 50, color: '#008FFB' },
            { from: 51, to: 100, color: '#00E396' },
          ],
        },
      },
    },
    dataLabels: {
      enabled: true,
      style: {
        colors: ['#fff'],
      },
    },
    colors: chartsColor,
    xaxis: {
      type: 'category',
    },
    title: {
      text: 'Rounded (Range without Shades)',
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
        data-chart-colors="[bg-primary-500, bg-green-500]"
        type="heatmap"
        chartId={chartId}
        height={300}
        width="100%"
      />
    </React.Fragment>
  )
}

export default RoundedHeatmapChart
