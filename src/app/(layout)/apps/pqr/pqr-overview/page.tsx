'use client'

import React, { Suspense, useState } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import BreadCrumb from '@src/components/common/BreadCrumb'
import { Modal } from '@src/components/custom/modal/modal'
import { NextPageWithLayout } from '@src/dtos'
import { RootState } from '@src/slices/reducer'
import { api } from '@src/trpc/react'
import { CalendarCheck, Mail, MapPin, Pencil, Phone } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import Select from 'react-select'
import { toast } from 'react-toastify'
import { z } from 'zod'

const pqrSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Invalid email').min(1, 'Email is required'),
  city: z.string().min(1, 'City is required'),
  documentType: z.enum(['CC', 'CE', 'PASSPORT', 'NIT']),
  documentNumber: z.string().min(1, 'Document number is required'),
  message: z.string().min(1, 'Message is required'),
  status: z.enum(['PROCESSING', 'COMPLETED', 'FAILED']),
})

type PQRFormData = z.infer<typeof pqrSchema>

const documentTypeOptions = [
  { value: 'CC', label: 'CC - Citizenship Card' },
  { value: 'CE', label: 'CE - Foreign ID' },
  { value: 'PASSPORT', label: 'Passport' },
  { value: 'NIT', label: 'NIT - Tax ID' },
]

const statusOptions = [
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'FAILED', label: 'Failed' },
]

