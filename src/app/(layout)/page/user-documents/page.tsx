'use client'

import React from 'react'

import UserProfileHeader from '@src/components/common/UserProfileHeader'
import { NextPageWithLayout } from '@src/dtos'

import UserDocumentsContent from './userDocuments'

const UserDocuments: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <UserProfileHeader />
      <UserDocumentsContent />
    </React.Fragment>
  )
}

export default UserDocuments
