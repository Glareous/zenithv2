'use client'

import React from 'react'

import multiMonthPlugin from '@fullcalendar/multimonth'
import FullCalendar from '@fullcalendar/react'
import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'

const CalendarMultiMonthgrid: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Multi-Month grid" subTitle="Calendar" />
      <div className="card">
        <div className="card-body">
          <div id="multiMonthGridCalendar">
            <FullCalendar
              plugins={[multiMonthPlugin]}
              themeSystem="sketchy"
              initialView="multiMonthYear"
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default CalendarMultiMonthgrid
