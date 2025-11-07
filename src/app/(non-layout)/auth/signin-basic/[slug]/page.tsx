'use client'

import React from 'react'

import { LAYOUT_DIRECTION } from '@src/components/constants/layout'
import { NextPageWithLayout } from '@src/dtos'
import { RootState } from '@src/slices/reducer'
import SigninBasicWithSlug from '@src/views/Auth/SignIn/SigninBasicWithSlug'
import { useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify'

const SignInBasicSlugPage: NextPageWithLayout = () => {
  const { layoutMode, layoutDirection } = useSelector(
    (state: RootState) => state.Layout
  )

  return (
    <React.Fragment>
      <SigninBasicWithSlug />

      <ToastContainer
        theme={layoutMode}
        rtl={layoutDirection === LAYOUT_DIRECTION.RTL}
        position={
          layoutDirection === LAYOUT_DIRECTION.RTL ? 'top-left' : 'top-right'
        }
      />
    </React.Fragment>
  )
}

export default SignInBasicSlugPage
