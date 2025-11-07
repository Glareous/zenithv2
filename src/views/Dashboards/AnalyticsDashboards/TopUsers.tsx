'use client'

import React from 'react'

import Image from 'next/image'

import user11 from '@assets/images/avatar/user-11.png'
import user14 from '@assets/images/avatar/user-14.png'
import user15 from '@assets/images/avatar/user-15.png'
import user17 from '@assets/images/avatar/user-17.png'
import user18 from '@assets/images/avatar/user-18.png'
import { NextPageWithLayout } from '@src/dtos'
import SimpleBar from 'simplebar-react'

const TopUsers: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <div className="col-span-12 md:col-span-6 2xl:col-span-3 card">
        <div className="card-header">
          <h6 className="card-title">Top Users (Contributors)</h6>
        </div>
        <div className="card-body">
          <SimpleBar className="h-36 -mx-space px-space">
            <div className="flex flex-col gap-3 ">
              <div className="flex items-center gap-3">
                <Image
                  src={user18}
                  alt="userImg"
                  className="rounded-full size-10 shrink-0"
                />
                <div className="grow">
                  <h6 className="mb-0.5">Julian Glover</h6>
                  <p className="text-gray-500 dark:text-dark-500 text-13">
                    78.4M Followers
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Image
                  src={user11}
                  alt="userImg"
                  className="rounded-full size-10 shrink-0"
                />
                <div className="grow">
                  <h6 className="mb-0.5">Steve Powlowski</h6>
                  <p className="text-gray-500 dark:text-dark-500 text-13">
                    64.9M Followers
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Image
                  src={user14}
                  alt="userImg"
                  className="rounded-full size-10 shrink-0"
                />
                <div className="grow">
                  <h6 className="mb-0.5">Della Brekke</h6>
                  <p className="text-gray-500 dark:text-dark-500 text-13">
                    63.2M Followers
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Image
                  src={user15}
                  alt="userImg"
                  className="rounded-full size-10 shrink-0"
                />
                <div className="grow">
                  <h6 className="mb-0.5">Jerod Bernhard</h6>
                  <p className="text-gray-500 dark:text-dark-500 text-13">
                    59.3M Followers
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Image
                  src={user17}
                  alt="userImg"
                  className="rounded-full size-10 shrink-0"
                />
                <div className="grow">
                  <h6 className="mb-0.5">Dominic Larkin</h6>
                  <p className="text-gray-500 dark:text-dark-500 text-13">
                    47.2M Followers
                  </p>
                </div>
              </div>
            </div>
          </SimpleBar>
        </div>
      </div>
    </React.Fragment>
  )
}
export default TopUsers
