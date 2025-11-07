'use client'

import React, { useState } from 'react'

import Link from 'next/link'

const SolidAlerts = () => {
  // Initialize state with alerts
  const [alerts, setAlerts] = useState([
    { text: 'Primary Alerts', color: 'alert-solid-primary' },
    { text: 'Purple Alerts', color: 'alert-solid-purple' },
    { text: 'Green Alerts', color: 'alert-solid-green' },
    { text: 'Red Alerts', color: 'alert-solid-red' },
    { text: 'Yellow Alerts', color: 'alert-solid-yellow' },
    { text: 'Sky Alerts', color: 'alert-solid-sky' },
    { text: 'Pink Alerts', color: 'alert-solid-pink' },
    { text: 'Indigo Alerts', color: 'alert-solid-indigo' },
    { text: 'Orange Alerts', color: 'alert-solid-orange' },
    { text: 'Dark Alerts', color: 'alert-solid-gray' },
  ])

  // Function to remove alert by index
  const removeAlert = (index: number) => {
    setAlerts((prevAlerts) => prevAlerts.filter((_, i) => i !== index))
  }

  return (
    <div className="card">
      <div className="card-header">
        <h6 className="card-title">Solid Alerts</h6>
      </div>
      <div className="card-body">
        <div className="flex flex-col gap-2">
          {alerts.map((alert, index) => (
            <div key={index} className={`${alert.color} alert`}>
              <span>{alert.text}</span>
              <Link
                href="#"
                onClick={() => removeAlert(index)}
                className="btn-close">
                <i className="ri-close-fill"></i>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SolidAlerts
