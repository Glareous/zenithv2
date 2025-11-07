import React from 'react'

import { NextPageWithLayout } from '@src/dtos'
import SignupBasic from '@src/views/Auth/Signup/SignupBasic'

const SignUpBasicPage: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <SignupBasic />
    </React.Fragment>
  )
}

export default SignUpBasicPage
