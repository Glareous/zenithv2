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

const BasicBarChart = ({ chartColors, chartDarkColors }: barChartsProps) => {
  // Pass both chartColors and chartDarkColors to the hook
  const chartsColor = useChartColors({ chartColors, chartDarkColors })

  const options = {
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
      top: '5%',
      left: '5%',
      right: '0%',
      bottom: '6%',
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
      },
    ],
  }
  return (
    <React.Fragment>
      <ReactEcharts
        option={options}
        style={{ height: '300px', width: '100%' }}
        className="h-80"
      />
    </React.Fragment>
  )
}

export default BasicBarChart
