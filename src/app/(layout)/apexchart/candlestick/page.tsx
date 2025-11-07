'use client'

import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import BasicCandleStickChart from '@src/views/Apexcharts/CandlestickCharts/BasicCandleStickChart'
import CandlestickLineChart from '@src/views/Apexcharts/CandlestickCharts/CandlestickLineChart'

const CandlestickCharts: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Candlestick Charts" subTitle="Apexcharts" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Basic</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <BasicCandleStickChart
                chartColors="[bg-green-500, bg-red-500]"
                chartDarkColors={''}
                chartId={'basicCandlestickChart'}
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Candlestick With Line</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <CandlestickLineChart
                chartColors="[bg-green-500, bg-red-500]"
                chartDarkColors={''}
                chartId={'candlestickLineChart'}
              />
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default CandlestickCharts
