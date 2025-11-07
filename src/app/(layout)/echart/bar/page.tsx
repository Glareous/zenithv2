'use client'

import React from 'react'

import Link from 'next/link'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import AxisAlignBarChart from '@src/views/ECharts/BarCharts/AxisAlignBarChart'
import BackgroundBarChart from '@src/views/ECharts/BarCharts/BackgroundBarChart'
import BasicBarChart from '@src/views/ECharts/BarCharts/BasicBarChart'
import SingleBarChart from '@src/views/ECharts/BarCharts/SingleBarChart'
import WorldPopulationBarChart from '@src/views/ECharts/BarCharts/WorldPopulationBarChart'

const BarEcharts: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Bar Charts" subTitle="Echarts" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Basic</h6>
          </div>
          <div className="card-body">
            <BasicBarChart
              chartColors="[bg-sky-500, bg-gray-200, bg-gray-800]"
              chartDarkColors="[bg-sky-500, bg-dark-800, bg-dark-100]"
            />
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Axis Align with Tick</h6>
          </div>
          <div className="card-body">
            <AxisAlignBarChart
              chartColors="[bg-primary-500, bg-gray-200, bg-gray-800]"
              chartDarkColors="[bg-primary-500, bg-dark-800, bg-dark-100]"
            />
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Bar with Background</h6>
          </div>
          <div className="card-body">
            <BackgroundBarChart
              chartColors="[bg-green-500, bg-gray-200, bg-gray-800, bg-gray-100]"
              chartDarkColors="[bg-green-500, bg-dark-800, bg-dark-100, bg-dark-850]"
            />
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Set Style of Single Bar</h6>
          </div>
          <div className="card-body">
            <SingleBarChart
              chartColors="[bg-primary-500, bg-purple-500, bg-gray-200, bg-gray-800, bg-gray-100]"
              chartDarkColors="[bg-primary-500, bg-purple-500, bg-dark-800, bg-dark-100, bg-dark-850]"
            />
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">World Population</h6>
          </div>
          <div className="card-body">
            <WorldPopulationBarChart
              chartColors="[bg-primary-500, bg-purple-500, bg-gray-200, bg-gray-800, bg-gray-100]"
              chartDarkColors="[bg-primary-500, bg-purple-500, bg-dark-800, bg-dark-100, bg-dark-850]"
            />
          </div>
        </div>
      </div>
      {/* more options */}
      <div className="mb-5 text-center">
        <Link
          href="https://echarts.apache.org/examples/en/index.html#chart-type-bar"
          target="_blank"
          className="btn btn-primary">
          More Example{' '}
          <i data-lucide="move-right" className="inline-block ml-1 size-4"></i>
        </Link>
      </div>
    </React.Fragment>
  )
}

export default BarEcharts
