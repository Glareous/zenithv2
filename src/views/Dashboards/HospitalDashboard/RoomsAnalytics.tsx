'use client'

import React from 'react'

import Image from 'next/image'
import Link from 'next/link'

import emergencyRoom from '@assets/images/dashboards/hospital/emergency-room.png'
import hospitalBedImg from '@assets/images/dashboards/hospital/hospital-bed.png'
import hospital from '@assets/images/dashboards/hospital/hospital.png'
import meeting from '@assets/images/dashboards/hospital/meeting.png'
import vip from '@assets/images/dashboards/hospital/vip.png'
import waitingArea from '@assets/images/dashboards/hospital/waiting-area.png'
import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
} from '@src/components/custom/dropdown/dropdown'
import { Ellipsis } from 'lucide-react'

const RoomsAnalytics = () => {
  return (
    <React.Fragment>
      <div className="col-span-12 lg:col-span-6 xl:col-span-4 card">
        <div className="flex items-center gap-3 card-header">
          <h6 className="card-title grow">Rooms Analytics Sessions</h6>
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
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 md:items-center md:flex-row">
              <Image src={vip} alt="vipImg" className="size-8 shrink-0" />
              <div className="grow">
                <h6>VIP Rooms</h6>
                <p className="text-gray-500 dark:text-dark-500">
                  Average usage of VIP Rooms
                </p>
              </div>
              <div className="md:ltr:text-right md:rtl:text-left shrink-0">
                <h6>36.7%</h6>
                <span className="text-green-500">this month</span>
              </div>
            </div>
            <div className="flex flex-col gap-3 md:items-center md:flex-row">
              <Image
                src={hospitalBedImg}
                alt="hospitalBedImg"
                className="size-8 shrink-0"
              />
              <div className="grow">
                <h6>Private Rooms</h6>
                <p className="text-gray-500 dark:text-dark-500">
                  Average usage of Private Rooms
                </p>
              </div>
              <div className="md:ltr:text-right md:rtl:text-left shrink-0">
                <h6>61.6%</h6>
                <span className="text-green-500">this month</span>
              </div>
            </div>
            <div className="flex flex-col gap-3 md:items-center md:flex-row">
              <Image
                src={hospital}
                alt="hospitalImg"
                className="size-8 shrink-0"
              />
              <div className="grow">
                <h6>General Rooms</h6>
                <p className="text-gray-500 dark:text-dark-500">
                  Average usage of General Rooms
                </p>
              </div>
              <div className="md:ltr:text-right md:rtl:text-left shrink-0">
                <h6>77.9%</h6>
                <span className="text-green-500">this month</span>
              </div>
            </div>
            <div className="flex flex-col gap-3 md:items-center md:flex-row">
              <Image
                src={emergencyRoom}
                alt="emergencyRoom"
                className="size-8 shrink-0"
              />
              <div className="grow">
                <h6>ICU Rooms</h6>
                <p className="text-gray-500 dark:text-dark-500">
                  Average usage of ICU Rooms
                </p>
              </div>
              <div className="md:ltr:text-right md:rtl:text-left shrink-0">
                <h6>24.1%</h6>
                <span className="text-green-500">this month</span>
              </div>
            </div>
            <div className="flex flex-col gap-3 md:items-center md:flex-row">
              <Image
                src={waitingArea}
                alt="waitingArea"
                className="size-8 shrink-0"
              />
              <div className="grow">
                <h6>Waiting Area</h6>
                <p className="text-gray-500 dark:text-dark-500">
                  Average usage of Waiting Area
                </p>
              </div>
              <div className="md:ltr:text-right md:rtl:text-left shrink-0">
                <h6>89.4%</h6>
                <span className="text-green-500">this month</span>
              </div>
            </div>
            <div className="flex flex-col gap-3 md:items-center md:flex-row">
              <Image src={meeting} alt="meeting" className="size-8 shrink-0" />
              <div className="grow">
                <h6>Staff Rooms</h6>
                <p className="text-gray-500 dark:text-dark-500">
                  Average usage of Staff Rooms
                </p>
              </div>
              <div className="md:ltr:text-right md:rtl:text-left shrink-0">
                <h6>99.9%</h6>
                <span className="text-green-500">this month</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}
export default RoomsAnalytics
