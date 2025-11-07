import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import ColorIcons from '@src/views/Icons/iconLucide/colorIcons'
import DuotuneIcons from '@src/views/Icons/iconLucide/duotuneIcons'
import LucideIcons from '@src/views/Icons/iconLucide/lucideIcons'
import SizesIcons from '@src/views/Icons/iconLucide/sizesIcons'
import StrokeWidth from '@src/views/Icons/iconLucide/strokeWidth'

const Lucide: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Lucide" subTitle="Icons" />
      <div className="grid grid-cols-12 gap-x-space">
        <LucideIcons />
        <ColorIcons />
        <StrokeWidth />
        <SizesIcons />
        <DuotuneIcons />
      </div>
    </React.Fragment>
  )
}

export default Lucide
