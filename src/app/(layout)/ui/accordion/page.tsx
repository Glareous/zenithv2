'use client'

import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import BasicAccordion from '@src/views/UiElements/Ui-Accordion/BasicAccordion'
import BoxedAccordion from '@src/views/UiElements/Ui-Accordion/BoxedAccordion'
import CollapseAccordion from '@src/views/UiElements/Ui-Accordion/CollapseAccordion'

const Accordion: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Accordion & Collapse" subTitle="UI" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Basic Accordion</h6>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-12 gap-5">
              <BasicAccordion />
            </div>
          </div>
        </div>

        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Boxed Accordion</h6>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-12 gap-5">
              <BoxedAccordion />
            </div>
          </div>
        </div>

        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Collapse</h6>
          </div>
          <div className="card-body">
            <div className="relative">
              <CollapseAccordion />
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default Accordion
