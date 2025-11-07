'use client'

import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import DatatablesStripe from '@src/views/Table/DataTables/DatatablesStripe'

const Stripe: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Stripe" subTitle="Datatables" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Stripe</h6>
          </div>
          <div className="card-body">
            <DatatablesStripe />
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default Stripe
