'use client'

import React, { useCallback, useEffect, useState } from 'react'

import Image from 'next/image'

import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '@src/components/custom/modal/modal'
import { api } from '@src/trpc/react'
import { Link, Plus, Trash2, Upload, User } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { PhoneInput } from 'react-international-phone'
import 'react-international-phone/style.css'
import Select from 'react-select'
import { toast } from 'react-toastify'
import { z } from 'zod'

const leadSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format').optional(),
  phoneNumber: z.string().min(1, 'Phone number is required').optional(),
  description: z.string().optional(),
  companyName: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  location: z.string().optional(),
  age: z.coerce.number().int().min(0).max(150).optional(),
  jobPosition: z.string().optional(),
  industry: z.string().optional(),
  contactId: z.string().optional(),
})

type LeadFormData = z.infer<typeof leadSchema>

const genderOptions = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
]

const DEFAULT_AVATAR = '/assets/images/user-avatar.jpg'

interface AddEditCrmLeadProps {
  isOpen: boolean
  onClose: () => void
  editMode?: boolean
  currentLead?: any
  projectId: string
  onSuccess?: () => void
}

const AddEditCrmLead: React.FC<AddEditCrmLeadProps> = ({
  isOpen,
  onClose,
  editMode = false,
  currentLead = null,
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
  const [relatedContact, setRelatedContact] = useState<any>(null)

  const { data: contactData } = api.projectContact.getById.useQuery(
    { id: currentLead?.contactId || '' },
    { enabled: !!currentLead?.contactId }
  )

  const createLead = api.projectLead.create.useMutation({
    onSuccess: () => {
      toast.success('Lead created successfully!')
      utils.projectLead.getAll.invalidate({ projectId })
      onSuccess?.()
      handleClose()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create lead')
    },
  })

  const updateLead = api.projectLead.update.useMutation({
    onSuccess: () => {
      toast.success('Lead updated successfully!')
      utils.projectLead.getAll.invalidate({ projectId })
      onSuccess?.()
      handleClose()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update lead')
    },
  })

  const uploadFile = api.projectLeadFile.getUploadUrl.useMutation()
  const createFile = api.projectLeadFile.create.useMutation()
  const deleteFile = api.projectLeadFile.delete.useMutation()

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema) as any,
  })

  const resetForm = useCallback(() => {
    reset({
      name: '',
      email: '',
      phoneNumber: '',
      description: '',
      companyName: '',
      gender: undefined,
      location: '',
      age: undefined,
      jobPosition: '',
      industry: '',
      contactId: undefined,
    })
    setGender(null)
    setPreview(null)
    setSelectedFile(null)
    setExistingImageId(null)
    setRelatedContact(null)
  }, [reset])

  useEffect(() => {
    if (editMode && currentLead) {
      setValue('name', currentLead.name)
      setValue('email', currentLead.email || '')
      setValue('phoneNumber', currentLead.phoneNumber || '')
      setValue('description', currentLead.description || '')
      setValue('companyName', currentLead.companyName || '')
      setValue('gender', currentLead.gender || undefined)
      setValue('location', currentLead.location || '')
      setValue('age', currentLead.age || undefined)
      setValue('jobPosition', currentLead.jobPosition || '')
      setValue('industry', currentLead.industry || '')
      setValue('contactId', currentLead.contactId || undefined)

      if (currentLead.gender) {
        setGender({
          value: currentLead.gender,
          label: currentLead.gender.charAt(0) + currentLead.gender.slice(1).toLowerCase(),
        })
      }

      if (currentLead.contactId) {
        setRelatedContact(contactData)
      }

      const profileImage = currentLead.files?.find(
        (file: any) => file.fileType === 'IMAGE'
      )

      if (profileImage) {
        setPreview(profileImage.s3Url)
        setExistingImageId(profileImage.id)
      } else {
        setPreview(DEFAULT_AVATAR)
        setExistingImageId(null)
      }
    } else {
      resetForm()
    }
  }, [editMode, currentLead, setValue, resetForm, contactData])

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
    if (editMode && currentLead && existingImageId) {
      try {
        await deleteFile.mutateAsync({
          fileId: existingImageId,
          leadId: currentLead.id,
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

  const uploadImageToS3 = async (leadId: string, file: File) => {
    try {
      const uploadUrlData = await uploadFile.mutateAsync({
        leadId,
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
        throw new Error('Failed to upload file to S3')
      }

      await createFile.mutateAsync({
        leadId,
        name: file.name,
        fileName: uploadUrlData.fileName,
        fileType: 'IMAGE',
        mimeType: file.type,
        fileSize: file.size,
        s3Key: uploadUrlData.s3Key,
        isPublic: true,
      })

      utils.projectLead.getAll.invalidate({ projectId })

      return true
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    }
  }

  const onSubmit = async (data: LeadFormData) => {
    try {
      setIsUploading(true)

      if (editMode && currentLead) {
        await updateLead.mutateAsync({
          id: currentLead.id,
          projectId,
          ...data,
        })

        if (selectedFile) {
          await uploadImageToS3(currentLead.id, selectedFile)
        }
      } else {
        const newLead = await createLead.mutateAsync({
          projectId,
          ...data,
        })

        if (selectedFile) {
          await uploadImageToS3(newLead.id, selectedFile)
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error('An error occurred while saving the lead')
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
      id={editMode ? 'showEditLeadForm' : 'showAddLeadForm'}
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
                        alt="lead image"
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

            {editMode && currentLead?.contactId && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-800">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <Link className="size-4" />
                  <span className="text-sm font-medium">
                    Created from Contact
                  </span>
                </div>
                {relatedContact && (
                  <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                    <p>
                      <span className="font-medium">Contact:</span>{' '}
                      {relatedContact.name}
                    </p>
                    <p>
                      <span className="font-medium">Company:</span>{' '}
                      {relatedContact.companyName || 'N/A'}
                    </p>
                    <p>
                      <span className="font-medium">Role:</span>{' '}
                      {relatedContact.role || 'N/A'}
                    </p>
                  </div>
                )}
                <p className="mt-2 text-xs text-blue-500 dark:text-blue-400">
                  Changes to this lead will not affect the original contact
                </p>
              </div>
            )}

            <div className="grid grid-cols-12 gap-4 mt-5">
              <div className="col-span-9">
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
              <div className="col-span-3">
                <label htmlFor="ageInput" className="form-label">
                  Age
                </label>
                <input
                  type="number"
                  id="ageInput"
                  className="form-input"
                  placeholder="Age"
                  min="0"
                  max="150"
                  onWheel={(e) => e.currentTarget.blur()}
                  {...register('age')}
                />
                {errors.age && (
                  <span className="text-red-500">{errors.age.message}</span>
                )}
              </div>

              <div className="col-span-6">
                <label htmlFor="genderSelect" className="form-label">
                  Gender
                </label>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Select
                      value={genderOptions.find((opt) => opt.value === value) || null}
                      onChange={(option) => {
                        onChange(option?.value)
                        setGender(option)
                      }}
                      options={genderOptions}
                      classNamePrefix="select"
                      placeholder="Select gender"
                      isClearable
                    />
                  )}
                />
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
              </div>

              <div className="col-span-6">
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

              <div className="col-span-6">
                <label htmlFor="jobPositionInput" className="form-label">
                  Job Position
                </label>
                <input
                  type="text"
                  id="jobPositionInput"
                  className="form-input"
                  placeholder="e.g. CEO, Manager"
                  {...register('jobPosition')}
                />
              </div>

              <div className="col-span-7">
                <label htmlFor="phoneNumber" className="form-label">
                  Phone Number
                </label>
                <PhoneInput
                  defaultCountry="us"
                  value={watch('phoneNumber')}
                  onChange={(value) => {
                    setValue('phoneNumber', value || '')
                  }}
                  className={`${errors.phoneNumber ? 'border-red-500' : ''}`}
                  placeholder="Enter phone number"
                />
                {errors.phoneNumber && (
                  <span className="text-red-500">
                    {errors.phoneNumber.message}
                  </span>
                )}
              </div>

              <div className="col-span-6">
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
              </div>

              <div className="col-span-6">
                <label htmlFor="industryInput" className="form-label">
                  Industry
                </label>
                <input
                  type="text"
                  id="industryInput"
                  className="form-input"
                  placeholder="e.g. Technology, Healthcare"
                  {...register('industry')}
                />
              </div>

              <div className="col-span-12">
                <label htmlFor="descriptionInput" className="form-label">
                  Description
                </label>
                <textarea
                  id="descriptionInput"
                  className="form-input"
                  rows={3}
                  placeholder="Lead description..."
                  {...register('description')}
                />
              </div>

              {editMode && currentLead && (
                <div className="col-span-12">
                  <label className="form-label">Status</label>
                  <div className="mt-2">
                    <span
                      className={
                        currentLead.status === 'PROCESSING'
                          ? 'badge badge-blue'
                          : currentLead.status === 'COMPLETED'
                            ? 'badge badge-green'
                            : currentLead.status === 'FAILED'
                              ? 'badge badge-red'
                              : 'badge'
                      }>
                      {currentLead.status === 'PROCESSING'
                        ? 'Processing'
                        : currentLead.status === 'COMPLETED'
                          ? 'Completed'
                          : currentLead.status === 'FAILED'
                            ? 'Failed'
                            : currentLead.status}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end col-span-12 gap-2 mt-5">
                <button
                  type="button"
                  className="btn btn-outline-red"
                  onClick={onClose}
                  disabled={isSubmitting || isUploading}>
                  <span className="align-baseline">Close</span>
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting || isUploading}>
                  <Plus className="inline-block ltr:mr-1 rtl:ml-1 size-4" />
                  {isSubmitting || isUploading
                    ? 'Saving...'
                    : editMode
                      ? 'Update Lead'
                      : 'Add Lead'}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    />
  )
}

export default AddEditCrmLead
