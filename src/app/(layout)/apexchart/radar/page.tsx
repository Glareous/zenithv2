'use client'

import React, { useRef } from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import BasicRadarChart from '@src/views/Apexcharts/RadarCharts/BasicRadarChart'
import MultipleRadarChart from '@src/views/Apexcharts/RadarCharts/MultipleRadarChart'
import PolygonfillChart from '@src/views/Apexcharts/RadarCharts/PolygonfillChart'

const RadarCharts: NextPageWithLayout = () => {
  const basicRadarChart = useRef(null)
  const multipleRadarChart = useRef(null)
  const polygonRadarChart = useRef(null)

  return (
    <React.Fragment>
      <BreadCrumb title="Radar Charts" subTitle="Apexcharts" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Basic</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <BasicRadarChart
                chartColors="[bg-primary-500]"
                chartDarkColors={''}
                chartId={basicRadarChart}
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Radar – Multiple Series</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <MultipleRadarChart
                chartColors="[bg-primary-500, bg-yellow-500, bg-green-500]"
                chartDarkColors={''}
                chartId={multipleRadarChart}
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Radar with Polygon-fill</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <PolygonfillChart
                chartColors="[bg-red-500]"
                chartDarkColors={''}
                chartId={polygonRadarChart}
              />
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default RadarCharts
