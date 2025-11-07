'use client'

import React from 'react'

import dynamic from 'next/dynamic'

import useChartColors from '@src/hooks/useChartColors'

// Dynamically import the ReactApexChart component
const ReactEcharts = dynamic(() => import('echarts-for-react'), {
  ssr: false,
})

interface barChartsProps {
  chartColors: string
  chartDarkColors: string
}

const BackgroundBarChart = ({
  chartColors,
  chartDarkColors,
}: barChartsProps) => {
  const chartsColor = useChartColors({ chartColors, chartDarkColors })

  const option = {
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: {
          color: chartsColor[1],
        },
      },
    },
    grid: {
      top: '3%',
      left: '2%',
      right: '0%',
      bottom: '2%',
      containLabel: true,
    },
    legend: {
      textStyle: {
        color: chartsColor[2],
      },
    },
    axisLine: {
      lineStyle: {
        color: chartsColor[1],
      },
    },
    color: chartsColor,
    series: [
      {
        data: [120, 200, 150, 80, 70, 110, 130],
        type: 'bar',
        showBackground: true,
        backgroundStyle: {
          color: 'rgba(180, 180, 180, 0.2)',
        },
      },
    ],
  }

  return (
    <React.Fragment>
      <ReactEcharts style={{ height: '350px' }} option={option} />
    </React.Fragment>
  )
}

export default BackgroundBarChart
