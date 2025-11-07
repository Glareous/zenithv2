'use client'

import React from 'react'

import UserProfileHeader from '@src/components/common/UserProfileHeader'
import { NextPageWithLayout } from '@src/dtos'

import UserNotesContent from './userNotes'

const UserNotes: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      {/* Profile Header */}
      <UserProfileHeader />

      {/* profile notes content */}
      <UserNotesContent />
    </React.Fragment>
  )
}

export default UserNotes
