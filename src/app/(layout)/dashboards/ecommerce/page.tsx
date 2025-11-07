'use client'

import BreadCrumb from '@src/components/common/BreadCrumb'
import EcommerceInfo from '@src/views/Dashboards/EcommerceDashboard/EcomInfo'
import MarkersMap from '@src/views/Dashboards/EcommerceDashboard/Location'
import Message from '@src/views/Dashboards/EcommerceDashboard/Message'
import ProductStock from '@src/views/Dashboards/EcommerceDashboard/ProductStock'
import TopCountries from '@src/views/Dashboards/EcommerceDashboard/TopCountries'
import TopSellingProducts from '@src/views/Dashboards/EcommerceDashboard/TopSellingProducts'
import Traffic from '@src/views/Dashboards/EcommerceDashboard/Traffic'
import Welcome from '@src/views/Dashboards/EcommerceDashboard/Welcome'

const DashboardsPage = () => {
  return (
    <>
      <BreadCrumb title={'Ecommerce'} subTitle={'Dashboards'} />
      <div className="grid grid-cols-12 gap-x-space">
        <Welcome />
        <EcommerceInfo />
        <ProductStock />
        <MarkersMap />
        <TopSellingProducts />
        <TopCountries />
        <Traffic />
        <Message />
      </div>
    </>
  )
}

export default DashboardsPage
