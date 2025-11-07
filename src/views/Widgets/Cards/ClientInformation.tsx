'use client'

import React from 'react'

import Image from 'next/image'
import Link from 'next/link'

import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
} from '@src/components/custom/dropdown/dropdown'
import { client } from '@src/data/index'
import { Ellipsis } from 'lucide-react'

const ClientInformation = () => {
  return (
    <React.Fragment>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-space">
        {client.map((person, index) => (
          <div className="card" key={index}>
            <div className="card-body">
              <div className="flex flex-wrap items-center gap-2">
                <Image
                  src={person.image}
                  alt={person.name}
                  className="rounded-md size-10 shrink-0"
                />
                <div className="grow">
                  <h6 className="mb-1">{person.name}</h6>
                  <p className="text-sm text-gray-500 dark:text-dark-500">
                    {person.role}
                  </p>
                </div>
                <h6 className="grow">{person.amount}</h6>
                <div className="grow">
                  <span className={`badge ${person.status.colorClass}`}>
                    {person.status.text}
                  </span>
                </div>

                <Dropdown trigger="click" dropdownClassName="dropdown">
                  <DropdownButton>
                    <Ellipsis className="size-5" />
                  </DropdownButton>
                  <DropdownMenu menuClass="dropdown-left">
                    <Link href="#!" className="dropdown-item">
                      <span>Overview</span>
                    </Link>

                    <Link href="#!" className="dropdown-item">
                      <span>Edit</span>
                    </Link>
                    <Link href="#!" className="dropdown-item">
                      <span>Delete</span>
                    </Link>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
          </div>
        ))}
      </div>
    </React.Fragment>
  )
}

export default ClientInformation
