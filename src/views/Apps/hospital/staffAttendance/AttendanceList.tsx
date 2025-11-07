'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'

import DeleteModal from '@src/components/common/DeleteModal'
import Pagination from '@src/components/common/Pagination'
import { LAYOUT_DIRECTION } from '@src/components/constants/layout'
import TableContainer from '@src/components/custom/table/table'
import { Attendance } from '@src/dtos'
import { AppDispatch, RootState } from '@src/slices/reducer'
import { deleteAttendanceData, getAttendanceData } from '@src/slices/thunk'
import { useDispatch, useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify'

import EditAttendance from './editAttendance'

const AttendanceList = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { attendance } = useSelector((state: RootState) => state.Attendance)
  const { layoutMode, layoutDirection } = useSelector(
    (state: RootState) => state.Layout
  )
  const [patientToDelete, setPatientToDelete] = useState<Attendance | null>(
    null
  )
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
  const [attendanceListData, setAttendanceListData] = useState<Attendance[]>([])

  useEffect(() => {
    if (attendance === null) {
      dispatch(getAttendanceData())
    } else {
      setAttendanceListData(attendance)
    }
  }, [attendance, dispatch])

  const toggleDeleteModal = useCallback(() => {
    setShowDeleteModal((prev) => !prev)
  }, [])

  const onClickEventListDelete = useCallback(
    (patient: Attendance) => {
      setPatientToDelete(patient)
      toggleDeleteModal()
    },
    [toggleDeleteModal]
  )

  const handleDeletePatients = () => {
    if (patientToDelete) {
      dispatch(deleteAttendanceData([patientToDelete.id]))
      toggleDeleteModal()
    }
  }

  // Add and edit logic
  const [modalState, setModalState] = useState<{
    showEditAttendanceForm: boolean
    showAddAttendanceForm: boolean
  }>({
    showAddAttendanceForm: false,
    showEditAttendanceForm: false,
  })

  const openModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: true }))
  const closeModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: false }))

  const [editMode, setEditMode] = useState(false)
  const [currentAttendance, setCurrentAttendance] = useState<Attendance | null>(
    null
  )

  const handleOpenModal = useCallback(
    (editMode: boolean = false, event: Attendance | null = null) => {
      setEditMode(editMode)
      setCurrentAttendance(event)
      const modalKey = editMode
        ? 'showEditAttendanceForm'
        : 'showAddAttendanceForm'
      openModal(modalKey)
    },
    []
  )

  const handleCloseModal = () => {
    const modalKey = editMode
      ? 'showEditAttendanceForm'
      : 'showAddAttendanceForm'
    closeModal(modalKey)
    setEditMode(false)
    setCurrentAttendance(null)
  }

  // Pagination logic
  const itemsPerPage = 5
  const [currentPage, setCurrentPage] = useState(1)
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedEvents = attendanceListData.slice(
    startIndex,
    startIndex + itemsPerPage
  )

  // Utility function to parse time (in "h:mm AM/PM" format)
  const parseTime = (timeString: string) => {
    if (!timeString || typeof timeString !== 'string')
      return { hours: 0, minutes: 0 }
    const [time, modifier] = timeString.split(' ')
    // Ensure time and modifier are valid
    if (!time || !modifier) return { hours: 0, minutes: 0 }
    const [hours, minutes] = time.split(':').map(Number)
    // Convert 12-hour time to 24-hour time
    let parsedHours = hours % 12
    if (modifier.toLowerCase() === 'pm') {
      parsedHours += 12
    }

    return {
      hours: parsedHours,
      minutes: minutes || 0,
    }
  }

  // Calculate worked time
  const calculateWorkedTime = useCallback(
    (checkInTime: string, checkOutTime: string) => {
      const checkIn = parseTime(checkInTime)
      const checkOut = parseTime(checkOutTime)

      let hours = checkOut.hours - checkIn.hours
      let minutes = checkOut.minutes - checkIn.minutes

      if (minutes < 0) {
        minutes += 60
        hours--
      }

      if (hours < 0) {
        hours += 24 // Handle overnight shifts
      }

      return { hours, minutes }
    },
    []
  )

  // Calculate difference time
  const calculateDifferenceTime = useCallback(
    (workedTime: { hours: number; minutes: number }, shiftTime: string) => {
      const shiftHoursMatch = shiftTime.match(/\d+/)
      const shiftHours = shiftHoursMatch ? parseInt(shiftHoursMatch[0], 10) : 9 // Default to 9 hrs
      const shiftMinutes = 0

      let hours = workedTime.hours - shiftHours
      let minutes = workedTime.minutes - shiftMinutes

      if (minutes < 0) {
        minutes += 60
        hours--
      }

      return { hours, minutes }
    },
    []
  )

  // Process attendance data
  const processedAttendanceData = useMemo(() => {
    return paginatedEvents.map((event) => {
      const { checkInTime, checkOutTime, shiftTime = '9 hrs Shift' } = event // Default shift time

      const workedTime = calculateWorkedTime(checkInTime, checkOutTime)
      const difference = calculateDifferenceTime(workedTime, shiftTime)

      return {
        ...event,
        shiftTime, // Ensure the shiftTime is part of the data
        workedTime: `${workedTime.hours} hrs ${workedTime.minutes} min`,
        difference: `${difference.hours} hrs ${difference.minutes} min`,
      }
    })
  }, [paginatedEvents, calculateWorkedTime, calculateDifferenceTime])

  const columns = useMemo(
    () => [
      {
        header: 'Date',
        accessorKey: 'date',
      },
      {
        header: 'Shift Time',
        accessorKey: 'shiftTime',
        cell: () => <div className="badge badge-gray">9 hrs Shift</div>,
      },
      {
        header: 'Check In',
        accessorKey: 'checkInTime',
      },
      {
        header: 'Check Out',
        accessorKey: 'checkOutTime',
      },
      {
        header: 'Worked Time',
        accessorKey: 'workedTime',
      },
      {
        header: 'Difference',
        accessorKey: 'difference',
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }: { row: { original: Attendance } }) => {
          const { status } = row.original
          return (
            <span className={`badge ${getStatusClass(status)}`}>{status}</span>
          )
        },
      },
      {
        header: 'Action',
        accessorKey: '',
        cell: (value) => (
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
    [handleOpenModal, onClickEventListDelete]
  )

  const getStatusClass = (status: string | undefined) => {
    switch (status) {
      case 'Present':
        return 'badge-green'
      case 'Late':
        return 'badge-yellow'
      case 'Absent':
        return 'badge-red'
      default:
        return 'badge'
    }
  }
  return (
    <React.Fragment>
      <div className="col-span-12 card">
        <div className="flex items-center gap-3 card-header">
          <h6 className="card-title grow">Attendance List</h6>
          <button
            type="button"
            className="btn btn-primary shrink-0"
            onClick={() => handleOpenModal(false)}>
            Start Timing
          </button>
        </div>
        <div className="pt-0 card-body">
          <div>
            <TableContainer
              columns={columns}
              data={processedAttendanceData}
              thClass="!font-medium cursor-pointer"
              divClass="overflow-x-auto table-box"
              tableClass="table flush whitespace-nowrap"
              thtrClass="text-gray-500 dark:text-dark-500"
            />
            <Pagination
              totalItems={attendanceListData.length}
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
        show={showDeleteModal}
        handleHide={toggleDeleteModal}
        deleteModalFunction={handleDeletePatients}
      />

      <EditAttendance
        modalState={modalState}
        closeModal={handleCloseModal}
        attendanceList={attendanceListData}
        editMode={editMode}
        currentAttendance={currentAttendance}
      />
    </React.Fragment>
  )
}

export default AttendanceList
