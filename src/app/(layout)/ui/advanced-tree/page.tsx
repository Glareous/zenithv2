import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import AdvanceTree from '@src/views/UiAdvanced/uIAdvancedTree/advanceTree'

const Tree: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Tree" subTitle="UI Advanced" />
      <AdvanceTree />
    </React.Fragment>
  )
}

export default Tree
