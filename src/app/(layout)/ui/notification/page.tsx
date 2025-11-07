import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import BasicNotification from '@src/views/UiElements/Ui-Notification/BasicNotification'
import ContentToast from '@src/views/UiElements/Ui-Notification/ContentToast'
import PositionNotification from '@src/views/UiElements/Ui-Notification/PositionNotification'

const Notifications: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Notification" subTitle="UI" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Basic Notification</h6>
          </div>
          <div className="card-body">
            <BasicNotification />
          </div>
        </div>

        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Position Notification</h6>
          </div>
          <PositionNotification />
        </div>

        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Content Toast</h6>
          </div>
          <ContentToast />
        </div>
      </div>
    </React.Fragment>
  )
}

export default Notifications
