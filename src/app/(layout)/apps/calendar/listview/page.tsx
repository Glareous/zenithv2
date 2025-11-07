'use client'

import React from 'react'

import listPlugin from '@fullcalendar/list'
import FullCalendar from '@fullcalendar/react'
import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'

const CalendarListView: NextPageWithLayout = () => {
  const events = [
    { title: 'Meeting', start: new Date() },
    { title: 'Update Weekly', start: new Date() },
  ]

  return (
    <React.Fragment>
      <BreadCrumb title="List View" subTitle="Calendar" />
      <div className="card">
        <div className="card-body">
          <div id="listViewCalendar">
            <FullCalendar
              plugins={[listPlugin]}
              initialView="listWeek"
              editable={true}
              events={events}
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default CalendarListView
