'use client'

import React from 'react'

import Image from 'next/image'
import Link from 'next/link'

import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
} from '@src/components/custom/dropdown/dropdown'
import { ActiveProjectData } from '@src/data'
import { NextPageWithLayout } from '@src/dtos'
import { Ellipsis } from 'lucide-react'

const ActiveProjects: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <div className="order-6 col-span-12 xl:col-span-6 2xl:col-span-4 card">
        <div className="flex items-center gap-3 card-header">
          <h6 className="card-title grow">Active Projects</h6>
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
          <p className="mb-3 text-gray-500 dark:text-dark-500">
            Average 64% completed
          </p>
          <div className="flex flex-col gap-4">
            {ActiveProjectData.map((item, index) => {
              return (
                <div key={index} className="flex items-center gap-3">
                  <Image
                    src={item.image}
                    alt="projectImg"
                    className="size-8 shrink-0"
                  />
                  <div className="overflow-hidden grow">
                    <h6 className="truncate">{item.projectName}</h6>
                    <p className="text-gray-500 dark:text-dark-500">
                      {item.projectType}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="!w-20 grow progress-bar progress-1">
                      <div className={item.process}></div>
                    </div>
                    <h6 className="shrink-0">{item.Percent}</h6>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}
export default ActiveProjects
