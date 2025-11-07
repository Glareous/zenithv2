'use client'

import React, { useEffect, useState } from 'react'
import { useRef } from 'react'
import { Suspense } from 'react'

import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import BreadCrumb from '@src/components/common/BreadCrumb'
import DeleteModal from '@src/components/common/DeleteModal'
import { OptionType } from '@src/data/ecommerce/product-list'
import Layout from '@src/layout/Layout'
import { RootState } from '@src/slices/reducer'
import { api } from '@src/trpc/react'
import { ImagePlus, Plus, Trash2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { Controller, useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import Select from 'react-select'
import { ToastContainer, toast } from 'react-toastify'
import 'swiper/css'
import 'swiper/css/pagination'
import { z } from 'zod'

const pricingTypeOptions = [
  { value: 'HOURLY', label: 'Hourly Rate' },
  { value: 'FIXED', label: 'Fixed Price' },
  { value: 'MONTHLY', label: 'Monthly Subscription' },
  { value: 'SQUARE_METER', label: 'Per Square Meter (m²)' },
]

const serviceSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  price: z.number().min(0, 'Price must be greater than 0'),
  pricingType: z.enum(['HOURLY', 'FIXED', 'MONTHLY', 'SQUARE_METER']),
  categoryIds: z.array(z.string()).min(1, 'Select at least one category'),
  description: z.string().optional(),
  isActive: z.boolean(),
})

type ServiceFormData = {
  name: string
  price: number
  pricingType: 'HOURLY' | 'FIXED' | 'MONTHLY' | 'SQUARE_METER'
  categoryIds: string[]
  description?: string
  isActive: boolean
}

export default function CreateServicePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateServiceForm />
    </Suspense>
  )
}

function CreateServiceForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const serviceId = searchParams.get('id')
  const isEditMode = !!serviceId

  const [preview1, setPreview1] = useState<string | null>(null)
  const [preview1Error, setPreview1Error] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview2, setPreview2] = useState<string | null>(null)
  const [preview3, setPreview3] = useState<string | null>(null)

  const [uploadedFileId1, setUploadedFileId1] = useState<string | null>(null)
  const [uploadedFileId2, setUploadedFileId2] = useState<string | null>(null)
  const [uploadedFileId3, setUploadedFileId3] = useState<string | null>(null)

  const [imageUrl1, setImageUrl1] = useState<string | null>(null)
  const [imageUrl2, setImageUrl2] = useState<string | null>(null)
  const [imageUrl3, setImageUrl3] = useState<string | null>(null)

  const [defaultsInitialized, setDefaultsInitialized] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [price, setPrice] = useState<number | undefined>()

  const currentProject = useSelector(
    (state: RootState) => state.Project.currentProject
  )
  const projectId = currentProject?.id || ''

  const { data: categories, isLoading: loadingCategories } =
    api.projectCategory.getAll.useQuery(
      { projectId, type: 'SERVICE' },
      { enabled: !!projectId }
    )

  const { data: existingService } = api.projectService.getById.useQuery(
    { id: serviceId! },
    { enabled: isEditMode && !!serviceId }
  )

  const updateService = api.projectService.update.useMutation()
  const createService = api.projectService.create.useMutation()
  const deleteService = api.projectService.delete.useMutation()

  const getUploadUrlMutation = api.projectServiceFile.getUploadUrl.useMutation()
  const createFileMutation = api.projectServiceFile.create.useMutation()
  const deleteFileMutation = api.projectServiceFile.delete.useMutation()

  const uploadImagesAfterServiceCreation = async (serviceId: string) => {
    const imageFiles = [
      { file: document.getElementById('logo1') as HTMLInputElement, index: 1 },
      { file: document.getElementById('logo2') as HTMLInputElement, index: 2 },
      { file: document.getElementById('logo3') as HTMLInputElement, index: 3 },
    ]

    for (const { file, index } of imageFiles) {
      if (file.files && file.files[0]) {
        try {
          const uploadResult = await getUploadUrlMutation.mutateAsync({
            serviceId: serviceId,
            fileName: file.files[0].name,
            fileType: file.files[0].type,
            fileSize: file.files[0].size,
          })

          const uploadResponse = await fetch(uploadResult.uploadUrl, {
            method: 'PUT',
            body: file.files[0],
            headers: {
              'Content-Type': file.files[0].type,
            },
            mode: 'cors',
          })

          if (uploadResponse.ok) {
            await createFileMutation.mutateAsync({
              serviceId: serviceId,
              name: file.files[0].name,
              fileName: uploadResult.fileName,
              fileType: 'IMAGE',
              mimeType: file.files[0].type,
              fileSize: file.files[0].size,
              s3Key: uploadResult.s3Key,
              description: 'Service image',
              isPublic: true,
            })
          }
        } catch (error) {
          console.error(`Error uploading image ${index}:`, error)
          toast.error(`Error uploading image ${index}`)
        }
      }
    }
  }

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setPreview: React.Dispatch<React.SetStateAction<string | null>>,
    imageIndex: number
  ) => {
    const file = event.target.files?.[0] || null
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setPreview1Error(false)
    } else {
      setPreview(null)
      setPreview1Error(true)
    }
  }

  const handleDeleteImage = async (imageIndex: number) => {
    let fileId: string | null = null
    let setPreview: React.Dispatch<React.SetStateAction<string | null>>
    let setImageUrlState: React.Dispatch<React.SetStateAction<string | null>>
    let setFileId: React.Dispatch<React.SetStateAction<string | null>>

    switch (imageIndex) {
      case 1:
        fileId = uploadedFileId1
        setPreview = setPreview1
        setImageUrlState = setImageUrl1
        setFileId = setUploadedFileId1
        break
      case 2:
        fileId = uploadedFileId2
        setPreview = setPreview2
        setImageUrlState = setImageUrl2
        setFileId = setUploadedFileId2
        break
      case 3:
        fileId = uploadedFileId3
        setPreview = setPreview3
        setImageUrlState = setImageUrl3
        setFileId = setUploadedFileId3
        break
      default:
        return
    }

    try {
      if (fileId) {
        await deleteFileMutation.mutateAsync({ id: fileId })
        setFileId(null)
      }

      setPreview(null)
      setImageUrlState(null)

      const fileInput = document.getElementById(
        `logo${imageIndex}`
      ) as HTMLInputElement
      if (fileInput) {
        fileInput.value = ''
      }

      toast.success('Image deleted successfully')
    } catch (error: any) {
      console.error('Delete error:', error)
      toast.error(`Error deleting image: ${error.message}`)
    }
  }

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      price: 0,
      pricingType: 'FIXED',
      categoryIds: [],
      description: '',
      isActive: true,
    },
  })

  const categoryOptions = (categories?.categories ?? []).map((cat: any) => ({
    label: cat.name,
    value: cat.id,
    isDefault: cat.isDefault,
  }))

  useEffect(() => {
    if (!isEditMode && !defaultsInitialized && categoryOptions.length > 0) {
      const currentCategories = getValues('categoryIds')
      if (currentCategories.length === 0) {
        const defaultCategory =
          categoryOptions.find((c) => c.isDefault) || categoryOptions[0]
        setValue('categoryIds', [defaultCategory.value])
      }

      setDefaultsInitialized(true)
    }
  }, [isEditMode, defaultsInitialized, categoryOptions, setValue, getValues])

  useEffect(() => {
    if (isEditMode && existingService) {
      setValue('name', existingService.name)
      setValue('description', existingService.description || '')
      setValue('price', existingService.price || 0)
      setValue('pricingType', existingService.pricingType || 'FIXED')
      setValue('isActive', existingService.isActive)
      setValue(
        'categoryIds',
        existingService.categories.map((c) => c.category.id)
      )

      setPrice(existingService.price || 0)

      if (existingService.files && existingService.files.length > 0) {
        existingService.files.forEach((file, index) => {
          if (index === 0) {
            setPreview1(file.s3Url)
            setImageUrl1(file.s3Url)
            setUploadedFileId1(file.id)
          } else if (index === 1) {
            setPreview2(file.s3Url)
            setImageUrl2(file.s3Url)
            setUploadedFileId2(file.id)
          } else if (index === 2) {
            setPreview3(file.s3Url)
            setImageUrl3(file.s3Url)
            setUploadedFileId3(file.id)
          }
        })
      }
    }
  }, [isEditMode, existingService, setValue])

  const onSubmit = async (data: ServiceFormData) => {
    if (data.categoryIds.length === 0) {
      toast.error('You must select at least one category')
      return
    }

    const submitData = {
      projectId,
      name: data.name,
      price: data.price,
      pricingType: data.pricingType,
      categoryIds: data.categoryIds,
      description: data.description,
      isActive: data.isActive,
    }

    try {
      if (isEditMode && serviceId) {
        await updateService.mutateAsync({
          id: serviceId,
          ...submitData,
        })

        await uploadImagesAfterServiceCreation(serviceId)
        toast.success('Service updated successfully')
      } else {
        const newService = await createService.mutateAsync(submitData)

        await uploadImagesAfterServiceCreation(newService.id)
        toast.success('Service created successfully')
      }

      router.push('/apps/service/list')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleReset = async () => {
    try {
      const deletePromises = []

      if (uploadedFileId1) {
        deletePromises.push(
          deleteFileMutation.mutateAsync({ id: uploadedFileId1 })
        )
      }
      if (uploadedFileId2) {
        deletePromises.push(
          deleteFileMutation.mutateAsync({ id: uploadedFileId2 })
        )
      }
      if (uploadedFileId3) {
        deletePromises.push(
          deleteFileMutation.mutateAsync({ id: uploadedFileId3 })
        )
      }

      if (deletePromises.length > 0) {
        await Promise.all(deletePromises)
        toast.success('Images deleted from server')
      }

      setPreview1(null)
      setPreview2(null)
      setPreview3(null)
      setPreview1Error(false)
      setImageUrl1(null)
      setImageUrl2(null)
      setImageUrl3(null)
      setUploadedFileId1(null)
      setUploadedFileId2(null)
      setUploadedFileId3(null)

      setDefaultsInitialized(false)

      reset()

      if (!isEditMode) {
        const defaultCategory =
          categoryOptions.find((c) => c.isDefault) || categoryOptions[0]
        setValue('categoryIds', [defaultCategory?.value])
      }

      const fileInputs = ['logo1', 'logo2', 'logo3']
      fileInputs.forEach((id) => {
        const fileInput = document.getElementById(id) as HTMLInputElement
        if (fileInput) {
          fileInput.value = ''
        }
      })

      toast.success('Form reset successfully')
    } catch (error: any) {
      console.error('Error during reset:', error)
      toast.error('Error resetting form')
    }
  }

  const handleDelete = () => {
    if (isEditMode && serviceId) {
      setIsDeleteModalOpen(true)
    }
  }

  const handleConfirmDelete = async () => {
    if (isEditMode && serviceId) {
      try {
        await deleteService.mutateAsync({ id: serviceId })

        toast.success('Service deleted successfully')
        router.push('/apps/service/list')
      } catch (error: any) {
        toast.error(error.message)
      }

      setIsDeleteModalOpen(false)
    }
  }

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
  }

  const validateNumber = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    const regex = /^[0-9]*$/

    if (regex.test(value)) {
      if (event.target.name === 'price') {
        setPrice(Number(value))
      }
    }
  }

  return (
    <React.Fragment>
      <BreadCrumb
        title={isEditMode ? 'Edit Service' : 'Create Service'}
        subTitle="Services"
      />
      <form onSubmit={handleSubmit(onSubmit)} className="card p-5">
        <div className="flex flex-wrap items-center gap-5 mb-5">
          <div className="grow">
            <h6 className="mb-1 card-title">
              {isEditMode ? 'Edit Service' : 'Create Service'}
            </h6>
            {!isEditMode && (
              <p className="text-gray-500 dark:text-dark-500">
                Complete the form to create a new service.
              </p>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            {isEditMode && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteService.isPending}
                className="btn btn-red">
                <Trash2 className="inline-block ltr:mr-1 rtl:ml-1 align-center size-4" />
                <span className="align-middle">
                  {deleteService.isPending ? 'Deleting...' : 'Delete'}
                </span>
              </button>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="btn btn-outline-red">
              <span className="align-middle">Reset</span>
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting ||
                createService.isPending ||
                updateService.isPending
              }
              className="btn btn-primary">
              <Plus className="inline-block ltr:mr-1 rtl:ml-1 align-center size-4" />
              <span className="align-middle">
                {isSubmitting ||
                createService.isPending ||
                updateService.isPending
                  ? 'Saving...'
                  : isEditMode
                    ? 'Update Service'
                    : 'Add Service'}
              </span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-12 xl:col-span-8">
            <div className="card">
              <div className="card-header">
                <h6 className="card-title">Service Description</h6>
              </div>
              <div className="card-body">
                <div>
                  <div className="grid grid-cols-12 gap-5">
                    <div className="col-span-12">
                      <label htmlFor="serviceNameInput" className="form-label">
                        Service Name
                      </label>
                      <input
                        type="text"
                        id="serviceNameInput"
                        className="form-input"
                        placeholder="Enter the service name"
                        {...register('name')}
                      />
                      {errors.name && (
                        <span className="text-red-500">
                          {errors.name.message}
                        </span>
                      )}
                    </div>
                    <div className="col-span-12">
                      <label
                        htmlFor="descriptionTextarea"
                        className="form-label">
                        Description
                      </label>
                      <textarea
                        id="descriptionTextarea"
                        rows={3}
                        className="h-auto form-input"
                        placeholder="Enter the service description"
                        {...register('description')}
                      />
                    </div>
                    <div className="col-span-12 md:col-span-6">
                      <label className="form-label">Categories</label>
                      <Controller
                        name="categoryIds"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <Select
                            isMulti
                            options={categoryOptions}
                            value={categoryOptions.filter((option) =>
                              value?.includes(option.value)
                            )}
                            onChange={(selected) => {
                              const selectedValues = selected
                                ? selected.map((s) => s.value)
                                : []
                              onChange(selectedValues)
                            }}
                            placeholder={
                              loadingCategories
                                ? 'Loading...'
                                : 'Select categories'
                            }
                            isDisabled={loadingCategories}
                            classNamePrefix="select"
                          />
                        )}
                      />
                      {errors.categoryIds && (
                        <span className="text-red-500">
                          {errors.categoryIds.message}
                        </span>
                      )}
                    </div>
                    <div className="col-span-12 md:col-span-6">
                      <label className="form-label">Pricing Type</label>
                      <Controller
                        name="pricingType"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <Select
                            options={pricingTypeOptions}
                            value={pricingTypeOptions.find(
                              (option) => option.value === value
                            )}
                            onChange={(selected) => {
                              onChange(selected?.value || 'FIXED')
                            }}
                            placeholder="Select pricing type"
                            className="react-select-container"
                            classNamePrefix="select"
                          />
                        )}
                      />
                      {errors.pricingType && (
                        <span className="text-red-500">
                          {errors.pricingType.message}
                        </span>
                      )}
                    </div>
                    <div className="col-span-12 md:col-span-6">
                      <label htmlFor="priceInput" className="form-label">
                        Price
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <input
                          type="number"
                          id="priceInput"
                          step="0.01"
                          className="form-input pl-8 [&::-webkit-inner-spin-button]:appearance-none"
                          placeholder="0.00"
                          onWheel={(e) => e.currentTarget.blur()}
                          {...register('price', {
                            valueAsNumber: true,
                            onChange: (e) => {
                              validateNumber(e)
                              setPrice(Number(e.target.value) || 0)
                            },
                          })}
                          value={price || ''}
                        />
                      </div>
                      {errors.price && (
                        <span className="text-red-500">
                          {errors.price.message}
                        </span>
                      )}
                    </div>
                    <div className="col-span-12 md:col-span-6">
                      <label className="form-label">State</label>
                      <Controller
                        name="isActive"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <Select
                            options={[
                              { label: 'Active', value: true },
                              { label: 'Inactive', value: false },
                            ]}
                            value={{
                              label: value ? 'Active' : 'Inactive',
                              value,
                            }}
                            onChange={(selected) =>
                              onChange(selected?.value ?? true)
                            }
                            classNamePrefix="select"
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-header">
                <h6 className="card-title">Service Images</h6>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-12 gap-5">
                  <div className="col-span-12 md:col-span-7 md:row-span-2">
                    <div className="h-full relative">
                      <label
                        htmlFor="logo1"
                        className="flex items-center justify-center h-full p-5 text-center border border-gray-200 border-dashed cursor-pointer dark:border-dark-800">
                        {preview1 ? (
                          <div className="relative w-full h-full">
                            <Image
                              src={preview1}
                              alt="previewImg"
                              className="mx-auto h-60"
                              width={472}
                              height={240}
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleDeleteImage(1)
                              }}
                              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors">
                              <Trash2 className="w-6 h-6" />
                            </button>
                          </div>
                        ) : (
                          <div className="text-gray-500 dark:text-dark-500">
                            <ImagePlus className="mx-auto" />
                            <div className="mt-3">Service Image 1</div>
                          </div>
                        )}
                      </label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        name="logo1"
                        id="logo1"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, setPreview1, 1)}
                        accept=".jpg,.jpeg,.png,.gif,.webp"
                      />
                      {preview1Error && (
                        <span className="text-red-500 mt-2">
                          Image is required
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="col-span-12 md:col-span-5">
                    <div className="relative">
                      <label
                        htmlFor="logo2"
                        className="flex items-center justify-center h-56 p-5 text-center border border-gray-200 border-dashed cursor-pointer dark:border-dark-800">
                        {preview2 ? (
                          <div className="relative w-full h-full">
                            <Image
                              src={preview2}
                              alt="preview2"
                              className="mx-auto h-44"
                              width={319}
                              height={176}
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleDeleteImage(2)
                              }}
                              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors">
                              <Trash2 className="w-6 h-6" />
                            </button>
                          </div>
                        ) : (
                          <div className="text-gray-500 dark:text-dark-500">
                            <ImagePlus className="mx-auto" />
                            <div className="mt-3">Service Image 2</div>
                          </div>
                        )}
                      </label>
                      <input
                        type="file"
                        name="logo2"
                        id="logo2"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, setPreview2, 2)}
                        accept=".jpg,.jpeg,.png,.gif,.webp"
                      />
                    </div>
                  </div>
                  <div className="col-span-12 md:col-span-5">
                    <div className="relative">
                      <label
                        htmlFor="logo3"
                        className="flex items-center justify-center h-56 p-5 text-center border border-gray-200 border-dashed cursor-pointer dark:border-dark-800">
                        {preview3 ? (
                          <div className="relative w-full h-full">
                            <Image
                              src={preview3}
                              alt="preview3"
                              className="mx-auto h-44"
                              width={319}
                              height={176}
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleDeleteImage(3)
                              }}
                              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors">
                              <Trash2 className="w-6 h-6" />
                            </button>
                          </div>
                        ) : (
                          <div className="text-gray-500 dark:text-dark-500">
                            <ImagePlus className="mx-auto" />
                            <div className="mt-3">Service Image 3</div>
                          </div>
                        )}
                      </label>
                      <input
                        type="file"
                        name="logo3"
                        id="logo3"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, setPreview3, 3)}
                        accept=".jpg,.jpeg,.png,.gif,.webp"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-12 xl:col-span-4"></div>
        </div>
        <DeleteModal
          show={isDeleteModalOpen}
          handleHide={handleCloseDeleteModal}
          deleteModalFunction={handleConfirmDelete}
          title="Delete Service"
          message="Are you sure you want to delete this service? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          type="delete"
        />
      </form>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </React.Fragment>
  )
}

CreateServiceForm.getLayout = (
  page: React.ReactElement
): React.ReactElement => {
  return <Layout breadcrumbTitle="Create Service">{page}</Layout>
}
