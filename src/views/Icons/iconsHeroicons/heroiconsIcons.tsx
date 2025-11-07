'use client'

import React from 'react'

import Link from 'next/link'

import { Usage } from './prismUsage'

const HeroiconsIcons = () => {
  return (
    <React.Fragment>
      <div className="col-span-12 card">
        <div className="flex flex-col md:items-center md:flex-row card-header">
          <h6 className="text-15 grow">
            Heroicons Icons (React & Vue Libraries)
          </h6>
          <Link
            href="https://heroicons.com/outline"
            target="_blank"
            className="font-medium text-red-500 underline transition duration-200 ease-linear hover:text-red-600 shrink-0">
            View All Icons
          </Link>
        </div>
        <div className="card-body">
          <h6 className="mb-1">Usage</h6>
          <p className="text-gray-500 dark:text-dark-500 mb-2">
            The quickest way to use these icons is to simply copy the source for
            the icon you need from heroicons.com and inline it directly into
            your HTML:
          </p>

          <Usage />

          <p className="mb-0 mt-2 text-gray-500 dark:text-dark-500">
            For more details, see the
            <Link
              href="https://github.com/tailwindlabs/heroicons"
              target="_blank"
              className="transition duration-200 ease-linear hover:text-primary-600 text-primary-500">
              documentation
            </Link>
            .
          </p>
        </div>
      </div>
    </React.Fragment>
  )
}
export default HeroiconsIcons
