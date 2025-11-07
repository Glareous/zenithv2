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
import {
  AssigneeType,
  OptionType,
  assignee,
  filterOptions,
  statusOptions,
} from '@src/data/Projects/project'
import { NextPageWithLayout } from '@src/dtos'
import { ProjectList } from '@src/dtos/apps/projects'
import {
  deleteProjectListData,
  getProjectListData,
} from '@src/slices/projects/list/thunk'
import { AppDispatch, RootState } from '@src/slices/reducer'
import {
  getProjectStatusBadgeClass,
  getProjectStatusLabel,
} from '@src/utils/projectStatus'
import { CirclePlus, Search, Trash } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import Select from 'react-select'
import { ToastContainer } from 'react-toastify'

import AddEditProjectList from '../../../../../components/molecules/AddEditProjectList'

const ProjectsLists: NextPageWithLayout = () => {
  const dispatch: AppDispatch = useDispatch()
  const { projectList } = useSelector((state: RootState) => state.ProjectsList)
  const { layoutMode, layoutDirection } = useSelector(
    (state: RootState) => state.Layout
  )
  const [list, setList] = useState<ProjectList[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOption, setSelectedOption] = useState<OptionType | null>(null)
  const [selectedStatusOption, setSelectedStatusOption] =
    useState<OptionType | null>(null)
  const [selectedAssignees, setSelectedAssignees] = useState<AssigneeType[]>([])
  const [projectLists, setProjectLists] = useState<number[] | null>(null)
  const [deletedListData, setDeletedListData] = useState<number[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [show, setShow] = useState<boolean>(false)
  const [modalState, setModalState] = useState<{
    showAddProjectForm: boolean
    showEditProjectForm: boolean
  }>({
    showAddProjectForm: false,
    showEditProjectForm: false,
  })
  const [editMode, setEditMode] = useState(false)
  const [currentProjectList, setCurrentProjectList] =
    useState<ProjectList | null>(null)
  const itemsPerPage = 10
  const [currentPage, setCurrentPage] = useState(1)
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  useEffect(() => {
    if (!projectList) {
      dispatch(getProjectListData())
    } else {
      setList(projectList)
    }
  }, [projectList, dispatch])

  const handleCheckboxChange = (assignee: AssigneeType) => {
    setSelectedAssignees((prevSelectedAssignees) => {
      const isSelected = prevSelectedAssignees.some(
        (selected) => selected.id === assignee.id
      )
      if (isSelected) {
        return prevSelectedAssignees.filter(
          (selected) => selected.id !== assignee.id
        )
      } else {
        return [...prevSelectedAssignees, assignee]
      }
    })
  }

  const filteredData = (list ?? [])
    .filter((item: ProjectList) => {
      if (selectedOption) {
        const { value } = selectedOption
        const projectDate = new Date(item.dueDate)
        const today = new Date()

        if (value === 'Weekly') {
          const lastWeek = new Date()
          lastWeek.setDate(today.getDate() - 7)
          return projectDate >= lastWeek && projectDate <= today
        }

        if (value === 'Monthly') {
          const lastMonth = new Date()
          lastMonth.setMonth(today.getMonth() - 1)
          return projectDate >= lastMonth && projectDate <= today
        }

        if (value === 'Yearly') {
          const lastYear = new Date()
          lastYear.setFullYear(today.getFullYear() - 1)
          return projectDate >= lastYear && projectDate <= today
        }
      }
      return true
    })
    .filter((item: ProjectList) => {
      if (selectedStatusOption) {
        return item.status === selectedStatusOption.value
      }
      return true
    })
    .filter(
      (item: ProjectList) =>
        item.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((item: ProjectList) => {
      if (selectedAssignees.length > 0) {
        return item.assignees.some((assignee) =>
          selectedAssignees.some((selected) => selected.name === assignee.name)
        )
      }
      return true
    })

  const handleChange = (selected: OptionType | null) => {
    setSelectedOption(selected)
  }
  const handleStatusChange = (selected: OptionType | null) => {
    setSelectedStatusOption(selected)
  }

  const toggleDelete = () => {
    setShow(false)
    setProjectLists(null)
  }

  const onClickProjectListDelete = (id: number) => {
    setProjectLists([id])
    setShow(true)
  }

  const handleDeleteProjectList = () => {
    if (projectLists) {
      dispatch(deleteProjectListData(projectLists))
      setShow(false)
    }
  }

  const handleSelectRecord = (id: number) => {
    setDeletedListData((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleSelectAll = useCallback(() => {
    if (selectAll && projectLists) {
      setDeletedListData([])
    } else {
      setDeletedListData(filteredData.map((customer) => customer.id))
    }
    setSelectAll((prev) => !prev)
  }, [selectAll, projectLists, filteredData])

  const handleRemoveSelectedRecords = () => {
    dispatch(deleteProjectListData(deletedListData))
    setDeletedListData([])
    setSelectAll(false)
  }

  const openModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: true }))
  const closeModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: false }))
  const handleOpenModal = useCallback(
    (editMode: boolean = false, list: ProjectList | null = null) => {
      setEditMode(editMode)
      setCurrentProjectList(list)
      const modalKey = editMode ? 'showEditProjectForm' : 'showAddProjectForm'
      openModal(modalKey)
    },
    []
  )
  const handleCloseModal = () => {
    const modalKey = editMode ? 'showEditProjectForm' : 'showAddProjectForm'
    closeModal(modalKey)
    setEditMode(false)
    setCurrentProjectList(null)
  }

  const getStatusClass = (status: string | undefined) => {
    if (!status) return 'badge'

    const statusMap: Record<string, string> = {
      Active: 'ACTIVE',
      'On Hold': 'ACTIVE',
      Pending: 'CREATED',
      Completed: 'COMPLETED',
    }

    const mappedStatus = statusMap[status] || status
    return getProjectStatusBadgeClass(mappedStatus)
  }

  const columns = useMemo(
    () => [
      {
        header: () => (
          <input
            id="checkboxAll"
            className="input-check input-check-primary"
            type="checkbox"
            checked={selectAll}
            onChange={handleSelectAll}
          />
        ),
        accessorKey: 'id',
        enableSorting: false,
        cell: ({ row }: { row: { original: ProjectList } }) =>
          (
            <input
              className="input-check input-check-primary"
              type="checkbox"
              checked={deletedListData.includes(row.original.id)}
              onChange={() => handleSelectRecord(row.original.id)}
            />
          ) as React.ReactNode,
      },
      {
        header: 'ID',
        accessorKey: 'projectId',
      },
      {
        header: 'Project and Client Name',
        accessorKey: 'projectName',
        cell: (value: {
          getValue: () => AssigneeType[]
          row: { original: ProjectList }
        }) => {
          return (
            <>
              <h6 className="mb-1">
                <Link
                  href="#!"
                  data-modal-target="contactOverviewModal"
                  className="text-current link link-primary grow">
                  {Array.isArray(value.getValue()) &&
                    value
                      .getValue()
                      .map((assignee: AssigneeType) => (
                        <span key={assignee.id}>{assignee.name}</span>
                      ))}
                </Link>
              </h6>
              <p className="text-sm text-gray-500 dark:text-dark-500">
                {value.row.original.clientName}
              </p>
            </>
          )
        },
      },
      {
        header: 'Assigned To',
        accessorKey: 'assignees',
        cell: (value: {
          getValue: () => AssigneeType[]
          row: {
            original: ProjectList
          }
        }) => {
          return (
            <>
              <div className="flex ml-3 -space-x-3 grow">
                {value.getValue().map((item: AssigneeType, idx: number) => (
                  <Link
                    href="#!"
                    className="transition duration-300 ease-linear hover:z-10"
                    title="avatar link"
                    key={idx}>
                    <Image
                      className="border-2 border-white rounded-full dark:border-dark-900 size-8"
                      src={item.image}
                      alt="item"
                      width={32}
                      height={32}
                    />
                  </Link>
                ))}
              </div>
            </>
          )
        },
      },
      {
        header: 'Due Date',
        accessorKey: 'dueDate',
      },
      {
        header: 'Total Amount ($)',
        accessorKey: 'totalAmount',
      },
      {
        header: '% Complete',
        accessorKey: 'progress',
        cell: (value) => (
          <>
            <div className="flex items-center gap-2">
              <p>{value.getValue() as unknown as number} %</p>
              <div className="progress-bar progress-1">
                <div
                  className="text-white progress-bar-wrap bg-primary-500"
                  style={{ width: `${value.getValue()}%` }}></div>
              </div>
            </div>
          </>
        ),
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }) => {
          const { status } = row.original
          return (
            <span className={getStatusClass(status)}>
              {getProjectStatusLabel(status || '')}
            </span>
          )
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
                <Link href="#!" className="dropdown-item ">
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
                    onClickProjectListDelete(value.row.original.id)
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
    []
  )
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedEvents =
    filteredData && filteredData.length > 0
      ? filteredData.slice(startIndex, startIndex + itemsPerPage)
      : []

  return (
    <React.Fragment>
      <BreadCrumb title="List View" subTitle="Projects" />
      <div className="card">
        <div className="flex flex-wrap items-center gap-5 card-header">
          <div className="grow">
            <h6 className="mb-1 card-title">All Projects (264)</h6>
            <p className="text-gray-500">
              Manage your construction projects from start to finish with
              complete control.
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              openModal('showAddProjectForm')
            }}
            className="btn btn-primary">
            <CirclePlus className="inline-block ltr:mr-1 rtl:ml-1 size-4"></CirclePlus>
            <span className="align-middle">Add Project</span>
          </button>
        </div>
        <div className="card-header">
          <div className="grid grid-cols-12 gap-5">
            <div className="col-span-12 xl:col-span-4">
              <div className="relative group/form">
                <input
                  type="text"
                  className="ltr:pl-9 rtl:pr-9 form-input group-[&.right]/form:pr-9 group-[&.right]/form:pl-4"
                  placeholder="Search for projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 flex items-center text-gray-500 dark:text-dark-500 ltr:left-3 rtl:right-3 group-[&.right]/form:right-3 group-[&.right]/form:left-auto focus:outline-hidden">
                  <Search className="size-4"></Search>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap col-span-12 gap-2 xl:col-span-8 xl:justify-end">
              {deletedListData.length > 0 && (
                <button
                  className="btn btn-red btn-icon"
                  onClick={handleRemoveSelectedRecords}>
                  <Trash className="inline-block size-4" />
                </button>
              )}
              <div>
                <Select
                  classNamePrefix="select"
                  options={filterOptions}
                  value={selectedOption}
                  onChange={handleChange}
                  placeholder="Filter Date Select"
                  id="filterSelect"
                  isClearable={true}
                  isSearchable={true}
                />
              </div>
              <div>
                <Select
                  classNamePrefix="select"
                  options={statusOptions}
                  value={selectedStatusOption}
                  onChange={handleStatusChange}
                  placeholder="Status Select"
                  id="filterStatusSelect"
                  isClearable={true}
                  isSearchable={true}
                />
              </div>
              <div>
                <Dropdown position="right" dropdownClassName="dropdown">
                  <DropdownButton colorClass="w-full btn btn-sub-gray whitespace-nowrap">
                    Filter By Assignee
                  </DropdownButton>
                  <DropdownMenu menuClass="!fixed p-2 !w-52">
                    <Link href="#!" className="dropdown-item ">
                      <p className="mb-1 text-gray-500 dark:text-dark-500">
                        Filter by Assignee
                      </p>
                    </Link>
                    {assignee.map((item) => (
                      <div className="py-2 input-check-group" key={item.id}>
                        <input
                          id={item.id}
                          className="shrink-0 input-check input-check-primary"
                          type="checkbox"
                          checked={selectedAssignees.some(
                            (selected) => selected.id === item.id
                          )}
                          onChange={() => handleCheckboxChange(item)}
                        />
                        <label
                          htmlFor={item.id}
                          className="flex items-center gap-2 font-medium input-check-label grow">
                          <Image
                            src={item.image}
                            alt={item.name}
                            className="rounded-full size-6"
                            height={24}
                            width={24}
                          />
                          {item.name}
                        </label>
                      </div>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
          </div>
        </div>
        <div className="pt-0 card-body">
          <div>
            <div className="overflow-x-auto table-box">
              <TableContainer
                columns={columns}
                data={paginatedEvents}
                thClass="!font-medium cursor-pointer"
                isSearch={false}
                divClass="overflow-x-auto"
                tableClass="table whitespace-nowrap"
                PaginationClassName="pagination-container"
                thtrClass="text-gray-500 bg-gray-100 dark:bg-dark-850 dark:text-dark-500"
                isTableFooter={false}
              />
              <div className="mx-3">
                {filteredData.length != 0 && (
                  <Pagination
                    totalItems={filteredData.length}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddEditProjectList
        modalState={modalState}
        closeModal={handleCloseModal}
        projectList={list}
        editMode={editMode}
        currentProjectList={currentProjectList}
      />

      <ToastContainer
        theme={layoutMode}
        rtl={layoutDirection === LAYOUT_DIRECTION.RTL}
        position={
          layoutDirection === LAYOUT_DIRECTION.RTL ? 'top-left' : 'top-right'
        }
      />

      <DeleteModal
        title="Are you sure you want to delete this Project?"
        show={show}
        handleHide={toggleDelete}
        deleteModalFunction={handleDeleteProjectList}
      />
    </React.Fragment>
  )
}

export default ProjectsLists
