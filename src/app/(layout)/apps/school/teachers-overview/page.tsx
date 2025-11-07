'use client'

import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import Achievements from '@src/views/Apps/school/teachersOverview/Achievements'
import Quiz from '@src/views/Apps/school/teachersOverview/Quiz'
import TeacherInformation from '@src/views/Apps/school/teachersOverview/TeacherInformation'
import Test from '@src/views/Apps/school/teachersOverview/Test'
import TimeSpendingLecture from '@src/views/Apps/school/teachersOverview/TimeSpendinLecture'
import UpcomingLecture from '@src/views/Apps/school/teachersOverview/UpcomingLecture'

const TeachersOverview: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Overview" subTitle="Teachers" />
      <div className="grid grid-cols-12 gap-x-space">
        <TeacherInformation />
        <Achievements />
        <Test />
        <TimeSpendingLecture />
        <Quiz />
        <UpcomingLecture />
      </div>
    </React.Fragment>
  )
}

export default TeachersOverview
