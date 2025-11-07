'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'

import Image from 'next/image'

import hospital from '@assets/images/hospital/img-01.png'
import BreadCrumb from '@src/components/common/BreadCrumb'
import DeleteModal from '@src/components/common/DeleteModal'
import Pagination from '@src/components/common/Pagination'
import { LAYOUT_DIRECTION } from '@src/components/constants/layout'
import TableContainer from '@src/components/custom/table/table'
import { Holidays, NextPageWithLayout } from '@src/dtos'
import { AppDispatch, RootState } from '@src/slices/reducer'
import { deleteHolidaysData, getHolidaysData } from '@src/slices/thunk'
import { CirclePlus } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify'

import AddEditeHolidays from './AddEditeHolidays'

const StaffHolidays: NextPageWithLayout = () => {
  const dispatch: AppDispatch = useDispatch()
  const { holidays } = useSelector((state: RootState) => state.Holidays)
  const { layoutMode, layoutDirection } = useSelector(
    (state: RootState) => state.Layout
  )
  const [holidaysData, setHolidaysData] = useState<Holidays[]>([])
  const [medicine, setMedicine] = useState<Holidays | null>(null)
  const [show, setShow] = useState<boolean>(false)
  const [modalState, setModalState] = useState<{
    showAddHolidaysForm: boolean
    showEditHolidaysForm: boolean
  }>({
    showAddHolidaysForm: false,
    showEditHolidaysForm: false,
  })

  const [editMode, setEditMode] = useState(false)
  const [currentEvent, setCurrentEvent] = useState<Holidays | null>(null)

  useEffect(() => {
    if (holidays === null) {
      dispatch(getHolidaysData())
    } else {
      setHolidaysData(holidays)
    }
  }, [holidays, dispatch])

  // Delete handling
  const toggleDelete = () => {
    setShow(false)
    setMedicine(null)
  }

  const onClickEventListDelete = (list: Holidays) => {
    setMedicine(list)
    setShow(true)
  }

  const handleDeleteList = () => {
    if (medicine) {
      dispatch(deleteHolidaysData([medicine.id]))
      setShow(false)
    }
  }

  const openModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: true }))
  const closeModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: false }))

  const handleOpenModal = useCallback(
    (editMode: boolean = false, event: Holidays | null = null) => {
      setEditMode(editMode)
      setCurrentEvent(event)
      const modalKey = editMode ? 'showEditHolidaysForm' : 'showAddHolidaysForm'
      openModal(modalKey)
    },
    []
  )

  const handleCloseModal = () => {
    const modalKey = editMode ? 'showEditHolidaysForm' : 'showAddHolidaysForm'
    closeModal(modalKey)
    setEditMode(false)
    setCurrentEvent(null)
  }

  // Pagination handling
  const itemsPerPage = 10
  const [currentPage, setCurrentPage] = useState(1)
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedEvents = holidaysData.slice(
    startIndex,
    startIndex + itemsPerPage
  )

  // Date formatting function
  const formatDate = (date: string) => {
    const parsedDate = new Date(date)
    const day = parsedDate.getDate()
    const month = parsedDate.toLocaleString('default', { month: 'short' })
    const year = parsedDate.getFullYear()
    return `${day} ${month} ${year}` // Format: "1 Jan 2024"
  }

  const columns = useMemo(
    () => [
      {
        header: 'Holiday Name',
        accessorKey: 'name',
      },
      {
        header: 'Date',
        accessorKey: 'date',
        cell: ({ row }: { row: { original: Holidays } }) =>
          formatDate(row.original.date),
      },
      {
        header: 'Day',
        accessorKey: 'day',
      },
      {
        header: 'Action',
        accessorKey: 'action',
        cell: (value) => (
          <div className="flex items-center gap-2">
            <button
              className="btn btn-sub-gray btn-icon !size-8 rounded-md"
              title="edit"
              onClick={(e) => {
                e.preventDefault()
                handleOpenModal(true, value.row.original)
              }}>
              <i className="ri-pencil-line"></i>
            </button>
            <button
              className="btn btn-sub-red btn-icon !size-8 rounded-md"
              title="delete"
              onClick={(e) => {
                e.preventDefault()
                onClickEventListDelete(value.row.original)
              }}>
              <i className="ri-delete-bin-line"></i>
            </button>
          </div>
        ),
      },
    ],
    [handleOpenModal]
  )

  return (
    <React.Fragment>
      <BreadCrumb title="Holidays" subTitle="Staff" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 xl:col-span-4 2xl:col-span-3">
          <div className="bg-gray-100 card dark:bg-dark-850">
            <div className="card-body">
              <div className="mx-5 mb-4">
                <Image src={hospital} alt="hospitalImg" />
              </div>
              <div className="flex flex-col gap-4">
                <div className="relative pl-5 before:absolute before:left-0 before:top-1.5 before:size-2 before:bg-primary-500 before:rounded-full">
                  <p className="mb-2 badge badge-gray">Today - 21 Jan, 2024</p>
                  <h6>World Religion Day</h6>
                </div>
                <div className="relative pl-5 before:absolute before:left-0 before:top-1.5 before:size-2 before:bg-yellow-500 before:rounded-full">
                  <p className="mb-2 badge badge-gray">
                    Upcoming - 04 Feb, 2024
                  </p>
                  <h6>World Cancer Day</h6>
                </div>
                <div className="relative pl-5 before:absolute before:left-0 before:top-1.5 before:size-2 before:bg-red-500 before:rounded-full">
                  <p className="mb-2 badge badge-gray">
                    Upcoming - 25 May, 2024
                  </p>
                  <h6>African Liberation Day</h6>
                </div>
                <div className="relative pl-5 before:absolute before:left-0 before:top-1.5 before:size-2 before:bg-red-500 before:rounded-full">
                  <p className="mb-2 badge badge-gray">
                    Upcoming - 29 Sep, 2024
                  </p>
                  <h6>World Heart Day</h6>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-8 2xl:col-span-9 card">
          <div className="flex items-center gap-3 card-header">
            <h6 className="card-title grow">Holiday</h6>
            <button
              type="button"
              className="btn btn-primary shrink-0"
              onClick={() => openModal('showAddHolidaysForm')}>
              <CirclePlus className="inline-block mr-1 size-4" /> Add Holiday
            </button>
          </div>
          <div className="pt-0 card-body">
            <div>
              <TableContainer
                columns={columns}
                data={paginatedEvents}
                thClass="!font-medium cursor-pointer"
                divClass="overflow-x-auto table-box whitespace-nowrap"
                tableClass="table flush"
                thtrClass="text-gray-500 bg-gray-100 dark:bg-dark-850 dark:text-dark-500"
              />
              <Pagination
                totalItems={holidaysData.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        </div>
      </div>

      <ToastContainer
        theme={layoutMode}
        rtl={layoutDirection === LAYOUT_DIRECTION.RTL}
        position={
          layoutDirection === LAYOUT_DIRECTION.RTL ? 'top-left' : 'top-right'
        }
      />

      <DeleteModal
        show={show}
        handleHide={toggleDelete}
        deleteModalFunction={handleDeleteList}
      />

      <AddEditeHolidays
        modalState={modalState}
        closeModal={handleCloseModal}
        eventList={holidaysData}
        editMode={editMode}
        currentContact={currentEvent}
      />
    </React.Fragment>
  )
}

export default StaffHolidays
