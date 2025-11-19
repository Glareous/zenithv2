'use client'

import React from 'react'

import Link from 'next/link'

interface FooterProps {
  organization?: {
    id: string
    name: string
    logoUrl: string | null
  } | null
}

const Footer: React.FC<FooterProps> = ({ organization }) => {
  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || 'Zenith'

  return (
    <React.Fragment>
      <div className="main-footer">
        <div className="w-full">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="hidden">
              <ul className="flex items-center gap-4">
                <li>
                  <Link
                    href="#!"
                    className="font-medium text-gray-500 transition duration-300 ease-linear dark:text-dark-500 hover:text-primary-500 dark:hover:text-primary-500">
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="#!"
                    className="font-medium text-gray-500 transition duration-300 ease-linear dark:text-dark-500 hover:text-primary-500 dark:hover:text-primary-500">
                    Support
                  </Link>
                </li>
                <li>
                  <Link
                    href="#!"
                    className="font-medium text-gray-500 transition duration-300 ease-linear dark:text-dark-500 hover:text-primary-500 dark:hover:text-primary-500">
                    Purchase Now
                  </Link>
                </li>
              </ul>
            </div>
            <div className="text-center text-gray-500 dark:text-dark-500 ltr:lg:text-right rtl:lg:text-left">
              <div>&copy; {new Date().getFullYear()} {organization?.name || brandName}.</div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default Footer
