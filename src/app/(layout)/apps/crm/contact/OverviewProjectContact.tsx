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
  Mail,
  MapPin,
  Phone,
  User,
} from 'lucide-react'

const DEFAULT_AVATAR = '/assets/images/user-avatar.jpg'

interface OverviewProjectContactProps {
  isOpen: boolean
  onClose: () => void
  contactId: string | null
  projectId: string
}

export const OverviewProjectContact: React.FC<OverviewProjectContactProps> = ({
  isOpen,
  onClose,
  contactId,
  projectId,
}) => {
  const { data: contactData, isLoading } = api.projectContact.getById.useQuery(
    { id: contactId! },
    { enabled: !!contactId && isOpen }
  )

  const getFirstImage = (contact: any) => {
    return contact.files?.[0]?.s3Url || contact.imageUrl || DEFAULT_AVATAR
  }

  const formatDate = (date: Date | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString()
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'CUSTOMER':
        return 'badge badge-green'
      case 'PERSONAL':
        return 'badge badge-primary'
      case 'EMPLOYEE':
        return 'badge badge-purple'
      case 'MARKETING':
        return 'badge badge-orange'
      default:
        return 'badge badge-gray'
    }
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

  if (!contactData) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        position="modal-center"
        contentClass="p-2"
        content={
          <div className="flex items-center justify-center p-8">
            <p className="text-gray-500">Contact not found</p>
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
                  src={getFirstImage(contactData)}
                  alt={contactData.name}
                  width={94}
                  height={94}
                  className="object-cover w-full h-full rounded-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4 mt-5">
              <div className="col-span-12">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {contactData.name}
                </h3>
                <span className={getStatusClass(contactData.status)}>
                  {contactData.status}
                </span>
              </div>

              <div className="col-span-12">
                <label className="form-label">Email</label>
                <div className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-md dark:bg-dark-850 dark:border-dark-800">
                  <Mail className="w-4 h-4 text-gray-400 mr-3" />
                  {contactData.email ? (
                    <Link
                      href={`mailto:${contactData.email}`}
                      className="text-gray-700 dark:text-gray-300 hover:text-primary">
                      {contactData.email}
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
                  {contactData.phoneNumber ? (
                    <Link
                      href={`tel:${contactData.phoneNumber}`}
                      className="text-gray-700 dark:text-gray-300 hover:text-primary">
                      {contactData.phoneNumber}
                    </Link>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">
                      No phone provided
                    </span>
                  )}
                </div>
              </div>

              <div className="col-span-12">
                <label className="form-label">Website</label>
                <div className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-md dark:bg-dark-850 dark:border-dark-800">
                  <Globe className="w-4 h-4 text-gray-400 mr-3" />
                  {contactData.website ? (
                    <Link
                      href={contactData.website}
                      target="_blank"
                      className="text-gray-700 dark:text-gray-300 hover:text-primary">
                      {contactData.website}
                    </Link>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">
                      No website provided
                    </span>
                  )}
                </div>
              </div>

              <div className="col-span-6">
                <label className="form-label">Company Name</label>
                <div className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-md dark:bg-dark-850 dark:border-dark-800">
                  <Building className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {contactData.companyName || 'Not specified'}
                  </span>
                </div>
              </div>

              <div className="col-span-6">
                <label className="form-label">Role</label>
                <div className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-md dark:bg-dark-850 dark:border-dark-800">
                  <BriefcaseBusiness className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {contactData.role || 'Not specified'}
                  </span>
                </div>
              </div>

              <div className="col-span-6">
                <label className="form-label">Created Date</label>
                <div className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-md dark:bg-dark-850 dark:border-dark-800">
                  <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {formatDate(contactData.createdAt)}
                  </span>
                </div>
              </div>

              <div className="col-span-6">
                <label className="form-label">Last Updated</label>
                <div className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-md dark:bg-dark-850 dark:border-dark-800">
                  <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {formatDate(contactData.updatedAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end col-span-12 gap-2 mt-5">
                <button
                  type="button"
                  className="btn btn-outline-red"
                  onClick={onClose}>
                  <span className="align-baseline">Closed</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    />
  )
}

export default OverviewProjectContact
