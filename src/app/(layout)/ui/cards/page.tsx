import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import Card from '@src/views/UiElements/Ui-Card/Card'
import CardFooter from '@src/views/UiElements/Ui-Card/CardFooter'
import CardHeader from '@src/views/UiElements/Ui-Card/CardHeader'
import ColoredCard from '@src/views/UiElements/Ui-Card/ColoredCard'
import DesignCard from '@src/views/UiElements/Ui-Card/DesignCard'
import EditCards from '@src/views/UiElements/Ui-Card/EditCards'
import FancyCard from '@src/views/UiElements/Ui-Card/FancyCard'
import HoverCard from '@src/views/UiElements/Ui-Card/HoverCard'
import OverlayCard from '@src/views/UiElements/Ui-Card/OverlayCard'

const Cards: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Cards" subTitle="UI" />
      <div className="grid grid-cols-12 gap-x-space">
        <Card />
        <CardHeader />
        <CardFooter />
      </div>
      <div className="grid grid-cols-12 gap-x-space">
        <DesignCard />
      </div>

      <h5 className="mt-2 mb-5 underline">Card Hover Effect:</h5>

      <div className="grid grid-cols-12 gap-x-space">
        <HoverCard />
      </div>

      <h5 className="mt-2 mb-5 underline">Card Colored:</h5>
      <div className="grid grid-cols-12 gap-x-space">
        <ColoredCard />
      </div>
      <h5 className="mt-2 mb-5 underline">Fancy Card:</h5>
      <div className="grid grid-cols-12 gap-x-space">
        <FancyCard />
      </div>

      <h5 className="mt-2 mb-5 underline">Overlay Card:</h5>
      <div className="grid grid-cols-12 gap-x-space">
        <OverlayCard />
      </div>

      <EditCards />
    </React.Fragment>
  )
}

export default Cards
