'use client'

import React, { useRef } from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import BasicTreepmapChart from '@src/views/Apexcharts/TreemapCharts/BasicTreepmapChart'
import ColorRangeTreemapChart from '@src/views/Apexcharts/TreemapCharts/ColorRangeTreemapChart'
import DistributedTreemapChart from '@src/views/Apexcharts/TreemapCharts/DistributedTreemapChart'
import MultipleTreepmapChart from '@src/views/Apexcharts/TreemapCharts/MultipleTreepmapChart'

const TreemapCharts: NextPageWithLayout = () => {
  const basiTreepmapChart = useRef(null)
  const multipleTreemapChart = useRef(null)
  const colorRangeTreemapChart = useRef(null)
  const distributedTreemapChart = useRef(null)

  return (
    <React.Fragment>
      <BreadCrumb title="Treemap Charts" subTitle="Apexcharts" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Basic</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <BasicTreepmapChart
                chartColors="[bg-primary-500]"
                chartDarkColors={''}
                chartId={basiTreepmapChart}
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Treemap Multiple Series</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <MultipleTreepmapChart
                chartColors="[bg-primary-500, bg-green-500]"
                chartDarkColors={''}
                chartId={multipleTreemapChart}
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Color Range</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <ColorRangeTreemapChart
                chartColors="[bg-primary-500, bg-green-500]"
                chartDarkColors={''}
                chartId={colorRangeTreemapChart}
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Distributed</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <DistributedTreemapChart
                chartColors="[bg-primary-500, bg-green-500, bg-yellow-500, bg-purple-500, bg-sky-500, bg-red-500]"
                chartDarkColors={''}
                chartId={distributedTreemapChart}
              />
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default TreemapCharts
