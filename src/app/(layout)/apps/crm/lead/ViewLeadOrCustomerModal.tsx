'use client'

import React from 'react'

import Image from 'next/image'
import Link from 'next/link'

import { Modal } from '@src/components/custom/modal/modal'
import { api } from '@src/trpc/react'
import {
  BriefcaseBusiness,
  Building,
  Calendar,
  Globe,
  Link as LinkIcon,
  Mail,
  MapPin,
  Phone,
  User,
} from 'lucide-react'

const DEFAULT_AVATAR = '/assets/images/user-avatar.jpg'

interface ViewLeadOrCustomerModalProps {
  isOpen: boolean
  onClose: () => void
  itemId: string | null
  itemType: 'lead' | 'customer'
  projectId: string
}

export const ViewLeadOrCustomerModal: React.FC<
  ViewLeadOrCustomerModalProps
> = ({ isOpen, onClose, itemId, itemType, projectId }) => {
  const { data: leadData, isLoading: leadLoading } =
    api.projectLead.getById.useQuery(
      { id: itemId! },
      { enabled: !!itemId && isOpen && itemType === 'lead' }
    )

  const { data: customerData, isLoading: customerLoading } =
    api.projectCustomer.getById.useQuery(
      { id: itemId! },
      { enabled: !!itemId && isOpen && itemType === 'customer' }
    )

  const itemData = itemType === 'lead' ? leadData : customerData
  const isLoading = itemType === 'lead' ? leadLoading : customerLoading

  const leadDataTyped = itemData as any
  const customerDataTyped = itemData as any

  const getFirstImage = (item: any) => {
    const profileImage = item.files?.find(
      (file: any) => file.fileType === 'IMAGE'
    )?.s3Url

    if (profileImage && !profileImage.includes('undefined')) {
      return profileImage
    }

    if (item.imageUrl && !item.imageUrl.includes('undefined')) {
      return item.imageUrl
    }

    return DEFAULT_AVATAR
  }

  const formatDate = (date: Date | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString()
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'badge badge-sky'
      case 'HOT':
        return 'badge badge-red'
      case 'CONVERTED_TO_CUSTOMER':
        return 'badge badge-green'
      case 'LOST':
        return 'badge badge-purple'
      default:
        return 'badge badge-gray'
    }
  }

  const renderLeadSourceIndicator = (item: any) => {
    if (itemType === 'customer') {
      if (item.origin === 'FROM_CONTACT') {
        return (
          <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">
            <LinkIcon className="size-3" />
            <span>From Contact</span>
          </div>
        )
      } else {
        return (
          <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
            <User className="size-3" />
            <span>From Customer</span>
          </div>
        )
      }
    }

    if (item.contactId) {
      return (
        <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">
          <LinkIcon className="size-3" />
          <span>From Contact</span>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-full">
        <User className="size-3" />
        <span>Direct Lead</span>
      </div>
    )
  }

  if (isLoading) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        position="modal-center"
        contentClass="p-2"
        content={
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        }
      />
    )
  }

  if (!itemData) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        position="modal-center"
        contentClass="p-2"
        content={
          <div className="flex items-center justify-center p-8">
            <p className="text-gray-500">
              {itemType === 'lead' ? 'Lead' : 'Customer'} not found
            </p>
          </div>
        }
      />
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      position="modal-center"
      contentClass="p-2"
      content={() => (
        <div>
          <div className="h-24 p-5 rounded-t bg-gradient-to-r from-primary-500/20 via-pink-500/20 to-green-500/20"></div>

          <div className="p-4">
            <div className="-mt-16">
              <div className="inline-flex items-center justify-center overflow-visible bg-gray-100 border border-gray-200 rounded-full dark:bg-dark-850 dark:border-dark-800 size-24">
                <Image
                  src={getFirstImage(itemData)}
                  alt={itemData.name}
                  width={94}
                  height={94}
                  className="object-cover w-full h-full rounded-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4 mt-5">
              <div className="col-span-12">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {itemData.name}
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  {itemType === 'lead' && (
                    <span className={getStatusClass(leadDataTyped.status)}>
                      {leadDataTyped.status === 'CONVERTED_TO_CUSTOMER'
                        ? 'CONVERTED TO CUSTOMER'
                        : leadDataTyped.status}
                    </span>
                  )}
                  {renderLeadSourceIndicator(itemData)}
                </div>
              </div>

              <div className="col-span-12">
                <label className="form-label">Email</label>
                <div className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-md dark:bg-dark-850 dark:border-dark-800">
                  <Mail className="w-4 h-4 text-gray-400 mr-3" />
                  {itemData.email ? (
                    <Link
                      href={`mailto:${itemData.email}`}
                      className="text-gray-700 dark:text-gray-300 hover:text-primary">
                      {itemData.email}
                    </Link>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">
                      No email provided
                    </span>
                  )}
                </div>
              </div>

              <div className="col-span-12">
                <label className="form-label">Phone Number</label>
                <div className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-md dark:bg-dark-850 dark:border-dark-800">
                  <Phone className="w-4 h-4 text-gray-400 mr-3" />
                  {itemData.phoneNumber ? (
                    <Link
                      href={`tel:${itemData.phoneNumber}`}
                      className="text-gray-700 dark:text-gray-300 hover:text-primary">
                      {itemData.phoneNumber}
                    </Link>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">
                      No phone provided
                    </span>
                  )}
                </div>
              </div>

              {/* Campos específicos de customers */}
              {itemType === 'customer' && (
                <>
                  {customerDataTyped.role && (
                    <div className="col-span-6">
                      <label className="form-label">Role</label>
                      <div className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-md dark:bg-dark-850 dark:border-dark-800">
                        <BriefcaseBusiness className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {customerDataTyped.role}
                        </span>
                      </div>
                    </div>
                  )}

                  {customerDataTyped.website && (
                    <div className="col-span-6">
                      <label className="form-label">Website</label>
                      <div className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-md dark:bg-dark-850 dark:border-dark-800">
                        <Globe className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                        <Link
                          href={customerDataTyped.website}
                          target="_blank"
                          className="text-gray-700 dark:text-gray-300 hover:text-primary truncate"
                          title={customerDataTyped.website}>
                          {customerDataTyped.website}
                        </Link>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Campos específicos de leads */}
              {itemType === 'lead' && leadDataTyped.contact && (
                <div className="col-span-12">
                  <label className="form-label">Related Contact</label>
                  <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-md dark:bg-blue-900/20 dark:border-blue-800">
                    <User className="w-4 h-4 text-blue-400 mr-3" />
                    <span className="text-blue-700 dark:text-blue-300">
                      {leadDataTyped.contact.name} (
                      {leadDataTyped.contact.email})
                    </span>
                  </div>
                </div>
              )}

              <div className="col-span-6">
                <label className="form-label">Created Date</label>
                <div className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-md dark:bg-dark-850 dark:border-dark-800">
                  <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {formatDate(itemData.createdAt)}
                  </span>
                </div>
              </div>

              <div className="col-span-6">
                <label className="form-label">Last Updated</label>
                <div className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-md dark:bg-dark-850 dark:border-dark-800">
                  <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {formatDate(itemData.updatedAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end col-span-12 gap-2 mt-5">
                <button
                  type="button"
                  className="btn btn-outline-red"
                  onClick={onClose}>
                  <span className="align-baseline">Close</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    />
  )
}

export default ViewLeadOrCustomerModal
