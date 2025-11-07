'use client'

import React from 'react'

import Image from 'next/image'
import Link from 'next/link'

import { changes } from '@src/data'
import { NextPageWithLayout } from '@src/dtos'

const UpcomingTest: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <div className="order-10 col-span-12 md:col-span-6 2xl:col-span-3 card">
        <div className="card-header">
          <h6 className="card-title">Upcoming Test</h6>
        </div>
        <div className="flex flex-col gap-3 card-body">
          {changes.map((item, index) => {
            return (
              <div key={index} className="flex items-center gap-3">
                <div
                  className={`flex items-center justify-center rounded-md ${item.color} size-12`}>
                  <Image
                    src={item.img}
                    alt="itemImg"
                    className="h-6"
                    width={24}
                    height={24}
                  />
                </div>
                <div className="grow">
                  <h6 className="mb-1">
                    <Link href="#!">{item.label}</Link>
                  </h6>
                  <p className="text-gray-500 dark:text-dark-500">
                    {item.class}
                  </p>
                </div>
                <p className="text-red-500 shrink-0">{item.date}</p>
              </div>
            )
          })}
        </div>
      </div>
    </React.Fragment>
  )
}
export default UpcomingTest
