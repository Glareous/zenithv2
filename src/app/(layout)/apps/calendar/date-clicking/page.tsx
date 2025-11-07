'use client'

import React from 'react'

import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'

const CalendarDateClicking: NextPageWithLayout = () => {
  // Handle date click event
  const handleDateClick = (info: { dateStr: string }) => {
    alert('clicked ' + info.dateStr)
  }
  // Handle select event (when date range is selected)
  const handleSelect = (info: { startStr: string; endStr: string }) => {
    alert('selected ' + info.startStr + ' to ' + info.endStr)
  }

  return (
    <React.Fragment>
      <BreadCrumb title="Date Clicking & Selecting" subTitle="Calendar" />
      <div className="card">
        <div className="card-body">
          <div id="dateClickingSelectingCalendar">
            <FullCalendar
              plugins={[interactionPlugin, dayGridPlugin, timeGridPlugin]}
              selectable={true}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay',
              }}
              dateClick={handleDateClick}
              select={handleSelect}
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default CalendarDateClicking
