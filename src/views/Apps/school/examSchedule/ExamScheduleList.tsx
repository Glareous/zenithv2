'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'

import DeleteModal from '@src/components/common/DeleteModal'
import Pagination from '@src/components/common/Pagination'
import { LAYOUT_DIRECTION } from '@src/components/constants/layout'
import TableContainer from '@src/components/custom/table/table'
import { ExamSchedule } from '@src/dtos'
import { OptionType } from '@src/dtos/apps/crm'
import { studentsStd, timeDuration } from '@src/dtos/apps/school'
import { AppDispatch, RootState } from '@src/slices/reducer'
import { deleteExamListData, getExamListData } from '@src/slices/thunk'
import { CirclePlus } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import Select from 'react-select'
import { ToastContainer } from 'react-toastify'

import AddEditExamSchedule from './AddEditExamSchedule'

const ExamScheduleList = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { examSchedule } = useSelector((state: RootState) => state.ExamList)
  const { layoutMode, layoutDirection } = useSelector(
    (state: RootState) => state.Layout
  )

  const [examListData, setExamListData] = useState<ExamSchedule[]>([])
  const [selectedStudentStd, setSelectedStudentStd] =
    useState<OptionType | null>(null)
  const [selectedTimeDuration, setSelectedTimeDuration] =
    useState<OptionType | null>(null)

  useEffect(() => {
    if (!examSchedule) {
      dispatch(getExamListData())
    } else {
      setExamListData(examSchedule)
    }
  }, [examSchedule, dispatch])

  const filterByTimeDuration = (exam: ExamSchedule): boolean => {
    const today = new Date()
    const startDate = new Date(exam.startDate)

    switch (selectedTimeDuration?.value) {
      case 'Today': {
        return startDate.toDateString() === today.toDateString()
      }
      case 'Tomorrow': {
        const tomorrow = new Date(today)
        tomorrow.setDate(today.getDate() + 1)
        return startDate.toDateString() === tomorrow.toDateString()
      }
      case 'Weekly': {
        const nextWeek = new Date(today)
        nextWeek.setDate(today.getDate() + 7)
        return startDate >= today && startDate <= nextWeek
      }
      case 'Monthly': {
        return (
          startDate.getMonth() === today.getMonth() &&
          startDate.getFullYear() === today.getFullYear()
        )
      }
      case 'Yearly': {
        return startDate.getFullYear() === today.getFullYear()
      }
      case 'All':
      default:
        return true
    }
  }

  const [modalState, setModalState] = useState<{
    showAddExamForm: boolean
    showEditExamForm: boolean
  }>({
    showAddExamForm: false,
    showEditExamForm: false,
  })

  const handleStudentStd = (selectedOption: OptionType | null) => {
    setSelectedStudentStd(selectedOption)
  }

  const filteredData = examListData.filter((exam) => {
    const matchesType =
      !selectedStudentStd ||
      selectedStudentStd.value === 'All' ||
      exam.class === selectedStudentStd.value
    const matchesDuration = !selectedTimeDuration || filterByTimeDuration(exam)
    return matchesType && matchesDuration
  })

  const openModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: true }))
  const closeModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: false }))

  const [editMode, setEditMode] = useState(false)
  const [currentExam, setCurrentExam] = useState<
    ExamSchedule | null | undefined
  >(undefined)

  const handleOpenModal = useCallback(
    (editMode: boolean = false, event: ExamSchedule | null = null) => {
      setEditMode(editMode)
      setCurrentExam(event)
      const modalKey = editMode ? 'showEditExamForm' : 'showAddExamForm'
      openModal(modalKey)
    },
    []
  )

  const handleCloseModal = () => {
    const modalKey = editMode ? 'showEditExamForm' : 'showAddExamForm'
    closeModal(modalKey)
    setEditMode(false)
    setCurrentExam(null)
  }

  const [event, setEvent] = useState<ExamSchedule | null>(null)
  const [show, setShow] = useState<boolean>(false)

  const toggleDelete = () => {
    setShow(false)
    setEvent(null)
  }

  const onClickEventListDelete = (list: ExamSchedule) => {
    setEvent(list)
    setShow(true)
  }

  const handleTimeDuration = (selectedOption: OptionType | null) => {
    setSelectedTimeDuration(selectedOption)
  }

  const handleDeleteList = () => {
    if (event) {
      dispatch(deleteExamListData([event.id]))
      setShow(false)
    }
  }

  const itemsPerPage = 10
  const [currentPage, setCurrentPage] = useState(1)
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedEvents = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  )

  const getStatusClass = (status: string | undefined) => {
    switch (status) {
      case 'New':
        return 'badge badge-sky'
      case 'Scheduled':
        return 'badge badge-yellow'
      case 'Completed':
        return 'badge badge-green'
      default:
        return 'badge'
    }
  }

  const columns = useMemo(
    () => [
      {
        header: 'Id',
        accessorKey: 'testId',
      },
      {
        header: 'Test Name',
        accessorKey: 'testName',
      },
      {
        header: 'Test Category',
        accessorKey: 'testCategory',
      },
      {
        header: 'Test Type',
        accessorKey: 'testType',
      },
      {
        header: 'Class',
        accessorKey: 'class',
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
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }: { row: { original: ExamSchedule } }) => {
          const { status } = row.original
          return <span className={getStatusClass(status)}>{status}</span>
        },
      },
      {
        header: 'Action',
        accessorKey: '',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              className="btn btn-sub-gray btn-icon !size-8 rounded-md"
              data-modal-target="addExamModal"
              onClick={(e) => {
                e.preventDefault()
                handleOpenModal(true, row.original)
              }}>
              <i className="ri-pencil-line"></i>
            </button>
            <button
              className="btn btn-sub-red btn-icon !size-8 rounded-md"
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
      <div className="card">
        <div className="justify-between md:flex card-header gap-5 items-center">
          <div>
            <h6 className="card-title">Exam Schedule List</h6>
          </div>
          <div className="flex flex-wrap gap-2 mt-3 md:mt-0">
            <div>
              <div id="stdFilterSelect">
                <Select
                  classNamePrefix="select"
                  options={studentsStd}
                  value={selectedStudentStd}
                  onChange={handleStudentStd}
                  placeholder="Select STD"
                  isClearable={true}
                />
              </div>
            </div>
            <div>
              <div id="dateFilterSelect">
                <Select
                  classNamePrefix="select"
                  options={timeDuration}
                  value={selectedTimeDuration}
                  onChange={handleTimeDuration}
                  placeholder="Select Filters."
                  isClearable={true}
                />
              </div>
            </div>
            <div>
              <button
                type="button"
                className="w-full btn btn-primary"
                data-modal-target="addExamModal"
                onClick={() => openModal('showAddExamForm')}>
                <CirclePlus className="inline-block ltr:mr-1 rtl:ml-1 size-4" />{' '}
                Add Exam Schedule
              </button>
            </div>
          </div>
        </div>

        <div className="pt-0 card-body">
          <div>
            <TableContainer
              columns={columns}
              data={paginatedEvents}
              thClass="!font-medium cursor-pointer"
              divClass="overflow-x-auto table-box"
              tableClass="table flush whitespace-nowrap"
              thtrClass="text-gray-500 bg-gray-100 dark:bg-dark-850 dark:text-dark-500"
            />

            <Pagination
              totalItems={filteredData.length}
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

      <AddEditExamSchedule
        modalState={modalState}
        closeModal={handleCloseModal}
        examList={examListData}
        editMode={editMode}
        currentExam={currentExam ?? undefined}
      />
    </React.Fragment>
  )
}

export default ExamScheduleList
