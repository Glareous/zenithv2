import React from 'react'

import { NextPageWithLayout } from '@src/dtos'
import SigninModern from '@src/views/Auth/SignIn/SigninModern'

const SignInModernPage: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <SigninModern />
    </React.Fragment>
  )
}

export default SignInModernPage
