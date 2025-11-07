import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import BaseBadge from '@src/views/UiElements/Ui-Badge/BaseBadge'
import ButtonBadge from '@src/views/UiElements/Ui-Badge/ButtonBadge'
import CloseBadge from '@src/views/UiElements/Ui-Badge/CloseBadge'
import InsideButtonBadge from '@src/views/UiElements/Ui-Badge/InsideButtonBadge'
import OutlineBadge from '@src/views/UiElements/Ui-Badge/OutlineBadge'
import RoundedBadge from '@src/views/UiElements/Ui-Badge/RoundedBadge'
import SoftBadges from '@src/views/UiElements/Ui-Badge/SoftBadge'
import SolidBadges from '@src/views/UiElements/Ui-Badge/SolidBadge'
import SquareBadge from '@src/views/UiElements/Ui-Badge/SquareBadge'

const Badge: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Badge" subTitle="UI" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Base Badge</h6>
          </div>
          <div className="card-body">
            <BaseBadge />
          </div>
        </div>

        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Outline Badge</h6>
          </div>
          <div className="card-body">
            <OutlineBadge />
          </div>
        </div>

        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Soft Badge</h6>
          </div>
          <div className="card-body">
            <SoftBadges />
          </div>
        </div>

        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Solid Badge</h6>
          </div>
          <div className="card-body">
            <SolidBadges />
          </div>
        </div>

        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Close Badge</h6>
          </div>
          <div className="card-body">
            <CloseBadge />
          </div>
        </div>

        <div className="col-span-12 lg:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Square Badge</h6>
          </div>
          <div className="card-body">
            <SquareBadge />
          </div>
        </div>

        <div className="col-span-12 lg:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Rounded Badge</h6>
          </div>
          <div className="card-body">
            <RoundedBadge />
          </div>
        </div>

        <div className="col-span-12 lg:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Button Badge</h6>
          </div>
          <div className="card-body">
            <ButtonBadge />
          </div>
        </div>

        <div className="col-span-12 lg:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Inside Button Badge</h6>
          </div>
          <div className="card-body">
            <InsideButtonBadge />
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default Badge
