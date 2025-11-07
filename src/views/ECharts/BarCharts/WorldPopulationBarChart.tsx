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

const WorldPopulationBarChart = ({
  chartColors,
  chartDarkColors,
}: barChartsProps) => {
  const chartsColor = useChartColors({ chartColors, chartDarkColors })

  const option = {
    series: [
      {
        name: '2011',
        type: 'bar',
        data: [18203, 23489, 29034, 104970, 131744, 630230],
      },
      {
        name: '2012',
        type: 'bar',
        data: [19325, 23438, 31000, 121594, 134141, 681807],
      },
    ],
    colors: chartsColor,
    title: {
      text: 'World Population',
      textStyle: {
        color: chartsColor[3],
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    legend: {
      textStyle: {
        color: chartsColor[3],
      },
    },
    axisLine: {
      lineStyle: {
        color: chartsColor[1],
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      boundaryGap: [0, 0.01],
      splitLine: {
        lineStyle: {
          color: chartsColor[2],
        },
      },
    },
    yAxis: {
      type: 'category',
      data: ['Brazil', 'Indonesia', 'USA', 'India', 'China', 'World'],
    },
  }

  return (
    <React.Fragment>
      <ReactEcharts style={{ height: '350px' }} option={option} />
    </React.Fragment>
  )
}

export default WorldPopulationBarChart
