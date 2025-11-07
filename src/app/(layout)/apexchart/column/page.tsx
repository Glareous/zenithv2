'use client'

import React, { useRef } from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import BasicColumnChart from '@src/views/Apexcharts/ColumnCharts/BasicColumnChart'
import DataLabelsColumnChart from '@src/views/Apexcharts/ColumnCharts/DataLabelsColumnChart'
import DistributedColumnChart from '@src/views/Apexcharts/ColumnCharts/DistributedColumnChart'
import DumbbellColumnChart from '@src/views/Apexcharts/ColumnCharts/DumbbellColumnChart'
import GroupLabelChart from '@src/views/Apexcharts/ColumnCharts/GroupLabelChart'
import GroupStackedColumnChart from '@src/views/Apexcharts/ColumnCharts/GroupStackedColumnChart'
import MarkersColumnChart from '@src/views/Apexcharts/ColumnCharts/MarkersColumnChart'
import NegativeValuesColumnChart from '@src/views/Apexcharts/ColumnCharts/NegativeValuesColumnChart'
import RotatedLabelsColumnChart from '@src/views/Apexcharts/ColumnCharts/RotatedLabelsColumnChart'
import StackedColumn100Chart from '@src/views/Apexcharts/ColumnCharts/StackedColumn100Chart'
import StackedColumnChart from '@src/views/Apexcharts/ColumnCharts/StackedColumnChart'

const ColumnCharts: NextPageWithLayout = () => {
  const basicColumnChart = useRef(null)
  const labelColumnChart = useRef(null)
  const stackedColumnChart = useRef(null)
  const stackedColumn100Chart = useRef(null)
  const groupStackedColumnChart = useRef(null)
  const dumbbellColumnChart = useRef(null)
  const markersColumnChart = useRef(null)
  const groupLabelColumnChart = useRef(null)
  const rotatedLabelColumnChart = useRef(null)
  const negativeLabelColumnChart = useRef(null)
  const distributedColumnChart = useRef(null)

  return (
    <React.Fragment>
      <BreadCrumb title="Column Charts" subTitle="Apexcharts" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Basic</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <BasicColumnChart
                chartColors="[bg-primary-500, bg-green-500, bg-yellow-500]"
                chartDarkColors={''}
                chartId={basicColumnChart}
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Column with Data Labels</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <DataLabelsColumnChart
                chartColors="[bg-primary-500]"
                chartDarkColors={''}
                chartId={labelColumnChart}
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Stacked Columns</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <StackedColumnChart
                chartColors="[bg-primary-500, bg-green-500, bg-red-500, bg-yellow-500]"
                chartDarkColors={''}
                chartId={stackedColumnChart}
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Stacked Columns 100</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <StackedColumn100Chart
                chartColors="[bg-primary-500, bg-green-500, bg-yellow-500]"
                chartDarkColors={''}
                chartId={stackedColumn100Chart}
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Grouped Stacked Columns</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <GroupStackedColumnChart
                chartColors="[bg-primary-500, bg-green-500, bg-primary-200, bg-green-300]"
                chartDarkColors="[bg-primary-500, bg-green-500, bg-primary-800, bg-green-800]"
                chartId={groupStackedColumnChart}
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Dumbbell Chart</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <DumbbellColumnChart
                chartColors="[bg-primary-500, bg-pink-500]"
                chartDarkColors={''}
                chartId={dumbbellColumnChart}
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Column with Markers</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <MarkersColumnChart
                chartColors="[bg-primary-500]"
                chartDarkColors={''}
                chartId={markersColumnChart}
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Column with Group Label</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <GroupLabelChart
                chartColors="[bg-primary-500]"
                chartDarkColors={''}
                chartId={groupLabelColumnChart}
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Column with Rotated Labels</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <RotatedLabelsColumnChart
                chartColors="[bg-primary-500]"
                chartDarkColors={''}
                chartId={rotatedLabelColumnChart}
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Column with Negative Values</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <NegativeValuesColumnChart
                chartColors="[bg-primary-500, bg-yellow-500, bg-red-500]"
                chartDarkColors={''}
                chartId={negativeLabelColumnChart}
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Distributed Columns</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <DistributedColumnChart
                chartColors="[bg-primary-500, bg-pink-500, bg-sky-500, bg-green-300, bg-yellow-500, bg-purple-500, bg-red-500, bg-sky-500]"
                chartDarkColors={''}
                chartId={distributedColumnChart}
              />
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default ColumnCharts
