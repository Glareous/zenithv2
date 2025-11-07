'use client'

import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

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
import { RootState } from '@src/slices/reducer'
import { api } from '@src/trpc/react'
import { Plus, Search, Trash } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { ToastContainer } from 'react-toastify'

import AddEditOrder from './AddEditOrder'
import OrderListTab from './OrderListTab'
import OrderStatsCards from './OrderStatsCards'
import OverviewModal from './OverviewModal'

type OrderData = {
  id: string
  orderId: string
  orderDate: Date
  deliveredDate: Date | null
  status: string
  payment: string
  totalAmount: number
  createdAt: Date
  updatedAt: Date
  customer: {
    id: string
    name: string
    email: string | null
  } | null
  customerName: string | null
  customerEmail: string | null
  items: Array<{
    id: string
    quantity: number
    price: number
    total: number
    product: {
      id: string
      name: string
    }
  }>
}

const OrderList: NextPageWithLayout = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { layoutMode, layoutDirection } = useSelector(
    (state: RootState) => state.Layout
  )
  const { data: session } = useSession()

  const currentProject = useSelector(
    (state: RootState) => state.Project.currentProject
  )
  const projectId = currentProject?.id || ''

  const [appliedSearchTerm, setAppliedSearchTerm] = useState('')
  const [searchInputValue, setSearchInputValue] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [activeTab, setActiveTab] = useState('All')

  const [deletedListData, setDeletedListData] = useState<string[]>([])
  const [editMode, setEditMode] = useState(false)
  const [selectAll, setSelectAll] = useState(false)
  const [currentOrderList, setCurrentOrderList] = useState<OrderData | null>(
    null
  )
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deletedRecord, setDeletedRecord] = useState<string[] | null>(null)
  const [modalState, setModalState] = useState<{
    showAddOrderForm: boolean
    showEditOrderForm: boolean
  }>({
    showAddOrderForm: false,
    showEditOrderForm: false,
  })
  const [overviewShow, setOverviewShow] = useState(false)

  const [appliedFilters, setAppliedFilters] = useState({
    isPaid: false,
    isUnpaid: false,
    priceRange: [0, 1000] as [number, number],
    selectedStatuses: [] as string[],
  })

  const utils = api.useUtils()

  const { data: ordersData, isLoading: loadingOrders } =
    api.projectOrders.getAll.useQuery(
      {
        projectId,
        page: currentPage,
        limit: itemsPerPage,
        search: appliedSearchTerm || undefined,
        status: activeTab !== 'All' ? (activeTab as any) : undefined,
        isPaid: appliedFilters.isPaid || undefined,
        isUnpaid: appliedFilters.isUnpaid || undefined,
        minAmount:
          appliedFilters.priceRange[0] > 0
            ? appliedFilters.priceRange[0]
            : undefined,
        maxAmount:
          appliedFilters.priceRange[1] < 1000
            ? appliedFilters.priceRange[1]
            : undefined,
        selectedStatuses:
          appliedFilters.selectedStatuses.length > 0
            ? appliedFilters.selectedStatuses
            : undefined,
      },
      { enabled: !!projectId }
    )

  const deleteOrder = api.projectOrders.delete.useMutation({
    onSuccess: () => {
      toast.success('Order deleted successfully')
      utils.projectOrders.getAll.invalidate({ projectId })
      setIsModalOpen(false)
      setDeletedRecord(null)
      setDeletedListData([])
      setSelectAll(false)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const handleSearch = () => {
    setAppliedSearchTerm(searchInputValue)
    setCurrentPage(1)
  }

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
  }

  const handleClearSearch = () => {
    setSearchInputValue('')
    setAppliedSearchTerm('')
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleTabChange = (status: string) => {
    setActiveTab(status)
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
  }

  const handleSelectRecord = (id: string) => {
    setDeletedListData((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleSelectAll = useCallback(() => {
    if (selectAll) {
      setDeletedListData([])
    } else {
      const allIds = ordersData?.orders.map((order) => order.id) || []
      setDeletedListData(allIds)
    }
    setSelectAll((prev) => !prev)
  }, [selectAll, ordersData?.orders])

  const handleDeleteRecord = (id: string) => {
    setIsModalOpen(true)
    setDeletedRecord([id])
  }

  const handleRemoveSelectedRecords = () => {
    setIsModalOpen(true)
    setDeletedRecord(deletedListData)
  }

  const setDeleteRecord = () => {
    if (deletedRecord && isModalOpen) {
      deletedRecord.forEach((id) => {
        deleteOrder.mutate({ id })
      })
    }
  }

  const openModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: true }))

  const closeModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: false }))

  const handleOpenOverviewEditModal = useCallback(
    (editMode: boolean = false, orderList: OrderData | null = null) => {
      setEditMode(editMode)
      setCurrentOrderList(orderList)
      const modalKey = editMode ? 'showEditOrderForm' : 'showAddOrderForm'
      openModal(modalKey)
    },
    []
  )

  const handleCloseModal = () => {
    const modalKey = editMode ? 'showEditOrderForm' : 'showAddOrderForm'
    closeModal(modalKey)
    setEditMode(false)
    setCurrentOrderList(null)
  }

  const handleOpenOverviewModal = (
    overview: boolean,
    orderList: OrderData | null = null
  ) => {
    setOverviewShow(overview)
    setCurrentOrderList(orderList)
  }

  const getStatusClass = (status: string | undefined) => {
    switch (status) {
      case 'NEW':
        return 'badge badge-blue'
      case 'DELIVERED':
        return 'badge badge-green'
      case 'PENDING':
        return 'badge badge-yellow'
      case 'SHIPPING':
        return 'badge badge-purple'
      case 'CANCELLED':
        return 'badge badge-red'
      default:
        return 'badge'
    }
  }

  const getPaymentClass = (payment: string | undefined) => {
    switch (payment) {
      case 'PAID':
        return 'badge badge-green'
      case 'UNPAID':
        return 'badge badge-red'
      case 'COD':
        return 'badge badge-blue'
      default:
        return 'badge'
    }
  }

  const orders = ordersData?.orders || []

  const columns = useMemo(
    () => [
      {
        id: 'select',
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
        cell: ({ row }: { row: { original: OrderData } }) => (
          <input
            className="input-check input-check-primary"
            type="checkbox"
            checked={deletedListData.includes(row.original.id)}
            onChange={() => handleSelectRecord(row.original.id)}
          />
        ),
      },
      {
        header: 'Order ID',
        accessorKey: 'orderId',
        cell: ({ row }: { row: { original: OrderData } }) => (
          <Link
            href={`/apps/ecommerce/orders/overview?id=${row.original.id}`}
            className="link link-primary">
            {row.original.orderId}
          </Link>
        ),
      },
      {
        header: 'Order Date',
        accessorKey: 'orderDate',
        cell: ({ row }: { row: { original: OrderData } }) => (
          <span>
            {row.original.orderDate
              ? new Date(row.original.orderDate).toLocaleDateString()
              : '-'}
          </span>
        ),
      },
      {
        header: 'Delivered Date',
        accessorKey: 'deliveredDate',
        cell: ({ row }: { row: { original: OrderData } }) => (
          <span>
            {row.original.deliveredDate
              ? new Date(row.original.deliveredDate).toLocaleDateString()
              : '-'}
          </span>
        ),
      },
      {
        header: 'Customer',
        accessorKey: 'customer',
        cell: ({ row }: { row: { original: OrderData } }) => (
          <span>
            {row.original.customer ? (
              row.original.customer.name
            ) : row.original.customerName ? (
              <span className="text-gray-600">
                {row.original.customerName}
                <span className="text-xs text-gray-400 ml-1">(Deleted)</span>
              </span>
            ) : (
              <span className="text-gray-400 italic">Unknown Customer</span>
            )}
          </span>
        ),
      },
      {
        header: 'Products',
        accessorKey: 'items',
        cell: ({ row }: { row: { original: OrderData } }) => (
          <span>
            {row.original.items.length} item
            {row.original.items.length !== 1 ? 's' : ''}
          </span>
        ),
      },
      {
        header: 'Payment',
        accessorKey: 'payment',
        cell: ({ row }: { row: { original: OrderData } }) => {
          const payment = row.original.payment
          return <span className={getPaymentClass(payment)}>{payment}</span>
        },
      },
      {
        header: 'Total',
        accessorKey: 'totalAmount',
        cell: ({ row }: { row: { original: OrderData } }) => (
          <span className="font-medium">
            ${row.original.totalAmount.toFixed(2)}
          </span>
        ),
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }: { row: { original: OrderData } }) => {
          const { status } = row.original
          return <span className={getStatusClass(status)}>{status}</span>
        },
      },
      {
        id: 'actions',
        header: 'Action',
        accessorKey: 'action',
        cell: ({ row }: { row: { original: OrderData } }) => (
          <Dropdown
            position="right"
            trigger="click"
            dropdownClassName="dropdown">
            <DropdownButton colorClass="flex items-center text-gray-500 dark:text-dark-500">
              <i className="ri-more-2-fill"></i>
            </DropdownButton>
            <DropdownMenu>
              <Link
                href="#!"
                className="dropdown-item"
                onClick={(e) => {
                  e.preventDefault()
                  router.push(
                    `/apps/ecommerce/orders/overview?id=${row.original.id}`
                  )
                }}>
                <i className="align-middle ltr:mr-2 rtl:ml-2 ri-eye-line"></i>{' '}
                <span>Overview</span>
              </Link>
              <Link
                href="#!"
                className="dropdown-item"
                onClick={(e) => {
                  e.preventDefault()
                  router.push(
                    `/apps/ecommerce/orders/create-order?id=${row.original.id}`
                  )
                }}>
                <i className="align-middle ltr:mr-2 rtl:ml-2 ri-pencil-line"></i>{' '}
                <span>Edit</span>
              </Link>
              <Link
                href="#!"
                className="dropdown-item dropdown-red"
                onClick={(e) => {
                  e.preventDefault()
                  handleDeleteRecord(row.original.id)
                }}>
                <i className="align-middle ltr:mr-2 rtl:ml-2 ri-delete-bin-line"></i>
                <span>Delete</span>
              </Link>
            </DropdownMenu>
          </Dropdown>
        ),
      },
    ],
    [
      deletedListData,
      selectAll,
      handleSelectAll,
      handleOpenOverviewEditModal,
      handleOpenOverviewModal,
      router,
    ]
  )

  if (loadingOrders) {
    return (
      <React.Fragment>
        <BreadCrumb title="Order List" subTitle="Orders" />
        <div className="card">
          <div className="card-body">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading orders...</p>
            </div>
          </div>
        </div>
      </React.Fragment>
    )
  }

  return (
    <React.Fragment>
      <BreadCrumb title="Order List" subTitle="Orders" />

      <OrderStatsCards projectId={projectId} />

      <div className="card">
        <div className="grid items-center grid-cols-12 gap-3 xl:gap-5 card-header">
          <div className="flex flex-wrap xl:flex-nowrap justify-end col-span-12 gap-3 xl:col-span-12 2xl:col-span-5">
            {deletedListData.length > 0 && (
              <button
                className="btn btn-red btn-icon"
                onClick={handleRemoveSelectedRecords}
                disabled={deleteOrder.isPending}>
                <Trash className="inline-block size-4" />
              </button>
            )}
            <div className="relative group/form">
              <input
                type="text"
                className="ltr:pl-9 rtl:pr-9 form-input"
                placeholder="Search order ID, customer name, status, payment..."
                value={searchInputValue}
                onChange={(e) => setSearchInputValue(e.target.value)}
                onKeyPress={handleSearchKeyPress}
              />
              <span className="absolute inset-y-0 flex items-center text-gray-500 dark:text-dark-500 ltr:left-3 rtl:right-3">
                <Search className="size-4" />
              </span>
              {appliedSearchTerm && (
                <button
                  className="absolute inset-y-0 flex items-center text-gray-500 dark:text-dark-500 ltr:right-3 rtl:left-3 hover:text-red-500"
                  onClick={handleClearSearch}
                  type="button">
                  <span className="text-lg">×</span>
                </button>
              )}
            </div>
            <button
              className="btn btn-primary"
              onClick={() =>
                router.push('/apps/ecommerce/orders/create-order')
              }>
              <Plus className="inline-block ltr:mr-1 rtl:ml-1 size-4" /> New
              Order
            </button>
          </div>
        </div>

        <OrderListTab
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          openModal={openModal}
          deletedListData={deletedListData}
          handleRemoveSelectedRecords={handleRemoveSelectedRecords}
          onFilterChange={(filters) => {
            setAppliedFilters({
              isPaid: filters.isPaid,
              isUnpaid: filters.isUnpaid,
              priceRange: filters.priceRange,
              selectedStatuses: filters.selectedStatuses,
            })
            setCurrentPage(1)
          }}
        />

        <div>
          <TableContainer
            columns={columns}
            data={orders}
            thClass="!font-medium"
            isSearch={false}
            divClass="overflow-x-auto"
            tableClass="table border-separate hovered flush border-spacing-y-2 whitespace-nowrap"
            tbodyClass="*:bg-gray-50 dark:*:bg-dark-900 *:rounded-md"
            PaginationClassName="pagination-container"
            thtrClass="text-gray-500 bg-gray-100 dark:bg-dark-800 dark:text-dark-500"
            isTableFooter={false}
          />
          <div className="card-body">
            {ordersData?.pagination && (
              <Pagination
                totalItems={ordersData.pagination.totalItems}
                itemsPerPage={ordersData.pagination.itemsPerPage}
                currentPage={ordersData.pagination.currentPage}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>

        <AddEditOrder
          modalState={modalState}
          closeModal={handleCloseModal}
          editMode={editMode}
          currentOrderList={currentOrderList as any}
          orders={(ordersData?.orders as any) || []}
        />

        <OverviewModal
          overviewShow={overviewShow}
          closeOverviewModal={() => setOverviewShow(false)}
          selectedOrder={currentOrderList as any}
          handleOpenOverviewEditModal={(editMode: boolean, orderList: any) =>
            handleOpenOverviewEditModal(editMode, orderList)
          }
        />

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

export default function OrdersListPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderList />
    </Suspense>
  )
}
