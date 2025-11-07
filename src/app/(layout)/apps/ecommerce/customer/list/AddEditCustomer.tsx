'use client'

import React, { useCallback, useEffect, useState } from 'react'

import Image from 'next/image'

import { zodResolver } from '@hookform/resolvers/zod'
import { validatePhoneNumber } from '@src/components/common/ValidationFormate'
import { validateEmailField } from '@src/components/common/ValidationFormate'
import { Modal } from '@src/components/custom/modal/modal'
import { CustomerRecord } from '@src/dtos'
import {
  AddNewCustomerPropsModal,
  OptionType,
  statusOptions,
  subscribeOptions,
} from '@src/dtos/apps/ecommerce'
import { RootState } from '@src/slices/reducer'
import { api } from '@src/trpc/react'
import { Trash, Upload } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { Controller, useForm } from 'react-hook-form'
import { PhoneInput } from 'react-international-phone'
import 'react-international-phone/style.css'
import { useSelector } from 'react-redux'
import Select from 'react-select'
import { toast } from 'react-toastify'
import { z } from 'zod'

const customerFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  phoneNumber: z.string().optional().or(z.literal('')),
  subscriber: z.boolean(),
  gender: z.string().optional().or(z.literal('')),
  location: z.string().optional().or(z.literal('')),
  isActive: z.boolean(),
})

type CustomerFormData = z.infer<typeof customerFormSchema>

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

