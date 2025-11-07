import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import AnimationNavigation from '@src/views/UiElements/Ui-ButtonNavigation/AnimationNavigation'
import BorderNavigation from '@src/views/UiElements/Ui-ButtonNavigation/BorderNavigation'
import NavigationBottom from '@src/views/UiElements/Ui-ButtonNavigation/NavigationBottom'

const ButtonNavigation: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Button Navigation" subTitle="UI" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Bottom Navigation</h6>
          </div>
          <div className="card-body">
            <NavigationBottom />
          </div>
        </div>

        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Animation Navigation</h6>
          </div>
          <div className="card-body">
            <AnimationNavigation />
          </div>
        </div>

        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Border Navigation</h6>
          </div>
          <div className="card-body">
            <BorderNavigation />
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default ButtonNavigation
