'use client'

import React, { useEffect, useRef, useState } from 'react'

import Link from 'next/link'

import { groupVideoKeyMoments } from '@src/data'
import { GroupKeyWordRecord } from '@src/dtos'
import { Pin } from 'lucide-react'
import SimpleBar from 'simplebar-react'

const KeyMoments: React.FC = () => {
  const [keyMoments, setKeyMoments] = useState<GroupKeyWordRecord[]>([])
  const [currentTime, setCurrentTime] = useState(0)
  const [formattedTime, setFormattedTime] = useState('00:00:00')
  const [newPinText, setNewPinText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (groupVideoKeyMoments) {
      setKeyMoments(groupVideoKeyMoments)
    }
  }, [])

  // Timer function to increment time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime((prevTime) => prevTime + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Update formatted time based on currentTime
  useEffect(() => {
    setFormattedTime(formatTime(currentTime))
  }, [currentTime])

  // Helper function to format time
  const formatTime = (seconds: number) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0')
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')
    const s = String(seconds % 60).padStart(2, '0')
    return `${h}:${m}:${s}`
  }

  // Function to add new pin
  const addPin = () => {
    if (newPinText.trim() === '') return
    setKeyMoments((prevPins) => [
      ...prevPins,
      { id: prevPins.length + 1, time: formattedTime, text: newPinText },
    ])
    setNewPinText('')
  }

  return (
    <React.Fragment>
      <div className="card">
        <div className="card-header">
          <h6 className="card-title">Key Moments</h6>
        </div>
        <div className="card-body">
          <SimpleBar className="max-h-28 -mx-space px-space overflow-y-auto">
            <div className="flex flex-col gap-2">
              {keyMoments.map((item: GroupKeyWordRecord, index: number) => (
                <Link
                  href="#!"
                  title="text pin"
                  className="flex items-center gap-3 text-gray-500 dark:text-dark-500"
                  key={index}>
                  <p className="w-28">{item.time}</p>
                  <p>{item.text}</p>
                </Link>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </SimpleBar>

          <div className="flex items-center gap-2 mt-5">
            <p className="font-medium text-green-500 shrink-0">
              {formattedTime}
            </p>
            <input
              type="text"
              className="form-input"
              value={newPinText}
              onChange={(e) => setNewPinText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addPin()}
            />
            <button
              className="btn btn-sub-red btn-icon shrink-0"
              onClick={addPin}>
              <Pin className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default KeyMoments
