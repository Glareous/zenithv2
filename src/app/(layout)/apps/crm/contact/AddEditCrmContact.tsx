'use client'

import React, { useCallback, useEffect, useState } from 'react'

import Image from 'next/image'

import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '@src/components/custom/modal/modal'
import { api } from '@src/trpc/react'
import { Plus, Trash2, Upload } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { PhoneInput } from 'react-international-phone'
import 'react-international-phone/style.css'
import Select from 'react-select'
import { toast } from 'react-toastify'
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  companyName: z.string().optional(),
  role: z.string().optional(),
  email: z.string().email('Invalid email format'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  website: z.string().optional(),
  status: z.enum(['CONTACT', 'CUSTOMER', 'LEAD']),
  subscriber: z.boolean(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  location: z.string().optional(),
})

type ContactFormData = z.infer<typeof contactSchema>

const statusOptions = [
  { value: 'CONTACT', label: 'Contact' },
  { value: 'CUSTOMER', label: 'Customer' },
  { value: 'LEAD', label: 'Lead' },
]

const genderOptions = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
]

const subscriberOptions = [
  { value: true, label: 'Yes' },
  { value: false, label: 'No' },
]

const DEFAULT_AVATAR = '/assets/images/user-avatar.jpg'

interface AddEditCrmContactProps {
  isOpen: boolean
  onClose: () => void
  editMode?: boolean
  currentContact?: any
  projectId: string
  onSuccess?: () => void
}

