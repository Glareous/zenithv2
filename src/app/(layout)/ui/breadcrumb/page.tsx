import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import ArrowExample from '@src/views/UiElements/Ui-Breadcrumb/ArrowExample'
import BaseExample from '@src/views/UiElements/Ui-Breadcrumb/BaseExample'
import LineExample from '@src/views/UiElements/Ui-Breadcrumb/LineExample'

const BreadCrumbs: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Breadcrumb" subTitle="UI" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Base Example</h6>
          </div>
          <div className="card-body">
            <BaseExample />
          </div>
        </div>

        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Arrow Example</h6>
          </div>
          <div className="card-body">
            <ArrowExample />
          </div>
        </div>

        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Line Example</h6>
          </div>
          <div className="card-body">
            <LineExample />
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default BreadCrumbs
