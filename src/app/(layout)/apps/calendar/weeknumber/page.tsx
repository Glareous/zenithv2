'use client'

import React from 'react'

import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/react'
import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'

const CalendarWeekNumber: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Week Number" subTitle="Calendar" />
      <div className="card">
        <div className="card-body">
          <div id="weekNumberCalendar">
            <FullCalendar
              plugins={[interactionPlugin, dayGridPlugin]}
              initialView="dayGridMonth"
              timeZone="America/New_York"
              weekNumbers={true}
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default CalendarWeekNumber
