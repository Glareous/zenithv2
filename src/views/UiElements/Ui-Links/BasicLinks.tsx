'use client'

import React from 'react'

import Link from 'next/link'

const BasicLinks = () => {
  return (
    <React.Fragment>
      <div className="col-span-12 md:col-span-6 card">
        <div className="card-header">
          <h6 className="card-title">Basic Links</h6>
        </div>
        <div className="flex flex-wrap items-center gap-3 card-body">
          <Link href="#!" className="link link-primary">
            Basic Links
          </Link>
          <Link
            href="#!"
            className="text-gray-800 link dark:text-dark-50 hover:text-primary-500 dark:hover:text-primary-500">
            Basic Links
          </Link>
        </div>
      </div>
    </React.Fragment>
  )
}
export default BasicLinks
