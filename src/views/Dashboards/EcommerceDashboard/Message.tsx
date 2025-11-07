'use client'

import React from 'react'

import Image from 'next/image'
import Link from 'next/link'

import { Tab, Tabs } from '@src/components/custom/tabs/tab'
import allMessages from '@src/data/ecommerceDashboard/all-messages'
import newMessages from '@src/data/ecommerceDashboard/new-messages'
import { NextPageWithLayout } from '@src/dtos'

const Message: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <div className="order-last col-span-12 xl:col-span-6 2xl:col-span-4 card">
        <div className="flex items-center gap-3 card-header">
          <h6 className="card-title grow">My Message</h6>
          <Link
            href="#!"
            className="flex px-3 py-1.5 text-xs border-gray-200 font-medium dark:border-dark-800 link link-primary btn">
            <i className="ri-add-line ltr:mr-1 rtl:ml-1"></i> New Chat
          </Link>
        </div>
        <div className="card-body">
          <Tabs
            ulProps="tabs-pills *:grow bg-gray-100 rounded-md dark:bg-dark-850"
            otherClass="nav-item [&.active]:bg-primary-500 [&.active]:text-primary-50"
            activeTabClass="active"
            inactiveTabClass="text-gray-500 hover:text-primary-500 dark:text-dark-500 dark:hover:text-primary-500"
            contentProps="mt-4">
            <Tab label="New Message">
              <div className="flex flex-col gap-4">
                {newMessages.map((item, index) => {
                  return (
                    <Link key={index} href="#!" className="flex gap-3">
                      <div className="rounded-full size-10 shrink-0">
                        <Image
                          src={item.image}
                          alt="messageImg"
                          className="rounded-full"
                        />
                      </div>
                      <div className="overflow-hidden grow">
                        <h6 className="mb-0.5">{item.name}</h6>
                        <p className="text-xs text-gray-500 truncate dark:text-dark-500">
                          {item.description}
                        </p>
                      </div>
                      <p className="text-xs shrink-0">{item.time}</p>
                    </Link>
                  )
                })}
              </div>
            </Tab>
            <Tab label="All Message">
              <div className="flex flex-col gap-4">
                {allMessages.map((item, index) => {
                  return (
                    <Link key={index} href="#!" className="flex gap-3">
                      <div className="rounded-full size-10 shrink-0">
                        <Image
                          src={item.image}
                          alt="userImg"
                          className="rounded-full"
                        />
                      </div>
                      <div className="overflow-hidden grow">
                        <h6 className="mb-0.5">{item.name}</h6>
                        <p className="text-xs text-gray-500 truncate dark:text-dark-500">
                          {item.description}
                        </p>
                      </div>
                      <p className="text-xs shrink-0">{item.time}</p>
                    </Link>
                  )
                })}
              </div>
            </Tab>
          </Tabs>
        </div>
      </div>
    </React.Fragment>
  )
}
export default Message
