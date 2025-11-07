'use client'

import React, { useCallback, useEffect, useState } from 'react'

import Image from 'next/image'

import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '@src/components/custom/modal/modal'
import { api } from '@src/trpc/react'
import 'flatpickr/dist/themes/material_blue.css'
import { Calendar, DollarSign, Plus, User } from 'lucide-react'
import Flatpickr from 'react-flatpickr'
import { Controller, useForm } from 'react-hook-form'
import Select from 'react-select'
import { toast } from 'react-toastify'
import { z } from 'zod'

const dealSchema = z.object({
  dealDate: z.date().optional(),
  isActive: z.boolean(),
  isExpired: z.boolean(),
  revenue: z.number().min(0, 'Revenue must be a positive number').optional(),
  customerId: z.string().min(1, 'Customer is required'),
  status: z.enum(['PROPOSAL', 'NEGOTIATION', 'WON', 'LOST']),
})

type DealFormData = z.infer<typeof dealSchema>

const DEFAULT_AVATAR = '/assets/images/user-avatar.jpg'

interface AddEditProjectDealProps {
  isOpen: boolean
  onClose: () => void
  editMode?: boolean
  currentDeal?: any
  projectId: string
  onSuccess?: () => void
}

const AddEditProjectDeal: React.FC<AddEditProjectDealProps> = ({
  isOpen,
  onClose,
  editMode = false,
  currentDeal = null,
  projectId,
  onSuccess,
}) => {
  const utils = api.useUtils()
  const [selectedLead, setSelectedLead] = useState<{
    value: string
    label: string
    image?: string
  } | null>(null)
  const [dealDate, setDealDate] = useState<Date | null>(null)
  const [selectedActiveStatus, setSelectedActiveStatus] = useState<{
    value: boolean
    label: string
  }>({ value: true, label: 'Active' })
  const [selectedExpiredStatus, setSelectedExpiredStatus] = useState<{
    value: boolean
    label: string
  }>({ value: false, label: 'Not Expired' })
  const [selectedDealStatus, setSelectedDealStatus] = useState<{
    value: string
    label: string
  }>({ value: 'PROPOSAL', label: 'Proposal' })

  const { data: customersData } = api.projectCustomer.getAll.useQuery(
    {
      projectId,
      page: 1,
      limit: 100,
    },
    { enabled: !!projectId }
  )

  const createDeal = api.projectDeal.create.useMutation({
    onSuccess: (newDeal) => {
      toast.success('Deal created successfully!')

      createDealMessage.mutate({
        dealId: newDeal.id,
        dealName: selectedLead?.label || 'Deal',
        dealImage: selectedLead?.image || DEFAULT_AVATAR,
        status: 'ACTIVE',
      })

      utils.projectDeal.getAll.invalidate({ projectId })
      utils.projectDealMessage.getAllByProject.invalidate({ projectId })
      onSuccess?.()
      handleClose()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create deal')
    },
  })

  const createDealMessage = api.projectDealMessage.create.useMutation({
    onSuccess: () => {
      toast.success('Deal message created automatically!')
    },
    onError: (error) => {
      console.error('Error creating deal message:', error)
    },
  })

  const updateDeal = api.projectDeal.update.useMutation({
    onSuccess: () => {
      toast.success('Deal updated successfully!')
      utils.projectDeal.getAll.invalidate({ projectId })
      utils.projectDealMessage.getAllByProject.invalidate({ projectId })
      onSuccess?.()
      handleClose()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update deal')
    },
  })

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<DealFormData>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      isActive: true,
      isExpired: false,
      status: 'PROPOSAL',
    },
  })

  const resetForm = useCallback(() => {
    reset({
      isActive: true,
      isExpired: false,
      status: 'PROPOSAL',
    })
    setSelectedLead(null)
    setDealDate(null)
    setSelectedActiveStatus({ value: true, label: 'Active' })
    setSelectedExpiredStatus({ value: false, label: 'Not Expired' })
    setSelectedDealStatus({ value: 'PROPOSAL', label: 'Proposal' })
  }, [reset])

  useEffect(() => {
    if (editMode && currentDeal) {
      setValue('customerId', currentDeal.customerId)
      setValue('isActive', currentDeal.isActive)
      setValue('isExpired', currentDeal.isExpired)
      setValue('revenue', currentDeal.revenue)
      setValue('status', currentDeal.status || 'PROPOSAL')
      setValue(
        'dealDate',
        currentDeal.dealDate ? new Date(currentDeal.dealDate) : undefined
      )

      if (currentDeal.customer) {
        setSelectedLead({
          value: currentDeal.customer.id,
          label: currentDeal.customer.name,
          image: currentDeal.customer.files?.[0]?.s3Url || DEFAULT_AVATAR,
        })
      }

      setSelectedActiveStatus({
        value: currentDeal.isActive,
        label: currentDeal.isActive ? 'Active' : 'Inactive',
      })
      setSelectedExpiredStatus({
        value: currentDeal.isExpired,
        label: currentDeal.isExpired ? 'Expired' : 'Not Expired',
      })
      setSelectedDealStatus({
        value: currentDeal.status || 'PROPOSAL',
        label: getDealStatusLabel(currentDeal.status || 'PROPOSAL'),
      })
      setDealDate(currentDeal.dealDate ? new Date(currentDeal.dealDate) : null)
    } else {
      resetForm()
    }
  }, [editMode, currentDeal, setValue, resetForm])

  const leadOptions =
    customersData?.customers?.map((customer) => ({
      value: customer.id,
      label: customer.name,
      image: customer.files?.[0]?.s3Url || DEFAULT_AVATAR,
    })) || []

  const activeStatusOptions = [
    { value: true, label: 'Active' },
    { value: false, label: 'Inactive' },
  ]

  const expiredStatusOptions = [
    { value: true, label: 'Expired' },
    { value: false, label: 'Not Expired' },
  ]

  const dealStatusOptions = [
    { value: 'PROPOSAL', label: 'Proposal' },
    { value: 'NEGOTIATION', label: 'Negotiation' },
    { value: 'WON', label: 'Won' },
    { value: 'LOST', label: 'Lost' },
  ]

  const getDealStatusLabel = (status: string) => {
    switch (status) {
      case 'PROPOSAL':
        return 'Proposal'
      case 'NEGOTIATION':
        return 'Negotiation'
      case 'WON':
        return 'Won'
      case 'LOST':
        return 'Lost'
      default:
        return 'Proposal'
    }
  }

  const handleLeadChange = (selected: any) => {
    setSelectedLead(selected)
    setValue('customerId', selected?.value || '')
  }

  const handleActiveStatusChange = (selected: any) => {
    setSelectedActiveStatus(selected)
    setValue('isActive', selected?.value)
  }

  const handleExpiredStatusChange = (selected: any) => {
    setSelectedExpiredStatus(selected)
    setValue('isExpired', selected?.value)
  }

  const handleDealStatusChange = (selected: any) => {
    setSelectedDealStatus(selected)
    setValue('status', selected?.value)
  }

  const handleDateChange = (dates: Date[]) => {
    const date = dates[0]
    setDealDate(date)
    setValue('dealDate', date)
  }

  const handleRevenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const numericValue = value === '' ? undefined : parseFloat(value)
    setValue('revenue', numericValue)
  }

  const onSubmit = async (data: DealFormData) => {
    try {
      if (!data.customerId) {
        toast.error('Please select a customer')
        return
      }

      if (editMode && currentDeal) {
        await updateDeal.mutateAsync({
          id: currentDeal.id,
          projectId,
          ...data,
          customerId: data.customerId,
        })
      } else {
        await createDeal.mutateAsync({
          projectId,
          ...data,
          customerId: data.customerId,
        })
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error('An error occurred while saving the deal')
    }
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      position="modal-center"
      id={editMode ? 'showEditDealForm' : 'showAddDealForm'}
      contentClass="p-2"
      content={(onClose) => (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="h-24 p-5 rounded-t bg-gradient-to-r from-primary-500/20 via-pink-500/20 to-green-500/20"></div>
          <div className="p-4">
            <div className="-mt-16">
              <div className="inline-flex items-center justify-center overflow-hidden bg-gray-100 border-2 border-white border-solid rounded-full cursor-pointer dark:border-dark-900 dark:bg-dark-850 size-24">
                {selectedLead?.image ? (
                  <Image
                    src={selectedLead.image}
                    alt="customer image"
                    width={92}
                    height={92}
                    className="object-cover w-full h-full rounded-full"
                  />
                ) : (
                  <div className="flex flex-col items-center text-gray-500 dark:text-dark-500">
                    <User className="size-8" />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4 mt-5">
              <div className="col-span-12">
                <label htmlFor="leadSelect" className="form-label">
                  Select Customer
                </label>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Select a customer to create a deal with.
                </div>
                <Controller
                  name="customerId"
                  control={control}
                  render={({ field: { onChange } }) => (
                    <Select
                      classNamePrefix="select"
                      options={leadOptions}
                      value={selectedLead}
                      onChange={(selected: any) => {
                        handleLeadChange(selected)
                        onChange(selected?.value)
                      }}
                      placeholder="Select a customer..."
                      isClearable
                      isSearchable
                      noOptionsMessage={() => 'No customers available'}
                    />
                  )}
                />
                {errors.customerId && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.customerId.message}
                  </p>
                )}
              </div>

              <div className="col-span-6">
                <label htmlFor="dealStatusSelect" className="form-label">
                  Deal Status
                </label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field: { onChange } }) => (
                    <Select
                      classNamePrefix="select"
                      options={dealStatusOptions}
                      value={selectedDealStatus}
                      onChange={(selected: any) => {
                        handleDealStatusChange(selected)
                        onChange(selected?.value)
                      }}
                      placeholder="Select deal status..."
                      id="dealStatusSelect"
                    />
                  )}
                />
                {errors.status && (
                  <span className="text-red-500">{errors.status.message}</span>
                )}
              </div>

              <div className="col-span-6">
                <label htmlFor="dealDateInput" className="form-label">
                  Deal Date
                </label>
                <div className="relative">
                  <Controller
                    name="dealDate"
                    control={control}
                    render={({ field: { onChange } }) => (
                      <Flatpickr
                        value={dealDate || ''}
                        onChange={(dates: Date[]) => {
                          handleDateChange(dates)
                          onChange(dates[0])
                        }}
                        options={{
                          dateFormat: 'Y-m-d',
                          allowInput: true,
                        }}
                        className="form-input ltr:pl-9 rtl:pr-9"
                      />
                    )}
                  />
                  <div className="absolute inset-y-0 flex items-center text-gray-500 dark:text-dark-500 ltr:left-3 rtl:right-3">
                    <Calendar className="size-4" />
                  </div>
                </div>
                {errors.dealDate && (
                  <span className="text-red-500">
                    {errors.dealDate.message}
                  </span>
                )}
              </div>

              <div className="col-span-12">
                <label htmlFor="revenueInput" className="form-label">
                  Revenue
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="revenueInput"
                    className="form-input ltr:pl-9 rtl:pr-9"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    value={watch('revenue') || ''}
                    onChange={handleRevenueChange}
                  />
                  <div className="absolute inset-y-0 flex items-center text-gray-500 dark:text-dark-500 ltr:left-3 rtl:right-3">
                    <DollarSign className="size-4" />
                  </div>
                </div>
                {errors.revenue && (
                  <span className="text-red-500">{errors.revenue.message}</span>
                )}
              </div>

              <div className="col-span-6 hidden">
                <label htmlFor="activeStatusSelect" className="form-label">
                  Active Status
                </label>
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field: { onChange } }) => (
                    <Select
                      classNamePrefix="select"
                      options={activeStatusOptions}
                      value={selectedActiveStatus}
                      onChange={(selected: any) => {
                        handleActiveStatusChange(selected)
                        onChange(selected?.value)
                      }}
                      placeholder="Select Active Status"
                      id="activeStatusSelect"
                    />
                  )}
                />
                {errors.isActive && (
                  <span className="text-red-500">
                    {errors.isActive.message}
                  </span>
                )}
              </div>

              <div className="col-span-6 hidden">
                <label htmlFor="expiredStatusSelect" className="form-label">
                  Expired Status
                </label>
                <Controller
                  name="isExpired"
                  control={control}
                  render={({ field: { onChange } }) => (
                    <Select
                      classNamePrefix="select"
                      options={expiredStatusOptions}
                      value={selectedExpiredStatus}
                      onChange={(selected: any) => {
                        handleExpiredStatusChange(selected)
                        onChange(selected?.value)
                      }}
                      placeholder="Select Expired Status"
                      id="expiredStatusSelect"
                    />
                  )}
                />
                {errors.isExpired && (
                  <span className="text-red-500">
                    {errors.isExpired.message}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-end col-span-12 gap-2 mt-5">
                <button
                  type="button"
                  className="btn btn-outline-red"
                  onClick={onClose}
                  disabled={isSubmitting}>
                  <span className="align-baseline">Cancel</span>
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}>
                  <Plus className="inline-block ltr:mr-1 rtl:ml-1 size-4" />
                  {isSubmitting
                    ? 'Saving...'
                    : editMode
                      ? 'Update Deal'
                      : 'Add Deal'}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    />
  )
}

export default AddEditProjectDeal
