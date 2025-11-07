'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Suspense } from 'react'

import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

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
import { NextPageWithLayout } from '@src/dtos'
import { AppDispatch, RootState } from '@src/slices/reducer'
import { deleteUserReviewRecord, getManageReviewData } from '@src/slices/thunk'
import { Plus } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify'

import AddEditReview from '../../manage-reviews/AddEditReview'
import SwiperSection from './SwiperSection'
import WishList from './Wishlist'

export default function ProductOverviewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductOverviewForm />
    </Suspense>
  )
}

function ProductOverviewForm() {
  const searchParams = useSearchParams()
  const dispatch = useDispatch<AppDispatch>()
  const { manageReviews } = useSelector(
    (state: RootState) => state.ManageReview
  )
  const { layoutMode, layoutDirection } = useSelector(
    (state: RootState) => state.Layout
  )
  const [allReviewData, setAllReviewData] = useState<any[]>([])
  const [editMode, setEditMode] = useState(false)
  const [currentReview, setCurrentReview] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deletedRecord, setDeletedRecord] = useState<number[] | null>(null)
  const [modalState, setModalState] = useState<{ [key: string]: boolean }>({
    showAddReviewForm: false,
    showEditReviewForm: false,
  })

  const openModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: true }))
  const closeModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: false }))

  const handleOpenModal = useCallback(
    (editMode: boolean = false, review: any | null = null) => {
      setEditMode(editMode)
      setCurrentReview(review)
      const modalKey = editMode ? 'showEditReviewForm' : 'showAddReviewForm'
      openModal(modalKey)
    },
    []
  )

  const handleCloseModal = () => {
    const modalKey = editMode ? 'showEditReviewForm' : 'showAddReviewForm'
    closeModal(modalKey)
    setEditMode(false)
    setCurrentReview(null)
  }

  const handleDeleteRecord = (id: number) => {
    setIsModalOpen(true)
    setDeletedRecord([id])
  }

  const setDeleteRecord = () => {
    if (deletedRecord && isModalOpen) {
      dispatch(deleteUserReviewRecord(deletedRecord))
      setIsModalOpen(false)
      setDeletedRecord(null)
    }
  }

  useEffect(() => {
    if (!manageReviews) {
      dispatch(getManageReviewData())
    } else {
      setAllReviewData(manageReviews)
    }
  }, [manageReviews, dispatch])

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

  return (
    <React.Fragment>
      <BreadCrumb title="Product Overview" subTitle="Ecommerce" />
      <div>
        <div className="grid grid-cols-12 gap-x-5">
          <div className="col-span-12 lg:col-span-12">
            <WishList />
          </div>
        </div>
      </div>

      <DeleteModal
        show={isModalOpen}
        handleHide={() => setIsModalOpen(false)}
        deleteModalFunction={setDeleteRecord}
      />

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
