'use client'

import React from 'react'

const InsideButtonBadge = () => {
  return (
    <>
      <div className="flex flex-wrap items-center gap-4">
        <button type="button" className="btn btn-primary">
          Notification{' '}
          <span className="rounded-full badge badge-square badge-solid-red">
            2
          </span>
        </button>
        <button type="button" className="btn btn-primary">
          Notification{' '}
          <span className="rounded-full badge badge-square badge-solid-green">
            2
          </span>
        </button>
      </div>
    </>
  )
}
export default InsideButtonBadge
