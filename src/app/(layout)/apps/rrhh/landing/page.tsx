import React from 'react'

import { NextPageWithLayout } from '@src/dtos'
import AvailableFacilities from '@src/views/landing/landingRRHH/availableFacilities'
import Footer from '@src/views/landing/landingRRHH/footer'
import HealthService from '@src/views/landing/landingRRHH/healthService'
import HeroBanner from '@src/views/landing/landingRRHH/heroBanner'
import OurDoctorsTeam from '@src/views/landing/landingRRHH/ourDoctorsTeam'


const RRHHLanding: NextPageWithLayout = () => {
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

export default RRHHLanding
