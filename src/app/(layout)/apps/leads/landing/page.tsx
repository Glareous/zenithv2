import React from 'react'

import { NextPageWithLayout } from '@src/dtos'
import AvailableFacilities from '@src/views/landing/landingLeads/availableFacilities'
import Footer from '@src/views/landing/landingLeads/footer'
import HealthService from '@src/views/landing/landingLeads/healthService'
import HeroBanner from '@src/views/landing/landingLeads/heroBanner'
import OurDoctorsTeam from '@src/views/landing/landingLeads/ourDoctorsTeam'


const LEADSLanding: NextPageWithLayout = () => {
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

export default LEADSLanding
