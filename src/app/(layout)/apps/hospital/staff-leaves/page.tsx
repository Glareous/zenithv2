'use client'

import React, { useState } from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import type { NextPageWithLayout, StaffLeaves } from '@src/dtos'
import LeavesList from '@src/views/Apps/hospital/staffLeaves/leavesList'

const ParentComponent: NextPageWithLayout = () => {
  const [, setLeaveData] = useState<StaffLeaves[]>([])
  return (
    <div>
      <BreadCrumb title="Leave Management" subTitle="Staff" />
      <LeavesList onLeaveDataLoaded={setLeaveData} />
    </div>
  )
}

export default ParentComponent
