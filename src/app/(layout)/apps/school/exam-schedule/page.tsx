'use client'

import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import ExamInformation from '@src/views/Apps/school/examSchedule/ExamInformation'
import ExamScheduleList from '@src/views/Apps/school/examSchedule/ExamScheduleList'

const ExamSchedule: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Schedule" subTitle="Exam" />
      <ExamInformation />
      <ExamScheduleList />
    </React.Fragment>
  )
}

export default ExamSchedule
