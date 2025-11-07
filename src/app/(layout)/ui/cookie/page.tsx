import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import CookieCard from '@src/views/UiElements/Ui-Cookie/CookieCard'
import CookieConsent from '@src/views/UiElements/Ui-Cookie/CookieConsent'
import CookieHorizontal from '@src/views/UiElements/Ui-Cookie/CookieHorizontal'
import CookiePolicy from '@src/views/UiElements/Ui-Cookie/CookiePolicy'

const Cookies: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Cookie Consent" subTitle="UI" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Cookie Card</h6>
          </div>
          <CookieCard />
        </div>

        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Cookie Horizontal Card</h6>
          </div>
          <CookieHorizontal />
        </div>
        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Cookie Consent Banner</h6>
          </div>
          <CookieConsent />
        </div>

        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Cookie Policy</h6>
          </div>
          <CookiePolicy />
        </div>
      </div>
    </React.Fragment>
  )
}

export default Cookies
