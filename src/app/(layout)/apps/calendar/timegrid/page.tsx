'use client'

import React from 'react'

import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'

const CalendarTimeGrid: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Time Grid View" subTitle="Calendar" />
      <div className="card">
        <div className="card-body">
          <div id="listViewCalendar">
            <FullCalendar
              plugins={[timeGridPlugin]}
              initialView="timeGridWeek"
              timeZone="America/New_York"
              headerToolbar={{
                left: 'prev,next',
                center: 'title',
                right: 'timeGridWeek,timeGridDay',
              }}
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default CalendarTimeGrid
