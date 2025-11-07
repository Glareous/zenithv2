'use client'

import React from 'react'

import UserProfileHeader from '@src/components/common/UserProfileHeader'
import { NextPageWithLayout } from '@src/dtos'

import UserFollowersContent from './userFollowers'

const UserFollowers: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <UserProfileHeader />
      <UserFollowersContent />
    </React.Fragment>
  )
}

export default UserFollowers
