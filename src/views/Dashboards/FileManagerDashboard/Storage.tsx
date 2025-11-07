'use client'

import React from 'react'

import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
} from '@src/components/custom/dropdown/dropdown'
import { NextPageWithLayout } from '@src/dtos'
import { Ellipsis } from 'lucide-react'

import { OverviewStorageApp } from './FileManagerChart'

const Storage: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <div className="col-span-12 md:col-span-6 2xl:col-span-3 card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h6 className="card-title">Overview Storage</h6>
            <Dropdown
              position="right"
              trigger="click"
              dropdownClassName="dropdown">
              <DropdownButton colorClass="flex items-center text-gray-500 dark:text-dark-500">
                <Ellipsis className="size-5" />
              </DropdownButton>
              <DropdownMenu>
                <a href="#!" className="dropdown-item">
                  <span>Weekly</span>
                </a>
                <a href="#!" className="dropdown-item">
                  <span>Monthly</span>
                </a>
                <a href="#!" className="dropdown-item">
                  <span>Yearly</span>
                </a>
              </DropdownMenu>
            </Dropdown>
          </div>{' '}
        </div>
        <div className="card-body">
          <OverviewStorageApp
            chartColors="[bg-primary-400, bg-green-400, bg-yellow-400, bg-purple-400, bg-red-400]"
            chartDarkColors={''}
            chartId="overviewStorageChart"
          />
          <div className="mt-5">
            <div className="flex items-center gap-3 mb-2">
              <h6 className="text-xs grow">Use Storage</h6>
              <h6 className="text-xs font-semibold text-red-500">74%</h6>
            </div>
            <div className="progress-bar progress-2">
              <div className="w-[74%] text-white progress-bar-wrap bg-primary-500"></div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}
export default Storage
