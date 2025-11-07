'use client'

import React from 'react'

import { LAYOUT_DIRECTION } from '@src/components/constants/layout'
import { NextPageWithLayout } from '@src/dtos'
import { RootState } from '@src/slices/reducer'
import ResetPasswordCreative from '@src/views/Auth/resetPassword/resetPasswordCreative'
import { useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify'

const ResetPasswordCreativePage: NextPageWithLayout = () => {
  const { layoutMode, layoutDirection } = useSelector(
    (state: RootState) => state.Layout
  )

  return (
    <React.Fragment>
      <ResetPasswordCreative />

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

export default ResetPasswordCreativePage
