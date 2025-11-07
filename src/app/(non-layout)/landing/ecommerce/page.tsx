import React from 'react'

import LandingThemeMode from '@src/components/common/LandingThemeMode'
import { NextPageWithLayout } from '@src/dtos'
import Advertisement from '@src/views/landing/landingEcommerce/advertisement'
import ClientBenefits from '@src/views/landing/landingEcommerce/clientBenefits'
import CoastalEdition from '@src/views/landing/landingEcommerce/coastalEdition'
import Footer from '@src/views/landing/landingEcommerce/footer'
import Header from '@src/views/landing/landingEcommerce/header'
import Home from '@src/views/landing/landingEcommerce/home'
import InstagramPost from '@src/views/landing/landingEcommerce/instagramPost'
import NewSeasonProducts from '@src/views/landing/landingEcommerce/newSeasonProducts'
import OurCollection from '@src/views/landing/landingEcommerce/ourCollection'
import Products from '@src/views/landing/landingEcommerce/products'
import SummerFashion from '@src/views/landing/landingEcommerce/summerFashion'

const Ecommerce: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <Header />
      <Home />
      <Products />
      <Advertisement />
      <NewSeasonProducts />
      <SummerFashion />
      <CoastalEdition />
      <ClientBenefits />
      <OurCollection />
      <InstagramPost />
      <Footer />
      <LandingThemeMode bgColor="bg-primary-500" />
    </React.Fragment>
  )
}

export default Ecommerce
