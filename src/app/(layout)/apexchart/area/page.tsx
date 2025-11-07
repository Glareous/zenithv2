import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import BasicAreaChart from '@src/views/Apexcharts/AreaCharts/BasicAreaChart'
import MissingNullAreaChart from '@src/views/Apexcharts/AreaCharts/MissingNullAreaChart'
import NegativeAreaChart from '@src/views/Apexcharts/AreaCharts/NegativeAreaChart'
import SpLineAreaChart from '@src/views/Apexcharts/AreaCharts/SpLineAreaChart'
import StackedAreaChart from '@src/views/Apexcharts/AreaCharts/StackedAreaChart'

const AreaCharts: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Area Charts" subTitle="Apexcharts" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Basic</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <BasicAreaChart
                chartId="basicAreaChart"
                chartColors={''}
                chartDarkColors={''}
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Spline Area</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <SpLineAreaChart
                chartId="splineAreaChart"
                chartColors="[bg-sky-500, bg-green-500]"
                chartDarkColors={''}
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Negative</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <NegativeAreaChart
                chartColors="[bg-primary-500, bg-gray-300]"
                chartDarkColors="[bg-primary-500, bg-dark-700]"
                chartId="negativeAreaChart"
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Stacked</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <StackedAreaChart
                chartColors="[bg-primary-500, bg-green-500, bg-gray-200]"
                chartDarkColors="[bg-primary-500, bg-green-500, bg-dark-700]"
                chartId="stackedAreaChart"
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Missing / Null values</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <MissingNullAreaChart
                chartColors="[bg-primary-500]"
                chartDarkColors={''}
                chartId="missingAreaChart"
              />
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default AreaCharts
