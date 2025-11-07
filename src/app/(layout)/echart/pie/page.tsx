'use client'

import React from 'react'

import Link from 'next/link'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import BasicPieChart from '@src/views/ECharts/PieCharts/BasicPieChart'
import DoughnutPieChart from '@src/views/ECharts/PieCharts/DoughnutPieChart'
import DoughnutRoundedPieChart from '@src/views/ECharts/PieCharts/DoughnutRoundedPieChart'
import HalfDouglasnutChart from '@src/views/ECharts/PieCharts/HalfDouglasnutChart'

const PieECharts: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Pie Charts" subTitle="ECharts" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Basic</h6>
          </div>
          <div className="card-body">
            <BasicPieChart />
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Doughnut Chart with Rounded Corner</h6>
          </div>
          <div className="card-body">
            <DoughnutRoundedPieChart />
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Doughnut Chart</h6>
          </div>
          <div className="card-body">
            <DoughnutPieChart />
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Doughnut Chart</h6>
          </div>
          <div className="card-body">
            <HalfDouglasnutChart />
          </div>
        </div>
      </div>

      <div className="mb-5 text-center">
        <Link
          href="https://echarts.apache.org/examples/en/index.html#chart-type-pie"
          target="_blank"
          className="btn btn-primary">
          More Example{' '}
          <i data-lucide="move-right" className="inline-block ml-1 size-4"></i>
        </Link>
      </div>
    </React.Fragment>
  )
}

export default PieECharts
