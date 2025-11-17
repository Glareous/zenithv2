import React from 'react'

import { NextPageWithLayout } from '@src/dtos'
import AvailableFacilities from '@src/views/landing/landingNIMFRAUD/availableFacilities'
import Footer from '@src/views/landing/landingNIMFRAUD/footer'
import HealthService from '@src/views/landing/landingNIMFRAUD/healthService'
import HeroBanner from '@src/views/landing/landingNIMFRAUD/heroBanner'
import OurDoctorsTeam from '@src/views/landing/landingNIMFRAUD/ourDoctorsTeam'


const NIMFRAUDLanding: NextPageWithLayout = () => {
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

export default NIMFRAUDLanding