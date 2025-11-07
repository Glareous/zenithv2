'use client'

import BreadCrumb from '@src/components/common/BreadCrumb'
import Campaign from '@src/views/Dashboards/AnalyticsDashboards/Campaign'
import CampaignPerformance from '@src/views/Dashboards/AnalyticsDashboards/CampaignPerformance'
import Followers from '@src/views/Dashboards/AnalyticsDashboards/Followers'
import Performance from '@src/views/Dashboards/AnalyticsDashboards/Performance'
import RecentTransaction from '@src/views/Dashboards/AnalyticsDashboards/RecentTransaction'
import TopCountry from '@src/views/Dashboards/AnalyticsDashboards/TopCountry'
import TopUsers from '@src/views/Dashboards/AnalyticsDashboards/TopUsers'
import TrafficSource from '@src/views/Dashboards/AnalyticsDashboards/TrafficSource'
import VisitBrowsers from '@src/views/Dashboards/AnalyticsDashboards/VisitBrowsers'
import WebAnalytics from '@src/views/Dashboards/AnalyticsDashboards/WebAnalytics'
import Widgets from '@src/views/Dashboards/AnalyticsDashboards/Widgets'

const Analytics = () => {
  return (
    <>
      <BreadCrumb title={'Analytics'} subTitle={'Dashboards'} />
      <div className="grid grid-cols-12 gap-x-space">
        <Widgets />
        <Performance />
        <WebAnalytics />
        <Campaign />
        <RecentTransaction />
        <Followers />
        <VisitBrowsers />
        <TrafficSource />
        <TopUsers />
        <TopCountry />
        <CampaignPerformance />
      </div>
    </>
  )
}

export default Analytics
