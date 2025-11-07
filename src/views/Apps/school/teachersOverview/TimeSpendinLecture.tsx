'use client'

import React from 'react'

import Link from 'next/link'

import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
} from '@src/components/custom/dropdown/dropdown'
import { Ellipsis } from 'lucide-react'

import TimeSpendLectureApp from './TimeSpendChart'

const TimeSpendingLecture = () => {
  return (
    <React.Fragment>
      <div className="col-span-12 md:col-span-6 xl:col-span-4 2xl:col-span-6 card">
        <div className="flex items-center gap-5 card-header">
          <h6 className="card-title grow">Time Spend in Lecture</h6>
          <Dropdown trigger="click" dropdownClassName="dropdown">
            <DropdownButton colorClass="flex items-center text-gray-500 dark:text-dark-500">
              <Ellipsis className="size-5" />
            </DropdownButton>
            <DropdownMenu>
              <Link href="/apps/event/overview" className="dropdown-item">
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
        <div className="card-body">
          <div dir="ltr">
            <TimeSpendLectureApp
              chartColors="[bg-primary-400]"
              chartDarkColors={''}
              chartId="timeSpendLectureChart"
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default TimeSpendingLecture
