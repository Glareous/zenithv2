'use client'

import React, { useRef } from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import AdvancedTimelineChart from '@src/views/Apexcharts/TimelineCharts/AdvancedTimelineChart'
import BasicTimelineChart from '@src/views/Apexcharts/TimelineCharts/BasicTimelineChart'
import DumbbellTimelineChart from '@src/views/Apexcharts/TimelineCharts/DumbbellTimelineChart'
import MultipleGroupTimelineChart from '@src/views/Apexcharts/TimelineCharts/MultipleGroupTimelineChart'

const TimelineChart: NextPageWithLayout = () => {
  const basicChart = useRef(null)
  const advancedTimelineChart = useRef(null)
  const multipleGroupTimelineChart = useRef(null)
  const dumbbellTimelineChart = useRef(null)

  return (
    <React.Fragment>
      <BreadCrumb title="Timeline Charts" subTitle="Apexcharts" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Basic</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <BasicTimelineChart
                chartColors="[bg-primary-500]"
                chartDarkColors={''}
                chartId={basicChart}
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Advanced</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <AdvancedTimelineChart
                chartColors="[bg-primary-500, bg-yellow-500, bg-green-500]"
                chartDarkColors={''}
                chartId={advancedTimelineChart}
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Multiple Series – Group Rows</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <MultipleGroupTimelineChart
                chartId={multipleGroupTimelineChart}
              />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Dumbbell Chart (Horizontal)</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <DumbbellTimelineChart
                chartColors="[bg-primary-500, bg-green-500]"
                chartDarkColors={''}
                chartId={dumbbellTimelineChart}
              />
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default TimelineChart
