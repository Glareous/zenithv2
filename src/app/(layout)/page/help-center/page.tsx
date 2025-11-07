import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import HelpCenterPage from '@src/views/Pages/HelpCenter/Index'

const HelpCenter: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Help Center" subTitle="Pages" />
      <HelpCenterPage />
    </React.Fragment>
  )
}

export default HelpCenter
