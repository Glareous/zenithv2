import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import AttendanceList from '@src/views/Apps/hospital/staffAttendance/AttendanceList'
import Information from '@src/views/Apps/hospital/staffAttendance/Information'

const StaffArrendance: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Attendance" subTitle="Staff" />
      <div className="grid grid-cols-12 gap-x-space">
        <Information />
        <AttendanceList />
      </div>
    </React.Fragment>
  )
}

export default StaffArrendance
