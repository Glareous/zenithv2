'use client'

import React from 'react'

import Image from 'next/image'

import { Modal } from '@src/components/custom/modal/modal'
import { OverviewCustomerProps } from '@src/dtos/apps/ecommerce'

type CustomerData = {
  id: string
  name: string
  email: string | null
  phoneNumber: string | null
  subscriber: boolean
  gender: string | null
  location: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  files: Array<{
    id: string
    s3Url: string
    fileType: string
  }>
  _count: {
    orders: number
  }
}

const OverviewCustomer: React.FC<OverviewCustomerProps> = ({
  currentCustomer = null,
  show,
  handleClose,
  handleEditMode,
}) => {
  const customer = currentCustomer as CustomerData | null

  const profileImage = customer?.files?.find(
    (file: { id: string; s3Url: string; fileType: string }) =>
      file.fileType === 'IMAGE'
  )?.s3Url

  const customerData = [
    {
      title: 'Name',
      subTitle: customer?.name || '-',
    },
    {
      title: 'Email',
      subTitle: customer?.email || '-',
    },
    {
      title: 'Phone Number',
      subTitle: customer?.phoneNumber || '-',
    },
    {
      title: 'Gender',
      subTitle: customer?.gender || '-',
    },
    {
      title: 'Location',
      subTitle: customer?.location || '-',
    },
    {
      title: 'Subscriber',
      subTitle: customer?.subscriber ? 'Yes' : 'No',
    },
    {
      title: 'Status',
      subTitle: customer?.isActive ? 'Active' : 'Inactive',
    },
    {
      title: 'Total Orders',
      subTitle: customer?._count?.orders?.toString() || '0',
    },
    {
      title: 'Created',
      subTitle: customer?.createdAt
        ? new Date(customer.createdAt).toLocaleDateString()
        : '-',
    },
    {
      title: 'Last Updated',
      subTitle: customer?.updatedAt
        ? new Date(customer.updatedAt).toLocaleDateString()
        : '-',
    },
  ]

  const handleOnEdite = (onclose: () => void) => {
    handleEditMode()
    onclose()
  }

  const DEFAULT_AVATAR = '/assets/images/user-avatar.jpg'

  return (
    <React.Fragment>
      <Modal
        isOpen={show}
        onClose={handleClose}
        position="modal-center"
        id="overviewCustomerModals"
        contentClass="modal-content p-0"
        content={(onClose) => (
          <>
            <div className="h-20 bg-gray-100 dark:bg-dark-850 rounded-t-md"></div>
            <div className="modal-content">
              <div className="relative inline-block -mt-16 rounded-full">
                <Image
                  src={profileImage || DEFAULT_AVATAR}
                  alt="userImg"
                  className="rounded-full size-24 object-cover"
                  height={96}
                  width={96}
                />
                <div
                  className={`absolute bottom-1.5 border-2 border-white dark:border-dark-900 rounded-full size-4 ltr:right-2 rtl:left-2 ${
                    customer?.isActive ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
              </div>
              <div className="mt-5">
                <div className="overflow-x-auto">
                  <table className="table flush">
                    <tbody>
                      {customerData &&
                        customerData.map((item, index) => {
                          return (
                            <tr className="*:!py-1.5" key={index}>
                              <th className="!border-0 w-40 font-medium text-gray-700 dark:text-gray-300">
                                {item.title}
                              </th>
                              <td className="text-gray-900 dark:text-gray-100">
                                {item.subTitle}
                              </td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-5">
                <button
                  type="button"
                  className="btn btn-outline-red"
                  onClick={onClose}>
                  Close
                </button>
              </div>
            </div>
          </>
        )}
      />
    </React.Fragment>
  )
}

export default OverviewCustomer
