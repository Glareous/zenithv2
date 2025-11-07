'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'

import BreadCrumb from '@src/components/common/BreadCrumb'
import DeleteModal from '@src/components/common/DeleteModal'
import { LAYOUT_DIRECTION } from '@src/components/constants/layout'
import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
} from '@src/components/custom/dropdown/dropdown'
import { NextPageWithLayout } from '@src/dtos'
import { RootState } from '@src/slices/reducer'
import { api } from '@src/trpc/react'
import 'flatpickr/dist/themes/material_blue.css'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  GalleryVerticalEnd,
  List,
  Plus,
  Search,
  Trash,
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import Flatpickr from 'react-flatpickr'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { ToastContainer } from 'react-toastify'

import AddEditProjectDeal from './AddEditProjectDeal'
import CallModal from './CallModal'
import MessageModal from './MessageModal'

type DealItem = {
  id: number
  image: string
  projectName: string
  createDate: string
  endDate: string
  amount: string
  company: string
  content: string
  status: string
  userimage: string
  messages: any[]
}

type DealData = {
  id: string
  name: string
  dealDate: Date | null
  isActive: boolean
  isExpired: boolean
  createdAt: Date
  updatedAt: Date
  customer: {
    id: string
    name: string
    email: string | null
    phoneNumber: string | null
    files: Array<{
      id: string
      s3Url: string
      fileType: string
    }>
  }
}

