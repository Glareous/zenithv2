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
const AxisAlignBarChart = ({
  chartColors,
  chartDarkColors,
}: barChartsProps) => {
  // Pass both chartColors and chartDarkColors to the hook
  const chartsColor = useChartColors({ chartColors, chartDarkColors })

  const option = {
    series: [
      {
        name: 'Direct',
        type: 'bar',
        barWidth: '60%',
        data: [10, 52, 200, 334, 390, 330, 220],
      },
    ],
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
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
    xAxis: [
      {
        type: 'category',
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        axisTick: {
          alignWithLabel: true,
        },
      },
    ],
    yAxis: [
      {
        type: 'value',
        splitLine: {
          lineStyle: {
            color: chartsColor[1],
          },
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

export default AxisAlignBarChart
