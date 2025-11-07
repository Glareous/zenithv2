import React from 'react'

import { NextPageWithLayout } from '@src/dtos'
import SignupModern from '@src/views/Auth/Signup/SignupModern'

const SignUpModernPage: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <SignupModern />
    </React.Fragment>
  )
}

export default SignUpModernPage
