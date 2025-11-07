'use client'

import React from 'react'

import FullCalendar from '@fullcalendar/react'
import resourceTimelinePlugin from '@fullcalendar/resource-timeline'
import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'

const CalendarTimeline: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Timeline" subTitle="Calendar" />
      <div className="card">
        <div className="card-body">
          <div id="timelineCalendar">
            <FullCalendar
              plugins={[resourceTimelinePlugin]}
              timeZone="UTC"
              initialView="resourceTimelineDay"
              scrollTime="08:00"
              aspectRatio={1.5}
              editable={true}
              headerToolbar={{
                left: 'today prev,next',
                center: 'title',
                right:
                  'resourceTimelineDay,resourceTimelineTenDay,resourceTimelineMonth,resourceTimelineYear',
              }}
              views={{
                resourceTimelineDay: {
                  buttonText: ':15 slots',
                  slotDuration: '00:15',
                },
                resourceTimelineTenDay: {
                  type: 'resourceTimeline',
                  duration: { days: 10 },
                  buttonText: '10 days',
                },
              }}
              resourceAreaHeaderContent={() => 'Rooms'}
              resources="/apidata/calendar/event.json"
              events="https://fullcalendar.io/api/demo-feeds/events.json?single-day&for-resource-timeline"
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default CalendarTimeline
