'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'

import Link from 'next/link'

import Pagination from '@src/components/common/Pagination'
import { LAYOUT_DIRECTION } from '@src/components/constants/layout'
import TableContainer from '@src/components/custom/table/table'
import type { StaffLeaves } from '@src/dtos'
import {
  LeaveStatus,
  LeavesListProps,
  OptionType,
} from '@src/dtos/apps/staffleaves'
import { AppDispatch, RootState } from '@src/slices/reducer'
import { getStaffLeaveData } from '@src/slices/thunk'
import { Filter, Search } from 'lucide-react'
import Flatpickr from 'react-flatpickr'
import { useDispatch, useSelector } from 'react-redux'
import Select, { SingleValue } from 'react-select'
import { ToastContainer } from 'react-toastify'

import EditStaffLeave from './editStaffLeave'
import LeaveInformation from './leaveInformation'

const LeavesList: React.FC<LeavesListProps> = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { staffLeave } = useSelector((state: RootState) => state.StaffLeave)
  const { layoutMode, layoutDirection } = useSelector(
    (state: RootState) => state.Layout
  )

  const [staffLeavedData, setStaffLeavedData] = useState<StaffLeaves[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] =
    useState<SingleValue<OptionType>>(null) // Change to SingleValue
  const [currentPage, setCurrentPage] = useState(1)
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ])
  const itemsPerPage = 10

  useEffect(() => {
    if (staffLeave === null) {
      dispatch(getStaffLeaveData())
    } else {
      setStaffLeavedData(staffLeave)
    }
  }, [staffLeave, dispatch])

  const handleLeaveChange = (selectedOption: SingleValue<OptionType>) => {
    setStatusFilter(selectedOption)
  }

  const handleApprove = (id: number | null) => {
    setStaffLeavedData((prev) =>
      prev.map((leave) =>
        leave.id === id ? { ...leave, status: 'Approved' } : leave
      )
    )
  }

  const handleReject = (id: number) => {
    setStaffLeavedData((prev) =>
      prev.map((leave) =>
        leave.id === id ? { ...leave, status: 'Rejected' } : leave
      )
    )
  }

  const [modalState, setModalState] = useState<{
    showAddLeaveForm: boolean
    showEditLeaveForm: boolean
  }>({
    showAddLeaveForm: false,
    showEditLeaveForm: false,
  })

  const openModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: true }))
  const closeModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: false }))

  const [editMode, setEditMode] = useState(false)
  const [currentLeave, setCurrentLeave] = useState<StaffLeaves | null>(null)

  const handleOpenModal = useCallback(
    (editMode: boolean = false, event: StaffLeaves | null = null) => {
      setEditMode(editMode)
      setCurrentLeave(event)
      const modalKey = editMode ? 'showEditLeaveForm' : 'showAddLeaveForm'
      openModal(modalKey)
    },
    []
  )

  const handleCloseModal = () => {
    const modalKey = editMode ? 'showEditLeaveForm' : 'showAddLeaveForm'
    closeModal(modalKey)
    setEditMode(false)
    setCurrentLeave(null)
  }

  // Filter leaves based on search term, status, and date range
  const filteredLeaves = useMemo(() => {
    return staffLeavedData.filter((leave: StaffLeaves) => {
      const matchesSearchTerm = searchTerm
        ? Object.values(leave).some((value) =>
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
          )
        : true

      const matchesStatus = statusFilter
        ? leave.status === statusFilter.value
        : true

      const matchesDateRange =
        dateRange[0] && dateRange[1]
          ? new Date(leave.startDate) >= dateRange[0]! &&
            new Date(leave.endDate) <= dateRange[1]!
          : true

      return matchesSearchTerm && matchesStatus && matchesDateRange
    })
  }, [staffLeavedData, searchTerm, statusFilter, dateRange])

  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredLeaves.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredLeaves, currentPage, itemsPerPage])

  const columns = useMemo(
    () => [
      {
        header: 'ID',
        accessorKey: 'staffId',
      },
      {
        header: 'Leave Type',
        accessorKey: 'leaveType',
      },
      {
        header: 'Start Date',
        accessorKey: 'startDate',
      },
      {
        header: 'End Date',
        accessorKey: 'endDate',
      },
      {
        header: 'Days',
        accessorKey: 'days',
        cell: ({ row }: { row: { original: StaffLeaves } }) => {
          const { startDate, endDate } = row.original
          const start = new Date(startDate)
          const end = new Date(endDate)
          const diffTime = Math.abs(end.getTime() - start.getTime())
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 // Include the start date
          return diffDays
        },
      },
      {
        header: 'Reason',
        accessorKey: 'reason',
      },
      {
        header: 'Approved By',
        accessorKey: 'approvedBy',
      },
      {
        header: 'Request Date',
        accessorKey: 'dateRequested',
      },
      {
        header: 'Approved Date',
        accessorKey: 'dateApproved',
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }: { row: { original: StaffLeaves } }) => {
          const { status } = row.original
          return <span className={getStatusClass(status)}>{status}</span>
        },
      },
      {
        header: 'Action',
        accessorKey: '',
        cell: ({ row }: { row: { original: StaffLeaves } }) => (
          <div className="flex items-center gap-2">
            <button
              title="Approve"
              className="btn btn-sub-green btn-icon !size-8"
              onClick={() => handleApprove(row.original.id)}>
              <i className="ri-check-line"></i>
            </button>
            <button
              title="Edit"
              className="btn btn-sub-gray btn-icon !size-8"
              onClick={(e) => {
                e.preventDefault()
                handleOpenModal(true, row.original)
              }}>
              <i className="ri-pencil-line"></i>
            </button>
            <button
              title="Reject"
              className="btn btn-sub-red btn-icon !size-8"
              onClick={() => handleReject(row.original.id)}>
              <i className="ri-close-line"></i>
            </button>
          </div>
        ),
      },
    ],
    [handleOpenModal]
  )

  const getStatusClass = (status: string | undefined) => {
    switch (status) {
      case 'Approved':
        return 'badge badge-green'
      case 'Rejected':
        return 'badge badge-red'
      case 'Pending':
        return 'badge badge-yellow'
      default:
        return 'badge'
    }
  }

  return (
    <React.Fragment>
      <LeaveInformation leaves={staffLeavedData} />

      <div className="card">
        <div className="flex items-center gap-3 card-header">
          <h6 className="card-title grow">Leaves</h6>
          <Link
            href="/apps/hospital/staff-leave-add"
            className="btn btn-primary">
            New Request
          </Link>
        </div>

        {/* Leave Information Section */}
        <div className="card-header">
          <div className="grid grid-cols-12 gap-space">
            <div className="col-span-12 md:col-span-6 xl:col-span-3 2xl:col-span-4">
              <div className="relative group/form">
                <input
                  type="text"
                  placeholder="Leave Type reason"
                  className="ltr:pl-9 rtl:pr-9 form-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 flex items-center text-gray-500 dark:text-dark-500 ltr:left-3 rtl:right-3 focus:outline-hidden">
                  <Search className="size-4" />
                </div>
              </div>
            </div>
            <div className="col-span-12 md:col-span-6 xl:col-span-3 2xl:col-span-3">
              <Flatpickr
                options={{
                  mode: 'range',
                  dateFormat: 'd-m-Y',
                  onChange: (selectedDates) => {
                    if (selectedDates.length === 2) {
                      setDateRange([selectedDates[0], selectedDates[1]])
                    } else {
                      setDateRange([null, null])
                    }
                  },
                }}
                className="form-input"
                placeholder="Select date range"
              />
            </div>
            <div className="col-span-12 md:col-span-6 xl:col-span-3 2xl:col-span-3">
              <Select
                classNamePrefix="select"
                options={LeaveStatus}
                value={statusFilter}
                onChange={handleLeaveChange}
                placeholder="Leave Status"
              />
            </div>
            <div className="col-span-12 md:col-span-6 xl:col-span-3 2xl:col-span-2">
              <button type="submit" className="w-full btn btn-sub-gray">
                <Filter className="inline-block align-middle size-4" /> Filter
                Now
              </button>
            </div>
          </div>
        </div>
        <div className="pt-0 card-body">
          <TableContainer
            columns={columns}
            data={paginatedEvents}
            thClass="!font-medium cursor-pointer"
            divClass="overflow-x-auto table-box"
            tableClass="table whitespace-nowrap"
            thtrClass="text-gray-500 bg-gray-100 dark:bg-dark-850 dark:text-dark-500"
          />
          <Pagination
            totalItems={filteredLeaves.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
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

      <EditStaffLeave
        modalState={modalState}
        closeModal={handleCloseModal}
        editMode={editMode}
        currentLeave={currentLeave}
      />
    </React.Fragment>
  )
}

export default LeavesList
