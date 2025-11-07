'use client'

import React, { useRef } from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import BasicRadialbarChart from '@src/views/Apexcharts/RadialBarCharts/BasicRadialbarChart'
import CustomAngleRadialbarChart from '@src/views/Apexcharts/RadialBarCharts/CustomAngleRadialbarChart'
import GradientRadialbarChart from '@src/views/Apexcharts/RadialBarCharts/GradientRadialbarChart'
import ImageRadialbarChart from '@src/views/Apexcharts/RadialBarCharts/ImageRadialbarChart'
import MultipleRadialbarChart from '@src/views/Apexcharts/RadialBarCharts/MultipleRadialbarChart'
import SemiGaugeRadialbarChart from '@src/views/Apexcharts/RadialBarCharts/SemiGaugeRadialbarChart'
import StrokedGaugeRadialbarChart from '@src/views/Apexcharts/RadialBarCharts/StrokedGaugeRadialbarChart'

const RadialbarCharts: NextPageWithLayout = () => {
  const basicRadialbarChart = useRef(null)
  const multipleRadialbarChart = useRef(null)
  const customAngleRadialbarChart = useRef(null)
  const gradientRadialbarChart = useRef(null)
  const imageRadialbarChart = useRef(null)
  const strokedGaugeRadialbarChart = useRef(null)
  const semiGaugeRadialbarChart = useRef(null)

  return (
    <React.Fragment>
      <BreadCrumb title="Radialbar Charts" subTitle="Apex Chart" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Basic</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <BasicRadialbarChart
                chartColors="[bg-primary-500]"
                chartDarkColors={''}
                chartId={basicRadialbarChart}
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Multiple</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <MultipleRadialbarChart
                chartColors="[bg-primary-500, bg-green-500, bg-yellow-500, bg-purple-500]"
                chartDarkColors={''}
                chartId={multipleRadialbarChart}
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Custom Angle Circle</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <CustomAngleRadialbarChart
                chartColors="[bg-primary-500, bg-green-500, bg-yellow-500, bg-purple-500]"
                chartDarkColors={''}
                chartId={customAngleRadialbarChart}
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
              <GradientRadialbarChart
                chartColors="[bg-primary-500, bg-green-500]"
                chartDarkColors={''}
                chartId={gradientRadialbarChart}
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Radialbars with Image</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <ImageRadialbarChart chartId={imageRadialbarChart} />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Stroked Gauge</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <StrokedGaugeRadialbarChart
                chartColors="[bg-primary-500]"
                chartDarkColors={''}
                chartId={strokedGaugeRadialbarChart}
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Semi Circle Gauge</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <SemiGaugeRadialbarChart
                chartColors="[bg-sky-500]"
                chartDarkColors={''}
                chartId={semiGaugeRadialbarChart}
              />
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default RadialbarCharts
