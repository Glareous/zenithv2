'use client'

import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import DealOpen from '@src/views/Dashboards/CrmDashboards/DealOpen'
import Premium from '@src/views/Dashboards/CrmDashboards/Premium'
import RevenueForecast from '@src/views/Dashboards/CrmDashboards/RevenueForecast'
import SalesAnalytics from '@src/views/Dashboards/CrmDashboards/SalesAnalytics'
import UserData from '@src/views/Dashboards/CrmDashboards/UserData'
import Widgets from '@src/views/Dashboards/CrmDashboards/Widgets'

const CRM = () => {
  return (
    <>
      <BreadCrumb title={'CRM'} subTitle={'Dashboards'} />
      <div className="grid grid-cols-12 gap-x-space">
        <SalesAnalytics />
        <Widgets />
        <RevenueForecast />
        <DealOpen />
        <Premium />
        <UserData />
      </div>
    </>
  )
}

export default CRM
