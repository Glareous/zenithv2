'use client'

import React, { Suspense, useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { Modal } from '@src/components/custom/modal/modal'
import { NextPageWithLayout } from '@src/dtos'
import { RootState } from '@src/slices/reducer'
import { api } from '@src/trpc/react'
import { Box, CalendarCheck, Mail, MapPin, Pencil, Phone } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'

const RrhhOverviewContent = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const employeeId = searchParams.get('id')
  const { currentProject } = useSelector((state: RootState) => state.Project)

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)

  const { data: employee, isLoading } = api.projectEmployee.getById.useQuery(
    { id: employeeId || '' },
    { enabled: !!employeeId }
  )

  const { data: histories, refetch: refetchHistories } =
    api.projectEmployeeHistory.getByEmployeeId.useQuery(
      { employeeId: employeeId || '' },
      { enabled: !!employeeId }
    )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
    },
  })

  const createHistoryMutation = api.projectEmployeeHistory.create.useMutation({
    onSuccess: () => {
      toast.success('History added successfully')
      refetchHistories()
      handleCloseHistoryModal()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add history')
    },
  })

  const handleOpenHistoryModal = () => {
    setIsHistoryModalOpen(true)
  }

  const handleCloseHistoryModal = () => {
    setIsHistoryModalOpen(false)
    reset()
  }

  const onSubmitHistory = (data: { title: string; description: string }) => {
    if (!employeeId) return
    createHistoryMutation.mutate({
      employeeId,
      title: data.title,
      description: data.description,
    })
  }

  const handleEdit = () => {
    if (employee) {
      localStorage.setItem('editEmployeeId', employee.id)
      router.push('/apps/rrhh/rrhh-admission')
    }
  }

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Please select a project first</p>
      </div>
    )
  }

  if (!employeeId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">No employee selected</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading employee data...</p>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Employee not found</p>
      </div>
    )
  }

  return (
    <React.Fragment>
      <BreadCrumb title="Overview" subTitle="Rrhh" />
      <div className="col-span-12 xl:col-span-8 2xl:col-span-9 xl:row-span-3">
        <div className="card">
          <div className="card-body">
            <div className="relative gap-4 mb-5 md:flex">
              {employee.image ? (
                <Image
                  src={employee.image}
                  alt={`${employee.firstName} ${employee.lastName}`}
                  className="rounded-md size-36 shrink-0"
                  width={144}
                  height={144}
                />
              ) : (
                <div className="flex items-center justify-center rounded-md size-36 shrink-0 bg-gray-100 dark:bg-dark-850">
                  <span className="text-4xl font-semibold text-gray-500 dark:text-dark-500">
                    {employee.firstName.charAt(0)}
                  </span>
                </div>
              )}
              <div className="mt-5 grow md:mt-0">
                <h6 className="mb-2">
                  {employee.firstName} {employee.lastName}
                </h6>
                <div className="flex flex-wrap gap-3 mb-2 whitespace-nowrap item-center">
                  {employee.class && (
                    <p className="text-gray-500 dark:text-dark-500">
                      <span className="align-bottom">
                        Class: {employee.class}
                      </span>
                    </p>
                  )}
                  {employee.city && (
                    <p className="text-gray-500 dark:text-dark-500">
                      <MapPin className="inline-block size-4 fill-gray-100 dark:fill-dark-850 mr-1" />
                      <span className="align-bottom">{employee.city}</span>
                    </p>
                  )}
                  {employee.birthDate && (
                    <p className="text-gray-500 dark:text-dark-500">
                      <CalendarCheck className="inline-block size-4 fill-gray-100 dark:fill-dark-850 mr-1" />
                      <span className="align-bottom">
                        {new Date(employee.birthDate).toLocaleDateString()}
                      </span>
                    </p>
                  )}
                </div>
                {employee.phone && (
                  <p className="mb-2 text-gray-500 dark:text-dark-500">
                    <Phone className="inline-block size-4 fill-gray-100 dark:fill-dark-850 mr-1" />
                    <span className="align-bottom">{employee.phone}</span>
                  </p>
                )}
                {employee.email && (
                  <p className="mb-3 text-gray-500 dark:text-dark-500">
                    <Mail className="inline-block size-4 mr-1" />
                    <span className="align-bottom">{employee.email}</span>
                  </p>
                )}
                {employee.rollNo && (
                  <div className="flex gap-2 item-center">
                    <span className="badge badge-primary">
                      Roll No: {employee.rollNo}
                    </span>
                    {employee.employeeId && (
                      <span className="badge badge-secondary">
                        ID: {employee.employeeId}
                      </span>
                    )}
                  </div>
                )}
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
              <div className="flex">
                {employee.gender && (
                  <div className="w-[130px] md:w-[200px] flex-shrink-0">
                    <p className="mb-1 text-gray-500 dark:text-dark-500">
                      Gender
                    </p>
                    <h6>{employee.gender}</h6>
                  </div>
                )}
                {employee.religion && (
                  <div className="w-[130px] md:w-[200px] flex-shrink-0">
                    <p className="mb-1 text-gray-500 dark:text-dark-500">
                      Religion
                    </p>
                    <h6>{employee.religion}</h6>
                  </div>
                )}
                {employee.fatherOccupation && (
                  <div className="w-[130px] md:w-[200px] flex-shrink-0">
                    <p className="mb-1 text-gray-500 dark:text-dark-500">
                      Father Occupation
                    </p>
                    <h6>{employee.fatherOccupation}</h6>
                  </div>
                )}
                {employee.admissionDate && (
                  <div className="w-[130px] md:w-[200px] flex-shrink-0">
                    <p className="mb-1 text-gray-500 dark:text-dark-500">
                      Admission Date
                    </p>
                    <h6>
                      {new Date(employee.admissionDate).toLocaleDateString()}
                    </h6>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-y-5">
                {employee.rollNo && (
                  <div className="w-[130px] md:w-[200px] flex-shrink-0">
                    <p className="mb-1 text-gray-500 dark:text-dark-500">
                      Roll No
                    </p>
                    <h6>{employee.rollNo}</h6>
                  </div>
                )}
                {employee.fatherName && (
                  <div className="w-[130px] md:w-[200px] flex-shrink-0">
                    <p className="mb-1 text-gray-500 dark:text-dark-500">
                      Father Name
                    </p>
                    <h6>{employee.fatherName}</h6>
                  </div>
                )}
                {employee.motherName && (
                  <div className="w-[130px] md:w-[200px] flex-shrink-0">
                    <p className="mb-1 text-gray-500 dark:text-dark-500">
                      Mother Name
                    </p>
                    <h6>{employee.motherName}</h6>
                  </div>
                )}
                {employee.parentsPhone && (
                  <div className="w-[130px] md:w-[200px] flex-shrink-0">
                    <p className="mb-1 text-gray-500 dark:text-dark-500">
                      Parents Number
                    </p>
                    <h6>{employee.parentsPhone}</h6>
                  </div>
                )}
                {employee.address && (
                  <div className="w-[130px] md:w-[200px] flex-shrink-0">
                    <div className="whitespace-normal">
                      <p className="mb-1 text-gray-500 dark:text-dark-500">
                        Address
                      </p>
                      <h6>{employee.address}</h6>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h5>History</h5>
            <button
              className="btn btn-primary"
              onClick={handleOpenHistoryModal}>
              Add History
            </button>
          </div>
          <div className="card-body">
            {histories && histories.length > 0 ? (
              <div className="space-y-4">
                {histories.map((history) => (
                  <div
                    key={history.id}
                    className="p-4 border border-gray-200 rounded-lg dark:border-dark-800">
                    <h6 className="mb-2">{history.title}</h6>
                    <p className="text-gray-500 dark:text-dark-500 mb-2">
                      {history.description}
                    </p>
                    <p className="text-sm text-gray-400 dark:text-dark-600">
                      {new Date(history.createdAt).toLocaleDateString()} at{' '}
                      {new Date(history.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-dark-500">
                No history records yet. Click "Add History" to create one.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Add History Modal */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={handleCloseHistoryModal}
        position="modal-center"
        size="modal-md"
        title="Add History"
        footerClass="flex justify-end"
        content={() => (
          <form onSubmit={handleSubmit(onSubmitHistory)}>
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label
                  htmlFor="historyTitle"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  id="historyTitle"
                  {...register('title', {
                    required: 'Title is required',
                  })}
                  className="form-input"
                  placeholder="Enter history title"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="historyDescription"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  id="historyDescription"
                  {...register('description', {
                    required: 'Description is required',
                  })}
                  rows={4}
                  className="form-input min-h-16"
                  placeholder="Enter history description"
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>
            </div>
          </form>
        )}
        footer={() => (
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="btn btn-red"
              onClick={handleCloseHistoryModal}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit(onSubmitHistory)}>
              Save History
            </button>
          </div>
        )}
      />
    </React.Fragment>
  )
}

const RrhhOverview: NextPageWithLayout = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-500">Loading...</p>
        </div>
      }>
      <RrhhOverviewContent />
    </Suspense>
  )
}

export default RrhhOverview
