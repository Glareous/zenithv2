import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import RevenueCharts from '@src/views/Widgets/Charts/RevenueCharts'
import TotalSales from '@src/views/Widgets/Charts/TotalSales'
import TotalViewPerformance from '@src/views/Widgets/Charts/TotalViewPerformance'

const WidgetsCharts: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Charts" subTitle="Widgets" />
      <div className="grid grid-cols-12 gap-x-space">
        <RevenueCharts />
        <TotalSales />
        <TotalViewPerformance />
      </div>
    </React.Fragment>
  )
}

export default WidgetsCharts
