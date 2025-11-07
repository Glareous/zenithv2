'use client'

import React, { useRef } from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import FunnelChart from '@src/views/Apexcharts/FunnelCharts/FunnelChart'
import PyramidChart from '@src/views/Apexcharts/FunnelCharts/PyramidChart'

const FunnelCharts: NextPageWithLayout = () => {
  const funnelChart = useRef(null)
  const pyramidChart = useRef(null)
  return (
    <React.Fragment>
      <BreadCrumb title="Funnel Charts" subTitle="Apexcharts" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Funnel</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <FunnelChart
                chartColors="[bg-primary-500]"
                chartDarkColors={''}
                chartId={funnelChart}
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Pyramid</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <PyramidChart chartId={pyramidChart} />
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default FunnelCharts
