'use client'

import React from 'react'

import UserProfileHeader from '@src/components/common/UserProfileHeader'
import { NextPageWithLayout } from '@src/dtos'

import UserActivityContent from './userActivity'

const UserActivity: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <UserProfileHeader />
      <UserActivityContent />
    </React.Fragment>
  )
}

export default UserActivity
