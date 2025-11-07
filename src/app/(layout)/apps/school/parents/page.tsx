'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'

import BreadCrumb from '@src/components/common/BreadCrumb'
import DeleteModal from '@src/components/common/DeleteModal'
import Pagination from '@src/components/common/Pagination'
import { LAYOUT_DIRECTION } from '@src/components/constants/layout'
import TableContainer from '@src/components/custom/table/table'
import type { NextPageWithLayout, Parents } from '@src/dtos'
import { AppDispatch, RootState } from '@src/slices/reducer'
import {
  deleteParentsListData,
  getParentsListData,
} from '@src/slices/school/parents/thunk'
import { CirclePlus, Search } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify'

import AddEditParentsList from './AddEditParentsList'

const Parents: NextPageWithLayout = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { parentsList } = useSelector((state: RootState) => state.Parents)
  const { layoutMode, layoutDirection } = useSelector(
    (state: RootState) => state.Layout
  )
  const [parentsListData, setParentsListData] = useState<Parents[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')

  //get
  useEffect(() => {
    if (!parentsList) {
      dispatch(getParentsListData())
    } else {
      setParentsListData(parentsList)
    }
  }, [parentsList, dispatch])

  //delete
  const [parent, setParents] = useState<Parents | null>(null)

  const [show, setShow] = useState<boolean>(false)
  const toggleDelete = () => {
    setShow(false)
    setParents(null)
  }

  const onClickEventListDelete = (list: Parents) => {
    setParents(list)
    setShow(true)
  }

  const handleDeleteList = () => {
    if (parent) {
      dispatch(deleteParentsListData([parent.id]))
      setShow(false)
    }
  }

  //add and edite
  const [modalState, setModalState] = useState<{ [key: string]: boolean }>({
    showAddParentsForm: false,
    showEditParentsForm: false,
  })

  const openModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: true }))
  const closeModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: false }))

  const [editMode, setEditMode] = useState(false)

  const [currentParent, setCurrentParent] = useState<Parents | null>(null)

  const handleOpenModal = useCallback(
    (editMode: boolean = false, event: Parents | null = null) => {
      setEditMode(editMode)
      setCurrentParent(event)
      const modalKey = editMode ? 'showEditParentsForm' : 'showAddParentsForm'
      openModal(modalKey)
    },
    []
  )

  const handleCloseModal = () => {
    const modalKey = editMode ? 'showEditParentsForm' : 'showAddParentsForm'
    closeModal(modalKey)
    setEditMode(false)
    setCurrentParent(null)
  }

  //search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const filierParentRecords = parentsListData.filter((parent) => {
    const filterRecord = parent.parentsName
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    return filterRecord
  })

  //pagination
  const itemsPerPage = 10
  const [currentPage, setCurrentPage] = useState(1)
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedEvents = filierParentRecords.slice(
    startIndex,
    startIndex + itemsPerPage
  )

  const columns = useMemo(
    () => [
      {
        header: 'Parents Name',
        accessorKey: 'parentsName',
      },
      {
        header: 'Student Name',
        accessorKey: 'studentName',
        cell: ({ row }: { row: { original: Parents } }) => {
          const { image, studentName, parentsName } = row.original
          return (
            <div className="flex items-center gap-3">
              <div className="relative text-gray-500 bg-gray-100 rounded-full size-8 dark:bg-dark-850 dark:text-dark-500">
                {image ? (
                  <Image
                    src={image}
                    alt={studentName}
                    className="rounded-full"
                    width={32}
                    height={32}
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-500 bg-gray-100 rounded-full dark:bg-dark-850 dark:text-dark-500">
                    {parentsName.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <h6>
                  <Link href="#!">{studentName}</Link>
                </h6>
              </div>
            </div>
          )
        },
      },
      {
        header: 'Relation ',
        accessorKey: 'relation',
      },
      {
        header: 'Occupation',
        accessorKey: 'occupation',
      },
      {
        header: 'Gender',
        accessorKey: 'gender',
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
        header: 'Address',
        accessorKey: 'address',
      },
      {
        header: 'Action',
        accessorKey: '',
        cell: ({ row }: { row: { original: Parents } }) => (
          <div className="flex items-center gap-2">
            <button
              className="btn btn-sub-gray btn-icon !size-8 rounded-md"
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
      <BreadCrumb title="List View" subTitle="Parents" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 card">
          <div className="card-header">
            <div className="grid items-center gap-3 grid-cols-12">
              <div className="col-span-12 md:col-span-9 lg:col-span-5 xxl:col-span-3">
                <div className="relative group/form grow">
                  <input
                    type="email"
                    className="ltr:pl-9 rtl:pr-9 form-input ltr:group-[&.right]/form:pr-9 rtl:group-[&.right]/form:pl-9 ltr:group-[&.right]/form:pl-4 rtl:group-[&.right]/form:pr-4"
                    placeholder="Search student, className etc. ..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                  <button className="absolute inset-y-0 flex items-center ltr:left-3 rtl:right-3 ltr:group-[&.right]/form:right-3 rtl:group-[&.right]/form:left-3 ltr:group-[&.right]/form:left-auto rtl:group-[&.right]/form:right-auto focus:outline-hidden">
                    <Search className="text-gray-500 dark:text-dark-500 size-4 fill-gray-100 dark:fill-dark-850" />
                  </button>
                </div>
              </div>
              <div className="col-span-12 md:col-span-3 lg:col-span-3 lg:col-start-10 xxl:col-span-2 xxl:col-start-11 ltr:md:text-right rtl:md:text-left">
                <button
                  className="btn btn-primary shrink-0"
                  data-modal-target="parentsCreateModal"
                  onClick={() => openModal('showAddParentsForm')}>
                  <CirclePlus className="inline-block ltr:mr-1 rtl:ml-1 size-4" />{' '}
                  Add Parents
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
                divClass="overflow-x-auto table-box whitespace-nowrap"
                tableClass="table flush"
                thtrClass="text-gray-500 bg-gray-100 dark:bg-dark-850 dark:text-dark-500"
              />
              <Pagination
                totalItems={filierParentRecords.length}
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

      <AddEditParentsList
        modalState={modalState}
        closeModal={handleCloseModal}
        parentsList={parentsListData}
        editMode={editMode}
        currentParent={currentParent}
      />
    </React.Fragment>
  )
}

export default Parents
