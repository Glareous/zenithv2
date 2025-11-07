import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import HorizontalGroup from '@src/views/UiElements/Ui-ButtonsGroup/HorizontalGroup'
import VerticalGroup from '@src/views/UiElements/Ui-ButtonsGroup/VerticalGroup'

const ButtonsGroup: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Buttons Group" subTitle="UI" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Horizontal Group</h6>
          </div>
          <div className="card-body">
            <HorizontalGroup />
          </div>
        </div>

        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Vertical Group</h6>
          </div>
          <div className="card-body">
            <VerticalGroup />
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default ButtonsGroup
