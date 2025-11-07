import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import BasicAvatar from '@src/views/UiElements/Ui-Avatar/BasicAvatar'
import ColoredAvatar from '@src/views/UiElements/Ui-Avatar/ColoredAvatar'
import GroupAvatar from '@src/views/UiElements/Ui-Avatar/GroupAvatar'
import IconAvatar from '@src/views/UiElements/Ui-Avatar/IconAvatar'
import RoundedAvatar from '@src/views/UiElements/Ui-Avatar/RoundedAvatar'
import RoundedTextAvatar from '@src/views/UiElements/Ui-Avatar/RoundedTextAvatar'
import TextAvatar from '@src/views/UiElements/Ui-Avatar/TextAvatar'

const Avatar: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Avatar" subTitle="UI" />
      <div className="grid grid-cols-12 gap-x-space">
        <BasicAvatar />
        <RoundedAvatar />
        <RoundedTextAvatar />
        <TextAvatar />
        <IconAvatar />
        <RoundedTextAvatar />
        <ColoredAvatar />
        <GroupAvatar />
      </div>
    </React.Fragment>
  )
}

export default Avatar
