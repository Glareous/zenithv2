import React from 'react'

import FourZeroFour from '@src/components/common/FourZeroFour'
import { NextPageWithLayout } from '@src/dtos'

const PageNotFoundError: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <FourZeroFour />
    </React.Fragment>
  )
}

export default PageNotFoundError