const PQROverviewContent = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pqrId = searchParams.get('id')
  const { currentProject } = useSelector((state: RootState) => state.Project)

  const [showEditModal, setShowEditModal] = useState(false)

  const {
    data: pqr,
    isLoading,
    refetch,
  } = api.projectPQR.getById.useQuery(
    { id: pqrId || '' },
    { enabled: !!pqrId }
  )

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PQRFormData>({
    resolver: zodResolver(pqrSchema),
  })

  const updateMutation = api.projectPQR.update.useMutation({
    onSuccess: () => {
      toast.success('PQR updated successfully')
      refetch()
      closeModal()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update PQR')
    },
  })

  const handleEdit = () => {
    if (pqr) {
      reset({
        firstName: pqr.firstName,
        lastName: pqr.lastName,
        phone: pqr.phone,
        email: pqr.email,
        city: pqr.city,
        documentType: pqr.documentType as 'CC' | 'CE' | 'PASSPORT' | 'NIT',
        documentNumber: pqr.documentNumber,
        message: pqr.message,
      })
      setShowEditModal(true)
    }
  }

  const closeModal = () => {
    setShowEditModal(false)
    reset()
  }

  const onSubmit = async (data: PQRFormData) => {
    if (!pqrId) return

    try {
      await updateMutation.mutateAsync({
        id: pqrId,
        ...data,
      })
    } catch (error) {
      console.error('Submit error:', error)
    }
  }

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Please select a project first</p>
      </div>
    )
  }

  if (!pqrId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">No PQR selected</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading PQR data...</p>
      </div>
    )
  }

  if (!pqr) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">PQR not found</p>
      </div>
    )
  }

  return (
    <React.Fragment>
      <BreadCrumb title="Overview" subTitle="PQR Details" />
      <div className="col-span-12 xl:col-span-8 2xl:col-span-9 xl:row-span-3">
        <div className="card">
          <div className="card-body">
            <div className="relative gap-4 mb-5 md:flex">
              {/* Avatar with initials */}
              <div className="flex items-center justify-center rounded-md size-36 shrink-0 bg-gradient-to-br from-blue-500 to-blue-600">
                <span className="text-5xl font-bold text-white">
                  {pqr.firstName.charAt(0)}
                  {pqr.lastName.charAt(0)}
                </span>
              </div>

              <div className="mt-5 grow md:mt-0">
                <h6 className="mb-2">
                  {pqr.firstName} {pqr.lastName}
                </h6>
                <div className="flex flex-wrap gap-3 mb-2 whitespace-nowrap item-center">
                  {pqr.city && (
                    <p className="text-gray-500 dark:text-dark-500">
                      <MapPin className="inline-block size-4 fill-gray-100 dark:fill-dark-850 mr-1" />
                      <span className="align-bottom">{pqr.city}</span>
                    </p>
                  )}
                  {pqr.createdAt && (
                    <p className="text-gray-500 dark:text-dark-500">
                      <CalendarCheck className="inline-block size-4 fill-gray-100 dark:fill-dark-850 mr-1" />
                      <span className="align-bottom">
                        {new Date(pqr.createdAt).toLocaleDateString()}
                      </span>
                    </p>
                  )}
                </div>
                {pqr.phone && (
                  <p className="mb-2 text-gray-500 dark:text-dark-500">
                    <Phone className="inline-block size-4 fill-gray-100 dark:fill-dark-850 mr-1" />
                    <span className="align-bottom">{pqr.phone}</span>
                  </p>
                )}
                {pqr.email && (
                  <p className="mb-3 text-gray-500 dark:text-dark-500">
                    <Mail className="inline-block size-4 mr-1" />
                    <span className="align-bottom">{pqr.email}</span>
                  </p>
                )}
                <div className="flex gap-2 item-center">
                  <span className="badge badge-primary">
                    {pqr.documentType}
                  </span>
                  <span className="badge badge-secondary">
                    {pqr.documentNumber}
                  </span>
                  <span
                    className={`badge ${pqr.status === 'COMPLETED'
                      ? 'badge-sub-green'
                      : pqr.status === 'FAILED'
                        ? 'badge-sub-red'
                        : 'badge-sub-yellow'
                      }`}>
                    {pqr.status === 'COMPLETED'
                      ? 'Completed'
                      : pqr.status === 'FAILED'
                        ? 'Failed'
                        : 'Processing'}
                  </span>
                </div>
              </div>
              <div className="absolute top-0 shrink-0 ltr:right-0 rtl:left-0">
                <button
                  onClick={handleEdit}
                  className="btn btn-sub-gray btn-icon">
                  <Pencil className="size-4" />
                </button>
              </div>
            </div>

            <div className="my-5 flex flex-col gap-5 flex-wrap">
              {/* First Row */}
              <div className="flex flex-wrap gap-y-5">
                <div className="w-[130px] md:w-[200px] flex-shrink-0">
                  <p className="mb-1 text-gray-500 dark:text-dark-500">
                    First Name
                  </p>
                  <h6>{pqr.firstName}</h6>
                </div>
                <div className="w-[130px] md:w-[200px] flex-shrink-0">
                  <p className="mb-1 text-gray-500 dark:text-dark-500">
                    Last Name
                  </p>
                  <h6>{pqr.lastName}</h6>
                </div>
                <div className="w-[130px] md:w-[200px] flex-shrink-0">
                  <p className="mb-1 text-gray-500 dark:text-dark-500">
                    Document Type
                  </p>
                  <h6>{pqr.documentType}</h6>
                </div>
                <div className="w-[130px] md:w-[200px] flex-shrink-0">
                  <p className="mb-1 text-gray-500 dark:text-dark-500">
                    Document Number
                  </p>
                  <h6>{pqr.documentNumber}</h6>
                </div>
              </div>

              {/* Second Row */}
              <div className="flex flex-wrap gap-y-5">
                <div className="w-[130px] md:w-[200px] flex-shrink-0">
                  <p className="mb-1 text-gray-500 dark:text-dark-500">Email</p>
                  <h6>{pqr.email}</h6>
                </div>
                <div className="w-[130px] md:w-[200px] flex-shrink-0">
                  <p className="mb-1 text-gray-500 dark:text-dark-500">Phone</p>
                  <h6>{pqr.phone}</h6>
                </div>
                <div className="w-[130px] md:w-[200px] flex-shrink-0">
                  <p className="mb-1 text-gray-500 dark:text-dark-500">City</p>
                  <h6>{pqr.city}</h6>
                </div>
                <div className="w-[130px] md:w-[200px] flex-shrink-0">
                  <p className="mb-1 text-gray-500 dark:text-dark-500">
                    Created Date
                  </p>
                  <h6>{new Date(pqr.createdAt).toLocaleDateString()}</h6>
                </div>
              </div>

              {/* Message Section */}
              <div className="flex flex-wrap gap-y-5">
                <div className="w-full">
                  <p className="mb-2 text-gray-500 dark:text-dark-500">
                    Message
                  </p>
                  <div className="p-4 bg-gray-50 dark:bg-dark-850 rounded-lg">
                    <p className="whitespace-pre-wrap">{pqr.message}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Analysis Section - Only show when status is COMPLETED and analysis exists */}
        {pqr.status === 'COMPLETED' && pqr.analysis && (
          <div className="card">
            <div className="card-body space-y-5">
              <div className="space-y-3">
                <h5>Analysis</h5>
                <p className="text-gray-600 dark:text-gray-400">
                  {pqr.analysis.analysis.split('\n')[0]}
                </p>
              </div>

              {/* Analysis Table - Real Data */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs uppercase bg-gray-50 dark:bg-dark-850">
                    <tr>
                      <th className="px-3 py-3 text-center">Type</th>
                      <th className="px-3 py-3 text-center">Priority</th>
                      <th className="px-3 py-3 text-center">Risk</th>
                      <th className="px-3 py-3 text-center">SLA</th>
                      <th className="px-3 py-3 text-center">Sentiment</th>
                      <th className="px-3 py-3 text-center">Emotion</th>
                      <th className="px-3 py-3 text-center">Topic</th>
                      {pqr.analysis.pts && (
                        <th className="px-3 py-3 text-center">PTS</th>
                      )}
                      <th className="px-3 py-3 text-center">Override</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-gray-200 dark:border-dark-700">
                      <td className="px-3 py-4 text-center">
                        <span
                          className={`badge ${pqr.analysis.type === 'COMPLAINT'
                            ? 'badge-danger'
                            : pqr.analysis.type === 'CLAIM'
                              ? 'badge-warning'
                              : 'badge-primary'
                            }`}>
                          {pqr.analysis.type}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-center">
                        <span
                          className={`badge ${pqr.analysis.priority === 'CRITICAL' ||
                            pqr.analysis.priority === 'HIGH'
                            ? 'badge-danger'
                            : pqr.analysis.priority === 'MEDIUM'
                              ? 'badge-warning'
                              : 'badge-success'
                            }`}>
                          {pqr.analysis.priority}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className={`font-semibold ${parseInt(pqr.analysis.risk) >= 75
                              ? 'text-red-600'
                              : parseInt(pqr.analysis.risk) >= 50
                                ? 'text-orange-600'
                                : parseInt(pqr.analysis.risk) >= 25
                                  ? 'text-yellow-600'
                                  : 'text-green-600'
                              }`}>
                            {pqr.analysis.risk}
                          </span>
                          <div className="w-20 h-2 bg-gray-200 rounded-full dark:bg-dark-700">
                            <div
                              className={`h-2 rounded-full ${parseInt(pqr.analysis.risk) >= 75
                                ? 'bg-red-600'
                                : parseInt(pqr.analysis.risk) >= 50
                                  ? 'bg-orange-600'
                                  : parseInt(pqr.analysis.risk) >= 25
                                    ? 'bg-yellow-600'
                                    : 'bg-green-600'
                                }`}
                              style={{
                                width: pqr.analysis.risk,
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-center">
                        <span
                          className={`badge ${pqr.analysis.sla === 'BREACHED'
                            ? 'badge-danger'
                            : pqr.analysis.sla === 'AT_RISK'
                              ? 'badge-warning'
                              : 'badge-success'
                            }`}>
                          {pqr.analysis.sla}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-center">
                        <span
                          className={`badge ${pqr.analysis.sentiment === 'NEGATIVE'
                            ? 'badge-danger'
                            : pqr.analysis.sentiment === 'NEUTRAL'
                              ? 'badge-secondary'
                              : 'badge-success'
                            }`}>
                          {pqr.analysis.sentiment}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-center">
                        <span className="badge badge-secondary">
                          {pqr.analysis.emotion}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-center font-medium">
                        {pqr.analysis.topic}
                      </td>
                      {pqr.analysis.pts && (
                        <td className="px-3 py-4 text-center">
                          <span className="">{pqr.analysis.pts}</span>
                        </td>
                      )}
                      <td className="px-3 py-4 text-center">
                        <span
                          className={`badge ${pqr.analysis.override
                            ? 'badge-warning'
                            : 'badge-success'
                            }`}>
                          {pqr.analysis.override ? 'Yes' : 'No'}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Keywords Section */}
              {pqr.analysis.keywords && (
                <div className="flex items-start gap-3">
                  <span className="font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    Keywords:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {pqr.analysis.keywords
                      .split(',')
                      .map((keyword, index) => (
                        <span
                          key={index}
                          className="badge badge-secondary badge-sm">
                          {keyword.trim()}
                        </span>
                      ))}
                  </div>
                </div>
              )}

              {/* Full Analysis Text */}
              <div className="mt-4">
                <h6 className="mb-2 text-gray-700 dark:text-gray-300">
                  Detailed Analysis
                </h6>
                <div className="p-4 bg-gray-50 dark:bg-dark-850 rounded-lg">
                  <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {pqr.analysis.analysis}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={closeModal}
        id="pqrEditModal"
        position="modal-center"
        size="modal-xl"
        title="Edit PQR"
        content={
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-4">
              {/* First Name */}
              <div className="mb-4">
                <label
                  htmlFor="firstName"
                  className="block mb-2 text-sm font-medium">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  {...register('firstName')}
                  className={`form-input ${errors.firstName ? 'border-red-500' : ''}`}
                  placeholder="Enter first name"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div className="mb-4">
                <label
                  htmlFor="lastName"
                  className="block mb-2 text-sm font-medium">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  {...register('lastName')}
                  className={`form-input ${errors.lastName ? 'border-red-500' : ''}`}
                  placeholder="Enter last name"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.lastName.message}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="mb-4">
                <label
                  htmlFor="phone"
                  className="block mb-2 text-sm font-medium">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="phone"
                  {...register('phone')}
                  className={`form-input ${errors.phone ? 'border-red-500' : ''}`}
                  placeholder="Enter phone number"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  {...register('email')}
                  className={`form-input ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="Enter email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* City */}
              <div className="mb-4">
                <label
                  htmlFor="city"
                  className="block mb-2 text-sm font-medium">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="city"
                  {...register('city')}
                  className={`form-input ${errors.city ? 'border-red-500' : ''}`}
                  placeholder="Enter city"
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.city.message}
                  </p>
                )}
              </div>

              {/* Document Type */}
              <div className="mb-4">
                <label
                  htmlFor="documentType"
                  className="block mb-2 text-sm font-medium">
                  Document Type <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="documentType"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={documentTypeOptions}
                      value={documentTypeOptions.find(
                        (opt) => opt.value === field.value
                      )}
                      onChange={(option) => field.onChange(option?.value)}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      placeholder="Select document type..."
                    />
                  )}
                />
                {errors.documentType && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.documentType.message}
                  </p>
                )}
              </div>

              {/* Document Number */}
              <div className="mb-4">
                <label
                  htmlFor="documentNumber"
                  className="block mb-2 text-sm font-medium">
                  Document Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="documentNumber"
                  {...register('documentNumber')}
                  className={`form-input ${errors.documentNumber ? 'border-red-500' : ''}`}
                  placeholder="Enter document number"
                />
                {errors.documentNumber && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.documentNumber.message}
                  </p>
                )}
              </div>

              {/* Status */}
              <div className="mb-4">
                <label
                  htmlFor="status"
                  className="block mb-2 text-sm font-medium">
                  Status <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={statusOptions}
                      value={statusOptions.find((opt) => opt.value === field.value)}
                      onChange={(option) => field.onChange(option?.value)}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      placeholder="Select status..."
                    />
                  )}
                />
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.status.message}
                  </p>
                )}
              </div>

              {/* Message */}
              <div className="mb-4 col-span-2">
                <label
                  htmlFor="message"
                  className="block mb-2 text-sm font-medium">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  {...register('message')}
                  rows={4}
                  className={`form-input ${errors.message ? 'border-red-500' : ''}`}
                  placeholder="Enter your request, complaint or claim"
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.message.message}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={closeModal}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || updateMutation.isPending}>
                {isSubmitting || updateMutation.isPending
                  ? 'Saving...'
                  : 'Update PQR'}
              </button>
            </div>
          </form>
        }
      />
    </React.Fragment>
  )
}

const PQROverviewPage: NextPageWithLayout = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-500">Loading...</p>
        </div>
      }>
      <PQROverviewContent />
    </Suspense>
  )
}

export default PQROverviewPage
