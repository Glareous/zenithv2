'use client'

import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import DatatablesHover from '@src/views/Table/DataTables/DatatablesHover'

const Hover: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Hover" subTitle="Datatables" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Hover Effect</h6>
          </div>
          <div className="card-body">
            <DatatablesHover />
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default Hover
