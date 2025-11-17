import React from 'react'

import { NextPageWithLayout } from '@src/dtos'
import AvailableFacilities from '@src/views/landing/landingForecasting/availableFacilities'
import Footer from '@src/views/landing/landingForecasting/footer'
import HealthService from '@src/views/landing/landingForecasting/healthService'
import HeroBanner from '@src/views/landing/landingForecasting/heroBanner'
import OurDoctorsTeam from '@src/views/landing/landingForecasting/ourDoctorsTeam'

const FORECASTINGLanding: NextPageWithLayout = () => {
  return (
    <>
      <main className="pt-0">

        <HeroBanner />
        <AvailableFacilities />
        <OurDoctorsTeam />
        <HealthService />
        <Footer />
      </main>
    </>
  )
}

export default FORECASTINGLanding
