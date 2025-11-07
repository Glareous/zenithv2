import React from 'react'

import UserProfileHeader from '@src/components/common/UserProfileHeader'
import UserProfileOverView from '@src/components/common/UserProfileOverView'
import { NextPageWithLayout } from '@src/dtos'

const UserPage: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <UserProfileHeader />
      <UserProfileOverView />
    </React.Fragment>
  )
}

export default UserPage
