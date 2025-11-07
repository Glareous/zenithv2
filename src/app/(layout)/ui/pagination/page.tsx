import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import BasicPagination from '@src/views/UiElements/Ui-Pagination/BasicPagination'
import FlushPagination from '@src/views/UiElements/Ui-Pagination/FlushPagination'
import LightPagination from '@src/views/UiElements/Ui-Pagination/LightPagination'
import ModernPagination from '@src/views/UiElements/Ui-Pagination/ModernPagination'
import SizePagination from '@src/views/UiElements/Ui-Pagination/SizePagination'

const Paginations: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Pagination" subTitle="UI" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 xl:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Basic Pagination</h6>
          </div>
          <div className="card-body">
            <BasicPagination />
          </div>
        </div>

        <div className="col-span-12 xl:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Modern Pagination</h6>
          </div>
          <div className="card-body">
            <ModernPagination />
          </div>
        </div>

        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Flush Pagination</h6>
          </div>
          <div className="card-body">
            <FlushPagination />
          </div>
        </div>

        <div className="col-span-12 xl:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Size Pagination</h6>
          </div>
          <div className="card-body">
            <SizePagination />
          </div>
        </div>
        <div className="col-span-12 xl:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Light Pagination</h6>
          </div>
          <div className="card-body">
            <LightPagination />
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default Paginations
