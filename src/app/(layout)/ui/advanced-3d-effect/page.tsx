'use client'

import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import Effect3D from '@src/views/UiAdvanced/uiAdvanced3d/effect3D'

const AdvancedEffect: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="3D Effect" subTitle="UI Advanced" />
      <div className="grid grid-cols-12 gap-x-space">
        <Effect3D />
      </div>
    </React.Fragment>
  )
}

export default AdvancedEffect
