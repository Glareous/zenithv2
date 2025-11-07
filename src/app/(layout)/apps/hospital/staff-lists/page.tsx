'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'

import BreadCrumb from '@src/components/common/BreadCrumb'
import DeleteModal from '@src/components/common/DeleteModal'
import Pagination from '@src/components/common/Pagination'
import { LAYOUT_DIRECTION } from '@src/components/constants/layout'
import TableContainer from '@src/components/custom/table/table'
import { NextPageWithLayout, StaffList } from '@src/dtos'
import { AppDispatch, RootState } from '@src/slices/reducer'
import { deleteStaffListData, getStaffListData } from '@src/slices/thunk'
import { CirclePlus } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify'

import AddEditStaffList from './AddEditStaffList'

const StaffLists: NextPageWithLayout = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { staffList } = useSelector((state: RootState) => state.StaffList)
  const { layoutMode, layoutDirection } = useSelector(
    (state: RootState) => state.Layout
  )
  const [staffListData, setStaffListData] = useState<StaffList[]>([])
  const [event, setEvent] = useState<StaffList | null>(null)
  const [show, setShow] = useState<boolean>(false)
  const [modalState, setModalState] = useState<{
    showAddStaffForm: boolean
    showEditStaffForm: boolean
  }>({
    showAddStaffForm: false,
    showEditStaffForm: false,
  })
  const [editMode, setEditMode] = useState(false)
  const [currentEvent, setCurrentEvent] = useState<StaffList | null>(null)
  //pagination
  const itemsPerPage = 10
  const [currentPage, setCurrentPage] = useState(1)
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  //get
  useEffect(() => {
    if (!staffList) {
      dispatch(getStaffListData())
    } else {
      setStaffListData(staffList)
    }
  }, [staffList, dispatch])

  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedEvents = staffListData.slice(
    startIndex,
    startIndex + itemsPerPage
  )
  const toggleDelete = () => {
    setShow(false)
    setEvent(null)
  }

  const onClickEventListDelete = (list: StaffList) => {
    setEvent(list)
    setShow(true)
  }

  const handleDeleteList = () => {
    if (event) {
      dispatch(deleteStaffListData([event.id]))
      setShow(false)
    }
  }

  const openModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: true }))
  const closeModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: false }))
  const handleOpenModal = useCallback(
    (editMode: boolean = false, event: StaffList | null = null) => {
      setEditMode(editMode)
      setCurrentEvent(event)
      const modalKey = editMode ? 'showEditStaffForm' : 'showAddStaffForm'
      openModal(modalKey)
    },
    []
  )

  const handleCloseModal = () => {
    const modalKey = editMode ? 'showEditStaffForm' : 'showAddStaffForm'
    closeModal(modalKey)
    setEditMode(false)
    setCurrentEvent(null)
  }

  const columns = useMemo(
    () => [
      {
        header: 'Id',
        accessorKey: 'staffId',
      },
      {
        header: 'Staff Name',
        accessorKey: 'name',
        cell: ({ row }: { row: { original: StaffList } }) => {
          const { image, name, role } = row.original
          return (
            <div className="flex items-center gap-3">
              <div className="relative text-gray-500 bg-gray-100 rounded-full dark:text-dark-500 dark:bg-dark-850 size-10">
                {image ? (
                  <Image
                    src={image}
                    alt={name}
                    className="rounded-full"
                    width={40}
                    height={40}
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-gray-500 bg-gray-100 rounded-full dark:text-dark-500 dark:bg-dark-850">
                    {name.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <h6 className="mb-1">
                  <Link href="#!">{name}</Link>
                </h6>
                <p className="text-sm text-gray-500 dark:text-dark-500">
                  {role}
                </p>
              </div>
            </div>
          )
        },
      },
      {
        header: 'Department',
        accessorKey: 'department',
      },
      {
        header: 'Email',
        accessorKey: 'email',
      },
      {
        header: 'Phone',
        accessorKey: 'phone',
      },
      {
        header: 'Joining Date',
        accessorKey: 'date',
      },
      {
        header: 'Action',
        accessorKey: '',
        cell: ({ row }: { row: { original: StaffList } }) => (
          <div className="flex items-center gap-2">
            <button
              className="btn btn-sub-gray btn-icon !size-8 rounded-md"
              title="edit"
              data-modal-target="addStaffModal"
              onClick={(e) => {
                e.preventDefault()
                handleOpenModal(true, row.original)
              }}>
              <i className="ri-pencil-line"></i>
            </button>
            <button
              className="btn btn-sub-red btn-icon !size-8 rounded-md"
              title="delete"
              data-modal-target="deleteModal"
              onClick={(e) => {
                e.preventDefault()
                onClickEventListDelete(row.original)
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
      <BreadCrumb title="List View" subTitle="Staff" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 card">
          <div className="flex items-center gap-3 card-header">
            <h6 className="card-title grow">Staff List</h6>
            <button
              type="button"
              className="btn btn-primary shrink-0"
              data-modal-target="addStaffModal"
              onClick={() => openModal('showAddStaffForm')}>
              <CirclePlus className="inline-block mr-1 size-4" /> Add Staff
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
                totalItems={staffListData.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        </div>
      </div>
      <DeleteModal
        show={show}
        handleHide={toggleDelete}
        deleteModalFunction={handleDeleteList}
      />
      <AddEditStaffList
        modalState={modalState}
        closeModal={handleCloseModal}
        staffList={staffListData}
        editMode={editMode}
        currentStaff={currentEvent}
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

export default StaffLists