const CrmDeal: NextPageWithLayout = () => {
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
  const [itemsPerPage, setItemsPerPage] = useState(8)

  // Nuevo estado para filtro de fecha
  const [dateFilter, setDateFilter] = useState<Date | null>(null)
  const [appliedDateFilter, setAppliedDateFilter] = useState<Date | null>(null)

  // Nuevo estado para mostrar/ocultar el date picker
  const [showDateFilter, setShowDateFilter] = useState(false)

  const [selectedDeal, setSelectedDeal] = useState<DealData | null>(null)
  const [open, setOpen] = useState(false)
  const [messageOpen, setMessageOpen] = useState(false)
  const [sortOption, setSortOption] = useState('none')
  const [isCardView, setIsCardView] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deletedRecord, setDeletedRecord] = useState<string[] | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [currentDeal, setCurrentDeal] = useState<DealData | null>(null)
  const [modalState, setModalState] = useState({
    showAddDealForm: false,
    showEditDealForm: false,
  })

  const utils = api.useUtils()

  const { data: dealsData, isLoading: loadingDeals } =
    api.projectDeal.getAll.useQuery(
      {
        projectId,
        page: currentPage,
        limit: itemsPerPage,
        search: appliedSearchTerm || undefined,
        // Agregar filtro de fecha si es necesario en el backend
        // dealDate: appliedDateFilter || undefined,
      },
      { enabled: !!projectId }
    )

  const deleteDeal = api.projectDeal.delete.useMutation({
    onSuccess: () => {
      toast.success('Deal deleted successfully')
      utils.projectDeal.getAll.invalidate({ projectId })
      setIsModalOpen(false)
      setDeletedRecord(null)
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

  // Nuevas funciones para filtro de fecha
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
  }

  const handleDeleteRecord = (id: string) => {
    setIsModalOpen(true)
    setDeletedRecord([id])
  }

  const setDeleteRecord = () => {
    if (deletedRecord && isModalOpen) {
      deletedRecord.forEach((id) => {
        deleteDeal.mutate({ id, projectId })
      })
    }
  }

  const openModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: true }))

  const closeModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: false }))

  const handleOpenModal = useCallback(
    (editMode: boolean = false, deal: DealData | null = null) => {
      setEditMode(editMode)
      setCurrentDeal(deal)
      const modalKey = editMode ? 'showEditDealForm' : 'showAddDealForm'
      openModal(modalKey)
    },
    []
  )

  const handleCloseModal = () => {
    const modalKey = editMode ? 'showEditDealForm' : 'showAddDealForm'
    closeModal(modalKey)
    setEditMode(false)
    setCurrentDeal(null)
  }

  const handleOpenCallModal = (deal: DealData) => {
    setSelectedDeal(deal)
    setMessageOpen(false)
    setOpen(true)
  }

  const handleCloseCallModal = () => {
    setOpen(false)
    setSelectedDeal(null)
  }

  const handleOpenMessageModal = (deal: DealData) => {
    setSelectedDeal(deal)
    setMessageOpen(true)
  }

  const handleCloseMessageModal = () => {
    setMessageOpen(false)
    setSelectedDeal(null)
  }

  const handleSort = (option: string) => {
    setSortOption(option)
  }

  const getStatusClass = (isActive: boolean, isExpired: boolean) => {
    if (isExpired) {
      return 'badge badge-red'
    }
    if (isActive) {
      return 'badge badge-green'
    }
    return 'badge badge-gray'
  }

  const getFirstImage = (deal: DealData) => {
    const profileImage = deal.customer.files?.find(
      (file) => file.fileType === 'IMAGE'
    )?.s3Url

    if (profileImage && !profileImage.includes('undefined')) {
      return profileImage
    }

    return DEFAULT_AVATAR
  }

  const formatDate = (date: Date | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString()
  }

  const getStatusText = (isActive: boolean, isExpired: boolean) => {
    if (isExpired) {
      return 'Expired'
    }
    if (isActive) {
      return 'Active'
    }
    return 'Inactive'
  }

  const DEFAULT_AVATAR = '/assets/images/user-avatar.jpg'

  const sortedData = useMemo(() => {
    let deals = dealsData?.deals || []

    // Aplicar filtro de fecha en frontend
    if (appliedDateFilter) {
      deals = deals.filter((deal) => {
        if (!deal.dealDate) return false
        const dealDate = new Date(deal.dealDate)
        const filterDate = new Date(appliedDateFilter)
        return dealDate.toDateString() === filterDate.toDateString()
      })
    }

    switch (sortOption) {
      case 'projectNameAsc':
        return [...deals].sort((a, b) => a.name.localeCompare(b.name))
      case 'projectNameDesc':
        return [...deals].sort((a, b) => b.name.localeCompare(a.name))
      case 'status':
        return [...deals].sort((a, b) => {
          const aStatus = getStatusText(a.isActive, a.isExpired)
          const bStatus = getStatusText(b.isActive, b.isExpired)
          return aStatus.localeCompare(bStatus)
        })
      default:
        return deals
    }
  }, [dealsData?.deals, sortOption, appliedDateFilter])

  const adaptDealDataToDealItem = (
    dealData: DealData | null
  ): DealItem | null => {
    if (!dealData) return null

    return {
      id: parseInt(dealData.id) || 0,
      image: getFirstImage(dealData),
      projectName: dealData.name,
      createDate: dealData.createdAt.toISOString(),
      endDate: dealData.dealDate?.toISOString() || '',
      amount: dealData.customer.name || '',
      company: dealData.customer.email || '',
      content: `Deal for ${dealData.customer.name}`,
      status: getStatusText(dealData.isActive, dealData.isExpired),
      userimage: getFirstImage(dealData),
      messages: [],
    }
  }

  if (!projectId) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-500">No project selected</p>
      </div>
    )
  }

  if (loadingDeals) {
    return (
      <React.Fragment>
        <BreadCrumb title="Deal" subTitle="CRM" />
        <div className="card">
          <div className="card-body">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading deals...</p>
            </div>
          </div>
        </div>
      </React.Fragment>
    )
  }

  return (
    <React.Fragment>
      <BreadCrumb title="Deal" subTitle="CRM" />
      <div>
        <div>
          <div>
            <div className="flex flex-wrap justify-between gap-5 mb-5">
              <div className="flex items-center gap-3">
                <div className="relative group/form">
                  <input
                    type="text"
                    className="ltr:pl-9 rtl:pr-9 form-input ltr:group-[&.right]/form:pr-9 rtl:group-[&.right]/form:pl-9 ltr:group-[&.right]/form:pl-4 rtl:group-[&.right]/form:pr-4"
                    placeholder="Search for deals..."
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

              <div>
                <div className="flex flex-wrap gap-2">
                  <button
                    className={`btn btn-icon btn-icon-text ${
                      isCardView ? 'btn btn-primary' : 'btn btn-sub-gray'
                    }`}
                    onClick={() => setIsCardView(true)}
                    title="card">
                    <GalleryVerticalEnd className="size-5" />
                  </button>
                  <button
                    className={`btn btn-icon btn-icon-text ${
                      !isCardView ? 'btn btn-primary' : 'btn btn-sub-gray'
                    }`}
                    onClick={() => setIsCardView(false)}
                    title="list">
                    <List className="size-5" />
                  </button>

                  <Dropdown
                    position=""
                    trigger="click"
                    dropdownClassName="dropdown">
                    <DropdownButton colorClass="btn btn-sub-gray">
                      <Filter className="inline-block ltr:mr-1 rtl:ml-1 align-center size-4" />{' '}
                      Sort By
                    </DropdownButton>
                    <DropdownMenu>
                      <button
                        onClick={() => handleSort('none')}
                        className="dropdown-item text-start">
                        <span>No Sorting</span>
                      </button>
                      <button
                        onClick={() => handleSort('projectNameAsc')}
                        className="dropdown-item text-start">
                        <span>Alphabetical (A -&gt; Z)</span>
                      </button>
                      <button
                        onClick={() => handleSort('projectNameDesc')}
                        className="dropdown-item text-start">
                        <span>Reverse Alphabetical (Z -&gt; A)</span>
                      </button>
                      <button
                        onClick={() => handleSort('status')}
                        className="dropdown-item text-start">
                        <span>Status</span>
                      </button>
                    </DropdownMenu>
                  </Dropdown>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => openModal('showAddDealForm')}>
                    <Plus className="inline-block size-4" />
                    <span className="align-baseline">Add Deal</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div
              className={` ${
                isCardView
                  ? 'group card-view gap-x-5 grid grid-cols-12'
                  : 'list-view group'
              }`}>
              {sortedData.map((item, idx: number) => (
                <div
                  className="group-[&.card-view]:2xl:col-span-3 group-[&.card-view]:md:col-span-6 group-[&.card-view]:col-span-12"
                  key={item.id}>
                  <div className="card">
                    <div className="card-body">
                      <div className="group-[&.list-view]:flex group-[&.list-view]:justify-between gap-4 group-[&.list-view]:overflow-x-auto group-[&.list-view]:whitespace-nowrap group-[&.card-view]:grid group-[&.card-view]:grid-cols-12">
                        <div className="flex items-center col-span-4 gap-3 group-[&.card-view]:min-w-[300px]">
                          <div className="p-2 border border-gray-200 rounded-md dark:border-dark-800 size-12 shrink-0">
                            <Image
                              src={getFirstImage(item)}
                              alt="leadImg"
                              height={30}
                              width={30}
                              className="rounded-md object-cover"
                            />
                          </div>
                          <div className="overflow-hidden grow">
                            <h6 className="mb-1 truncate">
                              <Link href="#!">{item.name}</Link>
                            </h6>

                            <p className="text-gray-500 dark:text-dark-500">
                              <span>{item.customer.name}</span>
                              {isCardView && (
                                <span className="inline-block group-[&.card-view]:inline-block">
                                  - <span>{formatDate(item.dealDate)}</span>
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        {!isCardView && (
                          <div className="w-28">
                            <p className="text-gray-500 dark:text-dark-500">
                              {formatDate(item.dealDate)}
                            </p>
                          </div>
                        )}
                        <div className="group-[&.list-view]:w-28 group-[&.card-view]:col-span-12">
                          <p
                            className={`text-gray-500 dark:text-dark-500 truncate ${
                              isCardView
                                ? 'group-[&.card-view]:text-gray-800 dark:group-[&.card-view]:text-dark-50 group-[&.card-view]:font-medium'
                                : ''
                            }`}>
                            {item.customer.email || 'No email'}
                          </p>
                          {isCardView && (
                            <p className="group-[&.card-view]:block hidden mt-1 text-gray-500 dark:text-dark-500 line-clamp-2">
                              {item.customer.phoneNumber || 'No phone'}
                            </p>
                          )}
                        </div>
                        <div className="w-28 group-[&.card-view]:col-span-12">
                          <div className="flex items-center gap-2">
                            <span
                              className={getStatusClass(
                                item.isActive,
                                item.isExpired
                              )}>
                              {getStatusText(item.isActive, item.isExpired)}
                            </span>
                          </div>
                        </div>
                        <div className="col-span-3 group-[&.card-view]:min-w-[300px]">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenMessageModal(item)}
                              className="border-dashed btn btn-dashed-yellow group-[&.card-view]:w-full">
                              <i className="align-baseline ltr:mr-1 rtl:ml-1 ri-message-2-line"></i>
                              Message
                            </button>
                            <button
                              type="button"
                              data-modal-target="callModal"
                              onClick={() => handleOpenCallModal(item)}
                              className="border-dashed btn btn-dashed-primary shrink-0 hidden">
                              <i className="align-baseline ltr:mr-1 rtl:ml-1 ri-phone-line"></i>
                              Call
                            </button>
                            <button
                              type="button"
                              className="btn btn-sub-gray shrink-0 btn-icon-text btn-icon"
                              title="edit"
                              onClick={() => handleOpenModal(true, item)}>
                              <i className="align-baseline ltr:mr-1 rtl:ml-1 ri-pencil-line"></i>
                            </button>
                            <button
                              type="button"
                              className="btn btn-red shrink-0 btn-icon-text btn-icon"
                              title="delete"
                              onClick={() => handleDeleteRecord(item.id)}>
                              <Trash className="inline-block size-4"></Trash>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <AddEditProjectDeal
        isOpen={modalState.showAddDealForm || modalState.showEditDealForm}
        onClose={handleCloseModal}
        editMode={editMode}
        currentDeal={currentDeal}
        projectId={projectId}
        onSuccess={() => {
          utils.projectDeal.getAll.invalidate({ projectId })
        }}
      />

      <MessageModal
        messageOpen={messageOpen}
        closeModal={handleCloseMessageModal}
        selectedDeal={adaptDealDataToDealItem(selectedDeal)}
        handleOpenModal={(deal) => handleOpenCallModal(selectedDeal!)}
      />

      <CallModal
        open={open}
        closeModal={handleCloseCallModal}
        selectedDeal={adaptDealDataToDealItem(selectedDeal)}
      />

      <DeleteModal
        title="Are you sure you want to delete this deal?"
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

export default CrmDeal
