import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import BoxIcons from '@src/views/Icons/iconsBoxicon/boxIcons'
import ColorIcons from '@src/views/Icons/iconsBoxicon/colorIcons'
import SizesIcons from '@src/views/Icons/iconsBoxicon/sizesIcons'
import SVGCode from '@src/views/Icons/iconsBoxicon/svgCode'

const BoxIcon: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="BoxIcon" subTitle="Icons" />
      <div className="grid grid-cols-12 gap-x-space">
        <BoxIcons />
        <ColorIcons />
        <SVGCode />
        <SizesIcons />
      </div>
    </React.Fragment>
  )
}

export default BoxIcon
