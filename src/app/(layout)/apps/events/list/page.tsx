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
import type { EventList, NextPageWithLayout } from '@src/dtos'
import { AppDispatch, RootState } from '@src/slices/reducer'
import { deleteEventListData, getEventListData } from '@src/slices/thunk'
import { Plus, SlidersHorizontal } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import { createSelector } from 'reselect'

import AddEditEventListt from './AddEditEventList'

const EventList: NextPageWithLayout = () => {
  const dispatch: AppDispatch = useDispatch()
  const customerDatas = createSelector(
    (state: RootState) => state.EventList,
    (state) => state.eventList
  )
  const eventList = useSelector(customerDatas)
  const { layoutMode, layoutDirection } = useSelector(
    (state: RootState) => state.Layout
  )
  const [eventListData, setEventListData] = useState<EventList[]>([])
  useEffect(() => {
    if (!eventList) {
      dispatch(getEventListData())
    } else {
      setEventListData(eventList)
    }
  }, [eventList, dispatch])
  const [event, setEvent] = useState<EventList | null>(null)
  const [show, setShow] = useState<boolean>(false)
  const [modalState, setModalState] = useState<{
    showAddContactForm: boolean
    showEditContactForm: boolean
  }>({
    showAddContactForm: false,
    showEditContactForm: false,
  })
  const [editMode, setEditMode] = useState(false)
  const [sortOption, setSortOption] = useState('none')
  const [currentEvent, setCurrentEvent] = useState<EventList | null>(null)
  const itemsPerPage = 10
  const [currentPage, setCurrentPage] = useState(1)
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedEvents = eventListData.slice(
    startIndex,
    startIndex + itemsPerPage
  )
  const toggleDelete = () => {
    setShow(false)
    setEvent(null)
  }

  const onClickEventListDelete = (list: EventList) => {
    setEvent(list)
    setShow(true)
  }

  const handleDeleteList = () => {
    if (event) {
      dispatch(deleteEventListData([event.id]))
      setShow(false)
    }
  }

  const openModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: true }))
  const closeModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: false }))

  const handleOpenModal = useCallback(
    (editMode: boolean = false, event: EventList | null = null) => {
      setEditMode(editMode)
      setCurrentEvent(event)
      const modalKey = editMode ? 'showEditContactForm' : 'showAddContactForm'
      openModal(modalKey)
    },
    []
  )

  const handleCloseModal = () => {
    const modalKey = editMode ? 'showEditContactForm' : 'showAddContactForm'
    closeModal(modalKey)
    setEditMode(false)
    setCurrentEvent(null)
  }

  const getStatusClass = (status: string | undefined) => {
    switch (status) {
      case 'Published':
        return 'badge badge-green'
      case 'Expired':
        return 'badge badge-red'
      case 'Coming Soon':
        return 'badge badge-yellow'
      default:
        return 'badge'
    }
  }

  const handleSort = (option: string) => {
    const sortedList = [...eventListData]
    switch (option) {
      case 'eventNameAsc':
        sortedList.sort((a, b) => a.eventName.localeCompare(b.eventName))
        break
      case 'eventNameDesc':
        sortedList.sort((a, b) => b.eventName.localeCompare(a.eventName))
        break
      case 'status':
        sortedList.sort((a, b) => a.status.localeCompare(b.status))
        break
      default:
        break
    }
    setSortOption(option)
    setEventListData(sortedList)
  }

  const columns = useMemo(
    () => [
      {
        header: 'Event Name',
        accessorKey: 'eventName',
        cell: (value: { row: { original: EventList } }) => {
          return (
            <>
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center p-1 border border-gray-200 rounded-sm size-9 dark:border-dark-800">
                  <Image
                    src={value.row.original.image}
                    alt="eventImg"
                    className="rounded-sm"
                    width={26}
                    height={26}
                  />
                </div>
                <h6>
                  <Link href="apps-ecommerce-event-overview"></Link>
                  {value.row.original.eventName}
                </h6>
              </div>
            </>
          )
        },
      },
      {
        header: 'Event Date',
        accessorKey: 'eventDate',
      },
      {
        header: 'People Size',
        accessorKey: 'peopleSize',
      },
      {
        header: 'Location',
        accessorKey: 'location',
      },
      {
        header: 'Event Type',
        accessorKey: 'eventType',
      },
      {
        header: 'Price',
        accessorKey: 'price',
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }) => {
          const { status } = row.original
          return <span className={getStatusClass(status)}>{status}</span>
        },
      },
      {
        header: 'Action',
        accessorKey: '',
        cell: (value) => (
          <>
            <Dropdown
              position="right"
              trigger="click"
              dropdownClassName="dropdown">
              <DropdownButton colorClass="flex items-center text-gray-500 dark:text-dark-500">
                <i className="ri-more-2-fill"></i>
              </DropdownButton>
              <DropdownMenu>
                <Link href="/apps/events/overview" className="dropdown-item ">
                  <i className="align-middle ltr:mr-2 rtl:ml-2 ri-eye-line"></i>
                  <span>Overview</span>
                </Link>

                <Link
                  href="#!"
                  className="dropdown-item "
                  onClick={(e) => {
                    e.preventDefault()
                    handleOpenModal(true, value.row.original)
                  }}>
                  <i className="align-middle ltr:mr-2 rtl:ml-2 ri-pencil-line"></i>
                  <span>Edit</span>
                </Link>
                <Link
                  href="#!"
                  className="dropdown-item"
                  onClick={(e) => {
                    e.preventDefault()
                    onClickEventListDelete(value.row.original)
                  }}>
                  <i className="align-middle ltr:mr-2 rtl:ml-2 ri-delete-bin-line"></i>
                  <span>Delete</span>
                </Link>
              </DropdownMenu>
            </Dropdown>
          </>
        ),
      },
    ],
    [handleOpenModal]
  )

  return (
    <React.Fragment>
      <BreadCrumb title="List View" subTitle="Events" />
      <div>
        <div className="flex flex-wrap items-center gap-5">
          <h6 className="grow">
            Event Listings (<span>{eventListData.length}</span>)
          </h6>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Dropdown
              position="right"
              trigger="click"
              dropdownClassName="dropdown">
              <DropdownButton colorClass="btn btn-sub-gray btn-icon btn-icon-text">
                <SlidersHorizontal className="size-4" />
              </DropdownButton>
              <DropdownMenu>
                <button
                  onClick={() => handleSort('none')}
                  className="dropdown-item text-start">
                  <span>No Sorting</span>
                </button>
                <button
                  onClick={() => handleSort('eventNameAsc')}
                  className="dropdown-item text-start">
                  <span>Alphabetical (A -&gt; Z)</span>
                </button>
                <button
                  onClick={() => handleSort('eventNameDesc')}
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
              className="btn btn-primary shrink-0"
              data-modal-target="addEventModal"
              onClick={() => openModal('showAddContactForm')}>
              <Plus className="inline-block size-4 me-1" />
              <span className="align-baseline">Add New Event</span>
            </button>
          </div>
        </div>

        <TableContainer
          columns={columns || []}
          data={paginatedEvents || sortOption}
          thClass="!font-medium cursor-pointer"
          // isSearch={false}
          divClass="mt-5 overflow-x-auto"
          tableClass="table whitespace-nowrap"
          thtrClass="text-gray-500 bg-gray-100 dark:bg-dark-850 dark:text-dark-500"
        />
        <div className="mb-5">
          <Pagination
            totalItems={eventListData.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      <ToastContainer
        theme={layoutMode}
        rtl={layoutDirection === LAYOUT_DIRECTION.RTL}
        position={
          layoutDirection === LAYOUT_DIRECTION.RTL ? 'top-left' : 'top-right'
        }
      />

      <AddEditEventListt
        modalState={modalState}
        closeModal={handleCloseModal}
        eventList={eventListData}
        editMode={editMode}
        currentEvent={currentEvent}
      />

      <DeleteModal
        show={show}
        handleHide={toggleDelete}
        deleteModalFunction={handleDeleteList}
      />
    </React.Fragment>
  )
}

export default EventList
