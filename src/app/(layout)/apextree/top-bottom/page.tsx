import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import Layout from '@src/layout/Layout'
import TopBottomChart from '@src/views/ApexTree/TopBottom/TopBottomChart'

const ApexTreeTopBottomChart: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Top to Bottom" subTitle="Apextree" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Top to Bottom</h6>
          </div>
          <div className="card-body">
            <TopBottomChart
              chartColors="[bg-gray-200, bg-white, bg-primary-500, bg-purple-500, bg-yellow-500, bg-gray-800, bg-orange-500, bg-green-500, bg-pink-500]"
              chartDarkColors="[bg-dark-800, bg-white, bg-primary-500, bg-purple-500, bg-yellow-500, bg-dark-800, bg-orange-500, bg-green-500, bg-pink-500]"
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

ApexTreeTopBottomChart.getLayout = (
  page: React.ReactElement
): React.ReactElement => {
  return <Layout breadcrumbTitle="Top to Bottom">{page}</Layout>
}

export default ApexTreeTopBottomChart
