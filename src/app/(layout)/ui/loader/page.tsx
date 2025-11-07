import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import BounceLoader from '@src/views/UiElements/Ui-loader/BounceLoader'
import Button from '@src/views/UiElements/Ui-loader/Button'
import GradientLoader from '@src/views/UiElements/Ui-loader/GradientLoader'
import LoaderModern from '@src/views/UiElements/Ui-loader/LoaderModern'
import Loadingdots from '@src/views/UiElements/Ui-loader/Loadingdots'
import OvelShapedSpinner from '@src/views/UiElements/Ui-loader/OvelShapedSpinner'
import PingLoader from '@src/views/UiElements/Ui-loader/PingLoader'
import PulseLoader from '@src/views/UiElements/Ui-loader/PulseLoader'
import SpinLoader from '@src/views/UiElements/Ui-loader/SpinLoader'

const Loader: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Loader" subTitle="UI" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-space">
        <div className="card">
          <div className="card-header">
            <h6 className="card-title">Spin Loader</h6>
          </div>
          <div className="card-body">
            <SpinLoader />
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h6 className="card-title">Modern Spin Loader</h6>
          </div>
          <div className="card-body">
            <LoaderModern />
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h6 className="card-title">Bounce Loader</h6>
          </div>
          <div className="card-body">
            <BounceLoader />
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h6 className="card-title">Ping Loader</h6>
          </div>
          <div className="card-body">
            <PingLoader />
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h6 className="card-title">Pulse Loader</h6>
          </div>
          <div className="card-body">
            <PulseLoader />
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h6 className="card-title">Gradient Loader</h6>
          </div>
          <div className="card-body">
            <GradientLoader />
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h6 className="card-title">Button</h6>
          </div>
          <div className="card-body">
            <Button />
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h6 className="card-title">Ovel Shaped Spinner</h6>
          </div>
          <OvelShapedSpinner />
        </div>
        <div className="card">
          <div className="card-header">
            <h6 className="card-title">Loading dots</h6>
          </div>
          <Loadingdots />
        </div>
      </div>
    </React.Fragment>
  )
}

export default Loader
