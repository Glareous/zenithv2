'use client'

import React, { useState } from 'react'

import Link from 'next/link'

import CommonAccount from '@src/components/common/CommonAccount'
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownMenu,
} from '@src/components/custom/dropdown/dropdown'
import { Modal } from '@src/components/custom/modal/modal'
import TableContainer from '@src/components/custom/table/table'
import { Tab, Tabs } from '@src/components/custom/tabs/tab'
import { accountStatement } from '@src/data'
import { NextPageWithLayout } from '@src/dtos'
import {
  Activity,
  Bell,
  Gem,
  HandCoins,
  ListTree,
  LogOut,
  ShieldCheck,
  UserRound,
} from 'lucide-react'

interface ColumnItem {
  header: string
  accessorKey?: string
  enableSorting?: boolean
}

interface MenuItem {
  text: string
}

const data: MenuItem[] = [{ text: 'Date' }, { text: 'Rating' }]

const AccountStatements: NextPageWithLayout = () => {
  const [modalState, setModalState] = useState<{ [key: string]: boolean }>({
    withdraw1Modal: false,
  })

  const openModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: true }))
  const closeModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: false }))
  // Table
  const columns: ColumnItem[] = React.useMemo(
    () => [
      {
        header: 'ID',
        accessorKey: 'statementsID',
        enableSorting: true,
      },
      {
        header: 'Date',
        accessorKey: 'date',
        enableSorting: true,
      },
      {
        header: 'Name',
        accessorKey: 'name',
        enableSorting: true,
      },
      {
        header: 'Details',
        accessorKey: 'details',
        enableSorting: true,
      },
      {
        header: 'Amount',
        accessorKey: 'totalAmount',
        enableSorting: true,
      },
      {
        header: 'Download Invoice',
        enableSorting: true,
        cell: () => (
          <>
            <Link href="#!" className="btn btn-md btn-primary">
              <i className="align-bottom ri-download-2-line"></i> Download
            </Link>
          </>
        ),
      },
    ],
    []
  )

  const currentPage = 1
  const itemsPerPage = 10
  const showingStart = Math.min(
    (currentPage - 1) * itemsPerPage + 1,
    accountStatement.length
  )

  const showingEnd = Math.min(
    currentPage * itemsPerPage,
    accountStatement.length
  )

  return (
    <React.Fragment>
      <CommonAccount />

      {/* tab section */}
      <Tabs
        ulProps="pb-2 overflow-x-auto tabs-pills lg:pb-0"
        activeTabClass="active"
        contentProps="mt-5"
        otherClass="nav-item text-gray-500 dark:text-dark-500 [&.active]:bg-primary-500 [&.active]:text-primary-50"
        spanProps="align-middle whitespace-nowrap">
        <Tab
          icon={<UserRound className="inline-block size-4 ltr:mr-2 rtl:ml-2" />}
          label="Account"
          path="/page/account-settings"></Tab>
        <Tab
          icon={
            <ShieldCheck className="inline-block size-4 ltr:mr-2 rtl:ml-2" />
          }
          label="Security"
          path="/page/account-security"></Tab>
        <Tab
          icon={<Gem className="inline-block size-4 ltr:mr-2 rtl:ml-2" />}
          label="Billing & Plans"
          path="/page/account-billing-plan"></Tab>
        <Tab
          icon={<Bell className="inline-block size-4 ltr:mr-2 rtl:ml-2" />}
          label="Notification"
          path="/page/account-notification"></Tab>
        <Tab
          icon={<ListTree className="inline-block size-4 ltr:mr-2 rtl:ml-2" />}
          label="Statements"
          path="/page/account-statements">
          <>
            <div className="mt-5 card">
              <div className="card-header">
                <div className="flex flex-wrap items-center gap-3">
                  <h6 className="card-title grow">Earnings</h6>
                  <button
                    onClick={() => openModal('withdraw1Modal')}
                    className="btn btn-primary shrink-0">
                    Withdraw $5,879
                  </button>
                </div>
              </div>
              <div className="card-body">
                <p className="mb-3 text-gray-500 dark:text-dark-500">
                  Earnings calculated for the last
                  <span className="font-medium text-primary-500">30</span> days.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-3">
                  <div className="card">
                    <div className="text-center card-body">
                      <HandCoins className="mx-auto text-primary-500 fill-primary-100 size-6"></HandCoins>
                      <h6 className="mt-3 mb-1">$5,487</h6>
                      <p className="text-gray-500 dark:text-dark-500">
                        Net Earnings
                      </p>
                    </div>
                  </div>
                  <div className="card">
                    <div className="text-center card-body">
                      <Activity className="mx-auto text-red-500 fill-red-100 size-6"></Activity>
                      <h6 className="mt-3 mb-1">$296.81</h6>
                      <p className="text-gray-500 dark:text-dark-500">
                        Fees & Charges
                      </p>
                    </div>
                  </div>
                </div>

                {/* tables */}
                <div className="flex items-center gap-3 mb-5">
                  <h6 className="card-title grow">Statements</h6>

                  {/* dropdown */}
                  <Dropdown trigger="click">
                    <DropdownButton
                      colorClass="flex px-3 py-1.5 text-xs border-gray-200 dark:border-dark-800 link link-primary btn"
                      arrow={true}>
                      Filters
                    </DropdownButton>
                    <DropdownMenu>
                      <ul>
                        {data.map((item, idx: number) => (
                          <DropdownItem key={idx}>
                            <span>{item.text}</span>
                          </DropdownItem>
                        ))}
                      </ul>
                    </DropdownMenu>
                  </Dropdown>
                </div>

                <TableContainer
                  columns={columns || []}
                  data={accountStatement || []}
                  divClass="overflow-x-auto table-box"
                  tableClass="table whitespace-nowrap"
                  thtrClass="bg-gray-100 dark:bg-dark-850"
                  thClass="whitespace-nowrap !font-medium text-gray-500 dark:text-dark-500 cursor-pointer"
                  isPagination={true}
                  showingStart={showingStart}
                  showingEnd={showingEnd}
                  PaginationClassName="grid grid-cols-12 gap-5 mb-5 items-center"
                  lastTrClass="ltr:text-right rtl:text-left"
                />
              </div>
            </div>
          </>
        </Tab>
        <Tab
          icon={<LogOut className="inline-block size-4 ltr:mr-2 rtl:ml-2" />}
          label="Logs"
          path="/page/account-logs"></Tab>
      </Tabs>

      {/* modal */}
      <Modal
        isOpen={modalState.withdraw1Modal}
        id="withdraw1Modal"
        onClose={() => closeModal('withdraw1Modal')}
        position="modal-center"
        title="Withdraw"
        content={() => (
          <>
            <p className="mb-3 text-gray-500 dark:text-dark-500">
              What amount would you like to withdraw?
            </p>
            <div className="p-3 mb-4 text-center bg-gray-100 rounded-md dark:bg-dark-850">
              <h5>$5,879</h5>
            </div>
            <div className="flex justify-center h-16">
              <div id="soft-limit" className="w-full"></div>
            </div>
            <p className="mt-2 mb-3 text-gray-500 dark:text-dark-500">
              Please input the account where you&apos;d like to transfer the
              withdrawn amount.
            </p>
            <div className="mb-4">
              <label htmlFor="bankNameInput" className="form-label">
                Bank Name
              </label>
              <input
                type="text"
                id="bankNameInput"
                className="form-input"
                placeholder="Bank name"
                required
              />
            </div>
            <div className="mb-5">
              <label htmlFor="accountNumberInput" className="form-label">
                Account Number
              </label>
              <input
                type="text"
                id="accountNumberInput"
                className="form-input"
                placeholder="0000 0000 00000 000"
                required
              />
            </div>
            <div>
              <button
                type="submit"
                data-modal-target="withdraw2Modal"
                className="w-full btn btn-green">
                Proceed
              </button>
            </div>
          </>
        )}
      />
    </React.Fragment>
  )
}

export default AccountStatements
