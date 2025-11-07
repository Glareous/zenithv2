import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import RecentInvoice from '@src/views/Widgets/data/recentInvoice'
import TopProducts from '@src/views/Widgets/data/topProducts'

const WidgetsData: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Data" subTitle="Widgets" />
      <div className="grid grid-cols-12 gap-x-space">
        <TopProducts />
        <RecentInvoice />
      </div>
    </React.Fragment>
  )
}

export default WidgetsData