const AddEditNewCustomer: React.FC<AddNewCustomerPropsModal> = ({
  modalState,
  closeModal,
  customerList,
  editMode = false,
  currentCustomer = null,
}: {
  modalState: any
  closeModal: (modal: string) => void
  customerList: any[]
  editMode?: boolean
  currentCustomer?: any
}) => {
  const { data: session } = useSession()

  const currentProject = useSelector(
    (state: RootState) => state.Project.currentProject
  )
  const projectId = currentProject?.id || ''

  const utils = api.useUtils()

  const [preview, setPreview] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [existingImageId, setExistingImageId] = useState<string | null>(null)
  const [subscribeOption, setSubscribeOption] = useState<OptionType | null>(
    null
  )
  const [statusOption, setStatusOption] = useState<OptionType | null>(null)
  const [phoneValue, setPhoneValue] = useState<string>('')

  const createCustomer = api.projectCustomer.create.useMutation({
    onSuccess: async (newCustomer) => {
      if (uploadedFile && newCustomer.id) {
        try {
          const uploadUrlResponse = await getUploadUrlMutation.mutateAsync({
            customerId: newCustomer.id.toString(),
            fileName: uploadedFile.name,
            fileType: uploadedFile.type,
            fileSize: uploadedFile.size,
          })

          await fetch(uploadUrlResponse.uploadUrl, {
            method: 'PUT',
            body: uploadedFile,
            headers: {
              'Content-Type': uploadedFile.type,
            },
          })

          await createFileMutation.mutateAsync({
            customerId: newCustomer.id.toString(),
            name: uploadedFile.name,
            fileName: uploadedFile.name,
            fileType: 'IMAGE',
            mimeType: uploadedFile.type,
            fileSize: uploadedFile.size,
            s3Key: uploadUrlResponse.s3Key,
          })
        } catch (error) {
          console.error('Error uploading image:', error)
          toast.error('Error uploading image')
        }
      }

      toast.success('Customer created successfully')
      utils.projectCustomer.getAll.invalidate({ projectId })
      handleCloseModal(
        editMode ? 'showEditCustomerForm' : 'showAddCustomerForm'
      )
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const updateCustomer = api.projectCustomer.update.useMutation({
    onSuccess: async (updatedCustomer) => {
      if (uploadedFile && updatedCustomer.id) {
        try {
          if (existingImageId) {
            await deleteFileMutation.mutateAsync({ id: existingImageId })
          }

          const uploadUrlResponse = await getUploadUrlMutation.mutateAsync({
            customerId: updatedCustomer.id.toString(),
            fileName: uploadedFile.name,
            fileType: uploadedFile.type,
            fileSize: uploadedFile.size,
          })

          await fetch(uploadUrlResponse.uploadUrl, {
            method: 'PUT',
            body: uploadedFile,
            headers: {
              'Content-Type': uploadedFile.type,
            },
          })

          await createFileMutation.mutateAsync({
            customerId: updatedCustomer.id.toString(),
            name: uploadedFile.name,
            fileName: uploadedFile.name,
            fileType: 'IMAGE',
            mimeType: uploadedFile.type,
            fileSize: uploadedFile.size,
            s3Key: uploadUrlResponse.s3Key,
          })
        } catch (error) {
          console.error('Error uploading image:', error)
          toast.error('Error uploading image')
        }
      }

      toast.success('Customer updated successfully')
      utils.projectCustomer.getAll.invalidate({ projectId })
      handleCloseModal(
        editMode ? 'showEditCustomerForm' : 'showAddCustomerForm'
      )
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const getUploadUrlMutation =
    api.projectCustomerFile.getUploadUrl.useMutation()
  const createFileMutation = api.projectCustomerFile.create.useMutation()
  const deleteFileMutation = api.projectCustomerFile.delete.useMutation()

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      phoneNumber: '',
      subscriber: false,
      gender: '',
      location: '',
      isActive: true,
    },
  })

  const submitForm = (data: CustomerFormData) => {
    const phoneData = phoneValue || data.phoneNumber

    if (editMode && currentCustomer) {
      updateCustomer.mutate({
        id: currentCustomer.id.toString(),
        name: data.name,
        email: data.email || undefined,
        phoneNumber: phoneData || undefined,
        subscriber: data.subscriber,
        gender: data.gender || undefined,
        location: data.location || undefined,
        isActive: data.isActive,
      })
    } else {
      createCustomer.mutate({
        projectId,
        name: data.name,
        email: data.email || undefined,
        phoneNumber: phoneData || undefined,
        subscriber: data.subscriber,
        gender: data.gender || undefined,
        location: data.location || undefined,
        isActive: data.isActive,
      })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file) {
      setUploadedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setUploadedFile(null)
      setPreview(null)
    }
  }

  const handleDeleteImage = async () => {
    if (editMode && currentCustomer && existingImageId) {
      try {
        await deleteFileMutation.mutateAsync({ id: existingImageId })
        toast.success('Image deleted successfully')
      } catch (error: any) {
        toast.error(`Error deleting image: ${(error as Error).message}`)
        return
      }
    }

    setPreview(null)
    setUploadedFile(null)
    setExistingImageId(null)
  }

  const handleSubScribeChange = (
    selected: OptionType | null,
    onChange: (value: OptionType | null) => void
  ) => {
    setSubscribeOption(selected)
    onChange(selected)
  }

  const handleStatusChange = (
    selected: OptionType | null,
    onChange: (value: OptionType | null) => void
  ) => {
    setStatusOption(selected)
    onChange(selected)
  }

  const resetForm = useCallback(() => {
    reset({
      name: '',
      email: '',
      phoneNumber: '',
      subscriber: false,
      gender: '',
      location: '',
      isActive: true,
    })
    setPreview(null)
    setUploadedFile(null)
    setExistingImageId(null)
    setSubscribeOption(null)
    setStatusOption(null)
    setPhoneValue('')
    clearErrors()
  }, [reset, clearErrors])

  useEffect(() => {
    if (editMode && currentCustomer) {
      clearErrors()

      setValue('name', currentCustomer.name)
      setValue('email', currentCustomer.email || undefined)
      setValue('phoneNumber', currentCustomer.phoneNumber || undefined)
      setValue('subscriber', currentCustomer.subscriber)
      setValue('gender', currentCustomer.gender || undefined)
      setValue('location', currentCustomer.location || undefined)
      setValue('isActive', currentCustomer.isActive)

      setPhoneValue(currentCustomer.phoneNumber || '')

      const profileImage = currentCustomer.files?.find(
        (file: any) => file.fileType === 'IMAGE'
      )
      if (profileImage) {
        setPreview(profileImage.s3Url)
        setExistingImageId(profileImage.id)
      }

      setSubscribeOption({
        value: currentCustomer.subscriber ? 'Yes' : 'No',
        label: currentCustomer.subscriber ? 'Yes' : 'No',
      })
      setStatusOption({
        value: currentCustomer.isActive ? 'Active' : 'Inactive',
        label: currentCustomer.isActive ? 'Active' : 'Inactive',
      })
    } else {
      resetForm()
    }
  }, [editMode, currentCustomer, setValue, reset, clearErrors, resetForm])

  const handleCloseModal = (modal: string) => {
    closeModal(modal)
    resetForm()
  }

  return (
    <React.Fragment>
      <Modal
        isOpen={
          modalState &&
          (editMode == true
            ? modalState.showEditCustomerForm
            : modalState.showAddCustomerForm)
        }
        onClose={() =>
          handleCloseModal(
            editMode ? 'showEditCustomerForm' : 'showAddCustomerForm'
          )
        }
        position="modal-center"
        id={editMode ? 'showEditCustomerForm' : 'showAddCustomerForm'}
        contentClass="modal-content p-0"
        size="modal-lg"
        content={(onClose) => (
          <>
            <form onSubmit={handleSubmit(submitForm)}>
              <div className="h-20 bg-gray-100 rounded-t-md dark:bg-dark-850"></div>
              <div className="modal-content">
                <div className="-mt-16 relative">
                  <label htmlFor="logo">
                    <div className="inline-flex items-center justify-center overflow-visible bg-gray-100 border border-gray-200 rounded-full cursor-pointer dark:bg-dark-850 dark:border-dark-800 size-24 relative">
                      {preview ? (
                        <>
                          <Image
                            src={preview}
                            alt="previewImg"
                            className="object-cover w-full h-full rounded-full"
                            width={94}
                            height={94}
                          />
                          <button
                            type="button"
                            onClick={handleDeleteImage}
                            className="absolute top-1 right-1 btn btn-red btn-xs z-50">
                            <Trash className="size-3" />
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <Upload className="size-6 mb-1" />
                          <span className="text-xs">Upload</span>
                        </div>
                      )}
                    </div>
                  </label>
                  <input
                    type="file"
                    id="logo"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="form-group">
                    <label htmlFor="name" className="form-label">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      className={`form-input ${
                        errors.name ? 'border-red-500' : ''
                      }`}
                      placeholder="Enter customer name"
                      {...register('name')}
                    />
                    {errors.name && (
                      <span className="text-red-500 text-sm">
                        {errors.name.message}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      className={`form-input ${
                        errors.email ? 'border-red-500' : ''
                      }`}
                      placeholder="Enter email address"
                      {...register('email')}
                    />
                    {errors.email && (
                      <span className="text-red-500 text-sm">
                        {errors.email.message}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="phoneNumber" className="form-label">
                      Phone Number
                    </label>
                    <PhoneInput
                      defaultCountry="us"
                      value={phoneValue}
                      onChange={(value) => {
                        setPhoneValue(value || '')
                        setValue('phoneNumber', value || '')
                      }}
                      className={`${
                        errors.phoneNumber ? 'border-red-500' : ''
                      }`}
                      placeholder="Enter phone number"
                    />
                    {errors.phoneNumber && (
                      <span className="text-red-500 text-sm">
                        {errors.phoneNumber.message}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <Controller
                      name="gender"
                      control={control}
                      render={({ field }) => (
                        <Select
                          classNamePrefix="select"
                          options={[
                            { value: 'Male', label: 'Male' },
                            { value: 'Female', label: 'Female' },
                            { value: 'Other', label: 'Other' },
                          ]}
                          value={
                            field.value
                              ? {
                                  value: field.value,
                                  label: field.value,
                                }
                              : null
                          }
                          onChange={(selected) =>
                            field.onChange(selected?.value || '')
                          }
                          placeholder="Select gender"
                          isClearable
                        />
                      )}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="location" className="form-label">
                      Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      className="form-input"
                      placeholder="Enter location"
                      {...register('location')}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Subscriber</label>
                    <Controller
                      name="subscriber"
                      control={control}
                      render={({ field }) => (
                        <Select
                          classNamePrefix="select"
                          options={subscribeOptions}
                          value={subscribeOption}
                          onChange={(selected) => {
                            field.onChange(selected?.value === 'Yes')
                            handleSubScribeChange(selected, () => {})
                          }}
                          placeholder="Select subscriber status"
                        />
                      )}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <Controller
                      name="isActive"
                      control={control}
                      render={({ field }) => (
                        <Select
                          classNamePrefix="select"
                          options={statusOptions}
                          value={statusOption}
                          onChange={(selected) => {
                            field.onChange(selected?.value === 'Active')
                            handleStatusChange(selected, () => {})
                          }}
                          placeholder="Select status"
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    className="btn btn-outline-red"
                    onClick={() =>
                      handleCloseModal(
                        editMode
                          ? 'showEditCustomerForm'
                          : 'showAddCustomerForm'
                      )
                    }>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={
                      createCustomer.isPending || updateCustomer.isPending
                    }>
                    {createCustomer.isPending || updateCustomer.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {editMode ? 'Updating...' : 'Creating...'}
                      </div>
                    ) : editMode ? (
                      'Update Customer'
                    ) : (
                      'Create Customer'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </>
        )}
      />
    </React.Fragment>
  )
}

export default AddEditNewCustomer
