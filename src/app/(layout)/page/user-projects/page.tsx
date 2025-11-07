'use client'

import React from 'react'

import UserProfileHeader from '@src/components/common/UserProfileHeader'
import { NextPageWithLayout } from '@src/dtos'

import UserProjectsContent from './userProjects'

const UserProjects: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <UserProfileHeader />
      <UserProjectsContent />
    </React.Fragment>
  )
}

export default UserProjects
