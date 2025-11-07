'use client'

import React, { useRef } from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import BasicRangeChart from '@src/views/Apexcharts/RangeAreaCharts/BasicRangeChart'
import RangeComboChart from '@src/views/Apexcharts/RangeAreaCharts/RangeComboChart'

const RangeAreaCharts: NextPageWithLayout = () => {
  const rangeBasicChart = useRef(null)
  const rangeComboChart = useRef(null)

  return (
    <React.Fragment>
      <BreadCrumb title="Range Area Charts" subTitle="Apexcharts" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Basic</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <BasicRangeChart
                chartColors="[bg-primary-500]"
                chartDarkColors={''}
                chartId={rangeBasicChart}
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Combo</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <RangeComboChart
                chartColors="[bg-sky-500, bg-red-500]"
                chartDarkColors={''}
                chartId={rangeComboChart}
              />
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default RangeAreaCharts
