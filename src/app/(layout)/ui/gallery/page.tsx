import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import BasicGallery from '@src/views/UiElements/Ui-Gallery/BasicGallery'
import Masonary from '@src/views/UiElements/Ui-Gallery/Masonary'

const Gallerys: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Gallery" subTitle="UI" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Basic Gallery</h6>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-12 gap-5">
              <BasicGallery />
            </div>
          </div>
        </div>

        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Masonry With Lightbox Gallery</h6>
          </div>
          <Masonary />
        </div>
      </div>
    </React.Fragment>
  )
}

export default Gallerys
