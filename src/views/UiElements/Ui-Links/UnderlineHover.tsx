'use client'

import React from 'react'

import Link from 'next/link'

const UnderlineHover = () => {
  return (
    <React.Fragment>
      <div className="col-span-12 md:col-span-6 card">
        <div className="card-header">
          <h6 className="card-title">Underline Hover Links</h6>
        </div>
        <div className="flex flex-wrap items-center gap-3 card-body">
          <Link
            href="#!"
            className="no-underline link link-primary hover:underline">
            hover Underline Links
          </Link>
          <Link
            href="#!"
            className="text-gray-800 no-underline link hover:underline dark:text-dark-50 hover:text-primary-500 dark:hover:text-primary-500">
            Hover Underline Links
          </Link>
        </div>
      </div>
    </React.Fragment>
  )
}
export default UnderlineHover
