'use client'

import React, { useCallback, useEffect, useId, useMemo, useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import BreadCrumb from '@src/components/common/BreadCrumb'
import DeleteModal from '@src/components/common/DeleteModal'
import Pagination from '@src/components/common/Pagination'
import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
} from '@src/components/custom/dropdown/dropdown'
import TableContainer from '@src/components/custom/table/table'
import { OptionType } from '@src/data/ecommerce/product-list'
import { RootState } from '@src/slices/reducer'
import { api } from '@src/trpc/react'
import { Filter, Plus, Search, Trash } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import { useSelector } from 'react-redux'
import Select from 'react-select'
import { toast } from 'react-toastify'
import { ToastContainer } from 'react-toastify'

type ServiceData = {
  id: string
  name: string
  description: string | null
  price: number | null
  pricingType: 'HOURLY' | 'FIXED' | 'MONTHLY' | 'SQUARE_METER'
  isActive: boolean
  imageUrl: string | null
  createdAt: Date
  updatedAt: Date
  categories: Array<{
    category: {
      id: string
      name: string
    }
  }>
  files: Array<{
    id: string
    s3Url: string
    name: string
  }>
}

type PaginatedResponse = {
  services: ServiceData[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

const List = () => {
  const router = useRouter()
  const { data: session } = useSession()
  const [selectedServiceOption, setSelectedServiceOption] =
    useState<OptionType | null>(null)
  const [deletedListData, setDeletedListData] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deletedRecord, setDeletedRecord] = useState<string[] | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isPublishedFilter, setIsPublishedFilter] = useState(false)
  const [isInactiveFilter, setIsInactiveFilter] = useState(false)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [appliedFilters, setAppliedFilters] = useState({
    isPublished: false,
    isInactive: false,
    priceRange: [0, 1000] as [number, number],
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const selectInstanceId = useId()

  const currentProject = useSelector(
    (state: RootState) => state.Project.currentProject
  )
  const projectId = currentProject?.id || ''

  const { data: servicesData, isLoading: loadingServices } =
    api.projectService.getAll.useQuery(
      {
        projectId,
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined,
        categories:
          selectedCategories?.length > 0 ? selectedCategories : undefined,
        isActive: appliedFilters.isPublished
          ? true
          : appliedFilters.isInactive
            ? false
            : undefined,
        minPrice:
          appliedFilters.priceRange[0] > 0
            ? appliedFilters.priceRange[0]
            : undefined,
        maxPrice:
          appliedFilters.priceRange[1] < 1000
            ? appliedFilters.priceRange[1]
            : undefined,
      },
      { enabled: !!projectId }
    )

  const { data: categories } = api.projectCategory.getAll.useQuery(
    { projectId, type: 'SERVICE' },
    { enabled: !!projectId }
  )

  const deleteService = api.projectService.delete.useMutation({
    onSuccess: () => {
      toast.success('Service successfully removed')
      window.location.reload()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
  }

  const handleChangeStatusService = useCallback((service: ServiceData) => {
    toast.info('Status change not yet implemented')
  }, [])

  const handleEditService = useCallback(
    (service: ServiceData) => {
      router.push(`/apps/service/create-service?id=${service.id}`)
    },
    [router]
  )

  const handleAddService = () => {
    localStorage.setItem('previousPage', '/apps/services/list')
    router.push('/apps/service/create-service')
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
    const services = servicesData?.services || []
    if (selectAll) {
      setDeletedListData([])
    } else {
      setDeletedListData(services.map((service) => service.id))
    }
    setSelectAll((prev) => !prev)
  }, [selectAll, servicesData])

  const handleDeleteRecord = (id: string) => {
    setIsModalOpen(true)
    setDeletedRecord([id])
  }

  const handleRemoveSelectedRecords = () => {
    deletedListData.forEach((id) => {
      deleteService.mutate({ id })
    })
    setDeletedListData([])
    setSelectAll(false)
  }

  const setDeleteRecord = () => {
    if (deletedRecord && isModalOpen) {
      deletedRecord.forEach((id) => {
        deleteService.mutate({ id })
      })
      setIsModalOpen(false)
      setDeletedRecord(null)
    }
  }

  const handleSelectService = (selectedOption: OptionType | null) => {
    setSelectedServiceOption(selectedOption)
    if (selectedOption && selectedOption.value !== 'All') {
      setSelectedCategories([selectedOption.value])
    } else {
      setSelectedCategories([])
    }
    setCurrentPage(1)
  }

  const getCategoriesDisplay = (categories: ServiceData['categories']) => {
    if (!categories || categories.length === 0) return 'No category'
    return categories.map((c) => c.category.name).join(', ')
  }

  const categoryOptions = useMemo(() => {
    const options = [{ label: 'All categories', value: 'All' }]
    if (categories?.categories) {
      categories.categories.forEach((cat: any) => {
        options.push({ label: cat.name, value: cat.name })
      })
    }
    return options
  }, [categories])

  const services = servicesData?.services || []
  const pagination = servicesData?.pagination

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
        cell: ({ row }: { row: { original: ServiceData } }) => (
          <input
            className="input-check input-check-primary"
            type="checkbox"
            checked={deletedListData.includes(row.original.id)}
            onChange={() => handleSelectRecord(row.original.id)}
          />
        ),
      },
      {
        header: () => 'Service ID',
        accessorKey: 'service_id',
        cell: ({ row }: { row: { original: ServiceData } }) => (
          <span className="text-sm text-gray-500">
            {row.original.id.slice(0, 8)}...
          </span>
        ),
      },
      {
        header: () => 'Service',
        accessorKey: 'name',
        cell: ({ row }: { row: { original: ServiceData } }) => {
          const firstImage =
            row.original.files?.[0]?.s3Url || row.original.imageUrl

          return (
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center p-1 border border-gray-200 rounded-sm dark:border-dark-800 size-9">
                {firstImage ? (
                  <Image
                    src={firstImage}
                    alt="serviceImg"
                    className="rounded-sm"
                    width={26}
                    height={26}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src =
                        '/assets/images/products/product-placeholder.png'
                    }}
                  />
                ) : (
                  <div className="w-6 h-6 bg-gray-200 rounded-sm flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">
                      {row.original.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <h6 className="font-medium truncate max-w-28">
                {row.original.name}
              </h6>
            </div>
          )
        },
      },
      {
        header: () => 'Category',
        accessorKey: 'categories',
        cell: ({ row }: { row: { original: ServiceData } }) => (
          <span className="text-sm">
            {getCategoriesDisplay(row.original.categories)}
          </span>
        ),
      },
      {
        header: () => 'Pricing Type',
        accessorKey: 'pricingType',
        cell: ({ row }: { row: { original: ServiceData } }) => {
          const pricingTypeLabels = {
            HOURLY: 'Hourly Rate',
            FIXED: 'Fixed Price',
            MONTHLY: 'Monthly',
            SQUARE_METER: 'Per (m²)',
          }
          return (
            <span className="badge badge-blue text-xs">
              {pricingTypeLabels[row.original.pricingType] ||
                row.original.pricingType}
            </span>
          )
        },
      },
      {
        header: () => 'Price',
        accessorKey: 'price',
        cell: ({ row }: { row: { original: ServiceData } }) => {
          const price = `$${(row.original.price || 0).toFixed(2)}`
          return (
            <span className="font-medium">
              {price.length > 6 ? `${price.slice(0, 6)}...` : price}
            </span>
          )
        },
      },
      {
        header: () => 'State',
        accessorKey: 'isActive',
        cell: ({ row }: { row: { original: ServiceData } }) => {
          const { isActive } = row.original
          const statusText = isActive ? 'Active' : 'Inactive'
          return <span className={getStatusClass(isActive)}>{statusText}</span>
        },
      },
      {
        id: 'actions',
        header: () => 'Action',
        accessorKey: 'action',
        cell: ({ row }: { row: { original: ServiceData } }) => (
          <Dropdown
            position="right"
            trigger="click"
            dropdownClassName="dropdown">
            <DropdownButton colorClass="flex items-center text-gray-500 dark:text-dark-500">
              <i className="ri-more-2-fill"></i>
            </DropdownButton>
            <DropdownMenu>
              <button
                className="dropdown-item"
                onClick={() => handleEditService(row.original)}>
                <i className="align-middle ltr:mr-2 rtl:ml-2 ri-pencil-line"></i>
                <span>Edit</span>
              </button>
              <Link
                href="#!"
                className="dropdown-item dropdown-red"
                onClick={(e) => {
                  e.preventDefault()
                  handleDeleteRecord(row.original.id)
                }}>
                <i className="align-middle ltr:mr-2 rtl:ml-2 ri-delete-bin-line"></i>
                <span>Delete</span>
              </Link>
            </DropdownMenu>
          </Dropdown>
        ),
      },
    ],
    [
      deletedListData,
      selectAll,
      handleSelectAll,
      handleChangeStatusService,
      handleEditService,
      handleDeleteRecord,
    ]
  )

  const handlePublishedFilterChange = (e: {
    target: { checked: boolean | ((prevState: boolean) => boolean) }
  }) => {
    setIsPublishedFilter(e.target.checked)
  }

  const handleInactiveFilterChange = (e: {
    target: { checked: boolean | ((prevState: boolean) => boolean) }
  }) => {
    setIsInactiveFilter(e.target.checked)
  }

  const handleApplyFilters = () => {
    setAppliedFilters({
      isPublished: isPublishedFilter,
      isInactive: isInactiveFilter,
      priceRange,
    })
    setCurrentPage(1)
  }

  const handleResetFilters = () => {
    setIsPublishedFilter(false)
    setIsInactiveFilter(false)
    setPriceRange([0, 1000])
    setAppliedFilters({
      isPublished: false,
      isInactive: false,
      priceRange: [0, 1000],
    })
    setCurrentPage(1)
  }

  const handleSliderChange = (value: number | number[]) => {
    if (Array.isArray(value) && value.length === 2) {
      setPriceRange([value[0], value[1]])
    }
  }

  if (loadingServices) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading services...</p>
        </div>
      </div>
    )
  }

  return (
    <React.Fragment>
      <BreadCrumb subTitle="Services" title="Services List" />
      <div className="card">
        <div className="card-header">
          <div className="flex flex-wrap items-center gap-5">
            <div className="grow">
              <h6 className="mb-1 card-title">Services List</h6>
              <p className="text-gray-500 dark:text-dark-500">
                Manage all services in your project.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <button
                className="btn btn-primary"
                onClick={(e) => {
                  e.preventDefault()
                  handleAddService()
                }}>
                <Plus className="inline-block ltr:mr-1 rtl:ml-1 align-center size-4" />
                Add Service
              </button>
            </div>
          </div>
        </div>

        <div className="card-body">
          <div className="flex justify-between items-center">
            <div>
              <div className="relative group/form">
                <input
                  type="text"
                  className="ltr:pl-9 rtl:pr-9 form-input ltr:group-[&.right]/form:pr-9 rtl:group-[&.right]/form:pl-9 ltr:group-[&.right]/form:pl-4 rtl:group-[&.right]/form:pr-4"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 flex items-center text-gray-500 dark:text-dark-500 ltr:left-3 rtl:right-3 ltr:group-[&.right]/form:left-auto rtl:group-[&.right]/form:right-auto focus:outline-hidden">
                  <Search className="size-4" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {deletedListData.length > 0 && (
                <button
                  className="btn btn-outline-red btn-md"
                  onClick={handleRemoveSelectedRecords}
                  disabled={deleteService.isPending}>
                  <Trash className=" size-4" />
                </button>
              )}
              <div id="sampleSelect" className="grow w-40 max-w-40">
                <Select
                  classNamePrefix="select"
                  options={categoryOptions}
                  value={selectedServiceOption}
                  onChange={handleSelectService}
                  placeholder="Category"
                  isClearable={true}
                  instanceId={selectInstanceId}
                />
              </div>
              <Dropdown
                position="right"
                trigger="click"
                dropdownClassName="dropdown"
                closeOnOutsideClick={true}>
                <DropdownButton colorClass="btn btn-sub-gray flex items-center gap-2">
                  <Filter className=" align-center size-4" />
                  Filters
                </DropdownButton>
                <DropdownMenu menuClass="!w-64 p-3">
                  <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                    <h6 className="mb-4">Filter Options</h6>

                    <form onSubmit={(e) => e.preventDefault()}>
                      <h6 className="mb-2 text-sm">State</h6>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="input-check-group">
                          <input
                            id="publishedCheckboxFilter"
                            className="input-check input-check-primary"
                            type="checkbox"
                            value="ACTIVE"
                            checked={isPublishedFilter}
                            onChange={handlePublishedFilterChange}
                          />
                          <label
                            htmlFor="publishedCheckboxFilter"
                            className="input-check-label">
                            Active
                          </label>
                        </div>
                        <div className="input-check-group">
                          <input
                            id="inactiveCheckboxFilter"
                            className="input-check input-check-primary"
                            type="checkbox"
                            value="INACTIVE"
                            checked={isInactiveFilter}
                            onChange={handleInactiveFilterChange}
                          />
                          <label
                            htmlFor="inactiveCheckboxFilter"
                            className="input-check-label">
                            Inactive
                          </label>
                        </div>
                        <div className="col-span-2">
                          <label className="mb-3 form-label">Price Range</label>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>
                                Min: ${priceRange[0].toLocaleString()}
                              </span>
                              <span>
                                Max: ${priceRange[1].toLocaleString()}
                              </span>
                            </div>
                            <Slider
                              range
                              min={0}
                              max={1000}
                              value={priceRange}
                              onChange={handleSliderChange}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-1 mt-5">
                        <button
                          type="reset"
                          className="btn-sm btn btn-outline-red"
                          onClick={handleResetFilters}>
                          Reset
                        </button>
                        <button
                          type="submit"
                          className="btn-sm btn btn-primary"
                          onClick={handleApplyFilters}>
                          Apply
                        </button>
                      </div>
                    </form>
                  </div>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
        </div>

        <div className="pt-0 card-body">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) =>
                  handleItemsPerPageChange(Number(e.target.value))
                }
                className="form-select form-select-sm w-20">
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-600">per page</span>
            </div>
            {pagination && (
              <div className="text-sm text-gray-600">
                Showing{' '}
                {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} to{' '}
                {Math.min(
                  pagination.currentPage * pagination.itemsPerPage,
                  pagination.totalItems
                )}{' '}
                of {pagination.totalItems} services
              </div>
            )}
          </div>

          <div>
            {services.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No services found</p>
              </div>
            ) : (
              <>
                <TableContainer
                  columns={columns}
                  data={services}
                  thClass="!font-medium cursor-pointer"
                  isSearch={false}
                  divClass="overflow-x-auto table-box"
                  tableClass="table hovered"
                  PaginationClassName="pagination-container"
                  thtrClass="text-gray-500 bg-gray-100 dark:bg-dark-850 dark:text-dark-500"
                  isTableFooter={false}
                />

                {pagination && pagination.totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination
                      totalItems={pagination.totalItems}
                      itemsPerPage={pagination.itemsPerPage}
                      currentPage={pagination.currentPage}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

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

      <DeleteModal
        show={isModalOpen}
        title="Are you sure you want to delete this Service?"
        handleHide={() => setIsModalOpen(false)}
        deleteModalFunction={setDeleteRecord}
      />
    </React.Fragment>
  )
}

export default List
