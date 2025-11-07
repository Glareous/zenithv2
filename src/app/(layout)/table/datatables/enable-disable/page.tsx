'use client'

import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import DataTableEnableDisable from '@src/views/Table/DataTables/DatatablesEnableDisable'

const EnableDisable: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Basic" subTitle="Datatables" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Basic</h6>
          </div>
          <div className="card-body">
            <DataTableEnableDisable />
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default EnableDisable
