'use client'

import React, { ChangeEvent, useEffect, useMemo, useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

import {
  DragDropContext,
  Draggable,
  DraggableProvided,
  DropResult,
  Droppable,
  DroppableProvided,
} from '@hello-pangea/dnd'
import BreadCrumb from '@src/components/common/BreadCrumb'
import DeleteModal from '@src/components/common/DeleteModal'
import { LAYOUT_DIRECTION } from '@src/components/constants/layout'
import { Modal } from '@src/components/custom/modal/modal'
import { ModalState } from '@src/dtos/apps/crmlead'
import { RootState } from '@src/slices/reducer'
import { api } from '@src/trpc/react'
import 'flatpickr/dist/themes/material_blue.css'
import {
  AlertTriangle,
  Calendar,
  Link as LinkIcon,
  Plus,
  RefreshCw,
  Search,
  User,
} from 'lucide-react'
import Flatpickr from 'react-flatpickr'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { ToastContainer } from 'react-toastify'
import SimpleBar from 'simplebar-react'

import AddEditCrmLead from './AddEditCrmLead'
import ViewLeadOrCustomerModal from './ViewLeadOrCustomerModal'

const DEFAULT_AVATAR = '/assets/images/user-avatar.jpg'

const CrmLead: React.FC = () => {
  const currentProject = useSelector(
    (state: RootState) => state.Project.currentProject
  )
  const projectId = currentProject?.id || ''

  const [modalState, setModalState] = useState<ModalState>({
    showAddLeadForm: false,
    showEditLeadForm: false,
  })

  const [showConversionModal, setShowConversionModal] = useState(false)
  const [contactToConvert, setContactToConvert] = useState<any>(null)
  const [hasShownFirstTimeModal, setHasShownFirstTimeModal] = useState(false)

  const statusOrders = ['NEW', 'HOT', 'CONVERTED_TO_CUSTOMER', 'LOST']
  const statusClasses = [
    'badge-sky',
    'badge-red',
    'badge-green',
    'badge-purple',
  ]

  const [searchInputValue, setSearchInputValue] = useState('')
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(50)
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [show, setShow] = useState<boolean>(false)
  const [editMode, setEditMode] = useState(false)
  const [currentLead, setCurrentLead] = useState<any>(null)

  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)

  const [dateFilter, setDateFilter] = useState<Date | null>(null)
  const [appliedDateFilter, setAppliedDateFilter] = useState<Date | null>(null)
  const [showDateFilter, setShowDateFilter] = useState(false)

  const utils = api.useUtils()

  // Query para leads
  const { data: leadsData, isLoading } = api.projectLead.getAll.useQuery(
    {
      projectId,
      page: currentPage,
      limit: itemsPerPage,
      search: appliedSearchTerm || undefined,
      createdAt: appliedDateFilter || undefined,
    },
    { enabled: !!projectId }
  )

  // Query para customers (con búsqueda)
  const { data: customersData } = api.projectCustomer.getAll.useQuery(
    {
      projectId,
      page: 1,
      limit: 100,
      search: appliedSearchTerm || undefined,
      createdAt: appliedDateFilter || undefined,
    },
    { enabled: !!projectId }
  )

  const convertContactToCustomerMutation =
    api.projectLead.convertContactToCustomer.useMutation({
      onSuccess: (data) => {
        toast.success(
          data.message || 'Contact successfully converted to customer'
        )
        setShowConversionModal(false)
        setContactToConvert(null)

        utils.projectLead.getAll.invalidate({ projectId })
        utils.projectCustomer.getAll.invalidate({ projectId })
        utils.projectContact.getAll.invalidate({ projectId })
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to convert contact to customer')
        setShowConversionModal(false)
        setContactToConvert(null)
      },
    })

  const deleteLeadMutation = api.projectLead.delete.useMutation({
    onSuccess: () => {
      toast.success('Lead deleted successfully')
      utils.projectLead.getAll.invalidate({ projectId })
      setShow(false)
      setSelectedLeads([])
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete lead')
    },
  })

  const updateLeadStatusMutation = api.projectLead.update.useMutation({
    onSuccess: () => {
      toast.success('Lead status updated successfully')
      utils.projectLead.getAll.invalidate({ projectId })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update lead status')
    },
  })

  const migrateExistingCustomersMutation =
    api.projectLead.migrateExistingCustomers.useMutation({
      onSuccess: (data) => {
        toast.success(data.message)

        utils.projectLead.getAll.invalidate({ projectId })
        utils.projectCustomer.getAll.invalidate({ projectId })
        utils.projectContact.getAll.invalidate({ projectId })
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to migrate existing customers')
      },
    })

  // Agrupar items con búsqueda aplicada
  const groupedItems = useMemo(() => {
    const leads = leadsData?.leads || []
    const customers = customersData?.customers || []

    // Agrupar leads (sin filtrado frontend, ya viene filtrado del servidor)
    const grouped = leads.reduce((acc: { [key: string]: any[] }, item) => {
      if (!acc[item.status]) {
        acc[item.status] = []
      }
      acc[item.status].push(item)
      return acc
    }, {})

    if (customers.length > 0) {
      const convertedCustomers = customers.map((customer: any) => ({
        ...customer,
        status: 'CONVERTED_TO_CUSTOMER',
        isCustomer: true,
      }))

      if (!grouped['CONVERTED_TO_CUSTOMER']) {
        grouped['CONVERTED_TO_CUSTOMER'] = []
      }
      grouped['CONVERTED_TO_CUSTOMER'].push(...convertedCustomers)
    }

    return grouped
  }, [leadsData?.leads, customersData?.customers])

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result

    if (!destination) return

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return
    }

    const sourceStatus = source.droppableId
    const destinationStatus = destination.droppableId

    if (sourceStatus === 'CONVERTED_TO_CUSTOMER') {
      toast.error('Customers cannot be moved from this column')
      return
    }

    const draggedItem = (leadsData?.leads || []).find((item) => {
      const itemId = `lead-${item.id}`
      const draggedId = groupedItems[sourceStatus][source.index].isCustomer
        ? `customer-${groupedItems[sourceStatus][source.index].id}`
        : `lead-${groupedItems[sourceStatus][source.index].id}`
      return item.status === sourceStatus && itemId === draggedId
    })

    if (!draggedItem) return

    if (destinationStatus === 'CONVERTED_TO_CUSTOMER') {
      if (draggedItem.contactId) {
        if (!hasShownFirstTimeModal) {
          setContactToConvert(draggedItem)
          setShowConversionModal(true)
          setHasShownFirstTimeModal(true)
        } else {
          handleConvertContactToCustomer(draggedItem.contactId)
        }
      } else {
        toast.error('Only leads from contacts can be converted to customers')
        return
      }
    } else {
      updateLeadStatusMutation.mutate({
        id: draggedItem.id,
        name: draggedItem.name,
        email: draggedItem.email || '',
        phoneNumber: draggedItem.phoneNumber || '',
        status: destinationStatus as any,
        projectId: draggedItem.projectId,
        contactId: draggedItem.contactId || undefined,
      })
    }
  }

  const handleConvertContactToCustomer = (contactId: string) => {
    convertContactToCustomerMutation.mutate({
      contactId,
      projectId,
    })
  }

  const handleConfirmConversion = () => {
    if (contactToConvert?.contactId) {
      handleConvertContactToCustomer(contactToConvert.contactId)
    }
  }

  const handleCancelConversion = () => {
    setShowConversionModal(false)
    setContactToConvert(null)
  }

  const toggleDelete = () => {
    setShow(false)
    setSelectedLeads([])
  }

  const onClickLeadDelete = (id: string) => {
    setSelectedLeads([id])
    setShow(true)
  }

  const handleDeleteLead = () => {
    if (selectedLeads.length > 0) {
      selectedLeads.forEach((id) => {
        deleteLeadMutation.mutate({ id, projectId })
      })
    }
  }

  const openModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: true }))

  const closeModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: false }))

  const handleOpenModal = (editMode: boolean = false, lead: any = null) => {
    setEditMode(editMode)
    setCurrentLead(lead)
    const modalKey = editMode ? 'showEditLeadForm' : 'showAddLeadForm'
    openModal(modalKey)
  }

  const handleCloseModal = () => {
    const modalKey = editMode ? 'showEditLeadForm' : 'showAddLeadForm'
    closeModal(modalKey)
    setEditMode(false)
    setCurrentLead(null)
    utils.projectLead.getAll.invalidate({ projectId })
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

  const handleDateFilter = (dates: Date[]) => {
    const date = dates[0]
    setDateFilter(date)
    setAppliedDateFilter(date)
    setCurrentPage(1)
  }

  const handleClearDateFilter = () => {
    setDateFilter(null)
    setAppliedDateFilter(null)
    setCurrentPage(1)
  }

  const getFirstImage = (lead: any) => {
    const profileImage = lead.files?.find(
      (file: any) => file.fileType === 'IMAGE'
    )?.s3Url

    if (profileImage && !profileImage.includes('undefined')) {
      return profileImage
    }

    if (lead.imageUrl && !lead.imageUrl.includes('undefined')) {
      return lead.imageUrl
    }

    return DEFAULT_AVATAR
  }

  const formatDate = (date: Date | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString()
  }

  const renderLeadSourceIndicator = (item: any) => {
    if (item.isCustomer) {
      if (item.origin === 'FROM_CONTACT') {
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

    if (item.contactId) {
      return (
        <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">
          <LinkIcon className="size-3" />
          <span>From Contact (Convertible)</span>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-full">
        <User className="size-3" />
        <span>Direct Lead (Not Convertible)</span>
      </div>
    )
  }

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'CONVERTED_TO_CUSTOMER':
        return 'CONVERTED TO CUSTOMER'
      default:
        return status
    }
  }

  const handleMigrateExistingCustomers = () => {
    if (
      confirm(
        'This will migrate all contacts with CUSTOMER status to the new customer structure. This action cannot be undone. Continue?'
      )
    ) {
      migrateExistingCustomersMutation.mutate({ projectId })
    }
  }

  const handleViewLead = (item: any) => {
    setSelectedLeadId(item.id)
    setShowViewModal(true)
  }

  const handleCloseViewModal = () => {
    setShowViewModal(false)
    setSelectedLeadId(null)
  }

  if (!projectId) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-500">No project selected</p>
      </div>
    )
  }

  return (
    <React.Fragment>
      <BreadCrumb title="Lead" subTitle="CRM" />
      <div>
        <div className="card">
          <div className="card-header">
            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12">
                <div className="flex items-center gap-3">
                  <div className="relative group/form w-full xl:max-w-[300px]">
                    <input
                      type="text"
                      className="ltr:pl-9 rtl:pr-9 form-input ltr:group-[&.right]/form:pr-9 rtl:group-[&.right]/form:pl-9 ltr:group-[&.right]/form:left-auto rtl:group-[&.right]/form:right-auto focus:outline-hidden"
                      placeholder="Search for leads and customers..."
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

                  <button
                    className={`btn btn-icon btn-icon-text ${
                      showDateFilter ? 'btn btn-primary' : 'btn btn-sub-gray'
                    }`}
                    onClick={() => setShowDateFilter(!showDateFilter)}
                    title="date filter">
                    <Calendar className="size-5" />
                  </button>

                  {showDateFilter && (
                    <div className="relative">
                      <Flatpickr
                        value={dateFilter || ''}
                        onChange={handleDateFilter}
                        options={{
                          dateFormat: 'Y-m-d',
                          allowInput: true,
                        }}
                        className="form-input w-36"
                        placeholder="Select date..."
                      />
                      {appliedDateFilter && (
                        <button
                          className="absolute inset-y-0 flex items-center text-gray-500 dark:text-dark-500 ltr:right-3 rtl:left-3 hover:text-red-500"
                          onClick={handleClearDateFilter}
                          type="button">
                          <span className="text-lg">×</span>
                        </button>
                      )}
                    </div>
                  )}

                  {(appliedSearchTerm || appliedDateFilter) && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>Active filters:</span>
                      {appliedSearchTerm && (
                        <span className="badge badge-blue">
                          Search: {appliedSearchTerm}
                        </span>
                      )}
                      {appliedDateFilter && (
                        <span className="badge badge-green">
                          Date: {appliedDateFilter.toLocaleDateString()}
                        </span>
                      )}
                      <button
                        onClick={() => {
                          handleClearSearch()
                          handleClearDateFilter()
                          setShowDateFilter(false)
                        }}
                        className="text-red-500 hover:text-red-700">
                        Clear all
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="col-span-12 lg:col-span-6 xl:col-span-3">
                <div className="justify-end gap-2 sm:flex">
                  <button
                    type="button"
                    className="mt-2 btn btn-primary shrink-0 sm:mt-0 hidden"
                    onClick={() => openModal('showAddLeadForm')}>
                    <Plus className="inline-block size-4" />
                    <span className="align-baseline"> Add Lead</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="card-body">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <SimpleBar>
                <DragDropContext onDragEnd={onDragEnd}>
                  <div className="flex space-x-4">
                    {statusOrders.map((status, i) => {
                      const leadsByStatus = groupedItems[status] || []

                      return (
                        <Droppable key={status} droppableId={status}>
                          {(provided: DroppableProvided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className="w-[350px] shrink-0 bg-gray-100 p-5 rounded-md dark:bg-dark-850">
                              <h6 className="mb-4">
                                {getStatusDisplayName(status)}
                                <span
                                  className={`badge ${statusClasses[i]} mx-2`}>
                                  {leadsByStatus.length}
                                </span>
                              </h6>
                              <SimpleBar
                                style={{ maxHeight: 'calc(100vh - 25.1rem)' }}
                                className=" -mx-5 px-5">
                                <div
                                  className="flex flex-col gap-2"
                                  id="leads-container"
                                  data-status={status}>
                                  {leadsByStatus.map((item, index) => (
                                    <Draggable
                                      key={
                                        item.isCustomer
                                          ? `customer-${item.id}`
                                          : `lead-${item.id}`
                                      }
                                      draggableId={
                                        item.isCustomer
                                          ? `customer-${item.id}`
                                          : `lead-${item.id}`
                                      }
                                      index={index}
                                      isDragDisabled={
                                        status === 'CONVERTED_TO_CUSTOMER'
                                      }>
                                      {(provided: DraggableProvided) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}>
                                          <div className="p-3 bg-white border border-white rounded-sm dark:bg-dark-900 dark:border-dark-900 mb-2">
                                            <div className="flex items-center gap-3 mb-4">
                                              <div className="rounded-full size-12">
                                                <Image
                                                  src={getFirstImage(item)}
                                                  alt="itemImg"
                                                  className="rounded-full"
                                                  width={48}
                                                  height={48}
                                                />
                                              </div>
                                              <div className="grow">
                                                <h6 className="mb-1">
                                                  {item.name}
                                                </h6>
                                                <p className="text-sm text-gray-500 dark:text-dark-500">
                                                  <i className="ri-time-line"></i>
                                                  <span>
                                                    {formatDate(item.createdAt)}
                                                  </span>
                                                </p>
                                              </div>
                                            </div>
                                            <div className="mb-2">
                                              {renderLeadSourceIndicator(item)}
                                            </div>

                                            <p className="mb-2">
                                              <i className="ltr:mr-1 rtl:ml-1 ri-mail-line"></i>
                                              <span className="text-gray-500 dark:text-dark-500">
                                                {item.email}
                                              </span>
                                            </p>
                                            <p>
                                              <i className="ltr:mr-1 rtl:ml-1 ri-phone-line"></i>
                                              <span className="text-gray-500 dark:text-dark-500">
                                                {item.phoneNumber}
                                              </span>
                                            </p>
                                            <div className="flex items-center gap-3 mt-3">
                                              <Link
                                                href="#!"
                                                className="link link-primary"
                                                onClick={(e) => {
                                                  e.preventDefault()
                                                  handleViewLead(item)
                                                }}>
                                                View
                                              </Link>
                                              <Link
                                                href="#!"
                                                className="link link-red hidden"
                                                onClick={(e) => {
                                                  e.preventDefault()
                                                  onClickLeadDelete(item.id)
                                                }}>
                                                Delete
                                              </Link>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                </div>
                              </SimpleBar>
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      )
                    })}
                  </div>
                </DragDropContext>
              </SimpleBar>
            )}
          </div>
        </div>
      </div>

      <ToastContainer theme="light" position="top-right" />

      <Modal
        isOpen={showConversionModal}
        onClose={handleCancelConversion}
        position="modal-center"
        size="modal-xs"
        content={
          <>
            <div>
              <h4 className="mb-2 text-center">Convert Contact to Customer</h4>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
                Create a new customer with the contact&apos;s information
              </p>
            </div>
            <div className="flex justify-center gap-3 w-full">
              <button
                onClick={handleCancelConversion}
                className="btn btn-primary">
                Cancel
              </button>
              <button onClick={handleConfirmConversion} className="btn btn-red">
                Convert
              </button>
            </div>
          </>
        }
      />

      <ViewLeadOrCustomerModal
        isOpen={showViewModal}
        onClose={handleCloseViewModal}
        itemId={selectedLeadId}
        itemType={
          selectedLeadId &&
          customersData?.customers?.find((c) => c.id === selectedLeadId)
            ? 'customer'
            : 'lead'
        }
        projectId={projectId}
      />

      <AddEditCrmLead
        isOpen={modalState.showAddLeadForm || modalState.showEditLeadForm}
        onClose={handleCloseModal}
        editMode={editMode}
        currentLead={currentLead}
        projectId={projectId}
      />

      <DeleteModal
        show={show}
        handleHide={toggleDelete}
        deleteModalFunction={handleDeleteLead}
      />
    </React.Fragment>
  )
}

export default CrmLead
