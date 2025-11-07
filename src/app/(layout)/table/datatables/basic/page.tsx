'use client'

import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import BasicTable from '@src/views/Table/DataTables/BasicTable'

const BasicTables: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Basic" subTitle="DataTables" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Basic</h6>
          </div>
          <div className="card-body">
            <BasicTable />
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default BasicTables
