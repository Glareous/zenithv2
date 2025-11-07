import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import BasicTimeline from '@src/views/UiElements/Ui-Timeline/BasicTimeline'
import ChangLogTimeline from '@src/views/UiElements/Ui-Timeline/ChangLogTimeline'
import ColoredTimeline from '@src/views/UiElements/Ui-Timeline/ColoredTimeline'
import SquareTimeline from '@src/views/UiElements/Ui-Timeline/SquareTimeline'

const TimeLine: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Timeline" subTitle="UI" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-4 card">
          <div className="card-header">
            <h6 className="card-title">Basic Timeline</h6>
          </div>
          <div className="card-body">
            <BasicTimeline />
          </div>
        </div>

        <div className="col-span-4 card">
          <div className="card-header">
            <h6 className="card-title">Square Timeline</h6>
          </div>
          <div className="card-body">
            <SquareTimeline />
          </div>
        </div>

        <div className="col-span-4 card">
          <div className="card-header">
            <h6 className="card-title">Colored Timeline</h6>
          </div>
          <div className="card-body">
            <ColoredTimeline />
          </div>
        </div>

        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">ChangLog Timeline</h6>
          </div>
          <div className="card-body">
            <ChangLogTimeline />
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default TimeLine
