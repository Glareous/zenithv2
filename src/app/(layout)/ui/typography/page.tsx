import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import FontFamily from '@src/views/UiElements/Ui-Typography/FontFamily'
import FontWeight from '@src/views/UiElements/Ui-Typography/FontWeight'
import HeadingTitle from '@src/views/UiElements/Ui-Typography/HeadingTitle'

const Typography: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Typography" subTitle="UI" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Font Family</h6>
          </div>
          <div className="card-body">
            <FontFamily />
          </div>
        </div>
        <HeadingTitle />
        <FontWeight />
      </div>
    </React.Fragment>
  )
}

export default Typography
