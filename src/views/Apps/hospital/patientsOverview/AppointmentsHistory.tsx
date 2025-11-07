'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'

import DeleteModal from '@src/components/common/DeleteModal'
import Pagination from '@src/components/common/Pagination'
import TableContainer from '@src/components/custom/table/table'
import { Appointments } from '@src/dtos'
import { AppDispatch, RootState } from '@src/slices/reducer'
import { deleteAppointmentsData, getAppointmentsData } from '@src/slices/thunk'
import { Plus } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'

import AddEditAppointments from './addEditAppointments'

const AppointmentsHistory = () => {
  //get
  const dispatch: AppDispatch = useDispatch()
  const { appointments } = useSelector((state: RootState) => state.Reoprts)
  const [appointmentsData, setAppointmentsData] = useState<Appointments[]>([])
  const [medicine, setMedicine] = useState<Appointments | null>(null)
  const [show, setShow] = useState<boolean>(false)
  interface ModalState {
    showAddAppointmentsForm: boolean
    showAppointmentsForm: boolean
  }

  const [modalState, setModalState] = useState<ModalState>({
    showAddAppointmentsForm: false,
    showAppointmentsForm: false,
  })
  const [editMode, setEditMode] = useState(false)
  const [currentAppointment, setCurrentAppointment] =
    useState<Appointments | null>(null)
  const itemsPerPage = 5
  const [currentPage, setCurrentPage] = useState(1)
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  useEffect(() => {
    if (!appointments) {
      dispatch(getAppointmentsData())
    } else {
      setAppointmentsData(appointments)
    }
  }, [appointments, dispatch])

  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedEvents = appointmentsData.slice(
    startIndex,
    startIndex + itemsPerPage
  )
  const toggleDelete = () => {
    setShow(false)
    setMedicine(null)
  }

  const onClickEventListDelete = (list: Appointments) => {
    setMedicine(list)
    setShow(true)
  }

  const handleDeleteList = () => {
    if (medicine) {
      dispatch(deleteAppointmentsData([medicine.id]))
      setShow(false)
    }
  }

  const openModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: true }))
  const closeModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: false }))

  const handleOpenModal = useCallback(
    (editMode: boolean = false, event: Appointments | null = null) => {
      setEditMode(editMode)
      setCurrentAppointment(event)
      const modalKey = editMode
        ? 'showAppointmentsForm'
        : 'showAddAppointmentsForm'
      openModal(modalKey)
    },
    []
  )

  const handleCloseModal = () => {
    const modalKey = editMode
      ? 'showAppointmentsForm'
      : 'showAddAppointmentsForm'
    closeModal(modalKey)
    setEditMode(false)
    setCurrentAppointment(null)
  }

  const getStatusClass = (status: string | undefined) => {
    switch (status) {
      case 'Completed':
        return 'badge badge-green'
      case 'Expired':
        return 'badge badge-red'
      case 'Pending':
        return 'badge badge-yellow'
      default:
        return 'badge'
    }
  }

  const columns = useMemo(
    () => [
      {
        header: 'Date',
        accessorKey: 'date',
      },
      {
        header: 'Treatment Type',
        accessorKey: 'treatmentType',
      },
      {
        header: 'Time',
        accessorKey: 'time',
      },
      {
        header: 'Doctor',
        accessorKey: 'doctor',
      },
      {
        header: 'Reason Condition',
        accessorKey: 'reasonCondition',
      },
      {
        header: 'Notes',
        accessorKey: 'notes',
      },
      {
        header: '',
        accessorKey: 'status',
        cell: ({ row }: { row: { original: { status: string } } }) => {
          const { status } = row.original
          return <span className={getStatusClass(status)}>{status}</span>
        },
      },
      {
        header: 'Action',
        accessorKey: 'action',
        cell: (value: { row: { original: Appointments } }) => (
          <div className="flex items-center gap-2">
            <button
              className="btn btn-sub-gray btn-icon !size-8"
              title="overview">
              <i className="ri-eye-line"></i>
            </button>
            <button
              className="btn btn-sub-gray btn-icon !size-8"
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
              data-modal-target="deleteModalAppointment"
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
      <div className="col-span-12 overflow-hidden card">
        <div className="flex items-center gap-3 card-header">
          <h6 className="card-title grow">Appointments History</h6>
          <button
            className="font-medium shrink-0 text-primary-500 link hover:text-primary-600"
            onClick={() => openModal('showAddAppointmentsForm')}>
            <Plus className="inline-block mb-1 align-middle size-4" /> New
            Appointment
          </button>
        </div>
        <div className="pt-0 card-body">
          <div>
            <TableContainer
              columns={columns || []}
              data={paginatedEvents}
              divClass="overflow-x-auto table-box"
              tableClass="table whitespace-nowrap"
              thtrClass="*:px-3 *:py-2.5"
              isHeader={false}
            />
            <Pagination
              totalItems={appointmentsData.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
      <DeleteModal
        show={show}
        handleHide={toggleDelete}
        deleteModalFunction={handleDeleteList}
      />
      <AddEditAppointments
        modalState={modalState}
        closeModal={handleCloseModal}
        appointmentsList={appointmentsData}
        editMode={editMode}
        currentAppointment={currentAppointment}
      />
    </React.Fragment>
  )
}

export default AppointmentsHistory
