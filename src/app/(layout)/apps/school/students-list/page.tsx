'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import BreadCrumb from '@src/components/common/BreadCrumb'
import DeleteModal from '@src/components/common/DeleteModal'
import Pagination from '@src/components/common/Pagination'
import { LAYOUT_DIRECTION } from '@src/components/constants/layout'
import TableContainer from '@src/components/custom/table/table'
import { NextPageWithLayout, StudentList } from '@src/dtos'
import { OptionType, studentStd } from '@src/dtos/apps/school'
import { AppDispatch, RootState } from '@src/slices/reducer'
import {
  deleteStudentListData,
  getStudentListData,
  modifyCurrentStudent,
} from '@src/slices/thunk'
import { CirclePlus, Search } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import Select from 'react-select'
import { ToastContainer } from 'react-toastify'

const StudentsList: NextPageWithLayout = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { studentList } = useSelector((state: RootState) => state.StudentList)
  const { layoutMode, layoutDirection } = useSelector(
    (state: RootState) => state.Layout
  )

  const router = useRouter()
  const [studentListData, setStudentListData] = useState<StudentList[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedStudentStd, setSelectedStudentStd] =
    useState<OptionType | null>(null)

  useEffect(() => {
    if (studentList === null) {
      dispatch(getStudentListData())
    } else {
      setStudentListData(studentList)
    }
  }, [studentList, dispatch])

  //delete
  const [show, setShow] = useState<boolean>(false)
  const [event, setEvent] = useState<StudentList | null>(null)
  const toggleDelete = () => {
    setShow(false)
    setEvent(null)
  }

  const handleDeleteList = () => {
    if (event) {
      dispatch(deleteStudentListData([event.id]))
      setShow(false)
    }
  }

  const onClickEventListDelete = (list: StudentList) => {
    setEvent(list)
    setShow(true)
  }

  const handleEdit = useCallback(
    (data: StudentList) => {
      dispatch(modifyCurrentStudent(data, true))
      router.push('/apps/school/students-admission')
    },
    [dispatch, router]
  )

  //filter
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleStudentStd = (selectedOption: OptionType | null) => {
    setSelectedStudentStd(selectedOption)
  }

  const filterStudent = studentListData.filter((student) => {
    const searchStudent = student.studentName
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesType =
      !selectedStudentStd ||
      selectedStudentStd.value === 'All' ||
      student.class === selectedStudentStd.value
    return searchStudent && matchesType
  })

  // pagination
  const itemsPerPage = 10
  const [currentPage, setCurrentPage] = useState(1)
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedEvents = filterStudent.slice(
    startIndex,
    startIndex + itemsPerPage
  )

  const columns = useMemo(
    () => [
      {
        header: 'ID',
        accessorKey: 'studentId',
      },
      {
        header: 'Student Name',
        accessorKey: 'studentName',
        cell: ({ row }: { row: { original: StudentList } }) => {
          const { image, studentName, lastName } = row.original
          return (
            <div className="flex items-center gap-3">
              <div className="relative text-gray-500 bg-gray-100 rounded-full dark:text-dark-500 dark:bg-dark-850 size-8">
                {image ? (
                  <Image
                    src={image}
                    alt="studentImg"
                    className="rounded-full"
                    style={{ width: '32px', height: '32px' }}
                    width={32}
                    height={32}
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-500 bg-gray-100 rounded-full dark:text-dark-500 dark:bg-dark-850">
                    {studentName.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <h6>
                  <Link href="/apps/school/students-overview">
                    {studentName} {lastName}
                  </Link>
                </h6>
              </div>
            </div>
          )
        },
      },
      {
        header: 'Gender',
        accessorKey: 'gender',
      },
      {
        header: 'Roll No',
        accessorKey: 'rollNo',
      },
      {
        header: 'Class',
        accessorKey: 'class',
      },
      {
        header: 'Phone',
        accessorKey: 'phone',
      },
      {
        header: 'Email',
        accessorKey: 'email',
      },
      {
        header: 'Birth Of Date',
        accessorKey: 'birthDate',
      },
      {
        header: 'Joining Date',
        accessorKey: 'date',
      },
      {
        header: 'Action',
        accessorKey: '',
        cell: (value) => (
          <div className="flex items-center gap-2">
            <button
              className="btn btn-sub-gray btn-icon !size-8"
              onClick={() => {
                handleEdit(value.row.original)
              }}>
              <i className="ri-pencil-line"></i>
            </button>
            <button
              className="btn btn-sub-red btn-icon !size-8"
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
    [handleEdit]
  )

  return (
    <React.Fragment>
      <BreadCrumb title="List View" subTitle="Students" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 card">
          <div className="card-header">
            <div className="flex flex-wrap justify-between gap-5">
              <div>
                <div className="relative group/form grow">
                  <input
                    type="text"
                    className="ltr:pl-9 rtl:pr-9 form-input ltr:group-[&.right]/form:pr-9 rtl:group-[&.right]/form:pl-9 ltr:group-[&.right]/form:pl-4 rtl:group-[&.right]/form:pr-4"
                    placeholder="Search student, class etc. ..."
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                  <button className="absolute inset-y-0 flex items-center ltr:left-3 rtl:right-3 ltr:group-[&.right]/form:right-3 rtl:group-[&.right]/form:left-3 ltr:group-[&.right]/form:left-auto rtl:group-[&.right]/form:right-auto focus:outline-hidden">
                    <Search className="text-gray-500 size-4 fill-gray-100 dark:text-dark-500 dark:fill-dark-850" />
                  </button>
                </div>
              </div>
              <div>
                <div className="items-center gap-5 sm:flex">
                  <div id="sortingByClass" className="w-full">
                    <Select
                      classNamePrefix="select"
                      options={studentStd}
                      value={selectedStudentStd}
                      onChange={handleStudentStd}
                      placeholder="Sorting by class"
                      isClearable={true}
                    />
                  </div>
                  <Link
                    href="/apps/school/students-admission"
                    className="mt-5 btn btn-primary shrink-0 sm:mt-0">
                    <CirclePlus className="inline-block ltr:mr-1 rtl:ml-1 size-4" />{' '}
                    Add Student
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-0 card-body">
            <div>
              <TableContainer
                columns={columns || []}
                data={paginatedEvents}
                thClass="!font-medium cursor-pointer"
                divClass="overflow-x-auto table-box whitespace-nowrap"
                tableClass="table flush"
                thtrClass="text-gray-500 bg-gray-100 dark:bg-dark-850 dark:text-dark-500"
              />
              {filterStudent.length != 0 && (
                <Pagination
                  totalItems={filterStudent.length}
                  itemsPerPage={itemsPerPage}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                />
              )}
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
    </React.Fragment>
  )
}

export default StudentsList
