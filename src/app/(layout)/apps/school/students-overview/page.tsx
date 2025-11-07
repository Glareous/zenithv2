'use client'

import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import PendingQuiz from '@src/views/Apps/school/StudentsOverview/PendingQuiz'
import StudentAchievements from '@src/views/Apps/school/StudentsOverview/StudentAchievements'
import StudentInformation from '@src/views/Apps/school/StudentsOverview/StudentInformation'
import TestMarks from '@src/views/Apps/school/StudentsOverview/TestMarks'
import UpcomingLecture from '@src/views/Apps/school/StudentsOverview/UpcomingLecture'

const StudentsOverview: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Overview" subTitle="Students" />
      <div className="grid grid-cols-12 gap-x-space">
        <StudentInformation />
        <StudentAchievements />
        <TestMarks />
        <PendingQuiz />
        <UpcomingLecture />
      </div>
    </React.Fragment>
  )
}

export default StudentsOverview
