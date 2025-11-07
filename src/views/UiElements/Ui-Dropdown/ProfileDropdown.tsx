'use client'

import React from 'react'

import Image from 'next/image'
import Link from 'next/link'

import user from '@assets/images/avatar/user-17.png'
import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
} from '@src/components/custom/dropdown/dropdown'
import { Headset, Moon, Phone, UserRound, VenetianMask } from 'lucide-react'

const ProfileDropdown = () => {
  return (
    <React.Fragment>
      <Dropdown position="" trigger="click" dropdownClassName="dropdown">
        <DropdownButton
          colorClass="flex items-center gap-2 btn btn-primary"
          arrow={true}>
          Profile
        </DropdownButton>
        <DropdownMenu menuClass="!fixed !w-72">
          <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-dark-800">
            <Image
              src={user}
              alt="user"
              className="rounded-full size-9 shrink-0"
            />
            <div className="overflow-hidden grow">
              <h6>Sophia Mia</h6>
              <Link href="#!" className="truncate link link-primary">
                sophia@example.com
              </Link>
            </div>
            <div className="shrink-0">
              <span className="badge badge-pink">Pro</span>
            </div>
          </div>
          <div className="p-4 *:flex flex flex-col gap-4 *:items-center">
            <Link href="#!" className="link link-primary">
              <UserRound className="size-4 ltr:mr-1 rtl:ml-1" /> Account
              Settings
            </Link>
            <Link href="#!" className="link link-primary">
              <VenetianMask className="size-4 ltr:mr-1 rtl:ml-1" /> Go Incognito
            </Link>
            <Link href="#!" className="link link-primary">
              <Headset className="size-4 ltr:mr-1 rtl:ml-1" /> Help Center
            </Link>
            <Link href="#!" className="link link-primary">
              <Moon className="size-4 ltr:mr-1 rtl:ml-1" />
              <span className="grow">Dark Mode</span>
              <label
                htmlFor="darkModeProfile"
                className="switch-group shrink-0">
                <div className="relative">
                  <input
                    type="checkbox"
                    id="darkModeProfile"
                    className="sr-only peer"
                  />
                  <div className="switch-wrapper"></div>
                  <div className="switch-dot peer-checked:translate-x-full rtl:peer-checked:-translate-x-full switch-primary"></div>
                </div>
              </label>
            </Link>
            <Link href="#!" className="link link-primary">
              <Phone className="size-4 ltr:mr-1 rtl:ml-1" /> Contact Us
            </Link>
          </div>
        </DropdownMenu>
      </Dropdown>
    </React.Fragment>
  )
}
export default ProfileDropdown
