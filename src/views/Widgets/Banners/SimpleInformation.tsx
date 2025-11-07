'use client'

import React from 'react'

import Image from 'next/image'
import Link from 'next/link'

import imag1 from '@assets/images/dashboards/img-1.png'

const SimpleInformation = () => {
  return (
    <React.Fragment>
      <div className="relative col-span-12 overflow-hidden xl:col-span-6 bg-sky-100 border-sky-200 dark:bg-sky-500/10 dark:border-sky-500/20 card">
        <div className="py-6 card-body">
          <div className="relative z-10 grid grid-cols-12">
            <div className="col-span-9">
              <h6 className="mb-1 text-15">Welcome to Dr. Olivia Martina</h6>
              <p className="mb-4 text-gray-500">
                Welcome to the Admin Dashboard! This centralized platform is
                designed to streamline your administrative tasks and provide you
                with real-time insights.
              </p>
              <Link href="#!" className="btn btn-sky">
                Get Started
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute border-[20px] border-sky-500/15 ltr:-right-12 rtl:-left-12 -bottom-12 size-56 rounded-full"></div>
        <Image
          src={imag1}
          alt="dashboardImg"
          className="absolute ltr:right-3 rtl:left-3 -bottom-6"
        />
      </div>
      <div className="relative col-span-12 overflow-hidden bg-gray-100 dark:bg-dark-850 dark:border-dark-800 border-gray-200 xl:col-span-6 card">
        <div className="py-6 card-body">
          <div className="relative z-10 grid grid-cols-12">
            <div className="col-span-9">
              <h6 className="mb-1 text-15">Welcome to Dr. Olivia Martina</h6>
              <p className="mb-4 text-gray-500">
                Welcome to the Admin Dashboard! This centralized platform is
                designed to streamline your administrative tasks and provide you
                with real-time insights.
              </p>
              <Link href="#!" className="btn btn-gray">
                Get Started
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute border-[20px] border-gray-200 dark:border-dark-800 ltr:-right-12 rtl:-left-12 -bottom-12 size-56 rounded-full"></div>
        <Image
          src={imag1}
          alt="dashboardImg"
          className="absolute ltr:right-3 rtl:left-3 -bottom-6"
        />
      </div>
    </React.Fragment>
  )
}

export default SimpleInformation
