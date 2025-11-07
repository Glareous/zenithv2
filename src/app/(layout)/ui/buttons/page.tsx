import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import ActiveStyleButtonCard from '@src/views/UiElements/Ui-Buttons/ActiveStyle'
import BaseButtons from '@src/views/UiElements/Ui-Buttons/BaseButtons'
import ButtonIcon from '@src/views/UiElements/Ui-Buttons/ButtonsIcon'
import ButtonRounded from '@src/views/UiElements/Ui-Buttons/ButtonsRounded'
import DButtonCard from '@src/views/UiElements/Ui-Buttons/DButtonCard'
import DisabledButtons from '@src/views/UiElements/Ui-Buttons/DisabledButtons'
import HoverEffect from '@src/views/UiElements/Ui-Buttons/HoverEffect'
import HoverEffectButtons from '@src/views/UiElements/Ui-Buttons/HoverEffectButtons'
import IconButton from '@src/views/UiElements/Ui-Buttons/IconButton'
import LoadingButtons from '@src/views/UiElements/Ui-Buttons/LoadingButtons'
import OutlineButtonCard from '@src/views/UiElements/Ui-Buttons/OutlineButtons'
import OutlineDashedButtonCard from '@src/views/UiElements/Ui-Buttons/OutlineDashed'
import SizeButton from '@src/views/UiElements/Ui-Buttons/SizeButton'
import SoftButtonCard from '@src/views/UiElements/Ui-Buttons/SoftButtons'

const Button: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Buttons" subTitle="UI" />
      <div className="grid grid-cols-12 gap-x-space">
        <BaseButtons />
        <OutlineButtonCard />
        <SoftButtonCard />
        <DButtonCard />
        <OutlineDashedButtonCard />
        <ActiveStyleButtonCard />
        <IconButton />
        <SizeButton />
        <LoadingButtons />
        <ButtonRounded />
        <HoverEffect />
        <ButtonIcon />
        <HoverEffectButtons />
        <DisabledButtons />
      </div>
    </React.Fragment>
  )
}

export default Button
