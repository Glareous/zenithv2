'use client'

import React, { useCallback, useEffect, useState } from 'react'

import dynamic from 'next/dynamic'

// Dynamically import the ReactEcharts component
const ReactEcharts = dynamic(() => import('echarts-for-react'), {
  ssr: false,
})

const StackedBorderRadiusBarChart = () => {
  const initialSeries: {
    data: (
      | string
      | number
      | { value: string | number; itemStyle: { borderRadius: number[] } }
    )[]
    type: string
    stack: string
    name: string
  }[] = [
    {
      data: [120, 200, 150, 80, 70, 110, 130],
      type: 'bar',
      stack: 'a',
      name: 'a',
    },
    {
      data: [10, 46, 64, '-', 0, '-', 0],
      type: 'bar',
      stack: 'a',
      name: 'b',
    },
    {
      data: [30, '-', 0, 20, 10, '-', 0],
      type: 'bar',
      stack: 'a',
      name: 'c',
    },
    {
      data: [30, '-', 0, 20, 10, '-', 0],
      type: 'bar',
      stack: 'b',
      name: 'd',
    },
    {
      data: [10, 20, 150, 0, '-', 50, 10],
      type: 'bar',
      stack: 'b',
      name: 'e',
    },
  ]

  const [series, setSeries] = useState<
    {
      data: (
        | string
        | number
        | { value: string | number; itemStyle: { borderRadius: number[] } }
      )[]
      type: string
      stack: string
      name: string
    }[]
  >(initialSeries)

  // Memoize the calculateStackInfo function using useCallback
  const calculateStackInfo = useCallback(() => {
    const stackInfo: {
      [key: string]: { stackStart: number[]; stackEnd: number[] }
    } = {}
    for (let i = 0; i < series[0].data.length; ++i) {
      for (let j = 0; j < series.length; ++j) {
        const stackName = series[j].stack
        if (!stackName) {
          continue
        }
        if (!stackInfo[stackName]) {
          stackInfo[stackName] = {
            stackStart: [],
            stackEnd: [] as number[],
          }
        }
        const info = stackInfo[stackName]
        const data = series[j].data[i]
        if (data && data !== '-') {
          if (info.stackStart[i] == null) {
            info.stackStart[i] = j
          }
          info.stackEnd[i] = j
        }
      }
    }

    return series.map((serie, i) => {
      const data = serie.data.map((value, j: number) => {
        const info = stackInfo[serie.stack]
        const isEnd = info.stackEnd[j] === i
        const topBorder = isEnd ? 20 : 0
        const bottomBorder = 0
        if (typeof value === 'number' || typeof value === 'string') {
          return {
            value,
            itemStyle: {
              borderRadius: [topBorder, topBorder, bottomBorder, bottomBorder],
            },
          }
        }
        return value
      })
      return { ...serie, data }
    })
  }, [series])

  useEffect(() => {
    const updatedSeries = calculateStackInfo()
    setSeries(updatedSeries)
  }, [calculateStackInfo])

  const option = {
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    grid: {
      top: '3%',
      left: '3%',
      right: '0%',
      bottom: '3%',
      containLabel: true,
    },
    yAxis: {
      type: 'value',
    },
    series: series,
  }

  return (
    <React.Fragment>
      <ReactEcharts style={{ height: '350px' }} option={option} />
    </React.Fragment>
  )
}

export default StackedBorderRadiusBarChart
