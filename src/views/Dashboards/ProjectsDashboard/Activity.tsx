'use client'

import React from 'react'

import Image from 'next/image'
import Link from 'next/link'

import user11 from '@assets/images/avatar/user-11.png'
import user13 from '@assets/images/avatar/user-13.png'
import user14 from '@assets/images/avatar/user-14.png'
import user16 from '@assets/images/avatar/user-16.png'
import brands22 from '@assets/images/brands/img-22.png'
import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
} from '@src/components/custom/dropdown/dropdown'
import { NextPageWithLayout } from '@src/dtos'
import { Ellipsis } from 'lucide-react'
import SimpleBar from 'simplebar-react'

const Activity: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <div className="order-11 col-span-12 xl:col-span-6 2xl:col-span-4 card">
        <div className="flex items-center gap-3 card-header">
          <h6 className="card-title grow">Activities</h6>
          <Dropdown position="" trigger="click" dropdownClassName="dropdown">
            <DropdownButton colorClass="flex items-center text-gray-500 dark:text-dark-500">
              <Ellipsis className="size-5" />
            </DropdownButton>
            <DropdownMenu>
              <Link href="#!" className="dropdown-item ">
                <span>Weekly</span>
              </Link>

              <Link href="#!" className="dropdown-item ">
                <span>Monthly</span>
              </Link>
              <Link href="#!" className="dropdown-item">
                <span>Yearly</span>
              </Link>
            </DropdownMenu>
          </Dropdown>
        </div>
        <div className="card-body">
          <SimpleBar className="h-[25rem] -mx-space px-space">
            <ul className="*:before:absolute *:before:w-0.5 *:before:bg-gray-200 dark:*:before:bg-dark-800 *:before:top-5 *:before:-bottom-5 *:relative ltr:*:before:left-[3px] rtl:*:before:right-[3px] flex flex-col *:pb-5 ltr:*:pl-5 rtl:*:pr-5 *:after:absolute *:after:bg-white dark:*:after:bg-dark-900 *:after:size-2 *:after:border *:after:border-gray-300 dark:*:after:border-dark-700 ltr:*:after:left-0 rtl:*:after:right-0 *:after:top-5 *:after:rounded-xs">
              <li className="last:before:hidden last:pb-0 [&.active]:before:bg-purple-500 [&.active]:after:border-purple-500">
                <div className="flex items-center gap-3 mb-3">
                  <Image
                    src={user14}
                    alt="userImg"
                    className="rounded-md size-10"
                  />
                  <div className="grow">
                    <h6 className="mb-0.5">Josefina Dach</h6>
                    <p className="text-gray-500 text-13">09:32 AM - Today</p>
                  </div>
                </div>
                <h6 className="mb-1">Client Meeting</h6>
                <p className="text-gray-500">
                  Project meeting with sophia @11:00AM
                </p>
              </li>
              <li className="last:before:hidden last:pb-0 [&.active]:before:bg-purple-500 [&.active]:after:border-purple-500">
                <div className="flex items-center gap-3 mb-3">
                  <Image
                    src={user16}
                    alt="userImg"
                    className="rounded-md size-10"
                  />
                  <div className="grow">
                    <h6 className="mb-0.5">Zara Russell</h6>
                    <p className="text-gray-500 text-13">
                      11:57 AM - Yesterday
                    </p>
                  </div>
                </div>
                <h6 className="mb-1 ">
                  Commented on
                  <Link href="#!" className="text-primary-500 ps-1.5">
                    Chat App
                  </Link>
                </h6>
                <p className="text-gray-500">
                  &quot;Great product but only if you end up using the exact
                  examples in the demos provided.&quot;
                </p>
              </li>
              <li className="last:before:hidden last:pb-0 [&.active]:before:bg-purple-500 [&.active]:after:border-purple-500">
                <div className="flex items-center gap-3 mb-3">
                  <Image
                    src={user11}
                    alt="userImg"
                    className="rounded-md size-10"
                  />
                  <div className="grow">
                    <h6 className="mb-0.5">Matthew Warner</h6>
                    <p className="text-gray-500 text-13">
                      04:55 AM - 19 July, 2024
                    </p>
                  </div>
                </div>
                <h6 className="mb-1">
                  Add a file to
                  <Link href="#!" className="text-red-500 ps-1.5">
                    domiex
                  </Link>
                </h6>
                <div className="flex items-center gap-3 p-3 border border-dashed rounded-md border-gray-200 rounded-md dark:border-dark-800">
                  <Image
                    src={brands22}
                    alt="brandImg"
                    className="size-9 shrink-0"
                  />
                  <div className="grow">
                    <h6 className="mb-1">Zenith Figma File</h6>
                    <p className="text-xs text-gray-500">21 MB</p>
                  </div>
                </div>
              </li>
              <li className="last:before:hidden last:pb-0 [&.active]:before:bg-purple-500 [&.active]:after:border-purple-500">
                <div className="flex items-center gap-3 mb-3">
                  <Image
                    src={user13}
                    alt="userImg"
                    className="rounded-md size-10"
                  />
                  <div className="grow">
                    <h6 className="mb-0.5">Nicole Bentley</h6>
                    <p className="text-gray-500 text-13">
                      04:11 PM - 16 July, 2024
                    </p>
                  </div>
                </div>
                <h6 className="mb-1">Create a new project for client</h6>
                <p className="text-gray-500">Add files to new design folder</p>
              </li>
            </ul>
          </SimpleBar>
        </div>
      </div>
    </React.Fragment>
  )
}
export default Activity
