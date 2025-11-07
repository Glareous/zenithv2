'use client'

import BreadCrumb from '@src/components/common/BreadCrumb'
import CampaignStats from '@src/views/Dashboards/EmailDashboards/CampaignStats'
import CustomerAndRate from '@src/views/Dashboards/EmailDashboards/CustomerAndRate'
import EmailCampaign from '@src/views/Dashboards/EmailDashboards/EmailCampaign'
import EmailPerformanceTable from '@src/views/Dashboards/EmailDashboards/EmailPerformance'
import MailStatistic from '@src/views/Dashboards/EmailDashboards/MailStatistic'
import TimeSpending from '@src/views/Dashboards/EmailDashboards/TimeSpending'
import TopCampaign from '@src/views/Dashboards/EmailDashboards/TopCampaign'
import Widgets from '@src/views/Dashboards/EmailDashboards/Widgets'

const Email = () => {
  return (
    <>
      <BreadCrumb title={'Email'} subTitle={'Dashboards'} />
      <div className="grid grid-cols-12 gap-x-space">
        <Widgets />
        <TopCampaign />
        <EmailCampaign />
        <MailStatistic />
        <TimeSpending />
        <CampaignStats />
        <CustomerAndRate />
        <EmailPerformanceTable />
      </div>
    </>
  )
}

export default Email
