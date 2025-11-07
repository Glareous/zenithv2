import React from 'react'

import LandingThemeMode from '@src/components/common/LandingThemeMode'
import { NextPageWithLayout } from '@src/dtos'
import Footer from '@src/views/landing/landingInvoice/footer'
import Freelancers from '@src/views/landing/landingInvoice/freelancers'
import GetInTouch from '@src/views/landing/landingInvoice/getInTouch'
import Header from '@src/views/landing/landingInvoice/header'
import OnlineInvoicing from '@src/views/landing/landingInvoice/onlineInvoicing'
import ReadyToGetStarted from '@src/views/landing/landingInvoice/readyToGetStarted'
import ReadyToGive from '@src/views/landing/landingInvoice/readyToGive'
import YourInvoicing from '@src/views/landing/landingInvoice/yourInvoicing'

const Invoice: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <Header />
      <YourInvoicing />
      <Freelancers />
      <OnlineInvoicing />
      <ReadyToGive />
      <ReadyToGetStarted />
      <GetInTouch />
      <Footer />
      <LandingThemeMode bgColor="bg-primary-500" />
    </React.Fragment>
  )
}

export default Invoice
