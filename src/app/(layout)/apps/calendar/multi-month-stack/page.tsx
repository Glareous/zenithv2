'use client'

import React from 'react'

import multiMonthPlugin from '@fullcalendar/multimonth'
import FullCalendar from '@fullcalendar/react'
import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'

const CalendarMultiMonthstack: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Multi-Month Stack" subTitle="Calendar" />
      <div className="card">
        <div className="card-body">
          <div id="multiMonthStackCalendar">
            <FullCalendar
              plugins={[multiMonthPlugin]}
              initialView="multiMonthYear"
              views={{
                multiMonthYear: {
                  type: 'multiMonthYear',
                  multiMonthMaxColumns: 1, // Move inside the views object
                },
              }}
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default CalendarMultiMonthstack
