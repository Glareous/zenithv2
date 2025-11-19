'use client'

import React from 'react'

import Image from 'next/image'
import Link from 'next/link'

import user11 from '@assets/images/avatar/user-11.png'
import user15 from '@assets/images/avatar/user-15.png'
import user18 from '@assets/images/avatar/user-18.png'
import { NextPageWithLayout } from '@src/dtos'
import { ChevronRight } from 'lucide-react'
import SimpleBar from 'simplebar-react'

const DealOpen: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <div className="col-span-12 xl:col-span-6 2xl:col-span-4 card">
        <div className="flex items-center gap-3 card-header">
          <h6 className="card-title grow">Deals Open</h6>
          <Link href="#!" className="link link-primary shrink-0">
            View More
            <ChevronRight className="inline-block ltr:ml-0.5 rtl:mr-0.5 size-4" />
          </Link>
        </div>
        <div className="card-body">
          <SimpleBar className="h-52 -mx-space px-space">
            <div className="flex flex-col gap-3">
              <div className="mb-0 card">
                <div className="card-body">
                  <div className="flex">
                    <div className="grow">
                      <p className="mb-1 text-gray-500 dark:text-dark-500">
                        Closing Date: 20 Jul, 2024
                      </p>
                      <h6>
                        <Link href="#!">Financial Work History</Link>
                      </h6>
                      <div className="flex items-center gap-2 mt-3">
                        <Image
                          src={user18}
                          alt="User Images"
                          className="rounded-full size-6"
                        />
                        <p>Donna Berlin</p>
                      </div>
                    </div>
                    <div className="ltr:text-right rtl:text-left shrink-0">
                      <h6 className="mb-1">$87,000</h6>
                      <span className="badge badge-sub-primary">
                        Contract sent
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mb-0 card">
                <div className="card-body">
                  <div className="flex">
                    <div className="grow">
                      <p className="mb-1 text-gray-500 dark:text-dark-500">
                        Closing Date: 18 Jul, 2024
                      </p>
                      <h6>
                        <Link href="#!">Zenith Admin Role</Link>
                      </h6>
                      <div className="flex items-center gap-2 mt-3">
                        <Image
                          src={user11}
                          alt="usermg"
                          className="rounded-full size-6"
                        />
                        <p>Willian Brim</p>
                      </div>
                    </div>
                    <div className="ltr:text-right rtl:text-left shrink-0">
                      <h6 className="mb-1">$49,599</h6>
                      <span className="badge badge-sub-primary">
                        Contract sent
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mb-0 card">
                <div className="card-body">
                  <div className="flex">
                    <div className="grow">
                      <p className="mb-1 text-gray-500 dark:text-dark-500">
                        Closing Date: 10 Jul, 2024
                      </p>
                      <h6>
                        <Link href="#!">API & Employee Statistic</Link>
                      </h6>
                      <div className="flex items-center gap-2 mt-3">
                        <Image
                          src={user15}
                          alt="usermg"
                          className="rounded-full size-6"
                        />
                        <p>Marla Ramos</p>
                      </div>
                    </div>
                    <div className="ltr:text-right rtl:text-left shrink-0">
                      <h6 className="mb-1">$34,999</h6>
                      <span className="badge badge-sub-primary">
                        Contract sent
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SimpleBar>
        </div>
      </div>
    </React.Fragment>
  )
}
export default DealOpen
