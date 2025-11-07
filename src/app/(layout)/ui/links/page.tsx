import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import BasicLinks from '@src/views/UiElements/Ui-Links/BasicLinks'
import ColoredLinks from '@src/views/UiElements/Ui-Links/ColoredLinks'
import HoverLinks from '@src/views/UiElements/Ui-Links/HoverLinks'
import IconLiks from '@src/views/UiElements/Ui-Links/IconLinks'
import UnderlineColored from '@src/views/UiElements/Ui-Links/UnderlineColored'
import UnderlineHover from '@src/views/UiElements/Ui-Links/UnderlineHover'
import UnderlineHoverColored from '@src/views/UiElements/Ui-Links/UnderlineHoverColored'
import UnderlineLinks from '@src/views/UiElements/Ui-Links/UnderlineLinks'

const Links: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="UI Links" subTitle="UI" />
      <div className="grid grid-cols-12 gap-x-space">
        <BasicLinks />
        <UnderlineLinks />
        <UnderlineHover />
        <HoverLinks />
        <ColoredLinks />
        <UnderlineColored />
        <UnderlineHoverColored />
        <IconLiks />
      </div>
    </React.Fragment>
  )
}

export default Links
