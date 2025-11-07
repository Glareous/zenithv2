import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import BookAppointment from '@src/views/Widgets/Banners/BookAppointment'
import CustomerSupport from '@src/views/Widgets/Banners/CustomerSupport'
import SimpleInformation from '@src/views/Widgets/Banners/SimpleInformation'

const WidgetsBanners: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Banners" subTitle="Widgets" />
      <div className="grid grid-cols-12 gap-x-space">
        <CustomerSupport />
        <SimpleInformation />
        <BookAppointment />
      </div>
    </React.Fragment>
  )
}

export default WidgetsBanners
