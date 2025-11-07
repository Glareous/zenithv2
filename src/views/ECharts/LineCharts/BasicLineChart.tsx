'use client'

import React from 'react'

import dynamic from 'next/dynamic'

// Dynamically import the ReactApexChart component
const ReactEcharts = dynamic(() => import('echarts-for-react'), {
  ssr: false,
})

const BasicLineChart = () => {
  const option = {
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data: [150, 230, 224, 218, 135, 147, 260],
        type: 'line',
      },
    ],
    grid: {
      top: '5%',
      left: '6%',
      right: '0%',
      bottom: '8%',
    },
  }
  return (
    <React.Fragment>
      <ReactEcharts style={{ height: '350px' }} option={option} />
    </React.Fragment>
  )
}

export default BasicLineChart
