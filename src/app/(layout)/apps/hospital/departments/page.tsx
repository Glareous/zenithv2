'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'

import BreadCrumb from '@src/components/common/BreadCrumb'
import DeleteModal from '@src/components/common/DeleteModal'
import Pagination from '@src/components/common/Pagination'
import { LAYOUT_DIRECTION } from '@src/components/constants/layout'
import TableContainer from '@src/components/custom/table/table'
import { NextPageWithLayout, departments } from '@src/dtos'
import { AppDispatch, RootState } from '@src/slices/reducer'
import { deleteDepartmentsData, getDepartmentsData } from '@src/slices/thunk'
import { CirclePlus } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify'

import AddEditDepartment from './AddEditDepartment'
import DistributedColumnChart from './DistributedColumnChart'

const Departments: NextPageWithLayout = () => {
  //get
  const dispatch = useDispatch<AppDispatch>()
  const { department } = useSelector((state: RootState) => state.Departments)
  const { layoutMode, layoutDirection } = useSelector(
    (state: RootState) => state.Layout
  )
  const [departmentData, setDepartmentData] = useState<departments[]>([])

  useEffect(() => {
    if (department === null) {
      dispatch(getDepartmentsData())
    } else {
      setDepartmentData(department)
    }
  }, [department, dispatch])

  //delete
  const [show, setShow] = useState<boolean>(false)
  const [event, setEvent] = useState<departments | null>(null)
  const [modalState, setModalState] = useState<{
    showEditDepartment: boolean
    showAddDepartment: boolean
  }>({
    showAddDepartment: false,
    showEditDepartment: false,
  })
  const [editMode, setEditMode] = useState(false)
  const [currentEvent, setCurrentEvent] = useState<departments | null>(null)
  const toggleDelete = () => {
    setShow(false)
    setEvent(null)
  }

  const handleDeleteList = () => {
    if (event) {
      dispatch(deleteDepartmentsData([event.id]))
      setShow(false)
    }
  }

  const onClickEventListDelete = (list: departments) => {
    setEvent(list)
    setShow(true)
  }

  const openModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: true }))
  const closeModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: false }))

  const handleOpenModal = useCallback(
    (editMode: boolean = false, event: departments | null = null) => {
      setEditMode(editMode)
      setCurrentEvent(event)
      const modalKey = editMode ? 'showEditDepartment' : 'showAddDepartment'
      openModal(modalKey)
    },
    []
  )

  const handleCloseModal = () => {
    const modalKey = editMode ? 'showEditDepartment' : 'showAddDepartment'
    closeModal(modalKey)
    setEditMode(false)
    setCurrentEvent(null)
  }

  //pagination
  const itemsPerPage = 5
  const [currentPage, setCurrentPage] = useState(1)
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedEvents = departmentData.slice(
    startIndex,
    startIndex + itemsPerPage
  )

  const getStatusClass = (status: string | undefined) => {
    switch (status) {
      case 'Active':
        return 'badge badge-green'
      case 'InActive':
        return 'badge badge-red'
      default:
        return 'badge'
    }
  }

  const columns = useMemo(
    () => [
      {
        header: 'Id',
        accessorKey: 'departmenId',
      },
      {
        header: 'Department Name',
        accessorKey: 'departmentName',
      },
      {
        header: 'Doctor',
        accessorKey: 'doctor',
        cell: ({ row }: { row: { original: departments } }) => {
          const { doctor, image } = row.original
          return (
            <div className="flex">
              <div className="flex items-center gap-3">
                <div className="relative text-gray-500 bg-gray-100 rounded-full dark:text-dark-500 dark:bg-dark-850 size-10">
                  {image ? (
                    <Image
                      src={image}
                      alt="doctorImg"
                      className="rounded-full"
                      width={40}
                      height={40}
                    />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-gray-500 bg-gray-100 rounded-full dark:text-dark-500 dark:bg-dark-850">
                      CE
                    </span>
                  )}
                </div>
                <div>
                  <h6>
                    <Link href="#!"></Link>
                    {doctor}
                  </h6>
                </div>
              </div>
            </div>
          )
        },
      },
      {
        header: 'Total Employee',
        accessorKey: 'totalEmployee',
      },
      {
        header: 'Head of Dept.',
        accessorKey: 'headOfDepartment',
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }: { row: { original: { status: string } } }) => {
          const { status } = row.original
          return <span className={getStatusClass(status)}>{status}</span>
        },
      },
      {
        header: 'Action',
        accessorKey: 'id',
        cell: (value) => (
          <>
            <div className="flex items-center gap-2">
              <button
                className="btn btn-sub-gray btn-icon !size-8"
                title="edit"
                onClick={(e) => {
                  e.preventDefault()
                  handleOpenModal(true, value.row.original as departments)
                }}>
                <i className="ri-pencil-line"></i>
              </button>
              <button
                className="btn btn-sub-red btn-icon !size-8"
                title="delete"
                data-modal-target="deleteModal"
                onClick={(e) => {
                  e.preventDefault()
                  onClickEventListDelete(value.row.original)
                }}>
                <i className="ri-delete-bin-line"></i>
              </button>
            </div>
          </>
        ),
      },
    ],
    [handleOpenModal]
  )

  return (
    <React.Fragment>
      <BreadCrumb title="Departments" subTitle="Hospital" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 card">
          <div className="flex items-center gap-3 card-header flex-wrap">
            <h6 className="card-title grow">Employee</h6>
            <p className="text-gray-500 shrink-0 dark:text-dark-500">
              Number of Staff according to department
            </p>
          </div>
          <div className="card-body">
            <div dir="ltr">
              <DistributedColumnChart
                chartColors="[bg-primary-500, bg-pink-500, bg-sky-500, bg-green-300, bg-yellow-200, bg-orange-200, bg-purple-500, bg-red-500]"
                chartDarkColors={''}
                chartId="distributedColumnChart"
              />
            </div>
          </div>
        </div>

        <div className="col-span-12 card">
          <div className="flex md:items-center gap-3 card-header flex-col md:flex-row">
            <h6 className="card-title grow">Department List</h6>
            <button
              type="button"
              className="btn btn-primary shrink-0"
              data-modal-target="addDepartmentModal"
              onClick={() => openModal('showAddDepartment')}>
              <CirclePlus className="inline-block ltr:mr-1 rtl:ml-1 size-4" />{' '}
              Add Department
            </button>
          </div>
          <div className="pt-0 card-body">
            <div>
              <TableContainer
                columns={columns || []}
                data={paginatedEvents}
                thClass="!font-medium cursor-pointer"
                // isSearch={false}
                divClass="overflow-x-auto table-box whitespace-nowrap"
                tableClass="table flush"
                thtrClass="text-gray-500 bg-gray-100 dark:text-dark-500 dark:bg-dark-850"
              />
            </div>

            <Pagination
              totalItems={departmentData.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
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

      <AddEditDepartment
        modalState={modalState}
        closeModal={handleCloseModal}
        departmentList={department}
        editMode={editMode}
        currentDepartment={currentEvent}
      />
    </React.Fragment>
  )
}

export default Departments
