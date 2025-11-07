'use client'

import React, { useState } from 'react'

import Link from 'next/link'

const LiveAlerts = () => {
  // State to manage the visibility of the alert
  const [isOpen, setIsOpen] = useState(false)

  // Function to handle showing the alert
  const showAlert = () => {
    setIsOpen(true)
    // Automatically hide the alert after 7 seconds
    setTimeout(() => {
      setIsOpen(false)
    }, 7000)
  }

  return (
    <div className="card">
      <div className="card-header">
        <h6 className="card-title">Live Alerts</h6>
      </div>
      <div className="card-body">
        <div>
          <button
            onClick={showAlert}
            className="text-white bg-primary-500 border-primary-500 btn hover:bg-primary-600 hover:text-white hover:border-primary-600 focus:bg-primary-600 focus:text-white focus:border-primary-600">
            Live Alert
          </button>
          {isOpen && (
            <div className="fixed -translate-x-1/2 alert alert-primary top-5 z-[1050] left-1/2">
              <span>You have successfully completed this thing!</span>
              <Link
                href=""
                onClick={() => setIsOpen(false)}
                className="text-primary-400 hover:text-primary-500 btn-close">
                <i className="ri-close-fill"></i>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LiveAlerts