const AddEditCrmContact: React.FC<AddEditCrmContactProps> = ({
  isOpen,
  onClose,
  editMode = false,
  currentContact = null,
  projectId,
  onSuccess,
}) => {
  const utils = api.useUtils()
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [existingImageId, setExistingImageId] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [status, setStatus] = useState<{ value: string; label: string } | null>(
    null
  )
  const [gender, setGender] = useState<{ value: string; label: string } | null>(
    null
  )
  const [subscriber, setSubscriber] = useState<{
    value: boolean
    label: string
  } | null>(null)

  const createContact = api.projectContact.create.useMutation({
    onSuccess: (newContact) => {
      toast.success('Contact and Lead created successfully!')
      onSuccess?.()
      handleClose()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create contact')
    },
  })

  const updateContact = api.projectContact.update.useMutation({
    onSuccess: (updatedContact) => {
      toast.success('Contact updated successfully!')
      onSuccess?.()
      handleClose()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update contact')
    },
  })

  const uploadFile = api.projectContactFile.getUploadUrl.useMutation()
  const createFile = api.projectContactFile.create.useMutation()
  const deleteFile = api.projectContactFile.delete.useMutation()

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  const resetForm = useCallback(() => {
    reset({
      name: '',
      companyName: '',
      role: '',
      email: '',
      phoneNumber: '',
      website: '',
      status: 'CONTACT',
      subscriber: false,
      gender: undefined,
      location: '',
    })
    setPreview(null)
    setSelectedFile(null)
    setExistingImageId(null)
    setStatus({ value: 'CONTACT', label: 'Contact' })
    setGender(null)
    setSubscriber({ value: false, label: 'No' })
  }, [reset])

  useEffect(() => {
    if (editMode && currentContact) {
      setValue('name', currentContact.name)
      setValue('companyName', currentContact.companyName || '')
      setValue('role', currentContact.role || '')
      setValue('email', currentContact.email || '')
      setValue('phoneNumber', currentContact.phoneNumber || '')
      setValue('website', currentContact.website || '')
      setValue('status', currentContact.status || 'CONTACT')
      setValue('subscriber', currentContact.subscriber || false)
      setValue('gender', currentContact.gender || undefined)
      setValue('location', currentContact.location || '')

      setStatus({
        value: currentContact.status || 'CONTACT',
        label:
          statusOptions.find((opt) => opt.value === currentContact.status)
            ?.label || 'Contact',
      })

      if (currentContact.gender) {
        setGender({
          value: currentContact.gender,
          label:
            genderOptions.find((opt) => opt.value === currentContact.gender)
              ?.label || '',
        })
      }

      setSubscriber({
        value: currentContact.subscriber || false,
        label: currentContact.subscriber ? 'Yes' : 'No',
      })

      if (currentContact.files && currentContact.files.length > 0) {
        setPreview(currentContact.files[0].s3Url)
        setExistingImageId(currentContact.files[0].id)
      }
    } else {
      resetForm()
    }
  }, [editMode, currentContact, setValue, resetForm])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setSelectedFile(null)
      setPreview(null)
    }
  }

  const handleDeleteImage = async () => {
    if (editMode && currentContact && existingImageId) {
      try {
        await deleteFile.mutateAsync({
          fileId: existingImageId,
          contactId: currentContact.id,
        })
        toast.success('Image deleted successfully')
      } catch (error: any) {
        toast.error(`Error deleting image: ${error.message}`)
        return
      }
    }

    setPreview(null)
    setSelectedFile(null)
    setExistingImageId(null)
  }

  const handleStatusChange = (
    selected: { value: string; label: string } | null,
    onChange: (value: any) => void
  ) => {
    setStatus(selected)
    onChange(selected?.value)
  }

  const handleGenderChange = (
    selected: { value: string; label: string } | null,
    onChange: (value: any) => void
  ) => {
    setGender(selected)
    onChange(selected?.value)
  }

  const handleSubscriberChange = (
    selected: { value: boolean; label: string } | null,
    onChange: (value: any) => void
  ) => {
    setSubscriber(selected)
    onChange(selected?.value)
  }

  const uploadImageToS3 = async (contactId: string, file: File) => {
    try {
      const uploadUrlData = await uploadFile.mutateAsync({
        contactId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      })

      const uploadResponse = await fetch(uploadUrlData.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload to S3')
      }

      const fileRecord = await createFile.mutateAsync({
        contactId,
        name: file.name,
        fileName: uploadUrlData.fileName,
        fileType: 'IMAGE',
        mimeType: file.type,
        fileSize: file.size,
        s3Key: uploadUrlData.s3Key,
      })

      await syncContactImageToLead(contactId)

      return fileRecord
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image')
      throw error
    }
  }

  const syncContactImageToLeadMutation =
    api.projectContact.syncImageToLead.useMutation()

  const syncContactImageToLead = async (contactId: string) => {
    try {
      await syncContactImageToLeadMutation.mutateAsync({
        contactId,
        projectId,
      })
    } catch (error) {
      console.error('Error syncing image to lead:', error)
    }
  }

  const onSubmit = async (data: ContactFormData) => {
    try {
      setIsUploading(true)

      if (editMode && currentContact) {
        await updateContact.mutateAsync({
          id: currentContact.id,
          projectId,
          ...data,
        })

        if (selectedFile) {
          await uploadImageToS3(currentContact.id, selectedFile)
        }
      } else {
        const newContact = await createContact.mutateAsync({
          projectId,
          ...data,
        })

        if (selectedFile) {
          await uploadImageToS3(newContact.id, selectedFile)
        }
      }

      onSuccess?.()
    } catch (error) {
      toast.error('An error occurred while saving the contact')
    } finally {
      setIsUploading(false)
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
      id={editMode ? 'showEditContactForm' : 'showAddContactForm'}
      contentClass="p-2"
      content={(onClose) => (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="h-24 p-5 rounded-t bg-gradient-to-r from-primary-500/20 via-pink-500/20 to-green-500/20"></div>
          <div className="p-4">
            <div className="-mt-16">
              <label htmlFor="logo">
                <div className="inline-flex items-center justify-center overflow-visible bg-gray-100 border border-gray-200 rounded-full cursor-pointer dark:bg-dark-850 dark:border-dark-800 size-24 relative">
                  {preview ? (
                    <>
                      <Image
                        src={preview}
                        alt="contact image"
                        width={94}
                        height={94}
                        className="object-cover w-full h-full rounded-full"
                      />
                      {(selectedFile || existingImageId) && (
                        <button
                          type="button"
                          onClick={handleDeleteImage}
                          className="absolute top-1 right-1 btn btn-red btn-xs z-50">
                          <Trash2 className="size-3" />
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-500 dark:text-dark-500">
                      <Upload className="size-6 mb-1" />
                      <span className="text-xs">Upload</span>
                    </div>
                  )}
                </div>
              </label>
              <div className="hidden mt-4">
                <label className="block">
                  <span className="sr-only">Choose profile photo</span>
                  <input
                    type="file"
                    name="logo"
                    id="logo"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm file:rounded-md focus:outline-0 text-slate-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4 mt-5">
              <div className="col-span-12">
                <label htmlFor="fullNameInput" className="form-label">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullNameInput"
                  className="form-input"
                  placeholder="Full name"
                  {...register('name')}
                />
                {errors.name && (
                  <span className="text-red-500">{errors.name.message}</span>
                )}
              </div>

              <div className="col-span-12">
                <label htmlFor="companyNameInput" className="form-label">
                  Company Name
                </label>
                <input
                  type="text"
                  id="companyNameInput"
                  className="form-input"
                  placeholder="Company name"
                  {...register('companyName')}
                />
                {errors.companyName && (
                  <span className="text-red-500">
                    {errors.companyName.message}
                  </span>
                )}
              </div>

              <div className="col-span-12">
                <label htmlFor="roleInput" className="form-label">
                  Role
                </label>
                <input
                  type="text"
                  id="roleInput"
                  className="form-input"
                  placeholder="Role"
                  {...register('role')}
                />
                {errors.role && (
                  <span className="text-red-500">{errors.role.message}</span>
                )}
              </div>

              <div className="col-span-12">
                <label htmlFor="emailInput" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  id="emailInput"
                  className="form-input"
                  placeholder="support@example.com"
                  {...register('email')}
                />
                {errors.email && (
                  <span className="text-red-500">{errors.email.message}</span>
                )}
              </div>

              <div className="col-span-12">
                <label htmlFor="phoneNumber" className="form-label">
                  Phone Number
                </label>
                <PhoneInput
                  defaultCountry="us"
                  value={watch('phoneNumber')}
                  onChange={(value) => {
                    setValue('phoneNumber', value || '')
                  }}
                  className={`${
                    errors.phoneNumber ? 'border-red-500' : ''
                  }`}
                  placeholder="Enter phone number"
                />
                {errors.phoneNumber && (
                  <span className="text-red-500">
                    {errors.phoneNumber.message}
                  </span>
                )}
              </div>

              <div className="col-span-6">
                <label htmlFor="websiteInput" className="form-label">
                  WebSite
                </label>
                <input
                  type="url"
                  id="websiteInput"
                  className="form-input"
                  placeholder="http://www.example.com"
                  {...register('website')}
                />
                {errors.website && (
                  <span className="text-red-500">{errors.website.message}</span>
                )}
              </div>

              <div className="col-span-6">
                <label htmlFor="locationInput" className="form-label">
                  Location
                </label>
                <input
                  type="text"
                  id="locationInput"
                  className="form-input"
                  placeholder="City, Country"
                  {...register('location')}
                />
                {errors.location && (
                  <span className="text-red-500">
                    {errors.location.message}
                  </span>
                )}
              </div>

              <div className="col-span-6">
                <label className="form-label">Gender</label>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Select
                      classNamePrefix="select"
                      options={genderOptions}
                      value={gender}
                      onChange={(selected) =>
                        handleGenderChange(selected, onChange)
                      }
                      placeholder="Select Gender"
                      isClearable
                    />
                  )}
                />
                {errors.gender && (
                  <span className="text-red-500">{errors.gender.message}</span>
                )}
              </div>

              <div className="col-span-6">
                <label className="form-label">Subscriber</label>
                <Controller
                  name="subscriber"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Select
                      classNamePrefix="select"
                      options={subscriberOptions}
                      value={subscriber}
                      onChange={(selected) =>
                        handleSubscriberChange(selected, onChange)
                      }
                      placeholder="Select Subscriber"
                    />
                  )}
                />
                {errors.subscriber && (
                  <span className="text-red-500">
                    {errors.subscriber.message}
                  </span>
                )}
              </div>

              <div className="col-span-12">
                <label htmlFor="statusSelect" className="form-label">
                  Status
                </label>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    Contact
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    (Status is automatically set to Contact)
                  </span>
                </div>
                <input type="hidden" {...register('status')} value="CONTACT" />
              </div>

              <div className="flex items-center justify-end col-span-12 gap-2 mt-5">
                <button
                  type="button"
                  className="btn btn-outline-red"
                  onClick={onClose}
                  disabled={isSubmitting || isUploading}>
                  <span className="align-baseline">Cancel</span>
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting || isUploading}>
                  <Plus className="inline-block ltr:mr-1 rtl:ml-1 size-4" />
                  {isSubmitting || isUploading
                    ? 'Saving...'
                    : editMode
                      ? 'Update Contact'
                      : 'Add Contact'}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    />
  )
}

export default AddEditCrmContact
