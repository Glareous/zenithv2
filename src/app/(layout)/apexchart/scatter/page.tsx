'use client'

import React, { useRef } from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import BasicScatterChart from '@src/views/Apexcharts/ScatterCharts/BasicScatterChart'
import DatetimeScatterChart from '@src/views/Apexcharts/ScatterCharts/DatetimeScatterChart'
import ImagesScatterChart from '@src/views/Apexcharts/ScatterCharts/ImagesScatterChart'

const ScatterCharts: NextPageWithLayout = () => {
  const basicScatterChart = useRef(null)
  const datetimeScatterChart = useRef(null)
  const imagesScatterChart = useRef(null)

  return (
    <React.Fragment>
      <BreadCrumb title="Scatter Charts" subTitle="Apexcharts" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Basic</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <BasicScatterChart
                chartColors="[bg-primary-500, bg-yellow-500, bg-red-500]"
                chartDarkColors={''}
                chartId={basicScatterChart}
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Scatter – Datetime</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <DatetimeScatterChart
                chartColors="[bg-primary-500, bg-green-500, bg-purple-500, bg-orange-500, bg-red-500]"
                chartDarkColors={''}
                chartId={datetimeScatterChart}
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Scatter – Images</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <ImagesScatterChart chartId={imagesScatterChart} />
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default ScatterCharts
