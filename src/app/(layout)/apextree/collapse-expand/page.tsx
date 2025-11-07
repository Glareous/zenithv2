import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import LeftAndRightCharts from '@src/views/ApexTree/LeftAndRight/LeftAndRightCharts'

const ApexTreeCollapseExpandChart: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Collapse Expand" subTitle="Apextree" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Collapse Expand</h6>
          </div>
          <div className="card-body">
            <LeftAndRightCharts
              chartColors="[bg-gray-200, bg-gray-500, bg-white, bg-primary-100, bg-purple-100, bg-yellow-100, bg-dark-100, bg-orange-100, bg-green-100, bg-pink-100, bg-indigo-100]"
              chartDarkColors="[bg-dark-800, bg-dark-500, bg-white, bg-primary-500, bg-purple-500, bg-yellow-500, bg-dark-850, bg-orange-500, bg-green-500, bg-pink-500, bg-indigo-500]"
              direction="left"
              collapse={true}
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default ApexTreeCollapseExpandChart
