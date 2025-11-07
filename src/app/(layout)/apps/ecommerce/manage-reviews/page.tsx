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
import { NextPageWithLayout, UserReviewRecord } from '@src/dtos'
import { AppDispatch, RootState } from '@src/slices/reducer'
import { deleteUserReviewRecord, getManageReviewData } from '@src/slices/thunk'
import { Plus, Search } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify'

import AddEditReview from './AddEditReview'
import Widgets from './Widgets'

const ManageReviews: NextPageWithLayout = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { manageReviews } = useSelector(
    (state: RootState) => state.ManageReview
  )
  const { layoutMode, layoutDirection } = useSelector(
    (state: RootState) => state.Layout
  )

  const [allReviewData, setAllReviewData] = useState<UserReviewRecord[]>([])
  const [search, setSearch] = useState('')
  const [sortOption] = useState('none')
  const [editMode, setEditMode] = useState(false)
  const [currentReview, setCurrentReview] = useState<UserReviewRecord | null>(
    null
  )
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deletedRecord, setDeletedRecord] = useState<number[] | null>(null)
  const [modalState, setModalState] = useState<{ [key: string]: boolean }>({
    showAddReviewForm: false,
    showEditReviewForm: false,
  })

  const handleSearchUserRecord = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = event.target
    setSearch(value)
    const filteredData = manageReviews.filter((user: UserReviewRecord) =>
      user.userName.toLowerCase().includes(value.toLowerCase())
    )
    setAllReviewData(filteredData)
  }

  const itemsPerPage = 10
  const [currentPage, setCurrentPage] = useState(1)
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedEvents = allReviewData.slice(
    startIndex,
    startIndex + itemsPerPage
  )
  const openModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: true }))
  const closeModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: false }))
  // open modal
  const handleOpenModal = useCallback(
    (editMode: boolean = false, review: UserReviewRecord | null = null) => {
      setEditMode(editMode)
      setCurrentReview(review)
      const modalKey = editMode ? 'showEditReviewForm' : 'showAddReviewForm'
      openModal(modalKey)
    },
    []
  )
  // close modal
  const handleCloseModal = () => {
    const modalKey = editMode ? 'showEditReviewForm' : 'showAddReviewForm'
    closeModal(modalKey)
    setEditMode(false)
    setCurrentReview(null)
  }

  // handle customer delete record
  const handleDeleteRecord = (id: number) => {
    setIsModalOpen(true)
    setDeletedRecord([id])
  }

  // set customer delete record
  const setDeleteRecord = () => {
    if (deletedRecord && isModalOpen) {
      dispatch(deleteUserReviewRecord(deletedRecord))
      setIsModalOpen(false)
      setDeletedRecord(null)
    }
  }

  useEffect(() => {
    if (manageReviews === null) {
      dispatch(getManageReviewData())
    } else {
      setAllReviewData(manageReviews)
    }
  }, [manageReviews, dispatch])

  const columns = useMemo(
    () => [
      {
        header: 'User Name',
        accessorKey: 'userName',
        cell: (value: { row: { original: UserReviewRecord } }) => {
          return (
            <>
              <div className="flex items-center gap-3">
                <Image
                  src={value.row.original.image}
                  alt="userImg"
                  className="rounded-md shrink-0 size-16"
                  width={64}
                  height={64}
                />
                <div className="overflow-hidden grow">
                  <h6 className="mb-1 truncate">
                    <Link href="#!" className="text-current link link-primary">
                      {value.row.original.userName}
                    </Link>
                  </h6>
                  <p className="mb-1 text-sm truncate">
                    {value.row.original.date}
                  </p>
                  <p className="text-sm text-gray-500 truncate dark:text-dark-500">
                    Location: <span>{value.row.original.location}</span>
                  </p>
                </div>
              </div>
            </>
          )
        },
      },
      {
        header: 'Title',
        accessorKey: 'title',
        cell: (value) => {
          const getStarClass = (averageReview: number, index: number) => {
            const roundedAverage = averageReview
            if (index <= roundedAverage) {
              return 'ri-star-fill'
            } else if (index - 1 < roundedAverage && roundedAverage % 1 !== 0) {
              return 'ri-star-half-fill'
            }
            return 'ri-star-line'
          }

          return (
            <>
              <div className="max-w-[550px]">
                <div className="flex items-center gap-2 mb-3">
                  <div className="text-yellow-500">
                    {[...Array(5)].map((_, i: number) => (
                      <i
                        key={i}
                        className={getStarClass(
                          value.row.original.star,
                          i + 1
                        )}></i>
                    ))}
                  </div>
                  <h6>
                    (<span>{value.row.original.star}</span>)
                  </h6>
                </div>
                <h6 className="mb-1">{value.row.original.title}</h6>
                <p className="text-gray-500 whitespace-normal dark:text-dark-500">
                  {value.row.original.content}
                </p>
              </div>
            </>
          )
        },
      },
      {
        header: 'Action',
        accessorKey: '',
        cell: (value) => (
          <>
            <div className="flex items-center justify-end gap-3">
              <button className="btn btn-sub-gray">Direct Message</button>
              <Dropdown
                position="right"
                trigger="click"
                dropdownClassName="dropdown">
                <DropdownButton colorClass="btn btn-icon-text btn-primary btn-icon">
                  <i className="ri-more-2-fill"></i>
                </DropdownButton>
                <DropdownMenu>
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
                      handleDeleteRecord(value.row.original.id)
                    }}>
                    <i className="align-middle ltr:mr-2 rtl:ml-2 ri-delete-bin-line"></i>
                    <span>Delete</span>
                  </Link>
                </DropdownMenu>
              </Dropdown>
            </div>
          </>
        ),
      },
    ],
    [handleOpenModal]
  )

  return (
    <React.Fragment>
      <BreadCrumb title="Manage Reviews" subTitle="Ecommerce" />
      {/* review topbar */}
      <div className="grid items-center grid-cols-12 gap-5 mb-5">
        <div className="col-span-12 2xl:col-span-8">
          <h6 className="card-title">Reviews</h6>
        </div>
        <div className="col-span-12 2xl:col-span-4">
          <div className="flex flex-wrap items-center gap-3 2xl:justify-end">
            <div className="relative group/form">
              <input
                type="email"
                className="ltr:pl-9 rtl:pr-9 form-input ltr:group-[&.right]/form:pr-9 rtl:group-[&.right]/form:pl-9 ltr:group-[&.right]/form:pl-4 rtl:group-[&.right]/form:pr-4"
                placeholder="Search username, date, etc..."
                value={search}
                onChange={handleSearchUserRecord}
              />
              <span className="absolute inset-y-0 flex items-center text-gray-500 dark:text-dark-500 ltr:left-3 rtl:right-3 ltr:group-[&.right]/form:right-3 rtl:group-[&.right]/form:left-3 ltr:group-[&.right]/form:left-auto rtl:group-[&.right]/form:right-auto focus:outline-hidden">
                <Search className="size-4" />
              </span>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => openModal('showAddReviewForm')}>
              <Plus className="inline-block ltr:mr-1 rtl:ml-1 size-4" /> New
              Review
            </button>
          </div>
        </div>
      </div>

      <div>
        {/* manage reviews widgets */}
        <Widgets reviewData={allReviewData} />

        {/* manage reviews list */}
        <TableContainer
          columns={columns || []}
          data={paginatedEvents || sortOption}
          thClass="!font-medium cursor-pointer"
          divClass="mt-5 overflow-x-auto"
          tableClass="table flush whitespace-nowrap !overflow-x-auto"
          thtrClass="text-gray-500 bg-gray-100 dark:bg-dark-850 dark:text-dark-500b"
          tdClass="align-top whitespace-nowrap"
          isHeader={false}
        />

        {allReviewData.length > 0 && (
          <Pagination
            totalItems={allReviewData.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        )}
        {/* add edit modal */}
        <AddEditReview
          modalState={modalState}
          closeModal={handleCloseModal}
          reviewList={manageReviews}
          editMode={editMode}
          currentReview={currentReview}
        />
        {/* delete record modal */}
        <DeleteModal
          show={isModalOpen}
          handleHide={() => setIsModalOpen(false)}
          deleteModalFunction={setDeleteRecord}
        />
      </div>
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

export default ManageReviews
