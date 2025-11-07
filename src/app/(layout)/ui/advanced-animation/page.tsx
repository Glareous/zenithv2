'use client'

import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import AnchorPlacement from '@src/views/UiAdvanced/uiAdvancedAnimation/anchorPlacement'
import DifferentsettingsexamplesAnimation from '@src/views/UiAdvanced/uiAdvancedAnimation/differentSettingsExamplesAnimation'
import FadeAnimation from '@src/views/UiAdvanced/uiAdvancedAnimation/fadeAnimation'
import FlipAnimation from '@src/views/UiAdvanced/uiAdvancedAnimation/flipAnimation'
import ZoomAnimation from '@src/views/UiAdvanced/uiAdvancedAnimation/zoomAnimation'

const AdvancedAnimation: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Animation" subTitle="UI Advanced" />
      <FadeAnimation />
      <FlipAnimation />
      <ZoomAnimation />
      <DifferentsettingsexamplesAnimation />
      <AnchorPlacement />
    </React.Fragment>
  )
}

export default AdvancedAnimation
