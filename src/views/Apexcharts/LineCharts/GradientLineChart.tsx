'use client'

import React from 'react'

import dynamic from 'next/dynamic'

import useChartColors from '@src/hooks/useChartColors'
import { ApexOptions } from 'apexcharts'

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
})

interface SeriesData {
  name: string
  data: Array<{ timestamp: string; value: string }>
  order: number
}

interface LineChartsProps {
  chartColors: string
  chartDarkColors: string
  chartId: React.MutableRefObject<null>
  series?: SeriesData[]
}

const GradientLineChart = ({
  chartColors,
  chartDarkColors,
  chartId,
  series: seriesData = [],
}: LineChartsProps) => {
  // Pass both chartColors and chartDarkColors to the hook
  const chartsColor = useChartColors({ chartColors, chartDarkColors })

  // Process multiple series - combine all unique timestamps
  const { categories, series } = React.useMemo(() => {
    if (seriesData.length === 0) return { categories: [], series: [] }

    // Helper function to normalize timestamp to date only (ignore time)
    const normalizeTimestamp = (ts: string): string => {
      const date = new Date(ts)
      return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`
    }

    // Collect all unique normalized timestamps from all series
    const timestampMap = new Map<string, { original: string; values: Map<number, number> }>()

    seriesData.forEach((s, seriesIndex) => {
      s.data.forEach((d) => {
        const normalized = normalizeTimestamp(d.timestamp)

        if (!timestampMap.has(normalized)) {
          timestampMap.set(normalized, {
            original: d.timestamp,
            values: new Map()
          })
        }

        const entry = timestampMap.get(normalized)!
        const value = parseFloat(d.value) || 0

        // If multiple values for same date in same series, use the last one
        entry.values.set(seriesIndex, value)
      })
    })

    // Sort timestamps chronologically
    const sortedEntries = Array.from(timestampMap.entries()).sort((a, b) => {
      const dateA = new Date(a[1].original).getTime()
      const dateB = new Date(b[1].original).getTime()
      return dateA - dateB
    })

    // Convert to ISO strings for categories
    const categories = sortedEntries.map(([_, entry]) => {
      const date = new Date(entry.original)
      return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
    })

    // Process each series to align with combined timestamps
    const processedSeries = seriesData.map((s, seriesIndex) => {
      const alignedData = sortedEntries.map(([normalized, entry]) => {
        return entry.values.get(seriesIndex) ?? null
      })

      return {
        name: s.name,
        data: alignedData,
      }
    })

    return { categories, series: processedSeries }
  }, [seriesData])
  const options: ApexOptions = {
    chart: {
      defaultLocale: 'en',
      height: 420,
      type: 'line',
      zoom: {
        enabled: false,
      },
    },
    stroke: {
      width: seriesData.map((s) => 5), // Same width for all series
      curve: 'smooth',
      dashArray: seriesData.map((s) => (s.order === 0 ? 0 : 5)), // Solid for first (order=0), dashed for rest
    },
    xaxis: {
      type: 'category',
      categories: categories.length > 0 ? categories.map((c, index) => {
        const date = new Date(c)
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      }) : [],
    },
    title: {
      text: 'Forecast',
      align: 'left',
      style: {
        fontSize: '16px',
        color: '#666',
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        gradientToColors: ['#FDD835'],
        shadeIntensity: 1,
        type: 'horizontal',
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100, 100, 100],
      },
    },
    yaxis: {
      min: seriesData.length > 0 ? undefined : 0,
      max: seriesData.length > 0 ? undefined : 10,
      labels: {
        formatter: (value: number) => {
          if (value === null || value === undefined) return ''
          return value.toFixed(3)
        },
      },
    },
    noData: {
      text: 'No data available. Upload a CSV file to see the forecast.',
      align: 'center',
      verticalAlign: 'middle',
      style: {
        color: '#999',
        fontSize: '14px',
      },
    },
    colors: chartsColor,
    grid: {
      padding: {
        top: 0,
        right: 5,
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
        type="line"
        height={420}
        width="100%"
      />
    </React.Fragment>
  )
}

export default GradientLineChart
