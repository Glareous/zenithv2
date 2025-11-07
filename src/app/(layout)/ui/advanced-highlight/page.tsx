'use client'

import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import HighlightCode from '@src/views/UiAdvanced/uIAdvancedHighlightCode/highlightCode'

const Highlight: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Highlight Code" subTitle="UI Advanced" />
      <HighlightCode />
    </React.Fragment>
  )
}

export default Highlight
