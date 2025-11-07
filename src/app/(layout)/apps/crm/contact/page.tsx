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
import { NextPageWithLayout } from '@src/dtos'
import { RootState } from '@src/slices/reducer'
import { api } from '@src/trpc/react'
import { Download, Plus, Search, Trash } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { ToastContainer } from 'react-toastify'

import AddEditCrmContact from './AddEditCrmContact'
import OverviewProjectContact from './OverviewProjectContact'

interface ModalState {
  showAddContactForm: boolean
  showEditContactForm: boolean
}

type ContactData = {
  id: string
  name: string
  companyName: string | null
  role: string | null
  email: string | null
  phoneNumber: string | null
  website: string | null
  status: string
  subscriber: boolean
  gender: string | null
  location: string | null
  createdAt: Date
  updatedAt: Date
  files: Array<{
    id: string
    s3Url: string
    fileType: string
  }>
}

const CrmContact: NextPageWithLayout = () => {
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
  const [currentContact, setCurrentContact] = useState<ContactData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deletedRecord, setDeletedRecord] = useState<string[] | null>(null)
  const [modalState, setModalState] = useState<ModalState>({
    showAddContactForm: false,
    showEditContactForm: false,
  })
  const [isOverviewModalOpen, setIsOverviewModalOpen] = useState(false)
  const [selectedContactId, setSelectedContactId] = useState<string | null>(
    null
  )

  const utils = api.useUtils()

  const { data: contactsData, isLoading: loadingContacts } =
    api.projectContact.getAll.useQuery(
      {
        projectId,
        page: currentPage,
        limit: itemsPerPage,
        search: appliedSearchTerm || undefined,
      },
      { enabled: !!projectId }
    )

  const deleteContact = api.projectContact.delete.useMutation({
    onSuccess: () => {
      toast.success('Contact deleted successfully')
      utils.projectContact.getAll.invalidate({ projectId })
      setIsModalOpen(false)
      setDeletedRecord(null)
      setDeletedListData([])
      setSelectAll(false)
    },
    onError: (error) => {
      toast.error(error.message)
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
      const allIds = contactsData?.contacts.map((contact) => contact.id) || []
      setDeletedListData(allIds)
    }
    setSelectAll((prev) => !prev)
  }, [selectAll, contactsData?.contacts])

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
        deleteContact.mutate({ id, projectId })
      })
    }
  }

  const openModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: true }))

  const closeModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: false }))

  const handleOpenModal = useCallback(
    (editMode: boolean = false, contact: ContactData | null = null) => {
      setEditMode(editMode)
      setCurrentContact(contact)
      const modalKey = editMode ? 'showEditContactForm' : 'showAddContactForm'
      openModal(modalKey)
    },
    []
  )

  const handleCloseModal = () => {
    const modalKey = editMode ? 'showEditContactForm' : 'showAddContactForm'
    closeModal(modalKey)
    setEditMode(false)
    setCurrentContact(null)
  }

  const handleContactOverview = useCallback((contactId: string) => {
    setSelectedContactId(contactId)
    setIsOverviewModalOpen(true)
  }, [])

  const handleCloseOverview = () => {
    setIsOverviewModalOpen(false)
    setSelectedContactId(null)
  }

  const getStatusClass = (status: string | undefined) => {
    switch (status) {
      case 'CONTACT':
        return 'badge badge-blue'
      case 'CUSTOMER':
        return 'badge badge-pink'
      case 'LEAD':
        return 'badge badge-green'
      default:
        return 'badge'
    }
  }

  const getGenderText = (gender: string | null) => {
    switch (gender) {
      case 'MALE':
        return 'Male'
      case 'FEMALE':
        return 'Female'
      case 'OTHER':
        return 'Other'
      default:
        return '-'
    }
  }

  const getSubscriberText = (subscriber: boolean) => {
    return subscriber ? 'Yes' : 'No'
  }

  const DEFAULT_AVATAR = '/assets/images/user-avatar.jpg'

  const getFirstImage = (contact: ContactData) => {
    const profileImage = contact.files?.find(
      (file) => file.fileType === 'IMAGE'
    )?.s3Url

    if (profileImage && !profileImage.includes('undefined')) {
      return profileImage
    }

    return DEFAULT_AVATAR
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
        cell: ({ row }: { row: { original: ContactData } }) => (
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
        cell: ({ row }: { row: { original: ContactData } }) => (
          <span className="text-sm font-mono">{row.original.id.slice(-8)}</span>
        ),
      },
      {
        header: 'Name',
        accessorKey: 'name',
        cell: ({ row }: { row: { original: ContactData } }) => {
          return (
            <div className="flex items-center gap-2">
              <Image
                src={getFirstImage(row.original)}
                alt="contactImg"
                className="rounded-full shrink-0 size-9 object-cover"
                width={36}
                height={36}
              />
              <div className="grow">
                <h6>
                  <Link
                    href="#!"
                    className="text-current link link-primary grow">
                    {row.original.name}
                  </Link>
                </h6>
                <p className="text-sm text-gray-500 dark:text-dark-500">
                  {row.original.phoneNumber || '-'}
                </p>
              </div>
            </div>
          )
        },
      },
      {
        header: 'Company',
        accessorKey: 'companyName',
        cell: ({ row }: { row: { original: ContactData } }) => (
          <span>{row.original.companyName || '-'}</span>
        ),
      },
      {
        header: 'Role',
        accessorKey: 'role',
        cell: ({ row }: { row: { original: ContactData } }) => (
          <span>{row.original.role || '-'}</span>
        ),
      },
      {
        header: 'Email',
        accessorKey: 'email',
        cell: ({ row }: { row: { original: ContactData } }) => (
          <span>{row.original.email || '-'}</span>
        ),
      },
      {
        header: 'Location',
        accessorKey: 'location',
        cell: ({ row }: { row: { original: ContactData } }) => (
          <span>{row.original.location || '-'}</span>
        ),
      },
      {
        header: 'Gender',
        accessorKey: 'gender',
        cell: ({ row }: { row: { original: ContactData } }) => (
          <span>{getGenderText(row.original.gender)}</span>
        ),
      },
      {
        header: 'Subscriber',
        accessorKey: 'subscriber',
        cell: ({ row }: { row: { original: ContactData } }) => (
          <span
            className={
              row.original.subscriber ? 'badge badge-green' : 'badge badge-gray'
            }>
            {getSubscriberText(row.original.subscriber)}
          </span>
        ),
      },
      {
        header: 'Website',
        accessorKey: 'website',
        cell: ({ row }: { row: { original: ContactData } }) =>
          row.original.website ? (
            <Link href={row.original.website} className="badge badge-gray">
              {row.original.website}
            </Link>
          ) : (
            <span>-</span>
          ),
      },
      {
        id: 'status',
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }: { row: { original: ContactData } }) => {
          const { status } = row.original
          const statusText =
            status === 'CONTACT'
              ? 'Contact'
              : status === 'CUSTOMER'
                ? 'Customer'
                : status === 'LEAD'
                  ? 'Lead'
                  : status
          return <span className={getStatusClass(status)}>{statusText}</span>
        },
      },
      {
        id: 'actions',
        header: () => 'Action',
        accessorKey: 'action',
        cell: ({ row }: { row: { original: ContactData } }) => (
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
                  handleContactOverview(row.original.id)
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
    [
      deletedListData,
      selectAll,
      handleSelectAll,
      handleOpenModal,
      handleContactOverview,
    ]
  )

  if (loadingContacts) {
    return (
      <React.Fragment>
        <BreadCrumb title="Contact" subTitle="CRM" />
        <div className="card">
          <div className="card-body">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading contacts...</p>
            </div>
          </div>
        </div>
      </React.Fragment>
    )
  }

  return (
    <React.Fragment>
      <BreadCrumb title="Contact" subTitle="CRM" />
      <div>
        <div className="card">
          <div className="card-header">
            <div className="flex flex-wrap justify-between gap-5">
              <div>
                <div className="relative group/form">
                  <input
                    type="text"
                    className="ltr:pl-9 rtl:pr-9 form-input ltr:group-[&.right]/form:pr-9 rtl:group-[&.right]/form:pl-9 ltr:group-[&.right]/form:pl-4 rtl:group-[&.right]/form:pr-4"
                    placeholder="Search for ..."
                    value={searchInputValue}
                    onChange={(e) => setSearchInputValue(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                  />
                  <div className="absolute inset-y-0 flex items-center text-gray-500 dark:text-dark-500 ltr:left-3 rtl:right-3 ltr:group-[&.right]/form:right-3 rtl:group-[&.right]/form:left-3 ltr:group-[&.right]/form:left-auto rtl:group-[&.right]/form:right-auto focus:outline-hidden">
                    <Search className="size-4" />
                  </div>
                  {appliedSearchTerm && (
                    <button
                      className="absolute inset-y-0 flex items-center text-gray-500 dark:text-dark-500 ltr:right-3 rtl:left-3 hover:text-red-500"
                      onClick={handleClearSearch}
                      type="button">
                      <span className="text-lg">×</span>
                    </button>
                  )}
                </div>
              </div>
              <div>
                <div className="flex flex-wrap gap-2">
                  {deletedListData.length > 0 && (
                    <button
                      className="btn btn-red btn-icon"
                      onClick={handleRemoveSelectedRecords}
                      disabled={deleteContact.isPending}>
                      <Trash className="inline-block size-4" />
                    </button>
                  )}
                  <button type="button" className="btn btn-sub-gray">
                    <Download className="inline-block size-4" />
                    <span className="align-baseline">Export</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={(e) => {
                      e.preventDefault()
                      openModal('showAddContactForm')
                    }}>
                    <Plus className="inline-block size-4" />
                    <span className="align-baseline">Add Contact</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="card-body">
            <div>
              <TableContainer
                columns={columns}
                data={contactsData?.contacts || []}
                thClass="!font-medium cursor-pointer"
                isSearch={false}
                divClass="overflow-x-auto"
                tableClass="table whitespace-nowrap"
                PaginationClassName="pagination-container"
                thtrClass="text-gray-500 bg-gray-100 dark:bg-dark-850 dark:text-dark-500"
                isTableFooter={false}
              />
              {contactsData?.pagination && (
                <Pagination
                  totalItems={contactsData.pagination.totalItems}
                  itemsPerPage={contactsData.pagination.itemsPerPage}
                  currentPage={contactsData.pagination.currentPage}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <AddEditCrmContact
        isOpen={modalState.showAddContactForm || modalState.showEditContactForm}
        onClose={handleCloseModal}
        editMode={editMode}
        currentContact={currentContact}
        projectId={projectId}
        onSuccess={() => {
          utils.projectContact.getAll.invalidate({ projectId })
          utils.projectLead.getAll.invalidate({ projectId })
        }}
      />

      {/* Overview Modal */}
      <OverviewProjectContact
        isOpen={isOverviewModalOpen}
        onClose={handleCloseOverview}
        contactId={selectedContactId}
        projectId={projectId}
      />

      <ToastContainer
        theme={layoutMode}
        rtl={layoutDirection === LAYOUT_DIRECTION.RTL}
        position={
          layoutDirection === LAYOUT_DIRECTION.RTL ? 'top-left' : 'top-right'
        }
      />

      <DeleteModal
        title="Are you sure you want to delete this contact?"
        show={isModalOpen}
        handleHide={() => setIsModalOpen(false)}
        deleteModalFunction={setDeleteRecord}
      />
    </React.Fragment>
  )
}

export default CrmContact
