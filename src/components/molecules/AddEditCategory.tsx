'use client'

import React, { useCallback, useEffect, useState } from 'react'

import Image from 'next/image'

import { CategoryItems } from '@src/dtos'
import { OptionType, statusOptions } from '@src/dtos/apps/ecommerce'
import { AppDispatch } from '@src/slices/reducer'
import { addCategoryData, editCategoryData } from '@src/slices/thunk'
import { getRecordId } from '@src/utils/record_id'
import { Plus, RotateCcw, Upload } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import Select from 'react-select'

const AddEditCategory = ({
  currentcategoryList,
  editMode,
  categoryData,
}: {
  currentcategoryList?: CategoryItems
  editMode: boolean
  categoryData: CategoryItems[]
}) => {
  const dispatch: AppDispatch = useDispatch()
  const {
    register,
    handleSubmit,
    setValue,
    control,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm<CategoryItems>({
    defaultValues: {
      products: currentcategoryList?.products || 0, // Set default for products
    },
  })
  const [preview, setPreview] = useState<string | null>(null)
  const [status, setStatus] = useState<OptionType | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPreview(null)
    }
  }

  const handleStatusChange = (
    selected: OptionType | null,
    onChange: (value: string | undefined) => void
  ) => {
    setStatus(selected)
    onChange(selected?.value) // Pass only the value
  }

  // Reset the form when opening the modal in "Add" mode
  const resetForm = useCallback(() => {
    reset({
      categoryID: '',
      category: '',
      products: 0, // Reset products
      image: '',
      status: '',
      description: '',
    })
    setPreview(null)
    setStatus(null)
    clearErrors()
  }, [reset, clearErrors])

  useEffect(() => {
    if (!currentcategoryList || !editMode) {
      resetForm()
    }

    if (editMode && currentcategoryList) {
      clearErrors()
      Object.keys(currentcategoryList).forEach((key) => {
        setValue(
          key as keyof CategoryItems,
          currentcategoryList[key as keyof CategoryItems]
        )
      })
      setPreview(currentcategoryList.image)
      if (currentcategoryList.status) {
        setStatus({
          label: currentcategoryList.status,
          value: currentcategoryList.status,
        })
      }
    } else {
      resetForm()
    }
  }, [editMode, currentcategoryList, setValue, reset, clearErrors, resetForm])

  const submitForm = (data: CategoryItems) => {
    if (editMode && currentcategoryList) {
      const updatedCategoryList: CategoryItems = {
        ...data,
        image: currentcategoryList.image,
        status: status?.value || data.status, // Use the status value or fallback to form data
      }
      dispatch(editCategoryData(updatedCategoryList))
      resetForm()
    } else {
      const newCategoryList = {
        ...data,
        status: status?.value ?? '', // Set a default value if status is undefined
        image: preview || '',
        categoryID: getRecordId(
          categoryData.map((item) => ({
            ...item,
            id: item.id || 0, // Ensure 'id' exists
          })),
          'categoryID',
          'PEC'
        ),
      }
      dispatch(addCategoryData(newCategoryList))
      resetForm()
    }
  }

  return (
    <React.Fragment>
      <div className="col-span-12 lg:col-span-5 xl:col-span-4">
        <div className="sticky top-24 card">
          <div className="card-header">
            <h6 className="card-title">
              {editMode ? 'Edit Category' : 'Add New Category'}
            </h6>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit(submitForm)}>
              <div className="grid grid-cols-12 gap-5">
                <div className="col-span-12">
                  <div>
                    <label
                      htmlFor="logo"
                      className="flex items-center justify-center p-2 mx-auto overflow-hidden bg-gray-100 border border-gray-200 rounded cursor-pointer dark:bg-dark-850 dark:border-dark-800 size-32">
                      {preview ? (
                        <Image
                          src={preview}
                          alt="previewImg"
                          width={92}
                          height={92}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="flex flex-col items-center text-gray-500 dark:text-dark-500">
                          <Upload />
                          <span className="block mt-2">Upload Images</span>
                        </div>
                      )}
                    </label>
                    <div className="hidden mt-4">
                      <label className="block">
                        <span className="sr-only">Choose profile photo</span>
                        <input
                          type="file"
                          name="logo"
                          id="logo"
                          onChange={handleFileChange}
                          style={{ display: 'none' }}
                          className="block w-full text-sm file:rounded-md focus:outline-0 text-slate-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 "
                        />
                      </label>
                    </div>
                  </div>
                </div>
                <div className="col-span-12">
                  <label htmlFor="categoryNameInput" className="form-label">
                    Category Name
                  </label>
                  <input
                    type="text"
                    id="categoryNameInput"
                    className="form-input"
                    placeholder="Category name"
                    {...register('category', {
                      required: 'Category Name is required',
                    })}
                  />
                  {errors.category && (
                    <span className="text-red-500">
                      {errors.category.message}
                    </span>
                  )}
                </div>
                <div className="col-span-12">
                  <label htmlFor="productsInput" className="form-label">
                    Products
                  </label>
                  <input
                    type="number"
                    id="productsInput"
                    className="form-input [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="Add Products"
                    {...register('products', {
                      required: 'Products is required',
                      valueAsNumber: true,
                    })}
                  />
                  {/* Ensure it's treated as a number */}
                  {errors.products && (
                    <span className="text-red-500">
                      {errors.products.message}
                    </span>
                  )}
                </div>
                <div className="col-span-12">
                  <label htmlFor="descriptionTextarea" className="form-label">
                    Description
                  </label>
                  <textarea
                    id="descriptionTextarea"
                    rows={3}
                    className="h-auto form-input"
                    placeholder="Enter your description"
                    {...register('description', {
                      required: 'Description is required',
                    })}></textarea>
                  {errors.description && (
                    <span className="text-red-500">
                      {errors.description.message}
                    </span>
                  )}
                </div>
                <div className="col-span-12">
                  <label htmlFor="statusSelect" className="form-label">
                    Status
                  </label>
                  <Controller
                    name="status"
                    control={control}
                    rules={{ required: true }}
                    render={({ field: { onChange } }) => (
                      <Select
                        classNamePrefix="select"
                        options={statusOptions}
                        value={status}
                        onChange={(selected) =>
                          handleStatusChange(selected, onChange)
                        }
                        placeholder="Select Status"
                        id="statusSelect"
                      />
                    )}
                  />
                  {errors.status && (
                    <span className="text-red-500">Status is required</span>
                  )}
                </div>
                <div className="flex items-center justify-end col-span-12 gap-2">
                  <button
                    className="btn btn-sub-gray"
                    type="button"
                    onClick={resetForm}>
                    <RotateCcw className="inline-block ltr:mr-1 rtl:ml-1 align-center size-4" />
                    <span className="align-middle">Reset</span>
                  </button>
                  <button className="btn btn-primary" type="submit">
                    <Plus className="inline-block ltr:mr-1 rtl:ml-1 align-center size-4" />
                    <span className="align-middle">
                      {editMode ? 'Edit Category' : 'Add Category'}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default AddEditCategory
