'use client'

import React from 'react'

import dynamic from 'next/dynamic'

import { Modal } from '@src/components/custom/modal/modal'
import useChartColors from '@src/hooks/useChartColors'
import { ApexOptions } from 'apexcharts'
import { Expand } from 'lucide-react'

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
  const [isModalOpen, setIsModalOpen] = React.useState(false)

  // Handler to close modal smoothly
  const handleCloseModal = React.useCallback(() => {
    setIsModalOpen(false)
  }, [])

  // Handler to open modal
  const handleOpenModal = React.useCallback(() => {
    setIsModalOpen(true)
  }, [])

  // Process multiple series - combine all unique timestamps
  const { categories, series } = React.useMemo(() => {
    console.log('🔍 GradientLineChart - seriesData received:', seriesData)

    if (seriesData.length === 0) return { categories: [], series: [] }

    // Helper function to normalize timestamp - keep full timestamp for proper grouping
    const normalizeTimestamp = (ts: string): string => {
      const date = new Date(ts)
      // Return full ISO string to preserve hours/minutes/seconds
      return date.toISOString()
    }

    // Collect all unique normalized timestamps from all series
    const timestampMap = new Map<
      string,
      { original: string; values: Map<number, number> }
    >()

    seriesData.forEach((s, seriesIndex) => {
      s.data.forEach((d) => {
        const normalized = normalizeTimestamp(d.timestamp)

        if (!timestampMap.has(normalized)) {
          timestampMap.set(normalized, {
            original: d.timestamp,
            values: new Map(),
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
      return isNaN(date.getTime())
        ? new Date().toISOString()
        : date.toISOString()
    })

    // Process each series to align with combined timestamps
    const processedSeries = seriesData.map((s, seriesIndex) => {
      const alignedData = sortedEntries.map(([normalized, entry]) => {
        return entry.values.get(seriesIndex) ?? null
      })

      console.log(`📊 Series "${s.name}" data:`, alignedData)

      return {
        name: s.name,
        data: alignedData,
      }
    })

    console.log('✅ Final processed series:', processedSeries)
    console.log('📅 Final categories:', categories)

    return { categories, series: processedSeries }
  }, [seriesData])

  const options: ApexOptions = React.useMemo(
    () => ({
      chart: {
        defaultLocale: 'en',
        height: 420,
        type: 'line',
        zoom: {
          enabled: true,
        },
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true,
            customIcons: [
              {
                icon: isModalOpen
                  ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-top: 3px; margin-left: 4px; margin-right: 4px;"><path d="m15 15 6 6m-6-6v4.8m0-4.8h4.8"/><path d="M9 19.8V15m0 0H4.2M9 15l-6 6"/><path d="M15 4.2V9m0 0h4.8M15 9l6-6"/><path d="M9 4.2V9m0 0H4.2M9 9 3 3"/></svg>'
                  : '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-top: 3px; margin-left: 4px; margin-right: 4px;"><path d="m15 15 6 6"/><path d="m15 9 6-6"/><path d="M21 16v5h-5"/><path d="M21 8V3h-5"/><path d="M3 16v5h5"/><path d="m3 21 6-6"/><path d="M3 8V3h5"/><path d="M9 9 3 3"/></svg>',
                index: -1,
                title: isModalOpen ? 'Shrink' : 'Expand',
                class: 'custom-icon-expand-shrink',
                click: () => {
                  if (isModalOpen) {
                    handleCloseModal()
                  } else {
                    handleOpenModal()
                  }
                },
              },
            ],
          },
        },
        events: {
          mounted: (chartContext: any) => {
            // Hide all series except 'data' and 'prediction' on initial load
            const visibleSeriesNames = ['data', 'prediction']
            seriesData.forEach((s) => {
              if (!visibleSeriesNames.includes(s.name.toLowerCase())) {
                chartContext.hideSeries(s.name)
              }
            })
          },
        },
      },
      stroke: {
        width: seriesData.map((s) => 5), // Same width for all series
        curve: 'smooth',
        dashArray: seriesData.map((s) => (s.order === 0 ? 0 : 5)), // Solid for first (order=0), dashed for rest
      },
      xaxis: {
        type: 'category',
        categories:
          categories.length > 0
            ? categories.map((c, index) => {
                const date = new Date(c)
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              })
            : [],
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
        min: 0,
        labels: {
          formatter: (value: number) => {
            if (value === null || value === undefined) return ''
            return value.toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 3,
            })
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
      legend: {
        show: true,
        showForSingleSeries: false,
        showForNullSeries: true,
        showForZeroSeries: true,
        onItemClick: {
          toggleDataSeries: true,
        },
        onItemHover: {
          highlightDataSeries: true,
        },
      },
    }),
    [
      categories,
      seriesData,
      chartsColor,
      isModalOpen,
      handleOpenModal,
      handleCloseModal,
    ]
  )

  // Options for modal - same as original but without custom icon and more bottom padding
  const modalOptions: ApexOptions = React.useMemo(
    () => ({
      ...options,
      chart: {
        ...options.chart,
        height: 550,
        zoom: {
          enabled: true,
          type: 'x',
          autoScaleYaxis: true,
        },
        toolbar: {
          ...options.chart?.toolbar,
          tools: {
            ...options.chart?.toolbar?.tools,
            customIcons: [], // Remove custom Expand/Shrink icon
          },
        },
      },
      grid: {
        ...options.grid,
        padding: {
          top: 0,
          right: 5,
          bottom: 20, // More space for legend
        },
      },
    }),
    [options]
  )

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

      {/* Modal with expanded chart */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Forecast Chart"
        size="modal-2xl"
        position="modal-center"
        contentClass=""
        content={
          <div className="p-4 pb-8">
            <ReactApexChart
              options={modalOptions}
              series={series}
              type="line"
              height={550}
              width="100%"
            />
          </div>
        }
      />
    </React.Fragment>
  )
}

export default GradientLineChart
