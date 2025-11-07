import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import BasicSlider from '@src/views/UiAdvanced/uiAdvancedSwiper/basicSlider'
import GrabCursorSlider from '@src/views/UiAdvanced/uiAdvancedSwiper/grabcursor'
import PaginationSwiper from '@src/views/UiAdvanced/uiAdvancedSwiper/pagination'
import PaginationDynamicSlider from '@src/views/UiAdvanced/uiAdvancedSwiper/paginationDynamic'
import SlidesPreview from '@src/views/UiAdvanced/uiAdvancedSwiper/slidesperview'
import VerticalSlider from '@src/views/UiAdvanced/uiAdvancedSwiper/verticalSwiper'

const Swiper: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Swiper" subTitle="UI Advanced" />
      <div className="grid grid-cols-12 gap-x-space">
        <BasicSlider />
        <PaginationDynamicSlider />
        <PaginationSwiper />
        <VerticalSlider />
        <GrabCursorSlider />
        <SlidesPreview />
      </div>
    </React.Fragment>
  )
}

export default Swiper
