'use client'

import React, { useState } from 'react'

// Ensure you have the icons imported
import Image from 'next/image'

import { Modal } from '@src/components/custom/modal/modal'
import { CallPatientsModalProps } from '@src/dtos/apps/appointmentsList'
import { Disc, Mic, MicOff, Pause, Phone, Settings } from 'lucide-react'

const CallPatientsModal: React.FC<CallPatientsModalProps> = ({
  show,
  patients,
  handleHide,
}) => {
  const [isMuted, setIsMuted] = useState(false)
  const [isCalling] = useState(true)
  const callDuration = 0
  const formatDuration = (duration: number) => `${duration} sec`
  const toggleMute = () => {
    setIsMuted((prev) => !prev)
  }

  return (
    <React.Fragment>
      <Modal
        isOpen={show}
        onClose={handleHide}
        position="modal-br"
        size="modal-xs"
        contentClass="modal-content"
        content={(onClose) => (
          <>
            <div>
              <div className="flex items-center gap-2">
                <div className="relative items-center justify-center overflow-hidden text-gray-500 bg-gray-100 rounded-full dark:bg-dark-850 dark:text-dark-500 size-12 shrink-0">
                  {patients.image && (
                    <Image src={patients.image} alt="patientsImg" />
                  )}
                  {!patients.image && (
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-500 bg-gray-100 rounded-full dark:bg-dark-850 dark:text-dark-500">
                      {patients.avatarText}
                    </span>
                  )}
                </div>
                <div>
                  <h6>{patients.patientName}</h6>
                  <p className="text-sm text-gray-500 dark:text-dark-500">
                    {isCalling ? 'Calling ...' : formatDuration(callDuration)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-5">
                <button
                  type="button"
                  className="btn btn-active-gray shrink-0 btn-icon-text btn-icon"
                  onClick={toggleMute}>
                  {isMuted ? (
                    <MicOff className="size-5" />
                  ) : (
                    <Mic className="size-5" />
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-active-gray shrink-0 btn-icon-text btn-icon">
                  <Pause className="size-5" />
                </button>
                <button
                  type="button"
                  className="btn btn-active-gray shrink-0 btn-icon-text btn-icon">
                  <Disc className="size-5" />
                </button>
                <button
                  type="button"
                  className="btn btn-active-red shrink-0 btn-icon-text btn-icon"
                  onClick={onClose}>
                  <Phone className="size-5" />
                </button>
                <button
                  type="button"
                  className="btn btn-active-gray shrink-0 btn-icon-text btn-icon">
                  <Settings className="size-5" />
                </button>
              </div>
            </div>
          </>
        )}
      />
    </React.Fragment>
  )
}

export default CallPatientsModal
