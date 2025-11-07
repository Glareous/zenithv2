import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import BasicSankeyChart from '@src/views/ApexSankey/BasicSankeyChart'
import EdgeCustomizationChart from '@src/views/ApexSankey/EdgeCustomizationChart'
import FontOptionsChart from '@src/views/ApexSankey/FontOptionsChart'
import NodeCustomizationChart from '@src/views/ApexSankey/NodeCustomizationChart'

const ApexSankeyChart: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="ApexSankey" subTitle="Charts" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Basic</h6>
          </div>
          <div className="card-body">
            <BasicSankeyChart
              chartColors="bg-gray-800, bg-white, bg-gray-200"
              chartDarkColors="bg-dark-100, bg-dark-900, bg-dark-800"
            />
          </div>
        </div>
        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Node Customization</h6>
          </div>
          <div className="card-body">
            <NodeCustomizationChart
              chartColors="bg-gray-800, bg-white, bg-gray-200"
              chartDarkColors="bg-dark-100, bg-dark-900, bg-dark-800"
            />
          </div>
        </div>
        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Edge Customization</h6>
          </div>
          <div className="card-body">
            <EdgeCustomizationChart
              chartColors="bg-gray-800, bg-white, bg-gray-200"
              chartDarkColors="bg-dark-100, bg-dark-900, bg-dark-800"
            />
          </div>
        </div>
        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Font Options</h6>
          </div>
          <div className="card-body">
            <FontOptionsChart
              chartColors="bg-gray-800, bg-white, bg-gray-200"
              chartDarkColors="bg-dark-100, bg-dark-900, bg-dark-800"
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default ApexSankeyChart
