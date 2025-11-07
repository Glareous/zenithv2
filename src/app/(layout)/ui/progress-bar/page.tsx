import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import AnimationProgress from '@src/views/UiElements/Ui-ProgressBar/AnimationProgress'
import BasicProgress from '@src/views/UiElements/Ui-ProgressBar/BasicProgress'
import ContentProgress from '@src/views/UiElements/Ui-ProgressBar/ContentProgress'
import GradientProgress from '@src/views/UiElements/Ui-ProgressBar/GradientProgress'
import SizesProgress from '@src/views/UiElements/Ui-ProgressBar/SizesProgress'
import SoftProgress from '@src/views/UiElements/Ui-ProgressBar/SoftProgress'

const ProgressBars: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Progress Bar" subTitle="UI" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Basic Progress Bar</h6>
          </div>
          <div className="card-body">
            <BasicProgress />
          </div>
        </div>

        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Soft Progress Bar</h6>
          </div>
          <div className="card-body">
            <SoftProgress />
          </div>
        </div>

        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Animation Progress Bar</h6>
          </div>
          <div className="card-body">
            <AnimationProgress />
          </div>
        </div>

        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Gradient Progress Bar</h6>
          </div>
          <div className="card-body">
            <GradientProgress />
          </div>
        </div>

        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Sizes Progress Bar</h6>
          </div>
          <div className="card-body">
            <SizesProgress />
          </div>
        </div>

        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Content Progress Bar</h6>
          </div>
          <div className="card-body">
            <ContentProgress />
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default ProgressBars
