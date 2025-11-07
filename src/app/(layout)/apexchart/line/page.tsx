'use client'

import React, { useRef } from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import DashedLineChart from '@src/views/Apexcharts/LineCharts/DashedLineChart'
import DataLabelsLineChart from '@src/views/Apexcharts/LineCharts/DataLabelsLineChart'
import GradientLineChart from '@src/views/Apexcharts/LineCharts/GradientLineChart'
import SteplineLineChart from '@src/views/Apexcharts/LineCharts/SteplineLineChart'
import ZoomableLineChart from '@src/views/Apexcharts/LineCharts/ZoomableLineChart'
import BasicLineChart from '@src/views/ECharts/LineCharts/BasicLineChart'

const LineCharts: NextPageWithLayout = () => {
  const labelLineChart = useRef(null)
  const zoomLineChart = useRef(null)
  const stepLineChart = useRef(null)
  const gradientLineChart = useRef(null)
  const dashedLineChart = useRef(null)

  return (
    <React.Fragment>
      <BreadCrumb title="Line Charts" subTitle="Apexcharts" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Basic</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <BasicLineChart />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Line with Data Labels</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <DataLabelsLineChart
                chartColors="[bg-primary-500, bg-gray-300]"
                chartDarkColors="[bg-primary-500, bg-gray-300]"
                chartId={labelLineChart}
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Zoomable Timeseries</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <ZoomableLineChart
                chartColors="[bg-sky-500]"
                chartDarkColors={''}
                chartId={zoomLineChart}
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Stepline</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <SteplineLineChart
                chartColors="[bg-green-500]"
                chartDarkColors={''}
                chartId={stepLineChart}
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Gradient</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <GradientLineChart
                chartColors="[bg-orange-500, bg-primary-500]"
                chartDarkColors={''}
                chartId={gradientLineChart}
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Dashed</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <DashedLineChart
                chartColors="[bg-primary-500, bg-green-500, bg-gray-200]"
                chartDarkColors={''}
                chartId={dashedLineChart}
              />
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default LineCharts
