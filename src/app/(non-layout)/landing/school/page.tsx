import React from 'react'

import LandingThemeMode from '@src/components/common/LandingThemeMode'
import { NextPageWithLayout } from '@src/dtos'
import CTA from '@src/views/landing/landingSchool/CTA'
import AboutUs from '@src/views/landing/landingSchool/aboutUs'
import Footer from '@src/views/landing/landingSchool/footer'
import Header from '@src/views/landing/landingSchool/header'
import HeroBanner from '@src/views/landing/landingSchool/heroBanner'
import HowToStart from '@src/views/landing/landingSchool/howToStart'
import InformationAlert from '@src/views/landing/landingSchool/informationAlert'
import LatestBlogs from '@src/views/landing/landingSchool/latestBlogs'
import OurMentors from '@src/views/landing/landingSchool/ourMentors'
import StudentsReview from '@src/views/landing/landingSchool/studentsReview'
import TopEducation from '@src/views/landing/landingSchool/topEducation'

const School: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <InformationAlert />
      <Header />
      <HeroBanner />
      <TopEducation />
      <AboutUs />
      <HowToStart />
      <StudentsReview />
      <OurMentors />
      <LatestBlogs />
      <CTA />
      <Footer />
      <LandingThemeMode bgColor="bg-orange-500" />
    </React.Fragment>
  )
}

export default School
