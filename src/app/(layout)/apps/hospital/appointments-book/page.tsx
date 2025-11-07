'use client'

import React, { useState } from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import { useForm } from 'react-hook-form'
import Select, { SingleValue } from 'react-select'

interface OptionType {
  label: string
  value: string
}

const doctors: OptionType[] = [
  { label: 'Dr. Michael Johnson', value: 'Dr. Michael Johnson' },
  { label: 'Dr. Sarah Evans', value: 'Dr. Sarah Evans' },
  { label: 'Dr. Emily Carter', value: 'Dr. Emily Carter' },
  { label: 'Dr. Robert Harris', value: 'Dr. Robert Harris' },
]

const AppointmentsBook: NextPageWithLayout = () => {
  const [categoryList, setCategoryList] =
    useState<SingleValue<OptionType> | null>(null)

  const { setValue } = useForm()

  const handleEventTypeChange = (selected: SingleValue<OptionType>) => {
    setCategoryList(selected)
    setValue('doctor', selected ? selected.value : '')
  }

  return (
    <React.Fragment>
      <BreadCrumb title="Book" subTitle="Appointments" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 xl:col-span-8 2xl:col-span-9 card">
          <div className="card-header">
            <h6 className="card-title">Appointment Book</h6>
          </div>
          <div className="card-body">
            <form action="#!">
              <div className="grid grid-cols-12 gap-space">
                <div className="col-span-12">
                  <label htmlFor="patientNameInput" className="form-label">
                    Patient Name
                  </label>
                  <input
                    type="text"
                    id="patientNameInput"
                    className="form-input"
                    placeholder="Enter your patient name"
                  />
                </div>
                <div className="col-span-12 sm:col-span-6 xl:col-span-4">
                  <label htmlFor="emailInput" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    id="emailInput"
                    className="form-input"
                    placeholder="Enter your email"
                  />
                </div>
                <div className="col-span-12 sm:col-span-6 xl:col-span-4">
                  <label htmlFor="phoneNumberInput" className="form-label">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phoneNumberInput"
                    className="form-input"
                    placeholder="(00) 000 00 0000"
                  />
                </div>
                <div className="col-span-12 sm:col-span-6 xl:col-span-4">
                  <label htmlFor="selectDateInput" className="form-label">
                    Select Date
                  </label>
                  <input
                    type="text"
                    id="selectDateInput"
                    className="form-input"
                    placeholder="Select date"
                    data-provider="flatpickr"
                    data-date-format="d M, Y"
                  />
                </div>
                <div className="col-span-12">
                  <label className="form-label">Start Time</label>
                  <div className="flex flex-wrap gap-2 md:gap-5">
                    <div className="input-radio-group">
                      <input
                        id="timeRadio1"
                        className="hidden input-radio peer"
                        name="startTime"
                        type="radio"
                      />
                      <label
                        htmlFor="timeRadio1"
                        className="px-3 py-1.5 border border-gray-200 rounded-md inline-block input-radio-label dark:border-dark-800 peer-checked:border-primary-500 dark:peer-checked:border-primary-500 peer-disabled:bg-gray-100 dark:peer-disabled:bg-dark-850 peer-disabled:text-gray-500 dark:peer-disabled:text-dark-500">
                        09:00 AM
                      </label>
                    </div>
                    <div className="input-radio-group">
                      <input
                        id="timeRadio2"
                        className="hidden input-radio peer"
                        name="startTime"
                        type="radio"
                      />
                      <label
                        htmlFor="timeRadio2"
                        className="px-3 py-1.5 border border-gray-200 rounded-md inline-block input-radio-label dark:border-dark-800 peer-checked:border-primary-500 dark:peer-checked:border-primary-500 peer-disabled:bg-gray-100 dark:peer-disabled:bg-dark-850 peer-disabled:text-gray-500 dark:peer-disabled:text-dark-500">
                        09:30 AM
                      </label>
                    </div>
                    <div className="input-radio-group">
                      <input
                        id="timeRadio3"
                        className="hidden input-radio peer"
                        name="startTime"
                        type="radio"
                        disabled
                      />
                      <label
                        htmlFor="timeRadio3"
                        className="px-3 py-1.5 border border-gray-200 rounded-md inline-block input-radio-label dark:border-dark-800 peer-checked:border-primary-500 dark:peer-checked:border-primary-500 peer-disabled:bg-gray-100 dark:peer-disabled:bg-dark-850 peer-disabled:text-gray-500 dark:peer-disabled:text-dark-500">
                        10:00 AM
                      </label>
                    </div>
                    <div className="input-radio-group">
                      <input
                        id="timeRadio4"
                        className="hidden input-radio peer"
                        name="startTime"
                        type="radio"
                      />
                      <label
                        htmlFor="timeRadio4"
                        className="px-3 py-1.5 border border-gray-200 rounded-md inline-block input-radio-label dark:border-dark-800 peer-checked:border-primary-500 dark:peer-checked:border-primary-500 peer-disabled:bg-gray-100 dark:peer-disabled:bg-dark-850 peer-disabled:text-gray-500 dark:peer-disabled:text-dark-500">
                        10:30 AM
                      </label>
                    </div>
                    <div className="input-radio-group">
                      <input
                        id="timeRadio5"
                        className="hidden input-radio peer"
                        name="startTime"
                        type="radio"
                      />
                      <label
                        htmlFor="timeRadio5"
                        className="px-3 py-1.5 border border-gray-200 rounded-md inline-block input-radio-label dark:border-dark-800 peer-checked:border-primary-500 dark:peer-checked:border-primary-500 peer-disabled:bg-gray-100 dark:peer-disabled:bg-dark-850 peer-disabled:text-gray-500 dark:peer-disabled:text-dark-500">
                        11:00 AM
                      </label>
                    </div>
                    <div className="input-radio-group">
                      <input
                        id="timeRadio6"
                        className="hidden input-radio peer"
                        name="startTime"
                        type="radio"
                      />
                      <label
                        htmlFor="timeRadio6"
                        className="px-3 py-1.5 border border-gray-200 rounded-md inline-block input-radio-label dark:border-dark-800 peer-checked:border-primary-500 dark:peer-checked:border-primary-500 peer-disabled:bg-gray-100 dark:peer-disabled:bg-dark-850 peer-disabled:text-gray-500 dark:peer-disabled:text-dark-500">
                        11:30 AM
                      </label>
                    </div>
                    <div className="input-radio-group">
                      <input
                        id="timeRadio7"
                        className="hidden input-radio peer"
                        name="startTime"
                        type="radio"
                      />
                      <label
                        htmlFor="timeRadio7"
                        className="px-3 py-1.5 border border-gray-200 rounded-md inline-block input-radio-label dark:border-dark-800 peer-checked:border-primary-500 dark:peer-checked:border-primary-500 peer-disabled:bg-gray-100 dark:peer-disabled:bg-dark-850 peer-disabled:text-gray-500 dark:peer-disabled:text-dark-500">
                        12:00 PM
                      </label>
                    </div>
                    <div className="input-radio-group">
                      <input
                        id="timeRadio8"
                        className="hidden input-radio peer"
                        name="startTime"
                        type="radio"
                      />
                      <label
                        htmlFor="timeRadio8"
                        className="px-3 py-1.5 border border-gray-200 rounded-md inline-block input-radio-label dark:border-dark-800 peer-checked:border-primary-500 dark:peer-checked:border-primary-500 peer-disabled:bg-gray-100 dark:peer-disabled:bg-dark-850 peer-disabled:text-gray-500 dark:peer-disabled:text-dark-500">
                        12:30 PM
                      </label>
                    </div>
                    <div className="input-radio-group">
                      <input
                        id="timeRadio9"
                        className="hidden input-radio peer"
                        name="startTime"
                        type="radio"
                      />
                      <label
                        htmlFor="timeRadio9"
                        className="px-3 py-1.5 border border-gray-200 rounded-md inline-block input-radio-label dark:border-dark-800 peer-checked:border-primary-500 dark:peer-checked:border-primary-500 peer-disabled:bg-gray-100 dark:peer-disabled:bg-dark-850 peer-disabled:text-gray-500 dark:peer-disabled:text-dark-500">
                        01:00 PM
                      </label>
                    </div>
                    <div className="input-radio-group">
                      <input
                        id="timeRadio10"
                        className="hidden input-radio peer"
                        name="startTime"
                        type="radio"
                      />
                      <label
                        htmlFor="timeRadio10"
                        className="px-3 py-1.5 border border-gray-200 rounded-md inline-block input-radio-label dark:border-dark-800 peer-checked:border-primary-500 dark:peer-checked:border-primary-500 peer-disabled:bg-gray-100 dark:peer-disabled:bg-dark-850 peer-disabled:text-gray-500 dark:peer-disabled:text-dark-500">
                        01:30 PM
                      </label>
                    </div>
                    <div className="input-radio-group">
                      <input
                        id="timeRadio11"
                        className="hidden input-radio peer"
                        name="startTime"
                        type="radio"
                      />
                      <label
                        htmlFor="timeRadio11"
                        className="px-3 py-1.5 border border-gray-200 rounded-md inline-block input-radio-label dark:border-dark-800 peer-checked:border-primary-500 dark:peer-checked:border-primary-500 peer-disabled:bg-gray-100 dark:peer-disabled:bg-dark-850 peer-disabled:text-gray-500 dark:peer-disabled:text-dark-500">
                        02:00 PM
                      </label>
                    </div>
                    <div className="input-radio-group">
                      <input
                        id="timeRadio12"
                        className="hidden input-radio peer"
                        name="startTime"
                        type="radio"
                      />
                      <label
                        htmlFor="timeRadio12"
                        className="px-3 py-1.5 border border-gray-200 rounded-md inline-block input-radio-label dark:border-dark-800 peer-checked:border-primary-500 dark:peer-checked:border-primary-500 peer-disabled:bg-gray-100 dark:peer-disabled:bg-dark-850 peer-disabled:text-gray-500 dark:peer-disabled:text-dark-500">
                        02:30 PM
                      </label>
                    </div>
                    <div className="input-radio-group">
                      <input
                        id="timeRadio13"
                        className="hidden input-radio peer"
                        name="startTime"
                        type="radio"
                        disabled
                      />
                      <label
                        htmlFor="timeRadio13"
                        className="px-3 py-1.5 border border-gray-200 rounded-md inline-block input-radio-label dark:border-dark-800 peer-checked:border-primary-500 dark:peer-checked:border-primary-500 peer-disabled:bg-gray-100 dark:peer-disabled:bg-dark-850 peer-disabled:text-gray-500 dark:peer-disabled:text-dark-500">
                        03:00 PM
                      </label>
                    </div>
                    <div className="input-radio-group">
                      <input
                        id="timeRadio14"
                        className="hidden input-radio peer"
                        name="startTime"
                        type="radio"
                      />
                      <label
                        htmlFor="timeRadio14"
                        className="px-3 py-1.5 border border-gray-200 rounded-md inline-block input-radio-label dark:border-dark-800 peer-checked:border-primary-500 dark:peer-checked:border-primary-500 peer-disabled:bg-gray-100 dark:peer-disabled:bg-dark-850 peer-disabled:text-gray-500 dark:peer-disabled:text-dark-500">
                        03:30 PM
                      </label>
                    </div>
                    <div className="input-radio-group">
                      <input
                        id="timeRadio15"
                        className="hidden input-radio peer"
                        name="startTime"
                        type="radio"
                      />
                      <label
                        htmlFor="timeRadio15"
                        className="px-3 py-1.5 border border-gray-200 rounded-md inline-block input-radio-label dark:border-dark-800 peer-checked:border-primary-500 dark:peer-checked:border-primary-500 peer-disabled:bg-gray-100 dark:peer-disabled:bg-dark-850 peer-disabled:text-gray-500 dark:peer-disabled:text-dark-500">
                        04:00 PM
                      </label>
                    </div>
                    <div className="input-radio-group">
                      <input
                        id="timeRadio16"
                        className="hidden input-radio peer"
                        name="startTime"
                        type="radio"
                      />
                      <label
                        htmlFor="timeRadio16"
                        className="px-3 py-1.5 border border-gray-200 rounded-md inline-block input-radio-label dark:border-dark-800 peer-checked:border-primary-500 dark:peer-checked:border-primary-500 peer-disabled:bg-gray-100 dark:peer-disabled:bg-dark-850 peer-disabled:text-gray-500 dark:peer-disabled:text-dark-500">
                        04:30 PM
                      </label>
                    </div>
                    <div className="input-radio-group">
                      <input
                        id="timeRadio17"
                        className="hidden input-radio peer"
                        name="startTime"
                        type="radio"
                      />
                      <label
                        htmlFor="timeRadio17"
                        className="px-3 py-1.5 border border-gray-200 rounded-md inline-block input-radio-label dark:border-dark-800 peer-checked:border-primary-500 dark:peer-checked:border-primary-500 peer-disabled:bg-gray-100 dark:peer-disabled:bg-dark-850 peer-disabled:text-gray-500 dark:peer-disabled:text-dark-500">
                        05:00 PM
                      </label>
                    </div>
                    <div className="input-radio-group">
                      <input
                        id="timeRadio18"
                        className="hidden input-radio peer"
                        name="startTime"
                        type="radio"
                      />
                      <label
                        htmlFor="timeRadio18"
                        className="px-3 py-1.5 border border-gray-200 rounded-md inline-block input-radio-label dark:border-dark-800 peer-checked:border-primary-500 dark:peer-checked:border-primary-500 peer-disabled:bg-gray-100 dark:peer-disabled:bg-dark-850 peer-disabled:text-gray-500 dark:peer-disabled:text-dark-500">
                        05:30 PM
                      </label>
                    </div>
                    <div className="input-radio-group">
                      <input
                        id="timeRadio19"
                        className="hidden input-radio peer"
                        name="startTime"
                        type="radio"
                      />
                      <label
                        htmlFor="timeRadio19"
                        className="px-3 py-1.5 border border-gray-200 rounded-md inline-block input-radio-label dark:border-dark-800 peer-checked:border-primary-500 dark:peer-checked:border-primary-500 peer-disabled:bg-gray-100 dark:peer-disabled:bg-dark-850 peer-disabled:text-gray-500 dark:peer-disabled:text-dark-500">
                        06:00 PM
                      </label>
                    </div>
                  </div>
                </div>
                <div className="col-span-12">
                  <label className="form-label">End Time</label>
                  <div className="flex flex-wrap gap-2 md:gap-5">
                    <div className="input-radio-group">
                      <input
                        id="dateRadio1"
                        className="hidden input-radio peer"
                        name="endTime"
                        type="radio"
                      />
                      <label
                        htmlFor="dateRadio1"
                        className="px-3 py-1.5 border border-gray-200 rounded-md inline-block input-radio-label dark:border-dark-800 peer-checked:border-primary-500 dark:peer-checked:border-primary-500 peer-disabled:bg-gray-100 dark:peer-disabled:bg-dark-850 peer-disabled:text-gray-500 dark:peer-disabled:text-dark-500">
                        09:00 AM
                      </label>
                    </div>
                    <div className="input-radio-group">
                      <input
                        id="dateRadio2"
                        className="hidden input-radio peer"
                        name="endTime"
                        type="radio"
                      />
                      <label
                        htmlFor="dateRadio2"
                        className="px-3 py-1.5 border border-gray-200 rounded-md inline-block input-radio-label dark:border-dark-800 peer-checked:border-primary-500 dark:peer-checked:border-primary-500 peer-disabled:bg-gray-100 dark:peer-disabled:bg-dark-850 peer-disabled:text-gray-500 dark:peer-disabled:text-dark-500">
                        09:30 AM
                      </label>
                    </div>
                    <div className="input-radio-group">
                      <input
                        id="dateRadio3"
                        className="hidden input-radio peer"
                        name="endTime"
                        type="radio"
                      />
                      <label
                        htmlFor="dateRadio3"
                        className="px-3 py-1.5 border border-gray-200 rounded-md inline-block input-radio-label dark:border-dark-800 peer-checked:border-primary-500 dark:peer-checked:border-primary-500 peer-disabled:bg-gray-100 dark:peer-disabled:bg-dark-850 peer-disabled:text-gray-500 dark:peer-disabled:text-dark-500">
                        10:00 AM
                      </label>
                    </div>
                    <div className="input-radio-group">
                      <input
                        id="dateRadio4"
                        className="hidden input-radio peer"
                        name="endTime"
                        type="radio"
                        disabled
                      />
                      <label
                        htmlFor="dateRadio4"
                        className="px-3 py-1.5 border border-gray-200 rounded-md inline-block input-radio-label dark:border-dark-800 peer-checked:border-primary-500 dark:peer-checked:border-primary-500 peer-disabled:bg-gray-100 dark:peer-disabled:bg-dark-850 peer-disabled:text-gray-500 dark:peer-disabled:text-dark-500">
                        10:30 AM
                      </label>
                    </div>
                    <div className="input-radio-group">
                      <input
                        id="dateRadio5"
                        className="hidden input-radio peer"
                        name="endTime"
                        type="radio"
                      />
                      <label
                        htmlFor="dateRadio5"
                        className="px-3 py-1.5 border border-gray-200 rounded-md inline-block input-radio-label dark:border-dark-800 peer-checked:border-primary-500 dark:peer-checked:border-primary-500 peer-disabled:bg-gray-100 dark:peer-disabled:bg-dark-850 peer-disabled:text-gray-500 dark:peer-disabled:text-dark-500">
                        11:00 AM
                      </label>
                    </div>
                    <div className="input-radio-group">
                      <input
                        id="dateRadio6"
                        className="hidden input-radio peer"
                        name="endTime"
                        type="radio"
                      />
                      <label
                        htmlFor="dateRadio6"
                        className="px-3 py-1.5 border border-gray-200 rounded-md inline-block input-radio-label dark:border-dark-800 peer-checked:border-primary-500 dark:peer-checked:border-primary-500 peer-disabled:bg-gray-100 dark:peer-disabled:bg-dark-850 peer-disabled:text-gray-500 dark:peer-disabled:text-dark-500">
                        11:30 AM
                      </label>
                    </div>
                    <div className="input-radio-group">
                      <input
                        id="dateRadio7"
                        className="hidden input-radio peer"
                        name="endTime"
                        type="radio"
                      />
                      <label
                        htmlFor="dateRadio7"
                        className="px-3 py-1.5 border border-gray-200 rounded-md inline-block input-radio-label dark:border-dark-800 peer-checked:border-primary-500 dark:peer-checked:border-primary-500 peer-disabled:bg-gray-100 dark:peer-disabled:bg-dark-850 peer-disabled:text-gray-500 dark:peer-disabled:text-dark-500">
                        12:00 PM
                      </label>
                    </div>
                    <div className="input-radio-group">
                      <input
                        id="dateRadio8"
                        className="hidden input-radio peer"
                        name="endTime"
                        type="radio"
                      />
                      <label
                        htmlFor="dateRadio8"
                        className="px-3 py-1.5 border border-gray-200 rounded-md inline-block input-radio-label dark:border-dark-800 peer-checked:border-primary-500 dark:peer-checked:border-primary-500 peer-disabled:bg-gray-100 dark:peer-disabled:bg-dark-850 peer-disabled:text-gray-500 dark:peer-disabled:text-dark-500">
                        12:30 PM
                      </label>
                    </div>
                    <div className="input-radio-group">
                      <input
                        id="dateRadio9"
                        className="hidden input-radio peer"
                        name="endTime"
                        type="radio"
                      />
                      <label
                        htmlFor="dateRadio9"
                        className="px-3 py-1.5 border border-gray-200 rounded-md inline-block input-radio-label dark:border-dark-800 peer-checked:border-primary-500 dark:peer-checked:border-primary-500 peer-disabled:bg-gray-100 dark:peer-disabled:bg-dark-850 peer-disabled:text-gray-500 dark:peer-disabled:text-dark-500">
                        01:00 PM
                      </label>
                    </div>
                    <div className="input-radio-group">
                      <input
                        id="dateRadio10"
                        className="hidden input-radio peer"
                        name="endTime"
                        type="radio"
                      />
                      <label
                        htmlFor="dateRadio10"
                        className="px-3 py-1.5 border border-gray-200 rounded-md inline-block input-radio-label dark:border-dark-800 peer-checked:border-primary-500 dark:peer-checked:border-primary-500 peer-disabled:bg-gray-100 dark:peer-disabled:bg-dark-850 peer-disabled:text-gray-500 dark:peer-disabled:text-dark-500">
                        01:30 PM
                      </label>
                    </div>
                    <div className="input-radio-group">
                      <input
                        id="dateRadio11"
                        className="hidden input-radio peer"
                        name="endTime"
                        type="radio"
                      />
                      <label
                        htmlFor="dateRadio11"
                        className="px-3 py-1.5 border border-gray-200 rounded-md inline-block input-radio-label dark:border-dark-800 peer-checked:border-primary-500 dark:peer-checked:border-primary-500 peer-disabled:bg-gray-100 dark:peer-disabled:bg-dark-850 peer-disabled:text-gray-500 dark:peer-disabled:text-dark-500">
                        02:00 PM
                      </label>
                    </div>
                    <div className="input-radio-group">
                      <input
                        id="dateRadio12"
                        className="hidden input-radio peer"
                        name="endTime"
                        type="radio"
                      />
                      <label
                        htmlFor="dateRadio12"
                        className="px-3 py-1.5 border border-gray-200 rounded-md inline-block input-radio-label dark:border-dark-800 peer-checked:border-primary-500 dark:peer-checked:border-primary-500 peer-disabled:bg-gray-100 dark:peer-disabled:bg-dark-850 peer-disabled:text-gray-500 dark:peer-disabled:text-dark-500">
                        02:30 PM
                      </label>
                    </div>
                    <div className="input-radio-group">
                      <input
                        id="dateRadio13"
                        className="hidden input-radio peer"
                        name="endTime"
                        type="radio"
                        disabled
                      />
                      <label
                        htmlFor="dateRadio13"
                        className="px-3 py-1.5 border border-gray-200 rounded-md inline-block input-radio-label dark:border-dark-800 peer-checked:border-primary-500 dark:peer-checked:border-primary-500 peer-disabled:bg-gray-100 dark:peer-disabled:bg-dark-850 peer-disabled:text-gray-500 dark:peer-disabled:text-dark-500">
                        03:00 PM
                      </label>
                    </div>
                    <div className="input-radio-group">
                      <input
                        id="dateRadio14"
                        className="hidden input-radio peer"
                        name="endTime"
                        type="radio"
                      />
                      <label
                        htmlFor="dateRadio14"
                        className="px-3 py-1.5 border border-gray-200 rounded-md inline-block input-radio-label dark:border-dark-800 peer-checked:border-primary-500 dark:peer-checked:border-primary-500 peer-disabled:bg-gray-100 dark:peer-disabled:bg-dark-850 peer-disabled:text-gray-500 dark:peer-disabled:text-dark-500">
                        03:30 PM
                      </label>
                    </div>
                    <div className="input-radio-group">
                      <input
                        id="dateRadio15"
                        className="hidden input-radio peer"
                        name="endTime"
                        type="radio"
                      />
                      <label
                        htmlFor="dateRadio15"
                        className="px-3 py-1.5 border border-gray-200 rounded-md inline-block input-radio-label dark:border-dark-800 peer-checked:border-primary-500 dark:peer-checked:border-primary-500 peer-disabled:bg-gray-100 dark:peer-disabled:bg-dark-850 peer-disabled:text-gray-500 dark:peer-disabled:text-dark-500">
                        04:00 PM
                      </label>
                    </div>
                    <div className="input-radio-group">
                      <input
                        id="dateRadio16"
                        className="hidden input-radio peer"
                        name="endTime"
                        type="radio"
                      />
                      <label
                        htmlFor="dateRadio16"
                        className="px-3 py-1.5 border border-gray-200 rounded-md inline-block input-radio-label dark:border-dark-800 peer-checked:border-primary-500 dark:peer-checked:border-primary-500 peer-disabled:bg-gray-100 dark:peer-disabled:bg-dark-850 peer-disabled:text-gray-500 dark:peer-disabled:text-dark-500">
                        04:30 PM
                      </label>
                    </div>
                    <div className="input-radio-group">
                      <input
                        id="dateRadio17"
                        className="hidden input-radio peer"
                        name="endTime"
                        type="radio"
                      />
                      <label
                        htmlFor="dateRadio17"
                        className="px-3 py-1.5 border border-gray-200 rounded-md inline-block input-radio-label dark:border-dark-800 peer-checked:border-primary-500 dark:peer-checked:border-primary-500 peer-disabled:bg-gray-100 dark:peer-disabled:bg-dark-850 peer-disabled:text-gray-500 dark:peer-disabled:text-dark-500">
                        05:00 PM
                      </label>
                    </div>
                    <div className="input-radio-group">
                      <input
                        id="dateRadio18"
                        className="hidden input-radio peer"
                        name="endTime"
                        type="radio"
                      />
                      <label
                        htmlFor="dateRadio18"
                        className="px-3 py-1.5 border border-gray-200 rounded-md inline-block input-radio-label dark:border-dark-800 peer-checked:border-primary-500 dark:peer-checked:border-primary-500 peer-disabled:bg-gray-100 dark:peer-disabled:bg-dark-850 peer-disabled:text-gray-500 dark:peer-disabled:text-dark-500">
                        05:30 PM
                      </label>
                    </div>
                    <div className="input-radio-group">
                      <input
                        id="dateRadio19"
                        className="hidden input-radio peer"
                        name="endTime"
                        type="radio"
                      />
                      <label
                        htmlFor="dateRadio19"
                        className="px-3 py-1.5 border border-gray-200 rounded-md inline-block input-radio-label dark:border-dark-800 peer-checked:border-primary-500 dark:peer-checked:border-primary-500 peer-disabled:bg-gray-100 dark:peer-disabled:bg-dark-850 peer-disabled:text-gray-500 dark:peer-disabled:text-dark-500">
                        06:00 PM
                      </label>
                    </div>
                  </div>
                </div>
                <div className="col-span-12">
                  <label htmlFor="doctorSelect" className="form-label">
                    Doctor Name
                  </label>
                  <Select
                    classNamePrefix="select"
                    options={doctors}
                    onChange={handleEventTypeChange}
                    value={categoryList}
                  />
                </div>
                <div className="col-span-12">
                  <label htmlFor="treatmentInput" className="form-label">
                    Treatment
                  </label>
                  <textarea
                    name="treatmentInput"
                    id="treatmentInput"
                    className="h-auto form-input"
                    rows={3}></textarea>
                </div>
                <div className="col-span-12">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <button type="reset" className="btn btn-sub-gray">
                      Reset
                    </button>
                    <button className="btn btn-primary">
                      Book Appointment
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
        <div className="col-span-12 xl:col-span-4 2xl:col-span-3">
          <div className="bg-green-100 !border-green-500/20 dark:bg-green-500/15 card">
            <div className="card-body">
              <h6 className="mb-3">Hospital Hours</h6>

              <p className="mb-2 text-gray-500 dark:text-dark-400">
                Monday - Friday 09:00AM - 06:00PM
              </p>
              <p className="mb-4 text-gray-500 dark:text-dark-400">
                Saturday 09:00AM - 03:00PM
              </p>

              <h6 className="mb-3">Sunday Closed</h6>
              <p className="text-red-500">
                * Every 2nd, 4th Saturday and all govt holidays are closed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default AppointmentsBook
