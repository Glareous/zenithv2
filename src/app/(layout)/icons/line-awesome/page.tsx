import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import AwesomeIcons from '@src/views/Icons/iconsLineAwesome/awesomeIcons'
import ColorIcons from '@src/views/Icons/iconsLineAwesome/colorIcons'
import SizesIcons from '@src/views/Icons/iconsLineAwesome/sizesIcons'

const LineAwesome: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Line Awesome" subTitle="Icons" />
      <div className="grid grid-cols-12 gap-x-space">
        <AwesomeIcons />
        <ColorIcons />
        <SizesIcons />
      </div>
    </React.Fragment>
  )
}

export default LineAwesome
