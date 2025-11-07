'use client'

import React, { useEffect, useMemo, useState } from 'react'

import { EventClickArg, EventDropArg } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin, {
  Draggable,
  DropArg,
} from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import BreadCrumb from '@src/components/common/BreadCrumb'
import DeleteModal from '@src/components/common/DeleteModal'
import { LAYOUT_DIRECTION } from '@src/components/constants/layout'
import { NextPageWithLayout } from '@src/dtos'
import { CalendarEvent, DateClickArg, EventItem } from '@src/dtos/apps/calendar'
import { AppDispatch, RootState } from '@src/slices/reducer'
import {
  addCalendarData,
  deleteCalendarData,
  editCalendarData,
  getCalendarData,
} from '@src/slices/thunk'
import { CirclePlus } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify'

import AddEditCalendar from './AddEditCalendar'

const CalendarDefault: NextPageWithLayout = () => {
  const dispatch: AppDispatch = useDispatch()
  const { layoutMode, layoutDirection } = useSelector(
    (state: RootState) => state.Layout
  )
  const { calendar } = useSelector((state: RootState) => state.Calendar)
  const [calendarList, setCalendarList] = useState<EventItem[]>([])
  const [open, setOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentCalendar, setCurrentCalendar] = useState<EventItem | null>(null)
  const [calendarRef, setCalendarRef] = useState<null | FullCalendar>(null)

  const updatedCalendarEvents = useMemo(() => {
    if (!calendar) return []

    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    return calendar.map((event: CalendarEvent) => {
      const startDate = new Date(event.start).getDate() + 1
      const endDate =
        new Date(event.end ? event.end : event.start).getDate() + 1

      const newStartDate = new Date(currentYear, currentMonth, startDate)
      const newEndDate = new Date(currentYear, currentMonth, endDate)

      return {
        ...event,
        start: newStartDate,
        end: newEndDate,
        extendedProps: event.extendedProps || {}, // Ensure extendedProps is always an object
      }
    })
  }, [calendar])

  useEffect(() => {
    if (!calendar) {
      dispatch(getCalendarData())
    } else {
      setCalendarList(updatedCalendarEvents)
    }
  }, [calendar, updatedCalendarEvents, dispatch])

  const handleOpenModal = (
    editMode: boolean = false,
    calendar: EventItem | null = null
  ) => {
    setEditMode(editMode)
    setCurrentCalendar(calendar)
    setOpen(true)
    setIsEditButton(true)
  }

  const handleCloseModal = () => {
    setOpen(false)
    setEditMode(false)
    setCurrentCalendar(null)
  }

  const [selectedNewDay, setSelectedNewDay] = useState<[Date, Date] | null>(
    null
  )
  const [deleteModal, setDeleteModal] = useState<boolean>(false)
  const [deleteEvent, setDeleteEvent] = useState<CalendarEvent | undefined>()
  const [, setIsEditButton] = useState<boolean>(true)

  const handleEventClick = (arg: EventClickArg) => {
    const event = arg.event

    const startDate = event.start ? new Date(event.start) : new Date()
    const endDate = event.end ? new Date(event.end) : startDate

    const color = (event.classNames ?? [])
      .map((className: string) => {
        const match = className.match(/bg-(\w+)-500/)
        return match ? match[1] : null
      })
      .find((color: string | null) => color !== null)

    const updatedCalendarEvent = {
      id: Number(event.id),
      title: event.title,
      start: startDate.toISOString().slice(0, 16),
      end: endDate.toISOString().slice(0, 16),
      eventTime: startDate.toTimeString().slice(0, 5),
      classNames: [
        `bg-${color}-500`,
        `border-${color}-500`,
        `text-${color}-50`,
        `hover:bg-${color}-500`,
      ],
      extendedProps: {
        guests: event.extendedProps?.guests || [],
        location: event.extendedProps?.location || '',
      },
    }

    setCurrentCalendar(updatedCalendarEvent)
    setEditMode(true)
    setDeleteEvent({
      id: event.id,
      title: event.title,
      start: event.start?.toISOString() || '',
      end: event.end?.toISOString() || '',
      eventTime: event.start?.toTimeString().slice(0, 5) || '',
      classNames: event.classNames,
      extendedProps: {
        guests: event.extendedProps?.guests || [],
        location: event.extendedProps?.location || '',
      },
    })
    setIsEditButton(false)

    handleOpenModal(true, updatedCalendarEvent)
  }

  const handleDeleteEvent = async () => {
    if (deleteEvent) {
      try {
        // Dispatch the delete action
        await dispatch(deleteCalendarData([Number(deleteEvent.id)]))
        // Filter out the deleted event from the local list
        setCalendarList((prevList) =>
          prevList.filter((event) => event.id !== Number(deleteEvent.id))
        )

        // Close the delete modal
        setDeleteModal(false)

        // Refresh the calendar view
        if (calendarRef) {
          calendarRef.getApi().refetchEvents()
        }
      } catch (error) {
        console.error('Failed to delete event:', error)
      }
    } else {
      console.warn('No event selected for deletion.')
    }
  }

  const handleEventDrop = (dropInfo: EventDropArg) => {
    const { event } = dropInfo

    const updatedEvent: EventItem = {
      id: Number(event.id),
      title: event.title,
      start: event.start ? event.start.toISOString().slice(0, 16) : '',
      end: event.end
        ? event.end.toISOString().slice(0, 16)
        : event.start
          ? event.start.toISOString().slice(0, 16)
          : '',
      eventTime: event.start ? event.start.toTimeString().slice(0, 5) : '',
      classNames: event.classNames || [],
      extendedProps: {
        guests: event.extendedProps?.guests || [],
        location: event.extendedProps?.location || '',
      },
    }

    // Redux state update
    dispatch(editCalendarData(updatedEvent))

    // Update local state
    setCalendarList((prevList) =>
      prevList.map((item) =>
        item.id === updatedEvent.id ? updatedEvent : item
      )
    )

    // Ensure FullCalendar re-renders correctly
    setTimeout(() => {
      if (calendarRef) {
        calendarRef.getApi().refetchEvents()
      }
    }, 100)
  }

  // Handling date click on calendar
  const handleDateClick = (arg: DateClickArg) => {
    if (arg) {
      setSelectedNewDay([arg.date, arg.date])
    }
    handleOpenModal()
  }

  const renderEventContent = (info: { event: CalendarEvent }) => {
    const containerEl = document.createElement('div')
    containerEl.style.padding = '5px'
    const titleEl = document.createElement('div')
    titleEl.classList.add('fc-event-title', 'grow')
    titleEl.innerText = info.event.title
    containerEl.appendChild(titleEl)
    if (info.event.extendedProps?.guests) {
      const guestsEl = document.createElement('div')
      guestsEl.classList.add('fc-event-guests', '-space-x-3', 'flex')
      info.event.extendedProps.guests.forEach((guest: string) => {
        const imgEl = document.createElement('img')
        imgEl.src = guest
        imgEl.alt = guest
        imgEl.style.width = '20px'
        imgEl.style.height = '20px'
        imgEl.style.borderRadius = '50%'
        imgEl.style.marginRight = '5px'
        guestsEl.appendChild(imgEl)
      })
      containerEl.appendChild(guestsEl)
    }
    containerEl.classList.add('flex', 'cursor-pointer')
    return { domNodes: [containerEl] }
  }

  const onDrag = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  useEffect(() => {
    const externalEvents = document.getElementById('external-events')
    if (externalEvents) {
      new Draggable(externalEvents, {
        itemSelector: '.fc-event',
        eventData: function (eventEl) {
          return {
            title: eventEl.innerText.trim(),
            className: eventEl.classList.value,
          }
        },
      })
    }
  }, [])

  const onDrop = (info: DropArg) => {
    // Check if dragged element has not been marked as added
    if (info.draggedEl && !info.draggedEl.classList.contains('event-added')) {
      // Mark the element as added
      info.draggedEl.classList.add('event-added')
      // Prepare the event data
      const modifiedData = {
        id: Math.floor(Math.random() * 1000),
        title: info.draggedEl.innerText,
        start: info.date.toISOString().slice(0, 16),
        end: info.date.toISOString().slice(0, 16), // Use 'info.date' as 'end' is not available on DropArg
        eventTime: new Date(info.date).toTimeString().slice(0, 5),
        className: info.draggedEl.className,
        extendedProps: {
          guests: [],
          location: 'surat',
        },
      }

      // Dispatch the event to add it to the calendar
      dispatch(addCalendarData(modifiedData))

      // Update local calendar list immediately
      setCalendarList((prevList) => [...prevList, modifiedData])

      // Refresh the calendar view
      if (calendarRef) {
        calendarRef.getApi().refetchEvents()
      }
    }
  }

  const handleAddEvent = (newEvent: EventItem) => {
    // Update the local calendar list immediately
    setCalendarList((prevList) => [...prevList, newEvent])
    // Refresh the calendar view
    if (calendarRef) {
      calendarRef.getApi().refetchEvents()
    }
  }

  const handleEditEvent = (updatedEvent: EventItem) => {
    setCalendarList((prevList) =>
      prevList.map((event) =>
        event.id === updatedEvent.id ? updatedEvent : event
      )
    )

    if (calendarRef) {
      calendarRef.getApi().refetchEvents()
    }
  }

  return (
    <React.Fragment>
      <BreadCrumb title="Default" subTitle="Calendar" />
      <div>
        <div
          className="flex flex-wrap items-center gap-2 mb-space"
          id="external-events">
          <div id="external-events" className="flex items-center gap-2 grow">
            <div
              className="block fc-event fc-h-event fc-daygrid-event fc-daygrid-block-event btn !btn-purple"
              draggable="true"
              onDrag={(event) => {
                onDrag(event)
              }}>
              <div className="fc-event-main">Events</div>
            </div>
            <div
              className="block fc-event fc-h-event fc-daygrid-event fc-daygrid-block-event btn !btn-primary"
              draggable="true"
              onDrag={(event) => {
                onDrag(event)
              }}>
              <div className="fc-event-main">Personal</div>
            </div>
            <div
              className="block fc-event fc-h-event fc-daygrid-event fc-daygrid-block-event btn !btn-green"
              draggable="true"
              onDrag={(event) => {
                onDrag(event)
              }}>
              <div className="fc-event-main">Meeting</div>
            </div>
            <div
              className="block fc-event fc-h-event fc-daygrid-event fc-daygrid-block-event btn !btn-sky"
              draggable="true"
              onDrag={(event) => {
                onDrag(event)
              }}>
              <div className="fc-event-main">Festival Function</div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            id="newEvent"
            onClick={() => handleDateClick({ date: new Date() })}>
            <CirclePlus className="inline-block size-4 ltr:mr-1 rtl:ml-1" /> Add
            Event
          </button>
          <button
            className="hidden"
            id="editEvent"
            data-modal-target="addEventModal"></button>
        </div>

        <div className="card">
          <div className="card-body">
            <div id="calendar">
              {calendarList && (
                <>
                  <FullCalendar
                    ref={(ref) => setCalendarRef(ref)}
                    timeZone="America/New_York"
                    plugins={[interactionPlugin, dayGridPlugin, timeGridPlugin]}
                    initialView="dayGridMonth"
                    handleWindowResize={true}
                    headerToolbar={{
                      left: 'title',
                      right: 'today prev,next',
                    }}
                    events={calendarList.map((event) => ({
                      ...event,
                      id: (event.id as number).toString(), // Convert id to string
                      extendedProps: event.extendedProps || {},
                    }))}
                    editable={true}
                    droppable={true}
                    selectable={true}
                    eventContent={renderEventContent}
                    dateClick={handleDateClick}
                    eventClick={handleEventClick}
                    drop={onDrop}
                    eventDrop={handleEventDrop}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add, Edit and Delete Modal */}
      <AddEditCalendar
        open={open}
        handleClose={handleCloseModal}
        calendarList={calendarList}
        editMode={editMode}
        currentCalendar={currentCalendar}
        onClickDelete={() => {
          setOpen(false)
          setDeleteModal(true)
        }}
        selectedNewDay={selectedNewDay}
        onAddEvent={handleAddEvent}
        onEditEvent={handleEditEvent}
      />
      <ToastContainer
        theme={layoutMode}
        rtl={layoutDirection === LAYOUT_DIRECTION.RTL}
        position={
          layoutDirection === LAYOUT_DIRECTION.RTL ? 'top-left' : 'top-right'
        }
      />
      <DeleteModal
        title="Are you sure you want to delete this Event?"
        show={deleteModal}
        handleHide={() => setDeleteModal(!deleteModal)}
        deleteModalFunction={handleDeleteEvent}
      />
    </React.Fragment>
  )
}

export default CalendarDefault
