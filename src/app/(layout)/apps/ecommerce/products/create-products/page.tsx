'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useRef } from 'react'
import { Suspense } from 'react'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import BreadCrumb from '@src/components/common/BreadCrumb'
import DeleteModal from '@src/components/common/DeleteModal'
import WareHomeTable from '@src/components/molecules/WareHomeTable'
import { OptionType } from '@src/data/ecommerce/product-list'
import { NextPageWithLayout } from '@src/dtos'
import Layout from '@src/layout/Layout'
import { RootState } from '@src/slices/reducer'
import { api } from '@src/trpc/react'
import { ImagePlus, Plus, Trash2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { Controller, useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import Select, { MultiValue } from 'react-select'
import { ToastContainer, toast } from 'react-toastify'
import 'swiper/css'
import 'swiper/css/pagination'
import { z } from 'zod'

const productSchema = z.object({
  name: z.string().min(1, 'Nombre del producto es requerido'),
  price: z.number().min(0, 'Precio debe ser mayor a 0'),
  categoryIds: z.array(z.string()).min(1, 'Selecciona al menos una categoría'),
  warehouses: z
    .array(
      z.object({
        warehouseId: z.string(),
        stock: z.number().min(0, 'Stock debe ser mayor o igual a 0'),
      })
    )
    .min(1, 'Selecciona al menos un almacén'),
  description: z.string().optional(),
  isActive: z.boolean(),
})

type ProductFormData = {
  name: string
  price: number
  categoryIds: string[]
  warehouses: { warehouseId: string; stock: number }[]
  description?: string
  isActive: boolean
}

export default function CreateProductPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateProductForm />
    </Suspense>
  )
}

function CreateProductForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const productId = searchParams.get('id')
  const isEditMode = !!productId

  const [productColor, setProductColor] = useState<number>(1)
  const [productSize, setProductSize] = useState<number>(1)
  const [preview1, setPreview1] = useState<string | null>(null)
  const [preview1Error, setPreview1Error] = useState<boolean>(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview2, setPreview2] = useState<string | null>(null)
  const [preview3, setPreview3] = useState<string | null>(null)

  const [uploadedFileId1, setUploadedFileId1] = useState<string | null>(null)
  const [uploadedFileId2, setUploadedFileId2] = useState<string | null>(null)
  const [uploadedFileId3, setUploadedFileId3] = useState<string | null>(null)

  const [imageUrl1, setImageUrl1] = useState<string | null>(null)
  const [imageUrl2, setImageUrl2] = useState<string | null>(null)
  const [imageUrl3, setImageUrl3] = useState<string | null>(null)

  const [categoryList, setCategoryList] = useState<OptionType | null>(null)
  const [brandList, setBrandList] = useState<OptionType | null>(null)
  const [statusList, setStatusList] = useState<OptionType | null>(null)
  const [stock, setStock] = useState(10)
  const [quantity, setQuantity] = useState(0)
  const [revenue, setRevenue] = useState<number>(0)
  const [errorMessage, setErrorMessage] = useState('')
  const [previousPage, setPreviousPage] = useState(
    '/apps/ecommerce/products/list'
  )
  const [price, setPrice] = useState<number | undefined>()
  const [priceError, setPriceError] = useState<boolean>(false)
  const [discount, setDiscount] = useState<string | number>('')

  const [warehouseStockData, setWarehouseStockData] = useState<
    Array<{
      id: string
      warehouseId: string
      name: string
      isDefault: boolean
      stock: number
      minQuantity: number
    }>
  >([])

  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null)

  const [defaultsInitialized, setDefaultsInitialized] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const currentProject = useSelector(
    (state: RootState) => state.Project.currentProject
  )
  const projectId = currentProject?.id || ''

  const { data: categories, isLoading: loadingCategories } =
    api.projectCategory.getAll.useQuery(
      { projectId, type: 'PRODUCT' },
      { enabled: !!projectId }
    )

  const { data: existingProduct } = api.projectProduct.getById.useQuery(
    { id: productId! },
    { enabled: isEditMode && !!productId }
  )

  const updateProduct = api.projectProduct.update.useMutation()
  const createProduct = api.projectProduct.create.useMutation()
  const deleteProduct = api.projectProduct.delete.useMutation()

  const getUploadUrlMutation = api.projectProductFile.getUploadUrl.useMutation()
  const createFileMutation = api.projectProductFile.create.useMutation()

  const deleteFileMutation = api.projectProductFile.delete.useMutation()

  const uploadImageToS3 = async (file: File, imageIndex: number) => {
    try {
      if (isEditMode && productId) {
        const uploadResult = await getUploadUrlMutation.mutateAsync({
          productId: productId,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        })

        console.log('Upload result:', uploadResult)

        const uploadResponse = await fetch(uploadResult.uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
          mode: 'cors',
        })

        if (!uploadResponse.ok) {
          throw new Error(
            `Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`
          )
        }

        const createFileResult = await createFileMutation.mutateAsync({
          productId: productId,
          name: file.name,
          fileName: uploadResult.fileName,
          fileType: 'IMAGE',
          mimeType: file.type,
          fileSize: file.size,
          s3Key: uploadResult.s3Key,
          description: 'Product image',
          isPublic: true,
        })

        switch (imageIndex) {
          case 1:
            setUploadedFileId1(createFileResult.id)
            setImageUrl1(createFileResult.s3Url)
            break
          case 2:
            setUploadedFileId2(createFileResult.id)
            setImageUrl2(createFileResult.s3Url)
            break
          case 3:
            setUploadedFileId3(createFileResult.id)
            setImageUrl3(createFileResult.s3Url)
            break
        }

        return createFileResult.s3Url
      } else {
        throw new Error('Please save the product first before uploading images')
      }
    } catch (error) {
      console.error('Upload error:', error)
      throw error
    }
  }

  const uploadImagesAfterProductCreation = async (productId: string) => {
    const imageFiles = [
      { file: document.getElementById('logo1') as HTMLInputElement, index: 1 },
      { file: document.getElementById('logo2') as HTMLInputElement, index: 2 },
      { file: document.getElementById('logo3') as HTMLInputElement, index: 3 },
    ]

    for (const { file, index } of imageFiles) {
      if (file.files && file.files[0]) {
        try {
          const uploadResult = await getUploadUrlMutation.mutateAsync({
            productId: productId,
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
              productId: productId,
              name: file.files[0].name,
              fileName: uploadResult.fileName,
              fileType: 'IMAGE',
              mimeType: file.files[0].type,
              fileSize: file.files[0].size,
              s3Key: uploadResult.s3Key,
              description: 'Product image',
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
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      price: 0,
      categoryIds: [],
      warehouses: [],
      description: '',
      isActive: true,
    },
  })

  const categoryOptions = (categories?.categories ?? []).map((cat: any) => ({
    label: cat.name,
    value: cat.id,
    isDefault: cat.isDefault,
  }))

  const { data: warehouses } = api.projectProductWarehouse.getAll.useQuery(
    { projectId },
    { enabled: !!projectId }
  )

  const warehouseOptions = (warehouses ?? []).map((wh) => ({
    label: `${wh.name} (${wh.warehouseId})`,
    value: wh.id,
    isDefault: wh.isDefault,
  }))

  const handleCategoryChange = (
    selected: OptionType | null,
    onChange: (value: string[]) => void
  ) => {
    setCategoryList(selected)
    onChange(selected ? [selected.value] : [])
  }
  const handleBrandChange = (
    selected: OptionType | null,
    onChange: (value: string[]) => void
  ) => {
    setBrandList(selected)
    onChange(selected ? [selected.value] : [])
  }
  const handleStatusChange = (
    selected: OptionType | null,
    onChange: (value: OptionType | null) => void
  ) => {
    setStatusList(selected)
    onChange(selected)
  }
  const handleSizeChange = (
    selected: MultiValue<OptionType>,
    onChange: (value: string[]) => void
  ) => {
    const selectedValues = selected.map((option) => option.value)
    onChange(selectedValues)
  }
  const handleColorChange = (
    selected: MultiValue<OptionType>,
    onChange: (value: string[]) => void
  ) => {
    const selectedValues = selected.map((option) => option.value)
    onChange(selectedValues)
  }

  const handleIncrement =
    (setter: React.Dispatch<React.SetStateAction<number>>) => () => {
      if (quantity < stock) {
        setter((prev) => prev + 1)
        setErrorMessage('')
      } else {
        setErrorMessage(
          `Cannot add quantity more than available stock (${stock}).`
        )
      }
    }
  const handleDecrement =
    (setter: React.Dispatch<React.SetStateAction<number>>) => () => {
      if (quantity > 0) {
        setter((prev) => prev - 1)
        setErrorMessage('')
      } else {
        setErrorMessage('Quantity cannot be less than 0.')
      }
    }

  const handleWarehouseDataChange = useCallback(
    (
      data: Array<{
        id: string
        warehouseId: string
        name: string
        isDefault: boolean
        stock: number
        minQuantity: number
      }>
    ) => {
      console.log('🔄 handleWarehouseDataChange called with:', data)
      setWarehouseStockData(data)

      const warehouseFormData = data.map((warehouse) => ({
        warehouseId: warehouse.id,
        stock: warehouse.stock,
      }))
      console.log(' Setting form value:', warehouseFormData)
      setValue('warehouses', warehouseFormData)
    },
    [setValue]
  )

  useEffect(() => {
    if (
      !isEditMode &&
      !defaultsInitialized &&
      categoryOptions.length > 0 &&
      warehouseOptions.length > 0
    ) {
      const currentCategories = getValues('categoryIds')
      if (currentCategories.length === 0) {
        const defaultCategory =
          categoryOptions.find((c) => c.isDefault) || categoryOptions[0]
        setValue('categoryIds', [defaultCategory.value])
      }

      const currentWarehouses = getValues('warehouses')
      if (currentWarehouses.length === 0) {
        const defaultWarehouse =
          warehouseOptions.find((w) => w.isDefault) || warehouseOptions[0]
        setValue('warehouses', [
          { warehouseId: defaultWarehouse.value, stock: 0 },
        ])
      }

      setDefaultsInitialized(true)
    }
  }, [
    isEditMode,
    defaultsInitialized,
    categoryOptions,
    warehouseOptions,
    setValue,
    getValues,
  ])

  useEffect(() => {
    if (isEditMode && existingProduct) {
      setValue('name', existingProduct.name)
      setValue('description', existingProduct.description || '')
      setValue('price', existingProduct.price || 0)
      setValue('isActive', existingProduct.isActive)
      setValue(
        'categoryIds',
        existingProduct.categories.map((c) => c.category.id)
      )

      const existingWarehouses = existingProduct.warehouses.map((w) => ({
        warehouseId: w.warehouse.id,
        stock: w.stock,
      }))
      setValue('warehouses', existingWarehouses)

      const warehouseDataForTable = existingProduct.warehouses.map((w) => ({
        id: w.warehouse.id,
        warehouseId: w.warehouse.warehouseId,
        name: w.warehouse.name,
        isDefault: w.warehouse.isDefault,
        stock: w.stock,
        minQuantity: 0,
      }))
      setWarehouseStockData(warehouseDataForTable)

      setPrice(existingProduct.price || 0)

      if (existingProduct.files && existingProduct.files.length > 0) {
        existingProduct.files.forEach((file, index) => {
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
  }, [isEditMode, existingProduct, setValue])

  useEffect(() => {
    const savedPreviousPage = localStorage.getItem('previousPage')
    if (savedPreviousPage) {
      setPreviousPage(savedPreviousPage)
    }
  }, [])

  const onSubmit = async (data: ProductFormData) => {
    if (data.categoryIds.length === 0) {
      toast.error('You must select at least one category')
      return
    }

    if (data.warehouses.length === 0) {
      toast.error('You must select at least one warehouse')
      return
    }

    const submitData = {
      projectId,
      name: data.name,
      price: data.price,
      categoryIds: data.categoryIds,
      warehouseIds: data.warehouses.map((w) => w.warehouseId),
      stockByWarehouse: data.warehouses,
      description: data.description,
      isActive: data.isActive,
    }

    try {
      if (isEditMode && productId) {
        await updateProduct.mutateAsync({
          id: productId,
          ...submitData,
        })

        await uploadImagesAfterProductCreation(productId)
        toast.success('Product updated successfully')
      } else {
        const newProduct = await createProduct.mutateAsync(submitData)

        await uploadImagesAfterProductCreation(newProduct.id)
        toast.success('Product created successfully')
      }

      router.push('/apps/ecommerce/products/list')
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
      setImageUrl(null)

      setDefaultsInitialized(false)

      reset()

      if (!isEditMode) {
        const defaultCategory =
          categoryOptions.find((c) => c.isDefault) || categoryOptions[0]
        const defaultWarehouse =
          warehouseOptions.find((w) => w.isDefault) || warehouseOptions[0]
        setValue('categoryIds', [defaultCategory?.value])
        setValue('warehouses', [
          { warehouseId: defaultWarehouse?.value, stock: 0 },
        ])

        setWarehouseStockData([
          {
            id: defaultWarehouse.value,
            warehouseId: defaultWarehouse.value,
            name: defaultWarehouse.label,
            isDefault: defaultWarehouse.isDefault,
            stock: 0,
            minQuantity: 0,
          },
        ])
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
    if (isEditMode && productId) {
      setIsDeleteModalOpen(true)
    }
  }

  const handleConfirmDelete = async () => {
    if (isEditMode && productId) {
      try {
        await deleteProduct.mutateAsync({ id: productId })

        toast.success('Product deleted successfully')
        router.push('/apps/ecommerce/products/list')
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
      } else if (event.target.name === 'discount') {
        setDiscount(value)
      }
    }
  }

  const calculateSellingPrice = () => {
    const priceValue = parseFloat(price?.toString() || '0')
    const discountValue = parseFloat(discount.toString())

    if (
      isNaN(priceValue) ||
      isNaN(discountValue) ||
      discountValue < 0 ||
      discountValue > 100
    ) {
      return '$00.00'
    } else {
      const sellingPrice = priceValue * (1 - discountValue / 100)
      return '$' + sellingPrice.toFixed(2)
    }
  }

  useEffect(() => {
    const priceValue = price ?? 0
    const discountValue = Number(discount)

    if (
      !isNaN(priceValue as number) &&
      !isNaN(Number(discountValue)) &&
      discountValue >= 0 &&
      discountValue <= 100
    ) {
      const sellingPrice = priceValue * (1 - discountValue / 100)
      setRevenue(sellingPrice)
    }
  }, [price, discount])

  return (
    <React.Fragment>
      <BreadCrumb
        title={isEditMode ? 'Edit Product' : 'Create Product'}
        subTitle="Ecommerce"
      />
      <form onSubmit={handleSubmit(onSubmit)} className="card p-5">
        <div className="flex flex-wrap items-center gap-5 mb-5">
          <div className="grow">
            <h6 className="mb-1 card-title">
              {isEditMode ? 'Edit Product' : 'Create Product'}
            </h6>
            {!isEditMode && (
              <p className="text-gray-500 dark:text-dark-500">
                Complete the form to create a new product.
              </p>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            {isEditMode && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteProduct.isPending}
                className="btn btn-red">
                <Trash2 className="inline-block ltr:mr-1 rtl:ml-1 align-center size-4" />
                <span className="align-middle">
                  {deleteProduct.isPending ? 'Deleting...' : 'Delete'}
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
                createProduct.isPending ||
                updateProduct.isPending
              }
              className="btn btn-primary">
              <Plus className="inline-block ltr:mr-1 rtl:ml-1 align-center size-4" />
              <span className="align-middle">
                {isSubmitting ||
                createProduct.isPending ||
                updateProduct.isPending
                  ? 'Saving...'
                  : isEditMode
                    ? 'Update Product'
                    : 'Add Product'}
              </span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-12 xl:col-span-8">
            <div className="card">
              <div className="card-header">
                <h6 className="card-title">Products Description</h6>
              </div>
              <div className="card-body">
                <div>
                  <div className="grid grid-cols-12 gap-5">
                    <div className="col-span-12">
                      <label htmlFor="productNameInput" className="form-label">
                        Product Name
                      </label>
                      <input
                        type="text"
                        id="productNameInput"
                        className="form-input"
                        placeholder="Enter the product name"
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
                        placeholder="Enter the product description"
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
                    <div className="col-span-12">
                      <label className="form-label">Warehouses</label>
                      <Controller
                        name="warehouses"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <div className="space-y-3">
                            <Select
                              isMulti
                              options={warehouseOptions}
                              value={warehouseOptions.filter((option) =>
                                value?.some(
                                  (w) => w.warehouseId === option.value
                                )
                              )}
                              onChange={(selected) => {
                                console.log('Select changed:', selected)

                                if (selected && warehouses) {
                                  const newWarehouseData = selected.map((s) => {
                                    const warehouseInfo = warehouses.find(
                                      (w) => w.id === s.value
                                    )
                                    const existingData =
                                      warehouseStockData.find(
                                        (d) => d.id === s.value
                                      )

                                    return {
                                      id: s.value,
                                      warehouseId:
                                        warehouseInfo?.warehouseId || s.value,
                                      name: warehouseInfo?.name || 'Unknown',
                                      isDefault:
                                        warehouseInfo?.isDefault || false,
                                      stock: existingData?.stock || 0,
                                      minQuantity:
                                        existingData?.minQuantity || 0,
                                    }
                                  })

                                  console.log(
                                    'Updating warehouse data:',
                                    newWarehouseData
                                  )

                                  setWarehouseStockData(newWarehouseData)

                                  const selectedValues = selected.map((s) => {
                                    const existingData =
                                      warehouseStockData.find(
                                        (d) => d.id === s.value
                                      )
                                    return {
                                      warehouseId: s.value,
                                      stock: existingData?.stock || 0,
                                    }
                                  })

                                  console.log(
                                    'Setting form values:',
                                    selectedValues
                                  )
                                  onChange(selectedValues)
                                } else {
                                  console.log('Clearing warehouse data')
                                  setWarehouseStockData([])
                                  onChange([])
                                }
                              }}
                              placeholder={'Select warehouses'}
                              isDisabled={false}
                              classNamePrefix="select"
                            />
                          </div>
                        )}
                      />
                      {errors.warehouses && (
                        <span className="text-red-500">
                          {errors.warehouses.message}
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
            <WareHomeTable
              onWarehouseDataChange={handleWarehouseDataChange}
              initialData={warehouseStockData}
              projectId={projectId}
              disabled={
                isSubmitting ||
                createProduct.isPending ||
                updateProduct.isPending
              }
            />
            <div className="card">
              <div className="card-header">
                <h6 className="card-title">Products Images</h6>
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
                            <div className="mt-3">Product Image 1</div>
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
                            <div className="mt-3">Product Image 2</div>
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
                            <div className="mt-3">Product Image 3</div>
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

            <div className="card">
              <div className="card-header">
                <h6 className="card-title">Advance Description</h6>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-12 gap-5">
                  <div className="col-span-12 md:col-span-4">
                    <h6 className="form-label">Select Gender</h6>
                    <div className="flex items-center gap-3">
                      <div className="input-radio-group">
                        <input
                          id="maleRadio"
                          name="selectGender"
                          className="input-radio input-radio-primary"
                          type="radio"
                          defaultChecked={false}
                        />
                        <label
                          htmlFor="maleRadio"
                          className="input-radio-label">
                          Male
                        </label>
                      </div>
                      <div className="input-radio-group">
                        <input
                          id="femaleRadio"
                          name="selectGender"
                          className="input-radio input-radio-primary"
                          type="radio"
                          defaultChecked={false}
                        />
                        <label
                          htmlFor="femaleRadio"
                          className="input-radio-label">
                          Female
                        </label>
                      </div>
                      <div className="input-radio-group">
                        <input
                          id="unisexRadio"
                          name="selectGender"
                          className="input-radio input-radio-primary"
                          type="radio"
                          defaultChecked={false}
                        />
                        <label
                          htmlFor="unisexRadio"
                          className="input-radio-label">
                          Unisex
                        </label>
                      </div>
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
          title="Delete Product"
          message="Are you sure you want to delete this product? This action cannot be undone."
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

CreateProductForm.getLayout = (
  page: React.ReactElement
): React.ReactElement => {
  return <Layout breadcrumbTitle="Create Product">{page}</Layout>
}
