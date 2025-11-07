'use client'

import React, { useRef } from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import SlopeMultiChart from '@src/views/Apexcharts/SlopChart/SlopMultiChart'
import SlopeBasicChart from '@src/views/Apexcharts/SlopChart/SlopeBasicChart'

const SlopeCharts: NextPageWithLayout = () => {
  const slopeBasicChart = useRef(null)
  return (
    <React.Fragment>
      <BreadCrumb title="Slope Charts" subTitle="Apexcharts" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Basic</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <SlopeBasicChart
                chartColors="[bg-primary-500, bg-purple-500, bg-red-500, bg-green-500]"
                chartDarkColors={''}
                chartId={slopeBasicChart}
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Multi Group</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <SlopeMultiChart
                chartColors="[bg-primary-500, bg-purple-500, bg-red-500, bg-green-500]"
                chartDarkColors={''}
                chartId={slopeBasicChart}
              />
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default SlopeCharts
