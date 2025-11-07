'use client'

import React, { useState } from 'react'

import Image from 'next/image'
// Import StaticImageData type

import Link from 'next/link'

import { AppointmentItem, appointmentData } from '@src/dtos/dashboards/hospital'

const AppointmentRequest: React.FC = () => {
  const [appointmentItems, setAppointmentItems] =
    useState<AppointmentItem[]>(appointmentData)
  const setStatus = (index: number, status: 'accepted' | 'rejected') => {
    setAppointmentItems((prevItems) =>
      prevItems.map((item, i) => (i === index ? { ...item, status } : item))
    )
  }

  return (
    <div className="col-span-12 md:col-span-6 xl:col-span-4 xl:row-span-2 card">
      <div className="flex items-center gap-3 card-header">
        <h6 className="card-title grow">Appointment Requests</h6>
        <Link href="#!" className="link link-primary shrink-0">
          Create
          <i className="ri-arrow-right-line ltr:inline-block rtl:hidden"></i>
          <i className="ri-arrow-right-line ltr:hidden rtl:inline-block"></i>
        </Link>
      </div>
      <div className="card-body">
        {appointmentItems.map((item, index) => (
          <div className="flex items-center gap-3 mb-3 last:mb-0" key={index}>
            <Image
              src={item.image.src} // Use .src for StaticImageData
              alt={item.name}
              className="rounded-full size-10 shrink-0"
              width={40}
              height={40}
            />
            <div className="grow">
              <h6 className="mb-1">{item.name}</h6>
              <p className="text-xs text-gray-500 dark:text-dark-500">
                <i className="align-baseline ri-calendar-line"></i>{' '}
                <span>{item.time}</span>
              </p>
            </div>
            {item.status === 'pending' && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setStatus(index, 'accepted')}
                  className="btn btn-icon btn-sub-green !size-8">
                  <i className="ri-check-line"></i>
                </button>
                <button
                  onClick={() => setStatus(index, 'rejected')}
                  className="btn btn-icon btn-sub-red !size-8">
                  <i className="ri-close-line"></i>
                </button>
              </div>
            )}
            {item.status === 'accepted' && (
              <div className="flex items-center gap-2 shrink-0">
                <span className="badge badge-green">Accepted</span>
              </div>
            )}
            {item.status === 'rejected' && (
              <div className="flex items-center gap-2 shrink-0">
                <span className="badge badge-red">Rejected</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default AppointmentRequest
