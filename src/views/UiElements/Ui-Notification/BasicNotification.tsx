'use client'

import React, { useCallback, useEffect, useState } from 'react'

type NoticeType = 'success' | 'info' | 'warning' | 'error'

interface Notice {
  id: number
  type: NoticeType
  text: string
}

const BasicNotification: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([])
  const [visible, setVisible] = useState<Notice[]>([])

  const generateUniqueId = (): number => {
    return Date.now() + Math.floor(Math.random() * 1000)
  }

  const removeNotice = useCallback((id: number) => {
    setVisible((prev) => prev.filter((notice) => notice.id !== id))
    setTimeout(() => {
      setNotices((prev) => prev.filter((notice) => notice.id !== id))
    }, 200) // Duration for the leave transition
  }, [])

  const addNotice = useCallback(
    (notice: Omit<Notice, 'id'>) => {
      const newNotice: Notice = { id: generateUniqueId(), ...notice }
      setNotices((prev) => [...prev, newNotice])
      setVisible((prev) => [...prev, newNotice])
      setTimeout(() => {
        removeNotice(newNotice.id)
      }, 3000)
    },
    [removeNotice]
  )

  useEffect(() => {
    const handleNotice = (event: CustomEvent) => {
      addNotice(event.detail)
    }
    window.addEventListener('notice', handleNotice as EventListener)
    return () => {
      window.removeEventListener('notice', handleNotice as EventListener)
    }
  }, [addNotice])

  const dispatchNotice = (type: NoticeType, text: string) => {
    window.dispatchEvent(
      new CustomEvent('notice', {
        detail: { type, text },
      })
    )
  }

  const getAlertClass = (type: NoticeType) => {
    switch (type) {
      case 'success':
        return 'bg-green-500 text-white'
      case 'info':
        return 'bg-blue-500 text-white'
      case 'warning':
        return 'bg-yellow-500 text-black'
      case 'error':
        return 'bg-red-500 text-white'
      default:
        return ''
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() =>
            dispatchNotice('success', '🔥 Your success message - make it short')
          }
          className="btn btn-green">
          Success
        </button>
        <button
          onClick={() =>
            dispatchNotice('info', 'Your Info message - make it short')
          }
          className="btn btn-sky">
          Info
        </button>
        <button
          onClick={() =>
            dispatchNotice('warning', '🪄 Your Warning message - make it short')
          }
          className="btn btn-yellow">
          Warning
        </button>
        <button
          onClick={() =>
            dispatchNotice('error', '😵 Your critical message - make it short!')
          }
          className="btn btn-red">
          Error
        </button>
      </div>

      <div
        className="fixed flex flex-col-reverse items-end justify-start w-screen h-screen gap-3 bottom-10 right-10 z-[1050]"
        style={{ pointerEvents: 'none' }}>
        {notices.map((notice) => (
          <div
            key={notice.id}
            className={`cursor-pointer alert w-82 transition-opacity duration-300 ${getAlertClass(notice.type)} ${visible.includes(notice) ? 'opacity-100' : 'opacity-0'}`}
            style={{ pointerEvents: 'all' }}
            onClick={() => removeNotice(notice.id)}>
            {notice.text}
          </div>
        ))}
      </div>
    </>
  )
}

export default BasicNotification
