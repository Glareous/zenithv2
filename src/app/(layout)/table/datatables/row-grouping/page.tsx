'use client'

import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import DatatablesRowGrouping from '@src/views/Table/DataTables/DatatablesRowGrouping'

const RowGrouPing: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Row Grouping" subTitle="Datatables" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Row Grouping</h6>
          </div>
          <div className="card-body">
            <DatatablesRowGrouping />
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default RowGrouPing
