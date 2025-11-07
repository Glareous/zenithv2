import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import VideoGallery from '@src/views/UiElements/Ui-Video/VideoGallery'

const Videos: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Video" subTitle="UI" />
      <div className="grid grid-cols-12 gap-x-space">
        <VideoGallery />
      </div>
    </React.Fragment>
  )
}

export default Videos
