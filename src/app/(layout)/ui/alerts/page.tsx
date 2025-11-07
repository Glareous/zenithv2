import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import BasicAlert from '@src/views/UiElements/Ui-Alerts/BasicAlert'
import BasicAlerts from '@src/views/UiElements/Ui-Alerts/BasicAlerts'
import GradientAlerts from '@src/views/UiElements/Ui-Alerts/GradientAlerts'
import IconsAlerts from '@src/views/UiElements/Ui-Alerts/IconsAlerts'
import LiveAlerts from '@src/views/UiElements/Ui-Alerts/LiveAlerts'
import OutlineAlert from '@src/views/UiElements/Ui-Alerts/OutlineAlerts'
import SoftAlert from '@src/views/UiElements/Ui-Alerts/SoftAlert'
import SolidAlerts from '@src/views/UiElements/Ui-Alerts/SolidAlerts'
import IconwithAlerts from '@src/views/UiElements/Ui-Alerts/iconwithAlerts'

const Alerts: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title={'Alerts'} subTitle={'UI'} />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-space">
        <BasicAlert />
        <SoftAlert />
        <OutlineAlert />
        <SolidAlerts />
      </div>
      <IconwithAlerts />
      <GradientAlerts />
      <LiveAlerts />
      <IconsAlerts />
      <BasicAlerts />
    </React.Fragment>
  )
}

export default Alerts
