import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import CallReceiver from '@src/views/Apps/chat/video/CallReciver'
import GroupVideoChat from '@src/views/Apps/chat/video/GroupChat'
import GroupVideoCall from '@src/views/Apps/chat/video/GroupVideoCall'
import KeyMoments from '@src/views/Apps/chat/video/KeyMoments'

const Video: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Group Video" subTitle="Charts" />
      <GroupVideoCall />
      <div className="grid grid-cols-12 gap-x-space">
        <CallReceiver />
        <div className="col-span-12 lg:col-span-6 xl:col-span-4">
          <KeyMoments />
          <GroupVideoChat />
        </div>
      </div>
    </React.Fragment>
  )
}

export default Video
