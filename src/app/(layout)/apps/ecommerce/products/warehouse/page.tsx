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

const warehouseSchema = z.object({
  name: z.string().min(1, 'Warehouse name is required'),
  description: z.string().optional(),
  isActive: z.boolean(),
})

type WarehouseFormData = {
  name: string
  description?: string
  isActive: boolean
}

type WarehouseData = {
  id: string
  warehouseId: string
  name: string
  description: string | null
  isActive: boolean
  isDefault: boolean
  projectId: string
  createdAt: Date
  updatedAt: Date
  _count?: {
    products: number
  }
}

const WarehouseList: NextPageWithLayout = () => {
  const { layoutMode, layoutDirection } = useSelector(
    (state: RootState) => state.Layout
  )
  const { data: session } = useSession()

  const [warehouseData, setWarehouseData] = useState<WarehouseData[]>([])
  const [editMode, setEditMode] = useState(false)
  const [currentWarehouseList, setCurrentWarehouseList] = useState<
    WarehouseData | null | undefined
  >(undefined)
  const [searchTerm, setSearchTerm] = useState('')
  const [deletedListData, setDeletedListData] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deletedRecord, setDeletedRecord] = useState<string[] | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const [appliedSearchTerm, setAppliedSearchTerm] = useState('')
  const [searchInputValue, setSearchInputValue] = useState('')

  const currentProject = useSelector(
    (state: RootState) => state.Project.currentProject
  )
  const projectId = currentProject?.id || ''

  const utils = api.useUtils()

  const { data: warehouses, isLoading: loadingWarehouses } =
    api.projectProductWarehouse.getAll.useQuery(
      { projectId },
      { enabled: !!projectId }
    )

  const createWarehouse = api.projectProductWarehouse.create.useMutation({
    onSuccess: () => {
      toast.success('Warehouse created successfully')
      utils.projectProductWarehouse.getAll.invalidate({ projectId })
      reset()
      setEditMode(false)
      setCurrentWarehouseList(null)
      setPreviewImage(null)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const updateWarehouse = api.projectProductWarehouse.update.useMutation({
    onSuccess: () => {
      toast.success('Warehouse updated successfully')
      utils.projectProductWarehouse.getAll.invalidate({ projectId })
      reset()
      setEditMode(false)
      setCurrentWarehouseList(null)
      setPreviewImage(null)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const deleteWarehouse = api.projectProductWarehouse.delete.useMutation({
    onSuccess: () => {
      toast.success('Warehouse deleted successfully')
      utils.projectProductWarehouse.getAll.invalidate({ projectId })
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
  } = useForm<WarehouseFormData>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      name: '',
      description: '',
      isActive: true,
    },
  })

  useEffect(() => {
    if (warehouses) {
      setWarehouseData(warehouses as unknown as WarehouseData[])
    }
  }, [warehouses])

  useEffect(() => {
    if (editMode && currentWarehouseList) {
      setValue('name', currentWarehouseList.name)
      setValue('description', currentWarehouseList.description || '')
      setValue('isActive', currentWarehouseList.isActive)
    }
  }, [editMode, currentWarehouseList, setValue])

  const filteredData = warehouseData.filter(
    (item: WarehouseData) =>
      item.name.toLowerCase().includes(appliedSearchTerm.toLowerCase()) ||
      item.warehouseId
        .toLowerCase()
        .includes(appliedSearchTerm.toLowerCase()) ||
      item.description
        ?.toLowerCase()
        .includes(appliedSearchTerm.toLowerCase()) ||
      false
  )

  const handleOpenEditModal = (
    editMode: boolean = false,
    warehouseList: WarehouseData | null = null
  ) => {
    setEditMode(editMode)
    setCurrentWarehouseList(warehouseList)
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
      setDeletedListData(warehouseData.map((warehouse) => warehouse.id))
    }
    setSelectAll((prev) => !prev)
  }, [selectAll, warehouseData])

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
        deleteWarehouse.mutate({ id })
      })
    }
  }

  const onSubmit = (data: WarehouseFormData) => {
    if (editMode && currentWarehouseList) {
      updateWarehouse.mutate({
        id: currentWarehouseList.id,
        name: data.name,
        description: data.description,
        isActive: data.isActive,
      })
    } else {
      createWarehouse.mutate({
        projectId,
        name: data.name,
        description: data.description,
        isActive: data.isActive,
      })
    }
  }

  const handleReset = () => {
    reset()
    setEditMode(false)
    setCurrentWarehouseList(null)
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
        cell: ({ row }: { row: { original: WarehouseData } }) => (
          <input
            className="input-check input-check-primary"
            type="checkbox"
            checked={deletedListData.includes(row.original.id)}
            onChange={() => handleSelectRecord(row.original.id)}
          />
        ),
      },
      {
        header: () => 'Warehouse ID',
        accessorKey: 'warehouseId',
        cell: ({ row }: { row: { original: WarehouseData } }) => (
          <Link href="#!" className="link link-primary">
            {row.original.warehouseId}
          </Link>
        ),
      },
      {
        header: () => 'Warehouse Name',
        accessorKey: 'name',
        cell: ({ row }: { row: { original: WarehouseData } }) => {
          const { name, isDefault } = row.original
          return (
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center p-1 border border-gray-200 rounded-sm size-9 dark:border-dark-800 shrink-0">
                <div className="w-6 h-6 bg-blue-200 rounded-sm flex items-center justify-center">
                  <span className="text-xs font-medium text-blue-600">
                    {name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <h6>
                <Link
                  href="#!"
                  className="text-gray-800 link-primary dark:text-white">
                  {name}
                  {isDefault && (
                    <span className="ml-2 text-xs text-gray-500">
                      (Default)
                    </span>
                  )}
                </Link>
              </h6>
            </div>
          )
        },
      },
      {
        header: () => 'Products',
        accessorKey: 'products',
        cell: ({ row }: { row: { original: WarehouseData } }) => {
          const productCount = row.original._count?.products || 0
          return <span className="text-sm">{productCount}</span>
        },
      },
      {
        header: () => 'Status',
        accessorKey: 'isActive',
        cell: ({ row }) => {
          const { isActive } = row.original
          const statusText = isActive ? 'Active' : 'Inactive'
          return <span className={getStatusClass(isActive)}>{statusText}</span>
        },
      },
      {
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
                    className="dropdown-item"
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

  const itemsPerPage = 10
  const [currentPage, setCurrentPage] = useState(1)
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedEvents =
    filteredData && filteredData.length > 0
      ? filteredData.slice(startIndex, startIndex + itemsPerPage)
      : []

  if (loadingWarehouses) {
    return (
      <React.Fragment>
        <BreadCrumb title="Warehouse List" subTitle="Ecommerce" />
        <div className="card">
          <div className="card-body">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading warehouses...</p>
            </div>
          </div>
        </div>
      </React.Fragment>
    )
  }

  return (
    <React.Fragment>
      <BreadCrumb title="Warehouse List" subTitle="Ecommerce" />
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-7 xl:col-span-8">
          <div className="card">
            <div className="card-header">
              <div className="grid items-center grid-cols-12 gap-3">
                <div className="col-span-3">
                  <h6 className="card-title">Warehouse List</h6>
                </div>

                <div className="col-span-4 col-start-9">
                  <div className="flex gap-2">
                    <div className="relative group/form grow">
                      <input
                        type="text"
                        className="ltr:pl-9 rtl:pr-9 form-input ltr:group-[&.right]/form:pr-9 rtl:group-[&.right]/form:pl-9 ltr:group-[&.right]/form:pl-4 rtl:group-[&.right]/form:pr-4"
                        placeholder="Search for warehouses..."
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
                        disabled={deleteWarehouse.isPending}>
                        <Trash className="size-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-0 card-body">
              {filteredData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No warehouses found</p>
                </div>
              ) : (
                <>
                  <TableContainer
                    columns={columns}
                    data={paginatedEvents}
                    thClass="!font-medium cursor-pointer"
                    isSearch={false}
                    divClass="overflow-x-auto table-box"
                    tableClass="table hovered"
                    PaginationClassName="pagination-container"
                    thtrClass="text-gray-500 bg-gray-100 dark:bg-dark-850 dark:text-dark-500"
                    isTableFooter={false}
                  />
                  {filteredData.length != 0 && (
                    <Pagination
                      totalItems={filteredData.length}
                      itemsPerPage={itemsPerPage}
                      currentPage={currentPage}
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
                {editMode ? 'Edit Warehouse' : 'Add New Warehouse'}
              </h6>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="warehouseName" className="form-label">
                      Warehouse Name
                    </label>
                    <input
                      type="text"
                      id="warehouseName"
                      className="form-input"
                      placeholder="Enter warehouse name"
                      {...register('name')}
                    />
                    {errors.name && (
                      <span className="text-red-500 text-sm">
                        {errors.name.message}
                      </span>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="warehouseDescription"
                      className="form-label">
                      Description
                    </label>
                    <textarea
                      id="warehouseDescription"
                      rows={3}
                      className="form-input"
                      placeholder="Enter warehouse description"
                      {...register('description')}
                    />
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
                    <label className="form-label">Warehouse Image</label>
                    <div className="flex items-center justify-center p-4 border border-gray-200 border-dashed rounded-lg dark:border-dark-800">
                      {previewImage ? (
                        <Image
                          src={previewImage}
                          alt="Warehouse preview"
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
                      id="warehouseImage"
                    />
                    <label
                      htmlFor="warehouseImage"
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
                        createWarehouse.isPending ||
                        updateWarehouse.isPending
                      }
                      className="btn btn-md btn-primary flex items-center gap-1">
                      <Plus className="align-center size-4" />
                      <span className="align-middle">
                        {isSubmitting ||
                        createWarehouse.isPending ||
                        updateWarehouse.isPending
                          ? 'Saving...'
                          : editMode
                            ? 'Update'
                            : 'Add Warehouse'}
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
        title="Are you sure you want to delete this warehouse?"
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

export default WarehouseList
