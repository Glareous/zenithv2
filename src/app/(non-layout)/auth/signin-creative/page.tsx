import React from 'react'

import { NextPageWithLayout } from '@src/dtos'
import SigninCreative from '@src/views/Auth/SignIn/SigninCreative'

const SignInCreativePage: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <SigninCreative />
    </React.Fragment>
  )
}

export default SignInCreativePage
