import React from 'react'

import { NextPageWithLayout } from '@src/dtos'
import AvailableFacilities from '@src/views/landing/landingPQR/availableFacilities'
import Footer from '@src/views/landing/landingPQR/footer'
import HealthService from '@src/views/landing/landingPQR/healthService'
import HeroBanner from '@src/views/landing/landingPQR/heroBanner'
import OurDoctorsTeam from '@src/views/landing/landingPQR/ourDoctorsTeam'


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
