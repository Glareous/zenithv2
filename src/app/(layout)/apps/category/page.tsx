'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'

import { zodResolver } from '@hookform/resolvers/zod'
import BreadCrumb from '@src/components/common/BreadCrumb'
import DeleteModal from '@src/components/common/DeleteModal'
import Pagination from '@src/components/common/Pagination'
import { LAYOUT_DIRECTION } from '@src/components/constants/layout'
import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
} from '@src/components/custom/dropdown/dropdown'
import TableContainer from '@src/components/custom/table/table'
import { CategoryItems, NextPageWithLayout } from '@src/dtos'
import { AppDispatch, RootState } from '@src/slices/reducer'
import { api } from '@src/trpc/react'
import { ImagePlus, Plus, Search, Trash } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { Controller, useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { ToastContainer } from 'react-toastify'
import { z } from 'zod'

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  type: z.enum(['PRODUCT', 'SERVICE']),
  isActive: z.boolean(),
})

type CategoryFormData = {
  name: string
  description?: string
  type: 'PRODUCT' | 'SERVICE'
  isActive: boolean
}

type CategoryData = {
  id: string
  name: string
  description: string | null
  type: 'PRODUCT' | 'SERVICE'
  isActive: boolean
  isDefault: boolean
  projectId: string
  createdAt: Date
  updatedAt: Date
  _count?: {
    productRelations: number
    serviceRelations: number
  }
}

