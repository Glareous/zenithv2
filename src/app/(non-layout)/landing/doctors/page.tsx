import React from 'react'

import { NextPageWithLayout } from '@src/dtos'
import AvailableFacilities from '@src/views/landing/landingDoctors/availableFacilities'
import Footer from '@src/views/landing/landingDoctors/footer'
import GetYourAppointment from '@src/views/landing/landingDoctors/getYourAppointment'
import Header from '@src/views/landing/landingDoctors/header'
import HealthService from '@src/views/landing/landingDoctors/healthService'
import HeroBanner from '@src/views/landing/landingDoctors/heroBanner'
import OurClients from '@src/views/landing/landingDoctors/ourClients'
import OurDoctorsTeam from '@src/views/landing/landingDoctors/ourDoctorsTeam'
import OurExpertDoctors from '@src/views/landing/landingDoctors/ourExpertDoctors'

const Doctors: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <Header />
      <HeroBanner />
      <AvailableFacilities />
      <OurDoctorsTeam />
      <HealthService />
      <OurExpertDoctors />
      <OurClients />
      <GetYourAppointment />
      <Footer />
    </React.Fragment>
  )
}

export default Doctors
