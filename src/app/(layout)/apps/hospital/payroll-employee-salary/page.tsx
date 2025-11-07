'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import DeleteModal from '@src/components/common/DeleteModal'
import Pagination from '@src/components/common/Pagination'
import { LAYOUT_DIRECTION } from '@src/components/constants/layout'
import TableContainer from '@src/components/custom/table/table'
import { NextPageWithLayout, employeeSalary } from '@src/dtos'
import { AppDispatch, RootState } from '@src/slices/reducer'
import {
  deleteEmployeeSalaryData,
  getEmployeeSalaryData,
} from '@src/slices/thunk'
import { useDispatch, useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify'

import AddEditEmployeeSalary from './AddEditEmployeeSalary'

const PayrollEmployeeSalary: NextPageWithLayout = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { salary } = useSelector((state: RootState) => state.EmployeeSalary)
  const { layoutMode, layoutDirection } = useSelector(
    (state: RootState) => state.Layout
  )
  const [employeeSalaryData, setEmployeeSalaryData] = useState<
    employeeSalary[]
  >([])
  const [show, setShow] = useState<boolean>(false)
  const [event, setEvent] = useState<employeeSalary | null>(null)
  const [modalState, setModalState] = useState<{
    showEmployeeForm: boolean
    showAddEmployeeForm: boolean
  }>({
    showAddEmployeeForm: false,
    showEmployeeForm: false,
  })
  const [editMode, setEditMode] = useState(false)
  const [currentEvent, setCurrentEvent] = useState<employeeSalary | null>(null)

  //get
  useEffect(() => {
    if (salary === null) {
      dispatch(getEmployeeSalaryData())
    } else {
      setEmployeeSalaryData(salary)
    }
  }, [salary, dispatch])

  const toggleDelete = () => {
    setShow(false)
    setEvent(null)
  }

  const handleDeleteList = () => {
    if (event) {
      dispatch(deleteEmployeeSalaryData([event.id]))
      setShow(false)
    }
  }

  const onClickEventListDelete = (list: employeeSalary) => {
    setEvent(list)
    setShow(true)
  }

  const openModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: true }))
  const closeModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: false }))

  const handleOpenModal = useCallback(
    (editMode: boolean = false, event: employeeSalary | null = null) => {
      setEditMode(editMode)
      setCurrentEvent(event)
      const modalKey = editMode ? 'showEmployeeForm' : 'showAddEmployeeForm'
      openModal(modalKey)
    },
    []
  )

  const handleCloseModal = () => {
    const modalKey = editMode ? 'showEmployeeForm' : 'showAddEmployeeForm'
    closeModal(modalKey)
    setEditMode(false)
    setCurrentEvent(null)
  }

  const getStatusClass = (status: string | undefined) => {
    switch (status) {
      case 'Successful':
        return 'badge badge-green'
      case 'Pending':
        return 'badge badge-yellow'
      case 'Failed':
        return 'badge badge-red'
      default:
        return 'badge'
    }
  }

  const columns = useMemo(
    () => [
      {
        header: 'Employee Name',
        accessorKey: 'employeeName',
      },
      {
        header: 'Email',
        accessorKey: 'email',
      },
      {
        header: 'Phone Number',
        accessorKey: 'phoneNumber',
      },
      {
        header: 'Department',
        accessorKey: 'department',
      },
      {
        header: 'Monthly Salary',
        accessorKey: 'monthlySalary',
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }: { row: { original: employeeSalary } }) => {
          const { status } = row.original
          return <span className={getStatusClass(status)}>{status}</span>
        },
      },
      {
        header: 'Action',
        accessorKey: '',
        cell: (value) => (
          <>
            <div className="flex items-center gap-2">
              <button
                className="btn btn-sub-primary btn-icon !size-8"
                title="edit"
                onClick={(e) => {
                  e.preventDefault()
                  handleOpenModal(true, value.row.original)
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

  // pagination

  const itemsPerPage = 10
  const [currentPage, setCurrentPage] = useState(1)
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedEvents = employeeSalaryData.slice(
    startIndex,
    startIndex + itemsPerPage
  )

  return (
    <React.Fragment>
      <BreadCrumb title="Employee Salary" subTitle="Payroll" />
      <div className="card">
        <div className="flex items-center gap-3 card-header">
          <h6 className="card-title grow">Employee</h6>
          <button type="button" className="btn btn-primary shrink-0">
            Download
          </button>
        </div>

        <div className="pt-0 card-body">
          <TableContainer
            columns={columns || []}
            data={paginatedEvents}
            divClass="overflow-x-auto table-box"
            tableClass="table flush"
            thtrClass="text-gray-500 bg-gray-100 dark:bg-dark-850 dark:text-dark-500"
          />
          <Pagination
            totalItems={employeeSalaryData.length}
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

      <DeleteModal
        show={show}
        handleHide={toggleDelete}
        deleteModalFunction={handleDeleteList}
      />

      <AddEditEmployeeSalary
        modalState={modalState}
        closeModal={handleCloseModal}
        salaryList={employeeSalaryData}
        editMode={editMode}
        currentSalary={currentEvent}
      />
    </React.Fragment>
  )
}

export default PayrollEmployeeSalary
