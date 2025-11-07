import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import ColorIcons from '@src/views/Icons/iconsRemix/colorIconss'
import RemixIcons from '@src/views/Icons/iconsRemix/remixIcons'
import SizesIcons from '@src/views/Icons/iconsRemix/sizesIcons'
import SVGCode from '@src/views/Icons/iconsRemix/svgCode'

const Remix: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Remix" subTitle="Icons" />
      <div className="grid grid-cols-12 gap-x-space">
        <RemixIcons />
        <ColorIcons />
        <SVGCode />
        <SizesIcons />
      </div>
    </React.Fragment>
  )
}

export default Remix
