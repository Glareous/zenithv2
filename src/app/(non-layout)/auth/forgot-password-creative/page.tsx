'use client'

import React from 'react'

import { LAYOUT_DIRECTION } from '@src/components/constants/layout'
import { NextPageWithLayout } from '@src/dtos'
import { RootState } from '@src/slices/reducer'
import ForgotPasswordCreative from '@src/views/Auth/ForgotPassword/ForgotPasswordCreative'
import { useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify'

const ForgotPasswordCreativePage: NextPageWithLayout = () => {
  const { layoutMode, layoutDirection } = useSelector(
    (state: RootState) => state.Layout
  )

  return (
    <React.Fragment>
      <ForgotPasswordCreative />

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

export default ForgotPasswordCreativePage
