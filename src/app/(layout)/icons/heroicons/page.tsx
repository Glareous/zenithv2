import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import HeroiconsIcons from '@src/views/Icons/iconsHeroicons/heroiconsIcons'
import OutlineSolidIcons from '@src/views/Icons/iconsHeroicons/outline&SolidIcons'
import SizesIcons from '@src/views/Icons/iconsHeroicons/sizesIcons'

const HeroIocns: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Heroicons" subTitle="Icons" />
      <HeroiconsIcons />
      <OutlineSolidIcons />
      <SizesIcons />
    </React.Fragment>
  )
}

export default HeroIocns
