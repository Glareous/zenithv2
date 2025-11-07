'use client'

import React, { useRef } from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import BasicHeatmapChart from '@src/views/Apexcharts/HeatMapCharts/BasicHeatmapChart'
import MultipleColorsChart from '@src/views/Apexcharts/HeatMapCharts/MultipleColorsChart'
import MultipleColorsFlippedHeatChart from '@src/views/Apexcharts/HeatMapCharts/MultipleColorsFlippedHeatChart'
import RoundedHeatmapChart from '@src/views/Apexcharts/HeatMapCharts/RoundedHeatmapChart'

const HeatmapCharts: NextPageWithLayout = () => {
  const basicHatmapChart = useRef(null)
  const multiColorHatmapChart = useRef(null)
  const multiColorFlippedHatmapChart = useRef(null)
  const roundedHatmapChart = useRef(null)

  return (
    <React.Fragment>
      <BreadCrumb title="Heatmap Charts" subTitle="Apexcharts" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Basic</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <BasicHeatmapChart
                chartColors="[bg-primary-500]"
                chartDarkColors={''}
                chartId={basicHatmapChart}
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Multiple Colors</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <MultipleColorsChart
                chartColors="[bg-primary-500, bg-green-500, bg-pink-500, bg-sky-500, bg-indigo-500, bg-purple-500, bg-orange-500, bg-yellow-500]"
                chartDarkColors={''}
                chartId={multiColorHatmapChart}
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Multiple Colors Flipped</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <MultipleColorsFlippedHeatChart
                chartColors="[bg-primary-500, bg-green-500, bg-pink-500, bg-sky-500, bg-indigo-500, bg-purple-500, bg-orange-500, bg-yellow-500]"
                chartDarkColors={''}
                chartId={multiColorFlippedHatmapChart}
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Rounded</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <RoundedHeatmapChart
                chartColors="[bg-primary-500, bg-green-500]"
                chartDarkColors={''}
                chartId={roundedHatmapChart}
              />
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default HeatmapCharts
