'use client'

import React, { useRef } from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import LineAreaChart from '@src/views/Apexcharts/MixedCharts/LineAreaChart'
import LineColumnAreaChart from '@src/views/Apexcharts/MixedCharts/LineColumnAreaChart'
import LineColumnChart from '@src/views/Apexcharts/MixedCharts/LineColumnChart'
import LineScatterChart from '@src/views/Apexcharts/MixedCharts/LineScatterChart'

const MixedCharts: NextPageWithLayout = () => {
  const lineColumnChart = useRef(null)
  const lineAreaChart = useRef(null)
  const lineColumnAreaChart = useRef(null)
  const lineScatterChart = useRef(null)

  return (
    <React.Fragment>
      <BreadCrumb title="Mixed Charts" subTitle="Apexcharts" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Line Column</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <LineColumnChart
                chartColors="[bg-primary-500, bg-green-500]"
                chartDarkColors={''}
                chartId={lineColumnChart}
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Line & Area</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <LineAreaChart
                chartColors="[bg-sky-500, bg-green-500]"
                chartDarkColors={''}
                chartId={lineAreaChart}
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Line Column Area</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <LineColumnAreaChart
                chartColors="[bg-primary-500, bg-green-500, bg-yellow-500]"
                chartDarkColors={''}
                chartId={lineColumnAreaChart}
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Line Scatter</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <LineScatterChart
                chartColors="[bg-sky-500, bg-green-500]"
                chartDarkColors={''}
                chartId={lineScatterChart}
              />
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default MixedCharts
