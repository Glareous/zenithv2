import React from 'react'

import { NextPageWithLayout } from '@src/dtos'
import SignupCreative from '@src/views/Auth/Signup/SignupCreative'

const SignUpCreativePage: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <SignupCreative />
    </React.Fragment>
  )
}

export default SignUpCreativePage
