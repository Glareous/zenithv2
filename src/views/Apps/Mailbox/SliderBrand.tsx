'use client'

import React, { useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import img6 from '@assets/images/brands/img-06.png'
import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
} from '@src/components/custom/dropdown/dropdown'
// Correct import
import { Modal } from '@src/components/custom/modal/modal'
import { Email } from '@src/dtos'
import { Ellipsis, RotateCcw, Search } from 'lucide-react'
import SimpleBar from 'simplebar-react'

import Emails from './Emails'

interface Sidemail {
  show: boolean
  handleShowMail: (id: number) => void
  filteredEmails: Email[]
}
const SliderBrand = ({ show, handleShowMail, filteredEmails }: Sidemail) => {
  const [open, setOpen] = useState(false)
  const [searchTerms, setSearchTerms] = useState('')
  const [visibleItems, setVisibleItems] = useState([
    { id: 1, text: 'Chat Management', isVisible: true },
    { id: 2, text: 'Projects Discuss', isVisible: true },
    { id: 3, text: 'Subscriber', isVisible: true },
    { id: 4, text: 'Reports', isVisible: true },
  ])
  const router = useRouter() // Use useRouter from 'next/router'

  const handleClick = (e: { preventDefault: () => void }) => {
    e.preventDefault()
    // Use router.reload() to reload the page
    router.refresh()
  }

  const handleOpenModal = () => {
    setOpen(true)
  }
  const handleCloseModal = () => {
    setOpen(false)
  }

  const handleSearchChange = (e: {
    target: { value: React.SetStateAction<string> }
  }) => {
    setSearchTerms(e.target.value)
  }

  const handleItemClose = (id: number, onClose: () => void) => {
    setVisibleItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, isVisible: false } : item
      )
    )
    onClose()
  }

  return (
    <React.Fragment>
      <div
        className={`xl:rounded-none xl:border-x-0 card grow ${
          show === true ? 'w-full xl:max-w-md' : 'w-full'
        }`}>
        <div className="card-body">
          <SimpleBar>
            <div className="flex gap-4 *:shrink-0">
              <Link
                href="#!"
                className="block w-24 p-2 text-center transition duration-300 ease-linear rounded-md hover:bg-gray-50 dark:hover:bg-dark-850">
                <div className="relative flex items-center justify-center mx-auto mb-1 text-lg font-semibold text-gray-500 bg-white border border-gray-200 rounded-full dark:bg-dark-900 dark:text-dark-500 dark:border-dark-800 size-12">
                  S
                  <span className="absolute flex items-center justify-center !p-0 rounded-full !text-11 -bottom-0.5 -right-0.5 !border-2 !border-white size-5 badge dark:!border-dark-900 badge-solid-primary">
                    5
                  </span>
                </div>
                <h6 className="font-medium truncate">Jason Statham</h6>
              </Link>
              <Link
                href="#!"
                className="block w-24 p-2 text-center transition duration-300 ease-linear rounded-md hover:bg-gray-50 dark:hover:bg-dark-850">
                <div className="relative flex items-center justify-center mx-auto mb-1 text-lg font-semibold text-gray-500 bg-white border border-gray-200 rounded-full dark:bg-dark-900 dark:text-dark-500 dark:border-dark-800 size-12">
                  <Image
                    src={img6}
                    alt="brandImg"
                    className="size-6"
                    width={24}
                    height={24}
                  />
                </div>
                <h6 className="font-medium truncate">Windows Social Media</h6>
              </Link>
              {/* More Link items omitted for brevity */}
            </div>
          </SimpleBar>

          <div className="mt-3">
            <div className="flex items-center gap-2 mb-4">
              <div className="input-check-group shrink-0"></div>
              <h6 className="grow">
                Main Inbox
                <small className="font-normal text-gray-500 ltr:ml-1 rtl:mt-1 dark:text-dark-500 text-14">
                  46 messages
                </small>
              </h6>
              <div className="flex items-center gap-4 shrink-0">
                <Dropdown
                  position=""
                  trigger="click"
                  dropdownClassName="dropdown">
                  <DropdownButton colorClass="flex items-center text-gray-500 dark:text-dark-500">
                    <Ellipsis className="size-5"></Ellipsis>
                  </DropdownButton>
                  <DropdownMenu>
                    <Link href="#!" className="dropdown-item">
                      <span>Show more messages</span>
                    </Link>
                    <Link href="#!" className="dropdown-item">
                      <span>Hide section when empty</span>
                    </Link>
                    <Link href="#!" className="dropdown-item">
                      <span>Manage Inbox settings</span>
                    </Link>
                    <Link href="#!" className="dropdown-item">
                      <span>Mark all as read</span>
                    </Link>
                  </DropdownMenu>
                </Dropdown>
                <Link
                  href="#!"
                  className="link link-primary"
                  onClick={handleClick}>
                  <RotateCcw className="size-4"></RotateCcw>
                </Link>
                <Link
                  href="#!"
                  className="link link-primary"
                  onClick={() => handleOpenModal()}>
                  <Search className="size-4"></Search>
                </Link>
              </div>
            </div>

            {/* mails */}
            <Emails
              filteredEmails={filteredEmails.map((email) => ({
                ...email,
                id: email.id.toString(),
                avatarImage:
                  typeof email.avatarImage === 'string'
                    ? email.avatarImage
                    : undefined,
                type: email.type, // Ensure the 'type' property is included
              }))}
              handleShowMail={(email) => handleShowMail(Number(email.id))}
            />
          </div>
        </div>
      </div>

      {/* <!-- search modals --> */}
      <Modal
        isOpen={open}
        onClose={() => handleCloseModal()}
        position="modal-top"
        id="searchMailModals"
        contentClass="!overflow-y-visible modal-content"
        content={(onClose) => (
          <div className="relative group/form grow">
            <input
              type="email"
              className="ltr:pl-9 rtl:pr-9 form-input ltr:group-[&.right]/form:pr-9 rtl:group-[&.right]/form:pl-9 ltr:group-[&.right]/form:pl-4 rtl:group-[&.right]/form:pr-4"
              placeholder="Search anythings ..."
              value={searchTerms}
              onChange={handleSearchChange}
            />
            <button className="absolute inset-y-0 flex items-center ltr:left-3 rtl:right-3 ltr:group-[&.right]/form:right-3 rtl:group-[&.right]/form:left-3 ltr:group-[&.right]/form:left-auto rtl:group-[&.right]/form:right-auto focus:outline-hidden">
              <Search className="text-gray-500 dark:text-dark-500 size-4 fill-gray-100 dark:fill-dark-850"></Search>
            </button>
            {searchTerms && (
              <div className="absolute inset-x-0 bg-white border border-gray-200 rounded-md top-full dark:bg-dark-900 dark:border-dark-800">
                <div className="p-5 max-h-72 ">
                  <p className="mb-2 text-sm text-gray-500 dark:text-dark-500">
                    Last Search
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {visibleItems.map(
                      (item) =>
                        item.isVisible && (
                          <span key={item.id} className="badge badge-gray">
                            {item.text}
                            <Link
                              href="#"
                              onClick={() => handleItemClose(item.id, onClose)}>
                              <i className="ml-1 align-middle ri-close-fill"></i>
                            </Link>
                          </span>
                        )
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      />
    </React.Fragment>
  )
}

export default SliderBrand
