'use client'

import React from 'react'

import dynamic from 'next/dynamic'

import useChartColors from '@src/hooks/useChartColors'
import { ApexOptions } from 'apexcharts'

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
})

interface AreaChartsProps {
  chartColors: string
  chartDarkColors: string
  chartId: string
  series?: number[]
  timeFrame?: string
}

const ProjectStatusApp = ({
  chartColors,
  chartDarkColors,
  chartId,
  timeFrame,
}: AreaChartsProps) => {
  // Pass both chartColors and chartDarkColors to the hook
  const chartsColor = useChartColors({ chartColors, chartDarkColors })

  const getSeriesData = () => {
    switch (timeFrame) {
      case 'Weekly':
        return [{ name: 'Earnings', data: [67, 48, 85, 51, 93, 109, 116] }]
      case 'Monthly':
        return [{ name: 'Earnings', data: [100, 120, 140, 130, 110, 150, 180] }]
      case 'Yearly':
        return [{ name: 'Earnings', data: [500, 600, 700, 300, 400, 620, 500] }]
      default:
        return [{ name: 'Earnings', data: [67, 48, 85, 51, 93, 109, 116] }]
    }
  }

  const labels = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']

  const options: ApexOptions = {
    labels: labels,
    chart: {
      defaultLocale: 'en',
      height: 125,
      type: 'area',
      sparkline: { enabled: !0 },
      zoom: {
        enabled: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 3,
      curve: 'smooth',
      dashArray: 2,
    },
    legend: {
      tooltipHoverFormatter: function (val, opts) {
        return (
          val +
          ' - <strong>' +
          opts.w.globals.series[opts.seriesIndex][opts.dataPointIndex] +
          '</strong>'
        )
      },
    },
    markers: {
      size: 0,
      hover: {
        sizeOffset: 6,
      },
    },
    yaxis: {
      title: {
        text: 'Growth',
      },
      labels: {
        formatter: function (y) {
          return '$' + y.toFixed(0) + 'k'
        },
      },
    },
    grid: {
      padding: {
        top: -20,
        right: 0,
        bottom: 0,
      },
    },
    colors: chartsColor,
  }

  return (
    <React.Fragment>
      <ReactApexChart
        dir="ltr"
        className="!min-h-full"
        options={options}
        series={getSeriesData()}
        data-chart-colors="[bg-primary-500]"
        type="area"
        id={chartId}
        height={125}
        width="100%"
      />
    </React.Fragment>
  )
}

const PatternDonutApp = ({
  chartColors,
  chartDarkColors,
  chartId,
  timeFrame,
}: AreaChartsProps) => {
  // Pass both chartColors and chartDarkColors to the hook
  const chartsColor = useChartColors({ chartColors, chartDarkColors })

  const getSeriesData = () => {
    switch (timeFrame) {
      case 'Weekly':
        return [55, 33, 46]
      case 'Monthly':
        return [25, 60, 15]
      case 'Yearly':
        return [25, 75, 63]
      default:
        return [55, 33, 46]
    }
  }

  const labels = ['Afternoon', 'Evening', 'Morning']

  const options: ApexOptions = {
    labels: labels,
    chart: {
      height: 210,
      type: 'donut',
      dropShadow: {
        enabled: true,
        color: '#111',
        top: -1,
        left: 3,
        blur: 3,
        opacity: 0.2,
      },
    },
    stroke: {
      width: 0,
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: false,
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    fill: {
      type: 'pattern',
      pattern: {
        style: 'squares',
      },
    },
    states: {
      hover: {
        // filter: 'none'
      },
    },
    theme: {
      palette: 'palette2',
    },
    legend: {
      show: false,
    },
    colors: chartsColor,
  }

  return (
    <React.Fragment>
      <ReactApexChart
        dir="ltr"
        className="!min-h-full"
        options={options}
        series={getSeriesData()}
        data-chart-colors="[bg-primary-500, bg-purple-500, bg-green-500]"
        type="donut"
        id={chartId}
        height={210}
        width="100%"
      />
    </React.Fragment>
  )
}

const MyTask1App = ({
  chartColors,
  chartDarkColors,
  chartId,
  series,
}: AreaChartsProps) => {
  // Pass both chartColors and chartDarkColors to the hook
  const chartsColor = useChartColors({ chartColors, chartDarkColors })

  const labels = ['[Progress]']

  const options: ApexOptions = {
    labels: labels,
    chart: {
      height: 60,
      width: 50,
      type: 'radialBar',
      sparkline: { enabled: !0 },
    },
    plotOptions: {
      radialBar: {
        dataLabels: {
          show: false,
        },
        hollow: {
          size: '20%',
        },
      },
    },
    colors: chartsColor,
  }

  return (
    <React.Fragment>
      <ReactApexChart
        dir="ltr"
        className="!min-h-full"
        options={options}
        series={series}
        data-chart-colors="[bg-primary-500]"
        type="radialBar"
        id={chartId}
        height={60}
        width={50}
      />
    </React.Fragment>
  )
}

export { ProjectStatusApp, PatternDonutApp, MyTask1App }