const CategoryList: NextPageWithLayout = () => {
  const { layoutMode, layoutDirection } = useSelector(
    (state: RootState) => state.Layout
  )
  const { data: session } = useSession()

  const [categoryData, setCategoryData] = useState<CategoryData[]>([])
  const [editMode, setEditMode] = useState(false)
  const [currentCategoryList, setCurrentCategoryList] = useState<
    CategoryData | null | undefined
  >(undefined)
  const [searchTerm, setSearchTerm] = useState('')
  const [deletedListData, setDeletedListData] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deletedRecord, setDeletedRecord] = useState<string[] | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const [appliedSearchTerm, setAppliedSearchTerm] = useState('')
  const [searchInputValue, setSearchInputValue] = useState('')

  const currentProject = useSelector(
    (state: RootState) => state.Project.currentProject
  )
  const projectId = currentProject?.id || ''

  const utils = api.useUtils()

  const { data: categoriesData, isLoading: loadingCategories } =
    api.projectCategory.getAll.useQuery(
      {
        projectId,
        page: currentPage,
        limit: itemsPerPage,
        search: appliedSearchTerm || undefined,
        isActive: undefined,
      },
      { enabled: !!projectId }
    )

  const createCategory = api.projectCategory.create.useMutation({
    onSuccess: () => {
      toast.success('Category created successfully')
      utils.projectCategory.getAll.invalidate({ projectId })
      reset()
      setEditMode(false)
      setCurrentCategoryList(null)
      setPreviewImage(null)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const updateCategory = api.projectCategory.update.useMutation({
    onSuccess: () => {
      toast.success('Category updated successfully')
      utils.projectCategory.getAll.invalidate({ projectId })
      reset()
      setEditMode(false)
      setCurrentCategoryList(null)
      setPreviewImage(null)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const deleteCategory = api.projectCategory.delete.useMutation({
    onSuccess: () => {
      toast.success('Category deleted successfully')
      utils.projectCategory.getAll.invalidate({ projectId })
      setIsModalOpen(false)
      setDeletedRecord(null)
      setEditMode(false)
      setDeletedListData([])
      setSelectAll(false)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'PRODUCT',
      isActive: true,
    },
  })

  useEffect(() => {
    if (categoriesData?.categories) {
      setCategoryData(categoriesData.categories)
    }
  }, [categoriesData])

  useEffect(() => {
    if (editMode && currentCategoryList) {
      setValue('name', currentCategoryList.name)
      setValue('description', currentCategoryList.description || '')
      setValue('type', currentCategoryList.type)
      setValue('isActive', currentCategoryList.isActive)
    }
  }, [editMode, currentCategoryList, setValue])

  const handleOpenEditModal = (
    editMode: boolean = false,
    categoryList: CategoryData | null = null
  ) => {
    setEditMode(editMode)
    setCurrentCategoryList(categoryList)
  }

  const getStatusClass = (isActive: boolean) => {
    return isActive ? 'badge badge-green' : 'badge badge-gray'
  }

  const handleSelectRecord = (id: string) => {
    setDeletedListData((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleSelectAll = useCallback(() => {
    if (selectAll) {
      setDeletedListData([])
    } else {
      setDeletedListData(categoryData.map((category) => category.id))
    }
    setSelectAll((prev) => !prev)
  }, [selectAll, categoryData])

  const handleDeleteRecord = (id: string) => {
    setIsModalOpen(true)
    setDeletedRecord([id])
  }

  const handleRemoveSelectedRecords = () => {
    setIsModalOpen(true)
    setDeletedRecord(deletedListData)
  }

  const setDeleteRecord = () => {
    if (deletedRecord && isModalOpen) {
      deletedRecord.forEach((id) => {
        deleteCategory.mutate({ id })
      })
    }
  }

  const onSubmit = (data: CategoryFormData) => {
    if (editMode && currentCategoryList) {
      updateCategory.mutate({
        id: currentCategoryList.id,
        name: data.name,
        description: data.description,
        type: data.type,
        isActive: data.isActive,
      })
    } else {
      createCategory.mutate({
        projectId,
        name: data.name,
        description: data.description,
        type: data.type,
        isActive: data.isActive,
      })
    }
  }

  const handleReset = () => {
    reset()
    setEditMode(false)
    setCurrentCategoryList(null)
    setPreviewImage(null)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPreviewImage(null)
    }
  }

  const handleSearch = () => {
    setAppliedSearchTerm(searchInputValue)
    setCurrentPage(1)
  }

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
  }

  const handleClearSearch = () => {
    setSearchInputValue('')
    setAppliedSearchTerm('')
    setCurrentPage(1)
  }

  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: () => (
          <input
            id="checkboxAll"
            className="input-check input-check-primary"
            type="checkbox"
            checked={selectAll}
            onChange={handleSelectAll}
          />
        ),
        accessorKey: 'id',
        enableSorting: false,
        cell: ({ row }: { row: { original: CategoryData } }) => (
          <input
            className="input-check input-check-primary"
            type="checkbox"
            checked={deletedListData.includes(row.original.id)}
            onChange={() => handleSelectRecord(row.original.id)}
          />
        ),
      },
      {
        id: 'categoryId',
        header: () => 'Category ID',
        accessorKey: 'id',
        cell: ({ row }: { row: { original: CategoryData } }) => (
          <Link href="#!" className="link link-primary">
            {row.original.id.slice(0, 8)}...
          </Link>
        ),
      },
      {
        id: 'categoryName',
        header: () => 'Category Name',
        accessorKey: 'name',
        cell: ({ row }: { row: { original: CategoryData } }) => {
          const { name, isDefault, type } = row.original
          return (
            <div className="flex items-center gap-2">
              <div className="flex items-center p-1 border border-gray-200 rounded-sm size-9 dark:border-dark-800 shrink-0">
                <div className="w-6 h-6 bg-gray-200 rounded-sm flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">
                    {name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center w-full gap-2">
                <div className="flex items-center gap-2 max-w-30">
                  <Link
                    href="#!"
                    className="text-gray-800 link-primary dark:text-white truncate">
                    {name}
                  </Link>
                </div>
                <span
                  className={`badge badge-sm flex flex-col items-center ${
                    type === 'PRODUCT' ? 'badge-blue' : 'badge-purple'
                  }`}>
                  {type === 'PRODUCT' ? 'Product' : 'Service'}
                  {isDefault && (
                    <span className="text-xs text-gray-500">(Default)</span>
                  )}
                </span>
              </div>
            </div>
          )
        },
      },
      {
        id: 'items',
        header: () => 'Items',
        accessorKey: 'items',
        cell: ({ row }: { row: { original: CategoryData } }) => {
          const productCount = row.original._count?.productRelations || 0
          const serviceCount = row.original._count?.serviceRelations || 0
          const totalCount = productCount + serviceCount
          return (
            <div className="flex items-center justify-center">
              <span className="text-sm">{totalCount}</span>
              <span className="text-xs text-gray-500 hidden">
                ({productCount}P, {serviceCount}S)
              </span>
            </div>
          )
        },
      },
      {
        id: 'status',
        header: () => 'Status',
        accessorKey: 'isActive',
        cell: ({ row }) => {
          const { isActive } = row.original
          const statusText = isActive ? 'Active' : 'Inactive'
          return <span className={getStatusClass(isActive)}>{statusText}</span>
        },
      },
      {
        id: 'actions',
        header: () => 'Action',
        accessorKey: 'actions',
        cell: ({ row }) => {
          const { isDefault } = row.original
          return (
            <Dropdown
              position="right"
              trigger="click"
              dropdownClassName="dropdown">
              <DropdownButton colorClass="flex items-center text-gray-500 dark:text-dark-500">
                <i className="ri-more-2-fill"></i>
              </DropdownButton>
              <DropdownMenu>
                <Link
                  href="#!"
                  className="dropdown-item"
                  onClick={(e) => {
                    e.preventDefault()
                    handleOpenEditModal(true, row.original)
                  }}>
                  <i className="align-middle ltr:mr-2 rtl:ml-2 ri-pencil-line"></i>{' '}
                  Edit
                </Link>
                {!isDefault && (
                  <Link
                    href="#!"
                    className="dropdown-item dropdown-red"
                    onClick={(e) => {
                      e.preventDefault()
                      handleDeleteRecord(row.original.id)
                    }}>
                    <i className="align-middle ltr:mr-2 rtl:ml-2 ri-delete-bin-line"></i>{' '}
                    Delete
                  </Link>
                )}
              </DropdownMenu>
            </Dropdown>
          )
        },
      },
    ],
    [deletedListData, handleSelectAll, selectAll]
  )

  const handleItemsPerPageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newItemsPerPage = parseInt(event.target.value)
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (loadingCategories) {
    return (
      <React.Fragment>
        <BreadCrumb title="Category List" subTitle="Category" />
        <div className="card">
          <div className="card-body">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading categories...</p>
            </div>
          </div>
        </div>
      </React.Fragment>
    )
  }

  return (
    <React.Fragment>
      <BreadCrumb title="Category List" subTitle="Category" />
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-7 xl:col-span-8">
          <div className="card">
            <div className="card-header">
              <div className="grid items-center grid-cols-12 gap-3">
                <div className="col-span-3">
                  <h6 className="card-title">Category List</h6>
                </div>

                <div className="col-span-4 col-start-9">
                  <div className="flex gap-2">
                    <div className="relative group/form grow">
                      <input
                        type="text"
                        className="ltr:pl-9 rtl:pr-9 form-input ltr:group-[&.right]/form:pr-9 rtl:group-[&.right]/form:pl-4 rtl:group-[&.right]/form:pr-4"
                        placeholder="Search for categories..."
                        value={searchInputValue}
                        onChange={(e) => setSearchInputValue(e.target.value)}
                        onKeyPress={handleSearchKeyPress}
                      />
                      <button
                        className="absolute inset-y-0 flex items-center text-gray-500 dark:text-dark-500 ltr:left-3 rtl:right-3 ltr:group-[&.right]/form:right-3 rtl:group-[&.right]/form:left-3 ltr:group-[&.right]/form:left-auto rtl:group-[&.right]/form:right-auto focus:outline-hidden"
                        onClick={handleSearch}
                        type="button">
                        <Search className="size-4"></Search>
                      </button>
                      {appliedSearchTerm && (
                        <button
                          className="absolute inset-y-0 flex items-center text-gray-500 dark:text-dark-500 ltr:right-3 rtl:left-3 hover:text-red-500"
                          onClick={handleClearSearch}
                          type="button">
                          <span className="text-lg">×</span>
                        </button>
                      )}
                    </div>
                    {deletedListData.length > 0 && (
                      <button
                        className="btn btn-outline-red btn-sm"
                        onClick={handleRemoveSelectedRecords}
                        disabled={deleteCategory.isPending}>
                        <Trash className="size-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-0 card-body">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Items per page:</span>
                  <select
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    className="form-select form-select-sm w-20">
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
                {categoriesData?.pagination && (
                  <div className="text-sm text-gray-600">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                    {Math.min(
                      currentPage * itemsPerPage,
                      categoriesData.pagination.totalItems
                    )}{' '}
                    of {categoriesData.pagination.totalItems} categories
                  </div>
                )}
              </div>

              {categoryData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No categories found</p>
                </div>
              ) : (
                <>
                  <TableContainer
                    columns={columns}
                    data={categoryData}
                    thClass="!font-medium cursor-pointer"
                    isSearch={false}
                    divClass="overflow-x-auto table-box"
                    tableClass="table hovered"
                    PaginationClassName="pagination-container"
                    thtrClass="text-gray-500 bg-gray-100 dark:bg-dark-850 dark:text-dark-500"
                    isTableFooter={false}
                  />
                  {categoriesData?.pagination && (
                    <Pagination
                      totalItems={categoriesData.pagination.totalItems}
                      itemsPerPage={categoriesData.pagination.itemsPerPage}
                      currentPage={categoriesData.pagination.currentPage}
                      onPageChange={handlePageChange}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5 xl:col-span-4">
          <div className="card">
            <div className="card-header">
              <h6 className="card-title">
                {editMode ? 'Edit Category' : 'Add New Category'}
              </h6>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="categoryName" className="form-label">
                      Category Name
                    </label>
                    <input
                      type="text"
                      id="categoryName"
                      className="form-input"
                      placeholder="Enter category name"
                      {...register('name')}
                    />
                    {errors.name && (
                      <span className="text-red-500 text-sm">
                        {errors.name.message}
                      </span>
                    )}
                  </div>

                  <div>
                    <label htmlFor="categoryDescription" className="form-label">
                      Description
                    </label>
                    <textarea
                      id="categoryDescription"
                      rows={3}
                      className="form-input"
                      placeholder="Enter category description"
                      {...register('description')}
                    />
                  </div>

                  <div>
                    <label htmlFor="categoryType" className="form-label">
                      Category Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="categoryType"
                      className="form-select"
                      {...register('type')}>
                      <option value="PRODUCT">Product</option>
                      <option value="SERVICE">Service</option>
                    </select>
                    {errors.type && (
                      <span className="text-red-500 text-sm">
                        {errors.type.message}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="form-label">Status</label>
                    <Controller
                      name="isActive"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <select
                          className="form-select"
                          value={value ? 'true' : 'false'}
                          onChange={(e) => onChange(e.target.value === 'true')}>
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                      )}
                    />
                  </div>

                  <div className="hidden">
                    <label className="form-label">Category Image</label>
                    <div className="flex items-center justify-center p-4 border border-gray-200 border-dashed rounded-lg dark:border-dark-800">
                      {previewImage ? (
                        <Image
                          src={previewImage}
                          alt="Category preview"
                          width={100}
                          height={100}
                          className="rounded-lg"
                        />
                      ) : (
                        <div className="text-center">
                          <ImagePlus className="mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-500">
                            Click to upload image
                          </p>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="categoryImage"
                    />
                    <label
                      htmlFor="categoryImage"
                      className="btn btn-sub-gray btn-sm mt-2 cursor-pointer">
                      Upload Image
                    </label>
                  </div>

                  <div className="flex gap-2 pt-4 justify-center items-center">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="btn btn-md btn-outline-red">
                      Reset
                    </button>
                    <button
                      type="submit"
                      disabled={
                        isSubmitting ||
                        createCategory.isPending ||
                        updateCategory.isPending
                      }
                      className="btn btn-md btn-primary">
                      <Plus className="inline-block ltr:mr-1 rtl:ml-1 align-center size-4" />
                      <span className="align-middle">
                        {isSubmitting ||
                        createCategory.isPending ||
                        updateCategory.isPending
                          ? 'Saving...'
                          : editMode
                            ? 'Update Category'
                            : 'Add Category'}
                      </span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <DeleteModal
        title="Are you sure you want to delete this Category?"
        show={isModalOpen}
        handleHide={() => setIsModalOpen(false)}
        deleteModalFunction={setDeleteRecord}
      />

      <ToastContainer
        theme={layoutMode}
        rtl={layoutDirection === LAYOUT_DIRECTION.RTL}
        position={
          layoutDirection === LAYOUT_DIRECTION.RTL ? 'top-left' : 'top-right'
        }
      />
    </React.Fragment>
  )
}

export default CategoryList
