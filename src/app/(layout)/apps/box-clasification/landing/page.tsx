import React from 'react'

import { NextPageWithLayout } from '@src/dtos'
import AvailableFacilities from '@src/views/landing/landingBox/availableFacilities'
import Footer from '@src/views/landing/landingBox/footer'
import HealthService from '@src/views/landing/landingBox/healthService'
import HeroBanner from '@src/views/landing/landingBox/heroBanner'
import OurDoctorsTeam from '@src/views/landing/landingBox/ourDoctorsTeam'


const BOXLanding: NextPageWithLayout = () => {
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

export default BOXLanding
