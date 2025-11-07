'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import Link from 'next/link'

import BreadCrumb from '@src/components/common/BreadCrumb'
import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
} from '@src/components/custom/dropdown/dropdown'
import { doctorSchedule } from '@src/data'
import { NextPageWithLayout } from '@src/dtos'
import SimpleBar from 'simplebar-react'
import 'simplebar/dist/simplebar.min.css'

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const DatePicker: NextPageWithLayout = () => {
  const today = useMemo(() => new Date(), [])
  const appointmentsRef = useRef(doctorSchedule)
  const [appointments, setAppointments] = useState(appointmentsRef.current)
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth())
  const [selectedYear] = useState(today.getFullYear())
  const [dates, setDates] = useState<
    { day: number; name: string; isToday: boolean; formattedDate: string }[]
  >([])
  const [filteredAppointments, setFilteredAppointments] = useState<
    {
      date: string
      name: string
      specialty: string
      notes: string
      time: string
      color: string
    }[]
  >([])
  const [selectedDate, setSelectedDate] = useState<{
    day: number
    name: string
    isToday: boolean
    formattedDate: string
  } | null>(null)

  const formatDate = (date: Date) => {
    return `${monthNames[date.getMonth()]}, ${date.getFullYear()}`
  }

  const generateDates = useCallback(() => {
    const date = new Date(selectedYear, selectedMonth, 1)
    const newDates = []

    while (date.getMonth() === selectedMonth) {
      newDates.push({
        day: date.getDate(),
        name: dayNames[date.getDay()],
        isToday:
          date.getDate() === today.getDate() &&
          selectedMonth === today.getMonth() &&
          selectedYear === today.getFullYear(),
        formattedDate: formatDate(date),
      })
      date.setDate(date.getDate() + 1)
    }

    setDates(newDates)
  }, [selectedYear, selectedMonth, today])

  const filterAppointments = useCallback(
    (appointmentsList = appointmentsRef.current) => {
      const filtered = appointmentsList.filter((appointment) => {
        const appointmentDate = new Date(appointment.date)
        return appointmentDate.getMonth() === selectedMonth
      })
      setFilteredAppointments(filtered)
    },
    [selectedMonth]
  )

  const updateAppointmentsToCurrentMonth = useCallback(() => {
    const currentMonth = new Date().getMonth()
    const updatedAppointments = appointmentsRef.current.map((appointment) => {
      const appointmentDate = new Date(appointment.date)
      appointmentDate.setMonth(currentMonth)
      return {
        ...appointment,
        date: appointmentDate.toISOString(),
      }
    })

    setAppointments(updatedAppointments)
    filterAppointments(updatedAppointments)
  }, [filterAppointments])

  useEffect(() => {
    updateAppointmentsToCurrentMonth()
    generateDates()
  }, [
    selectedMonth,
    selectedYear,
    updateAppointmentsToCurrentMonth,
    generateDates,
  ])

  const selectMonth = (index: number) => {
    setSelectedMonth(index)
  }

  const selectDate = (date: {
    day: number
    name: string
    isToday: boolean
    formattedDate: string
  }) => {
    const selectedDate = new Date(selectedYear, selectedMonth, date.day)
    const filtered = appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.date)
      return appointmentDate.toDateString() === selectedDate.toDateString()
    })
    setFilteredAppointments(filtered)
    setSelectedDate(date)
  }

  return (
    <div>
      <BreadCrumb title="Doctor Schedule" subTitle="Hospital" />
      <Dropdown trigger="click" dropdownClassName="dropdown">
        <DropdownButton colorClass="flex items-center gap-2 btn-primary btn">
          <span>
            {monthNames[selectedMonth]} {selectedYear}
          </span>
        </DropdownButton>
        <DropdownMenu>
          {monthNames.map((month, index) => (
            <Link
              href="#"
              key={index}
              onClick={(e) => {
                e.preventDefault()
                selectMonth(index)
              }}
              className="dropdown-item">
              {month}
            </Link>
          ))}
        </DropdownMenu>
      </Dropdown>

      {/* Dates Section */}
      <SimpleBar className="mt-5">
        <div className="flex gap-5">
          {dates.map((date, index) => (
            <Link
              key={index}
              href="#!"
              className={`flex items-center justify-center text-center border border-gray-200 rounded-md dark:border-dark-800 size-16 shrink-0 ${
                date.isToday ? 'active-date' : ''
              } ${
                selectedDate &&
                selectedDate.day === date.day &&
                selectedDate.name === date.name
                  ? 'bg-blue-500 text-white'
                  : ''
              }`}
              onClick={() => selectDate(date)}>
              <div>
                <h5>{date.day}</h5>
                <p>{date.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </SimpleBar>

      {filteredAppointments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-space mt-space">
          {filteredAppointments.map((appointment, index) => (
            <div
              key={index}
              className={`relative card before:absolute ltr:before:-left-0.5 rtl:before:-right-0.5 before:rounded-full before:top-5 before:h-12 before:w-[2px] before:bg-${appointment.color}`}>
              <div className="card-body">
                <div className="flex items-center gap-2 mb-5">
                  <h3 className="flex items-center justify-center border border-gray-200 rounded-md dark:border-dark-800 size-12">
                    {new Date(appointment.date).getDate()}
                  </h3>
                  <div>
                    <h6 className="mb-0.5">
                      {formatDate(new Date(appointment.date))}
                    </h6>
                  </div>
                </div>
                <h6>{appointment.name}</h6>
                <p className="mb-2 text-gray-500 dark:text-dark-500">
                  {appointment.specialty}
                </p>
                <small className="text-gray-500 dark:text-dark-500">
                  Notes:
                </small>
                <p className="mb-2">{appointment.notes}</p>

                <div className="flex items-center gap-1 font-semibold">
                  <i className="text-lg font-normal text-gray-500 dark:text-dark-500 ri-time-line"></i>
                  <span>{appointment.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DatePicker
