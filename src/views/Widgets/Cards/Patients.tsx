'use client'

import React from 'react'

import Image from 'next/image'
import Link from 'next/link'

import { patients } from '@src/data/index'
import { Phone } from 'lucide-react'
import SimpleBar from 'simplebar-react'

const PatientsList = () => {
  const getLucideIcon = (icon: string, className: string) => {
    const icons: { [key: string]: React.ReactElement } = {
      phone: <Phone className={className} />,
    }
    return icons[icon]
  }

  return (
    <React.Fragment>
      <div className="col-span-12 row-span-2 md:col-span-6 xl:col-span-4 card">
        <div className="flex items-center card-header">
          <h6 className="card-title grow">Today Patients</h6>
          <div className="shrink-0">
            <div className="inline-flex gap-3 text-sm">
              <Link
                href="#!"
                className="relative inline-block text-gray-500 dark:text-dark-500 transition duration-200 ease-linear grow hover:text-purple-500 dark:hover:text-purple-500 after:size-1 after:absolute after:transition-all after:duration-200 after:opacity-0 after:-bottom-3 hover:after:-bottom-1.5 hover:after:opacity-100 after:mx-auto after:rounded-full after:inset-x-0 after:bg-purple-500 [&.active]:after:-bottom-1.5 [&.active]:after:opacity-100 [&.active]:text-purple-500 active">
                Day
              </Link>
              <Link
                href="#!"
                className="relative inline-block text-gray-500 dark:text-dark-500 transition duration-200 ease-linear grow hover:text-purple-500 dark:hover:text-purple-500 after:size-1 after:absolute after:transition-all after:duration-200 after:opacity-0 after:-bottom-3 hover:after:-bottom-1.5 hover:after:opacity-100 after:mx-auto after:rounded-full after:inset-x-0 after:bg-purple-500 [&.active]:after:-bottom-1.5 [&.active]:after:opacity-100 [&.active]:text-purple-500">
                Week
              </Link>
            </div>
          </div>
        </div>
        <SimpleBar className="h-36 card-body">
          <div className="flex flex-col gap-3">
            {patients.map((patient, index) => (
              <div key={index} className="flex items-center gap-3">
                <Image
                  src={patient.image}
                  alt={patient.alt}
                  className="rounded-md size-10 shrink-0"
                />
                <div className="grow">
                  <h6>{patient.name}</h6>
                  <p className="text-sm text-gray-500 dark:text-dark-500">
                    {patient.appointment}
                  </p>
                </div>
                <button className={patient.button.className}>
                  {patient.button.icon &&
                    getLucideIcon(patient.button.icon, patient.button.iconSize)}
                </button>
              </div>
            ))}
          </div>
        </SimpleBar>
      </div>
    </React.Fragment>
  )
}

export default PatientsList
