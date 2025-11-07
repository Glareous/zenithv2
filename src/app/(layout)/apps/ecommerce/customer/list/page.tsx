'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'

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
import { CustomerRecord, NextPageWithLayout } from '@src/dtos'
import { RootState } from '@src/slices/reducer'
import { api } from '@src/trpc/react'
import { Link as LinkIcon, Plus, Search, Trash, User } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { ToastContainer } from 'react-toastify'

import AddEditNewCustomer from './AddEditCustomer'
import OverviewCustomer from './OverviewCustomer'

interface ModalState {
  showAddCustomerForm: boolean
  showEditCustomerForm: boolean
}

type CustomerData = {
  id: string
  name: string
  email: string | null
  phoneNumber: string | null
  subscriber: boolean
  gender: string | null
  location: string | null
  role: string | null
  website: string | null
  origin: string | null
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

const CustomerList: NextPageWithLayout = () => {
  const { layoutMode, layoutDirection } = useSelector(
    (state: RootState) => state.Layout
  )
  const { data: session } = useSession()

  const currentProject = useSelector(
    (state: RootState) => state.Project.currentProject
  )
  const projectId = currentProject?.id || ''

  const [appliedSearchTerm, setAppliedSearchTerm] = useState('')
  const [searchInputValue, setSearchInputValue] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const [deletedListData, setDeletedListData] = useState<string[]>([])
  const [editMode, setEditMode] = useState(false)
  const [selectAll, setSelectAll] = useState(false)
  const [currentCustomer, setCurrentCustomer] = useState<CustomerData | null>(
    null
  )
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deletedRecord, setDeletedRecord] = useState<string[] | null>(null)
  const [isOverviewModalOpen, setIsOverviewModalOpen] = useState(false)
  const [modalState, setModalState] = useState<ModalState>({
    showAddCustomerForm: false,
    showEditCustomerForm: false,
  })

  const [customerToDelete, setCustomerToDelete] = useState<CustomerData | null>(
    null
  )

  const utils = api.useUtils()

  const { data: customersData, isLoading: loadingCustomers } =
    api.projectCustomer.getAll.useQuery(
      {
        projectId,
        page: currentPage,
        limit: itemsPerPage,
        search: appliedSearchTerm || undefined,
      },
      { enabled: !!projectId }
    )

  const deleteCustomer = api.projectCustomer.delete.useMutation({
    onSuccess: () => {
      toast.success('Customer deleted successfully!')
      setIsModalOpen(false)
      setDeletedRecord(null)
      utils.projectCustomer.getAll.invalidate({ projectId })
    },
    onError: (error) => {
      if (error.data?.code === 'BAD_REQUEST') {
        toast.error(error.message)
      } else if (error.data?.code === 'FORBIDDEN') {
        toast.error('You do not have permission to delete this customer')
      } else {
        toast.error('An error occurred while deleting the customer')
      }
      setIsModalOpen(false)
      setDeletedRecord(null)
    },
  })

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
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
      const allIds =
        customersData?.customers.map((customer) => customer.id) || []
      setDeletedListData(allIds)
    }
    setSelectAll((prev) => !prev)
  }, [selectAll, customersData?.customers])

  const handleDeleteRecord = (id: string) => {
    const customer = customersData?.customers.find((c) => c.id === id)
    setCustomerToDelete(customer || null)
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
        deleteCustomer.mutate({ id })
      })
    }
  }

  const getDeleteMessage = () => {
    if (!customerToDelete) return 'This action cannot be undone.'

    const warnings = []

    if (customerToDelete.isActive) {
      warnings.push('• Customer is currently active')
    }

    if (customerToDelete.subscriber) {
      warnings.push('• Customer has an active subscription')
    }

    if (customerToDelete._count.orders > 0) {
      warnings.push(`• Customer has ${customerToDelete._count.orders} order(s)`)
    }

    if (warnings.length > 0) {
      return `Warning: ${warnings.join('\n')}\n\nThis action cannot be undone.`
    }

    return 'This action cannot be undone.'
  }

  const openModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: true }))

  const closeModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: false }))

  const handleOpenModal = useCallback(
    (editMode: boolean = false, customer: CustomerData | null = null) => {
      setEditMode(editMode)
      setCurrentCustomer(customer)
      const modalKey = editMode ? 'showEditCustomerForm' : 'showAddCustomerForm'
      openModal(modalKey)
    },
    []
  )

  const handleCloseModal = () => {
    const modalKey = editMode ? 'showEditCustomerForm' : 'showAddCustomerForm'
    closeModal(modalKey)
    setEditMode(false)
    setCurrentCustomer(null)
  }

  const handleCustomerOverview = (
    modal: boolean = false,
    customer: CustomerData | null = null
  ) => {
    setCurrentCustomer(customer)
    setIsOverviewModalOpen(modal)
  }

  const handleCloseOverview = () => {
    setIsOverviewModalOpen(false)
    setCurrentCustomer(null)
    setEditMode(false)
  }

  const handleEditModeOverview = () => {
    setIsOverviewModalOpen(false)
    setEditMode(true)
    openModal('showEditCustomerForm')
  }

  const getStatusClass = (isActive: boolean) => {
    return isActive ? 'badge badge-green' : 'badge badge-red'
  }

  const DEFAULT_AVATAR = '/assets/images/user-avatar.jpg'
  const renderCustomerOriginIndicator = (customer: CustomerData) => {
    if (customer.origin === 'FROM_CONTACT') {
      return (
        <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">
          <LinkIcon className="size-3" />
          <span>From Contact</span>
        </div>
      )
    } else {
      return (
        <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
          <User className="size-3" />
          <span>From Customer</span>
        </div>
      )
    }
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
        cell: ({ row }: { row: { original: CustomerData } }) => (
          <input
            className="input-check input-check-primary"
            type="checkbox"
            checked={deletedListData.includes(row.original.id)}
            onChange={() => handleSelectRecord(row.original.id)}
          />
        ),
      },
      {
        header: 'ID',
        accessorKey: 'id',
        cell: ({ row }: { row: { original: CustomerData } }) => (
          <span className="text-sm font-mono">{row.original.id.slice(-8)}</span>
        ),
      },
      {
        header: 'Name',
        accessorKey: 'name',
        cell: ({ row }: { row: { original: CustomerData } }) => {
          const profileImage = row.original.files.find(
            (file) => file.fileType === 'IMAGE'
          )?.s3Url

          return (
            <div className="flex items-center gap-2">
              <Image
                src={profileImage || DEFAULT_AVATAR}
                alt="customerImg"
                className="rounded-full shrink-0 size-8 object-cover"
                width={32}
                height={32}
              />
              <Link
                href="#!"
                className="text-current link link-primary grow mr-4">
                {row.original.name}
              </Link>
            </div>
          )
        },
      },
      {
        header: 'Email',
        accessorKey: 'email',
        cell: ({ row }: { row: { original: CustomerData } }) => (
          <span>{row.original.email || '-'}</span>
        ),
      },
      {
        header: 'Phone Number',
        accessorKey: 'phoneNumber',
        cell: ({ row }: { row: { original: CustomerData } }) => (
          <span>{row.original.phoneNumber || '-'}</span>
        ),
      },
      {
        header: 'Subscriber',
        accessorKey: 'subscriber',
        cell: ({ row }: { row: { original: CustomerData } }) => (
          <span
            className={
              row.original.subscriber ? 'badge badge-green' : 'badge badge-gray'
            }>
            {row.original.subscriber ? 'Yes' : 'No'}
          </span>
        ),
      },
      {
        header: 'Gender',
        accessorKey: 'gender',
        cell: ({ row }: { row: { original: CustomerData } }) => (
          <span>{row.original.gender || '-'}</span>
        ),
      },
      {
        header: 'Location',
        accessorKey: 'location',
        cell: ({ row }: { row: { original: CustomerData } }) => (
          <span>{row.original.location || '-'}</span>
        ),
      },
      {
        header: 'Origin',
        accessorKey: 'origin',
        cell: ({ row }: { row: { original: CustomerData } }) => (
          <div className="flex items-center">
            {renderCustomerOriginIndicator(row.original)}
          </div>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        accessorKey: 'isActive',
        cell: ({ row }: { row: { original: CustomerData } }) => {
          const { isActive } = row.original
          const statusText = isActive ? 'Active' : 'Inactive'
          return <span className={getStatusClass(isActive)}>{statusText}</span>
        },
      },
      {
        id: 'actions',
        header: () => 'Action',
        accessorKey: 'action',
        cell: ({ row }: { row: { original: CustomerData } }) => (
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
                  handleCustomerOverview(true, row.original)
                }}>
                <i className="align-middle ltr:mr-2 rtl:ml-2 ri-eye-line"></i>{' '}
                <span>Overview</span>
              </Link>
              <Link
                href="#!"
                className="dropdown-item"
                onClick={(e) => {
                  e.preventDefault()
                  handleOpenModal(true, row.original)
                }}>
                <i className="align-middle ltr:mr-2 rtl:ml-2 ri-pencil-line"></i>{' '}
                <span>Edit</span>
              </Link>
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
    [deletedListData, selectAll, handleSelectAll, handleOpenModal]
  )

  if (loadingCustomers) {
    return (
      <React.Fragment>
        <BreadCrumb title="List View" subTitle="Customers" />
        <div className="card">
          <div className="card-body">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading customers...</p>
            </div>
          </div>
        </div>
      </React.Fragment>
    )
  }

  return (
    <React.Fragment>
      <BreadCrumb title="List View" subTitle="Customers" />
      <div>
        <div className="grid items-center grid-cols-12 gap-3 xl:gap-5 mb-3">
          <div className="col-span-12 xl:col-span-5 2xl:col-span-7">
            <h6 className="card-title mb-0">Customer List</h6>
          </div>
          <div className="flex flex-wrap xl:flex-nowrap xl:justify-end col-span-12 gap-3 xl:col-span-7 2xl:col-span-5">
            {deletedListData.length > 0 && (
              <button
                className="btn btn-red btn-icon"
                onClick={handleRemoveSelectedRecords}
                disabled={deleteCustomer.isPending}>
                <Trash className="inline-block size-4" />
              </button>
            )}
            <div className="relative group/form">
              <input
                type="text"
                className="ltr:pl-9 rtl:pr-9 form-input"
                placeholder="Search name, email, phone, location..."
                value={searchInputValue}
                onChange={(e) => setSearchInputValue(e.target.value)}
                onKeyPress={handleSearchKeyPress}
              />
              <span className="absolute inset-y-0 flex items-center text-gray-500 dark:text-dark-500 ltr:left-3 rtl:right-3">
                <Search className="size-4" />
              </span>
              {appliedSearchTerm && (
                <button
                  className="absolute inset-y-0 flex items-center text-gray-500 dark:text-dark-500 ltr:right-3 rtl:left-3 hover:text-red-500"
                  onClick={handleClearSearch}
                  type="button">
                  <span className="text-lg">×</span>
                </button>
              )}
            </div>
            <button
              className="btn btn-primary"
              onClick={() => openModal('showAddCustomerForm')}>
              <Plus className="inline-block ltr:mr-1 rtl:ml-1 size-4" /> New
              Customer
            </button>
          </div>
        </div>
        <div>
          <TableContainer
            columns={columns}
            data={customersData?.customers || []}
            thClass="!font-medium"
            isSearch={false}
            divClass="overflow-x-auto"
            tableClass="table border-separate hovered flush border-spacing-y-2 whitespace-nowrap"
            tbodyClass="*:bg-gray-50 dark:*:bg-dark-900 *:rounded-md"
            PaginationClassName="pagination-container"
            thtrClass="text-gray-500 bg-gray-100 dark:bg-dark-800 dark:text-dark-500"
            isTableFooter={false}
          />
          {customersData?.pagination && (
            <Pagination
              totalItems={customersData.pagination.totalItems}
              itemsPerPage={customersData.pagination.itemsPerPage}
              currentPage={customersData.pagination.currentPage}
              onPageChange={handlePageChange}
            />
          )}
        </div>

        <AddEditNewCustomer
          modalState={modalState}
          closeModal={handleCloseModal}
          editMode={editMode}
          currentCustomer={currentCustomer as CustomerRecord | null}
          customerList={customersData?.customers as unknown as CustomerRecord[]}
        />

        <OverviewCustomer
          show={isOverviewModalOpen}
          handleClose={handleCloseOverview}
          currentCustomer={currentCustomer as CustomerRecord | null}
          editMode={editMode}
          handleEditMode={handleEditModeOverview}
        />

        <DeleteModal
          title="Are you sure you want to delete this customer?"
          message={getDeleteMessage()}
          show={isModalOpen}
          handleHide={() => {
            setIsModalOpen(false)
            setCustomerToDelete(null)
          }}
          deleteModalFunction={setDeleteRecord}
          type={
            customerToDelete &&
            (customerToDelete.isActive ||
              customerToDelete.subscriber ||
              customerToDelete._count.orders > 0)
              ? 'warning'
              : 'delete'
          }
        />
      </div>

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

export default CustomerList
