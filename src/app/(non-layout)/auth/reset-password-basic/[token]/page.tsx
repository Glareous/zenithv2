'use client'

import React from 'react'
import { useParams } from 'next/navigation'

import { LAYOUT_DIRECTION } from '@src/components/constants/layout'
import { NextPageWithLayout } from '@src/dtos'
import { RootState } from '@src/slices/reducer'
import ResetPasswordBasic from '@src/views/Auth/resetPassword/resetPasswordBasic'
import { useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify'

const ResetPasswordBasicPage: NextPageWithLayout = () => {
  const { layoutMode, layoutDirection } = useSelector(
    (state: RootState) => state.Layout
  )
  const params = useParams()
  const token = params.token as string

  return (
    <React.Fragment>
      <ResetPasswordBasic token={token} />

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

export default ResetPasswordBasicPage