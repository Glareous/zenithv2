'use client'

import React from 'react'

import Link from 'next/link'

import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
} from '@src/components/custom/dropdown/dropdown'
import { BaseDropdownProps, DropdownItems } from '@src/dtos/pages/ui'

const BaseDropdown: React.FC<BaseDropdownProps> = ({ data }) => {
  return (
    <React.Fragment>
      <Dropdown trigger="click" dropdownClassName="dropdown">
        <DropdownButton
          colorClass="flex items-center gap-2 btn-sub-gray btn"
          arrow={true}>
          Dropdown Options
        </DropdownButton>
        <DropdownMenu>
          {data.map((item) => (
            <Link href="#" className="dropdown-item" key={item.id}>
              <span className={item?.spantextColor}>{item.text}</span>
            </Link>
          ))}
        </DropdownMenu>
      </Dropdown>

      <Dropdown position="" trigger="click" dropdownClassName="dropdown">
        <DropdownButton colorClass="flex items-center gap-2" arrow={true}>
          Dropdown Link Options
        </DropdownButton>
        <DropdownMenu>
          {data.map((item: DropdownItems) => (
            <Link href="#" className="dropdown-item" key={item.id}>
              <span className={item?.spantextColor}>{item.text}</span>
            </Link>
          ))}
        </DropdownMenu>
      </Dropdown>
    </React.Fragment>
  )
}
export default BaseDropdown
