import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import BasicBoxChart from '@src/views/Apexcharts/boxWhisker/basicBoxChart'
import BoxPlotScatterChart from '@src/views/Apexcharts/boxWhisker/boxPlotScatterChart'
import HorizontalBoxPlot from '@src/views/Apexcharts/boxWhisker/horizontalBoxPlot'

const BoxWhisker: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Box-whisker Charts" subTitle="Apexcharts" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Basic</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <BasicBoxChart chartId="boxWhiskerBasicChart" />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Boxplot-Scatter</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <BoxPlotScatterChart chartId="boxplotScatterChart" />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Horizontal BoxPlot</h6>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <HorizontalBoxPlot chartId="boxplotHorizontalChart" />
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default BoxWhisker
