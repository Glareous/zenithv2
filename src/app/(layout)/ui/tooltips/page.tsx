import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import AnimationTooltip from '@src/views/UiElements/UI-tooltips/AnimationTooltip'
import ArrowlessTooltip from '@src/views/UiElements/UI-tooltips/ArrowlessTooltip'
import CustomeTooltip from '@src/views/UiElements/UI-tooltips/CustomeTooltip'
import DefaultTooltips from '@src/views/UiElements/UI-tooltips/DefaultTooltips'
import FollowCursor from '@src/views/UiElements/UI-tooltips/FollowCursor'
import NoFlipTooltip from '@src/views/UiElements/UI-tooltips/NoFlipTooltip'
import PlacementTooltip from '@src/views/UiElements/UI-tooltips/PlacementTooltip'

const Tooltips: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="UI Tooltip" subTitle="UI" />
      <div className="grid grid-cols-12 gap-x-space">
        <DefaultTooltips />
        <FollowCursor />
        <ArrowlessTooltip />
        <NoFlipTooltip />
        <CustomeTooltip />
        <AnimationTooltip />
        <PlacementTooltip />
      </div>
    </React.Fragment>
  )
}

export default Tooltips
