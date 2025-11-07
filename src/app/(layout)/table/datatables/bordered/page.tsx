'use client'

import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import BorderTable from '@src/views/Table/DataTables/BorderedTable'

const Bordered: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Bordered" subTitle="Datatables" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Bordered</h6>
          </div>
          <div className="card-body">
            <BorderTable />
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default Bordered
