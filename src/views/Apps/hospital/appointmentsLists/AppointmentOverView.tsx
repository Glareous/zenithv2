'use client'

import React from 'react'

// Import only the icon needed
import Image from 'next/image'

import { Modal } from '@src/components/custom/modal/modal'
import { AppointmentOverViewProps } from '@src/dtos/apps/hospital'
// Assuming the custom Modal component exists
import { CalendarPlus2 } from 'lucide-react'

const AppointmentOverView: React.FC<AppointmentOverViewProps> = ({
  show,
  handleHide,
  appointment,
  deleteAppointment,
  handleShowCallModal,
}) => {
  const data = appointment

  const onClickPatientsView = (onClose: () => void) => {
    handleShowCallModal()
    onClose()
  }

  return (
    <React.Fragment>
      <Modal
        isOpen={show}
        onClose={handleHide}
        position="modal-center"
        title="Appointment Overview"
        size="modal-lg"
        contentClass="modal-content"
        content={(onClose) => (
          <>
            <p className="mb-2 text-gray-500 dark:text-dark-500">
              Patient Info
            </p>
            <div className="flex gap-3 mb-5">
              <div className="relative items-center justify-center overflow-hidden text-gray-500 bg-gray-100 rounded-full dark:bg-dark-850 dark:text-dark-500 size-10">
                <Image
                  src={data.image}
                  alt="dataImg"
                  className="rounded-full"
                  height={40}
                  width={40}
                />
                {!data.image && (
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-500 bg-gray-100 rounded-full dark:bg-dark-850 dark:text-dark-500">
                    {data.avatarText}
                  </span>
                )}
              </div>
              <div>
                <h6>{data.patientName}</h6>
                <p className="text-gray-500 dark:text-dark-500">
                  {data.treatmentType}
                </p>
              </div>
            </div>
            <p className="mb-2 text-gray-500 dark:text-dark-500">Date & Time</p>
            <div className="flex gap-3 mb-5">
              <div className="flex items-center justify-center overflow-hidden text-gray-500 bg-gray-100 rounded-full dark:bg-dark-850 dark:text-dark-500 size-10">
                <CalendarPlus2 className="size-5" />
              </div>
              <div>
                <h6>{data.date}</h6>
                <p className="text-gray-500 dark:text-dark-500">
                  {data.startTime} - {data.endTime}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <p className="text-gray-500 dark:text-dark-500">Doctor Name:</p>
              <div>
                <h6>{data.doctor}</h6>
              </div>
            </div>

            <div className="gap-2 modal-footer">
              <button
                type="button"
                className="w-full btn btn-primary"
                onClick={() => onClickPatientsView(onClose)}>
                <i className="ri-phone-line"></i> Call Patient
              </button>
              <button
                type="button"
                className="w-full btn btn-red"
                onClick={() => {
                  deleteAppointment(appointment)
                  onClose()
                  // Close modal after cancellation
                }}>
                <i className="ri-close-line"></i> Cancel Appointment
              </button>
            </div>
          </>
        )}
      />
    </React.Fragment>
  )
}

export default AppointmentOverView
