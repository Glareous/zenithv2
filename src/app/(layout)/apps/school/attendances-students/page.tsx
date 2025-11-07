'use client'

import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import AttendanceList from '@src/views/Apps/school/StudentsAttendances/AttendanceList'
import StudentsAttendancesInfo from '@src/views/Apps/school/StudentsAttendances/StudentsAttendancesInfo'

const StudentsAttendances: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Students" subTitle="Attendances" />
      <StudentsAttendancesInfo />
      <AttendanceList />
    </React.Fragment>
  )
}

export default StudentsAttendances
