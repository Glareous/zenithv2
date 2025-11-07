'use client'

import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import UserProfileHeader from '@src/components/common/UserProfileHeader'
import UserProfileOverView from '@src/components/common/UserProfileOverView'
import { NextPageWithLayout } from '@src/dtos'

const OverView: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Overview" subTitle="User" />

      {/* user profile header */}
      <UserProfileHeader />

      {/* user profile */}
      <UserProfileOverView />
    </React.Fragment>
  )
}

export default OverView
