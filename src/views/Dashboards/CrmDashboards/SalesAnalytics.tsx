'use client'

import React from 'react'

import { NextPageWithLayout } from '@src/dtos'

import { EmailCampaignChart } from './CrmChart'

const SalesAnalytics: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <div className="col-span-12">
        <div className="mb-space" dir="ltr">
          <div>
            <h6 className="mb-1">Sales Analytics</h6>
            <p className="text-gray-500 dark:text-dark-500">
              Unlocking Insights and Driving Growth Through Data-Driven Sales
              Strategies
            </p>
          </div>
          <div className="mt-5 lg:-mt-8">
            <EmailCampaignChart
              chartColors="[bg-primary-500, bg-pink-300, bg-sky-300, bg-slate-600]"
              chartId="salesAnalyticsChart"
              chartDarkColors={''}
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}
export default SalesAnalytics
