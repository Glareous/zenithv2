import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import WordCounter from '@src/views/UiAdvanced/uiAdvancedWordCounter/wordCounter'

const WordCounters: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Word Counter" subTitle="UI Advanced" />
      <WordCounter />
    </React.Fragment>
  )
}

export default WordCounters
