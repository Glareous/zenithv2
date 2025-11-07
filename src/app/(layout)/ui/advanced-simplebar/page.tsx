'use client'

import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import DefualtSimplebar from '@src/views/UiAdvanced/uiSimplebar/defualtSimplebar'
import GreenSimplebar from '@src/views/UiAdvanced/uiSimplebar/greenSimplebar'
import PinkSimplebar from '@src/views/UiAdvanced/uiSimplebar/pinkSimplebar'
import PrimarySimplebar from '@src/views/UiAdvanced/uiSimplebar/primarySimplebar'
import PurpleSimplebar from '@src/views/UiAdvanced/uiSimplebar/purpleSimplebar'
import RedSimplebar from '@src/views/UiAdvanced/uiSimplebar/redSimplebar'
import SkySimplebar from '@src/views/UiAdvanced/uiSimplebar/skySimplebar'
import YellowSimplebar from '@src/views/UiAdvanced/uiSimplebar/yellowSimplebar'

const Simplebar: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Simplebar" subTitle="UI Advanced" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Defualt Simplebar</h6>
          </div>
          <div className="card-body">
            <DefualtSimplebar />
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Primary Simplebar</h6>
          </div>
          <div className="card-body">
            <PrimarySimplebar />
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 xl:col-span-4 card">
          <div className="card-header">
            <h6 className="card-title">Green Simplebar</h6>
          </div>
          <div className="card-body">
            <GreenSimplebar />
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 xl:col-span-4 card">
          <div className="card-header">
            <h6 className="card-title">Purple Simplebar</h6>
          </div>
          <div className="card-body">
            <PurpleSimplebar />
          </div>
        </div>

        <div className="col-span-12 md:col-span-6 xl:col-span-4 card">
          <div className="card-header">
            <h6 className="card-title">Yellow Simplebar</h6>
          </div>
          <div className="card-body">
            <YellowSimplebar />
          </div>
        </div>

        <div className="col-span-12 md:col-span-6 xl:col-span-4 card">
          <div className="card-header">
            <h6 className="card-title">Red Simplebar</h6>
          </div>
          <div className="card-body">
            <RedSimplebar />
          </div>
        </div>

        <div className="col-span-12 md:col-span-6 xl:col-span-4 card">
          <div className="card-header">
            <h6 className="card-title">Sky Simplebar</h6>
          </div>
          <div className="card-body">
            <SkySimplebar />
          </div>
        </div>

        <div className="col-span-12 md:col-span-6 xl:col-span-4 card">
          <div className="card-header">
            <h6 className="card-title">Pink Simplebar</h6>
          </div>
          <div className="card-body">
            <PinkSimplebar />
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default Simplebar
