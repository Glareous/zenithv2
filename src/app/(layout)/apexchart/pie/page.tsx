'use client'

import React, { useRef } from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import DonutUpdateChart from '@src/views/Apexcharts/PieCharts/DonutUpdateChart'
import DonutwithPatternChart from '@src/views/Apexcharts/PieCharts/DonutwithPatternChart'
import GradientDonutChart from '@src/views/Apexcharts/PieCharts/GradientDonutChart'
import MonochromePieChart from '@src/views/Apexcharts/PieCharts/MonochromePieChart'
import SemiDonutChart from '@src/views/Apexcharts/PieCharts/SemiDonutChart'
import SimpleDonutChart from '@src/views/Apexcharts/PieCharts/SimpleDonutChart'
import SimplePieChart from '@src/views/Apexcharts/PieCharts/SimplePieChart'

const PieChart: NextPageWithLayout = () => {
  const simplePieChart = useRef(null)
  const simpleDonutChart = useRef(null)
  const updateDonutChart = useRef(null)
  const monochromePieChart = useRef(null)
  const gradientDonutChart = useRef(null)
  const semiDonutChart = useRef(null)
  const patternDonutChart = useRef(null)

  return (
    <React.Fragment>
      <BreadCrumb title="Pie/Donuts Charts" subTitle="Apexcharts" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Simple Pie</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <SimplePieChart
                chartColors="[bg-primary-500, bg-green-500, bg-yellow-500, bg-purple-500, bg-red-500]"
                chartDarkColors={''}
                chartId={simplePieChart}
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Simple Donut</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <SimpleDonutChart
                chartColors="[bg-primary-500, bg-green-500, bg-yellow-500, bg-red-500, bg-purple-500]"
                chartDarkColors={''}
                chartId={simpleDonutChart}
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Donut Update</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <DonutUpdateChart
                chartColors="[bg-primary-500, bg-green-500, bg-yellow-500, bg-red-500]"
                chartDarkColors={''}
                chartId={updateDonutChart}
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Monochrome Pie</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <MonochromePieChart
                chartColors="[bg-yellow-500]"
                chartDarkColors={''}
                chartId={monochromePieChart}
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Gradient Donut</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <GradientDonutChart
                chartColors="[bg-primary-500, bg-green-500, bg-yellow-500, bg-purple-500, bg-red-500]"
                chartDarkColors={''}
                chartId={gradientDonutChart}
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Semi Donut</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <SemiDonutChart
                chartColors="[bg-primary-500, bg-green-500, bg-yellow-500, bg-purple-500, bg-red-500]"
                chartDarkColors={''}
                chartId={semiDonutChart}
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Donut with Pattern</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <DonutwithPatternChart
                chartColors="[bg-primary-500, bg-green-500, bg-yellow-500, bg-purple-500, bg-red-500]"
                chartDarkColors={''}
                chartId={patternDonutChart}
              />
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default PieChart
