import React from 'react'

import { NextPageWithLayout } from '@src/dtos'
import AccountDeactivationBasic from '@src/views/Auth/AccountDeactivation/AccountDeactivationBasic'

const AccountDeactivationBasicPage: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <AccountDeactivationBasic />
    </React.Fragment>
  )
}

export default AccountDeactivationBasicPage
