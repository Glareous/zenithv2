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

const SingleBarChart = ({ chartColors, chartDarkColors }: barChartsProps) => {
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
          color: chartsColor[2],
        },
      },
    },
    legend: {
      textStyle: {
        color: chartsColor[3],
      },
    },
    axisLine: {
      lineStyle: {
        color: chartsColor[2],
      },
    },
    grid: {
      top: '3%',
      left: '2%',
      right: '0%',
      bottom: '2%',
      containLabel: true,
    },
    colors: chartsColor,
    series: [
      {
        data: [
          120,
          {
            value: 200,
            itemStyle: {
              color: chartsColor[1],
            },
          },
          150,
          80,
          70,
          110,
          130,
        ],
        type: 'bar',
      },
    ],
  }

  return (
    <React.Fragment>
      <ReactEcharts style={{ height: '350px' }} option={option} />
    </React.Fragment>
  )
}

export default SingleBarChart
