'use client'

import React from 'react'

import Image from 'next/image'

import school from '@assets/images/dashboards/school.png'
import { NextPageWithLayout } from '@src/dtos'

const Explore: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <div className="col-span-12 text-center bg-gray-100 order-last dark:bg-dark-850 xl:col-span-4 2xl:col-span-3 card">
        <div className="card-body">
          <h5 className="mb-2">
            Join the community and find out more information
          </h5>
          <button type="button" className="btn btn-green">
            Explore Now
          </button>
          <div className="mt-5">
            <Image
              src={school}
              alt="schoolImg"
              className="mx-auto h-44"
              width={242}
              height={176}
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}
export default Explore
