import React from 'react'

import LandingThemeMode from '@src/components/common/LandingThemeMode'
import { NextPageWithLayout } from '@src/dtos'
import EmailAutomation from '@src/views/landing/landingEmail/emailAtomation'
import EmailFeatures from '@src/views/landing/landingEmail/emailFeatures'
import EmailMarketing from '@src/views/landing/landingEmail/emailMarketing'
import FAQSection from '@src/views/landing/landingEmail/faqSection'
import Footer from '@src/views/landing/landingEmail/footer'
import Header from '@src/views/landing/landingEmail/header'
import NewUpdates from '@src/views/landing/landingEmail/newUpdates'
import OurBestPlans from '@src/views/landing/landingEmail/ourBestPlans'
import ServicesSection from '@src/views/landing/landingEmail/ourServices'

const Email: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <Header />
      <EmailMarketing />
      <ServicesSection />
      <OurBestPlans />
      <EmailFeatures />
      <EmailAutomation />
      <FAQSection />
      <NewUpdates />
      <Footer />
      <LandingThemeMode bgColor="bg-primary-500" />
    </React.Fragment>
  )
}

export default Email
