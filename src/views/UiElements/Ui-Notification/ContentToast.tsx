'use client'

import React, { useState } from 'react'

import Link from 'next/link'

interface NotificationProps {
  isOpen: boolean
  onClose: () => void
}

const Notification: React.FC<NotificationProps> = ({ isOpen, onClose }) => {
  return (
    <div
      className={`fixed text-sm transition-all duration-300 ease-in-out transform bg-white rounded-md shadow-lg top-5 right-5 max-w-96 shadow-gray-300 dark:bg-dark-900 dark:shadow-dark-900 ${
        isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
      style={{ zIndex: 9999 }}>
      <div className="flex items-center p-3 border-b border-gray-200 dark:border-dark-800 relative">
        <h6 className="flex-grow">
          You have successfully completed this thing!
        </h6>
        <Link
          href="#"
          onClick={(e) => {
            e.preventDefault()
            onClose()
          }}
          className="absolute text-lg link link-red right-4 top-2">
          <i className="ri-close-fill"></i>
        </Link>
      </div>
      <div className="p-3">
        <p className="text-gray-500 dark:text-dark-500">
          Those who successfully complete the programme will be awarded a
          certificate of achievement. You can concentrate and successfully
          complete a project that just days ago would have looked too difficult.
        </p>
      </div>
    </div>
  )
}

const ContentToast: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const handleClick = () => {
    setIsOpen(true)
    setTimeout(() => {
      setIsOpen(false)
    }, 5000)
  }

  return (
    <div className="flex items-center gap-2 card-body">
      <button onClick={handleClick} className="btn btn-purple">
        Content Toast
      </button>
      <Notification isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  )
}

export default ContentToast
