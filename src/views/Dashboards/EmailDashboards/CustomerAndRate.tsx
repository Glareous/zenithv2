'use client'

import React from 'react'

import Link from 'next/link'

import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
} from '@src/components/custom/dropdown/dropdown'
import { NextPageWithLayout } from '@src/dtos'
import { Ellipsis } from 'lucide-react'

const CustomerAndRate: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <div className="col-span-12 md:col-span-6 xl:col-span-2 card">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <p className="text-gray-500 dark:text-dark-500">Total Customers</p>
            <Dropdown
              position="right"
              trigger="click"
              dropdownClassName="dropdown">
              <DropdownButton colorClass="flex items-center text-gray-500 dark:text-dark-500">
                <Ellipsis className="size-5" />
              </DropdownButton>
              <DropdownMenu>
                <Link href="#!" className="dropdown-item">
                  <span>Weekly</span>
                </Link>
                <Link href="#!" className="dropdown-item">
                  <span>Monthly</span>
                </Link>
                <Link href="#!" className="dropdown-item">
                  <span>Yearly</span>
                </Link>
              </DropdownMenu>
            </Dropdown>
          </div>
          <h5 className="mt-6 mb-1">1,32,603</h5>
          <p className="text-gray-500 dark:text-dark-500">
            <span className="text-green-500">0.5%</span> From last week
          </p>
        </div>
      </div>
      <div className="col-span-12 md:col-span-6 xl:col-span-2 card">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <p className="text-gray-500 dark:text-dark-500">Bounce Rate</p>
            <Dropdown
              position="right"
              trigger="click"
              dropdownClassName="dropdown">
              <DropdownButton colorClass="flex items-center text-gray-500 dark:text-dark-500">
                <Ellipsis className="size-5" />
              </DropdownButton>
              <DropdownMenu>
                <Link href="#!" className="dropdown-item">
                  <span>Weekly</span>
                </Link>
                <Link href="#!" className="dropdown-item">
                  <span>Monthly</span>
                </Link>
                <Link href="#!" className="dropdown-item">
                  <span>Yearly</span>
                </Link>
              </DropdownMenu>
            </Dropdown>
          </div>
          <h5 className="mt-6 mb-1">48,314</h5>
          <p className="text-gray-500 dark:text-dark-500">
            <span className="text-green-500">1.8%</span> From last week
          </p>
        </div>
      </div>
    </React.Fragment>
  )
}
export default CustomerAndRate
