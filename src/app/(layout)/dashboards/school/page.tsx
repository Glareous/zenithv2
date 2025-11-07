'use client'

import BreadCrumb from '@src/components/common/BreadCrumb'
import Explore from '@src/views/Dashboards/SchoolDashboard/Explore'
import TopScoreTable from '@src/views/Dashboards/SchoolDashboard/TopScore'
import TotalStudents from '@src/views/Dashboards/SchoolDashboard/TotalStudents'
import UpcomingTest from '@src/views/Dashboards/SchoolDashboard/UpcomingTest'
import Videos from '@src/views/Dashboards/SchoolDashboard/Videos'
import Widgets from '@src/views/Dashboards/SchoolDashboard/Widgets'

const School = () => {
  return (
    <>
      <BreadCrumb title="School" subTitle="Dashboards" />
      <div className="grid grid-cols-12 gap-x-space">
        <Widgets />
        <TotalStudents />
        <UpcomingTest />
        <TopScoreTable />
        <Videos />
        <Explore />
      </div>
    </>
  )
}

export default School
