import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'

const Starter: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Starter" subTitle="UI" />
    </React.Fragment>
  )
}

export default Starter
