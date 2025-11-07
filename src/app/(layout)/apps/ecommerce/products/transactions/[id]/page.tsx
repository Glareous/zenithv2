'use client'

import React, { useEffect, useMemo, useState } from 'react'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import BreadCrumb from '@src/components/common/BreadCrumb'
import Pagination from '@src/components/common/Pagination'
import TableContainer from '@src/components/custom/table/table'
import { NextPageWithLayout } from '@src/dtos'
import Layout from '@src/layout/Layout'
import { RootState } from '@src/slices/reducer'
import { api } from '@src/trpc/react'
import 'flatpickr/dist/themes/material_blue.css'
import { ArrowLeft, Calendar } from 'lucide-react'
import Flatpickr from 'react-flatpickr'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { ToastContainer } from 'react-toastify'

type StockMovementData = {
  id: string
  movementId: string
  productId: string
  warehouseId: string
  movementType: string
  orderId: string | null
  quantity: number
  previousStock: number
  newStock: number
  createdAt: Date
  product: {
    id: string
    name: string
  }
  warehouse: {
    id: string
    warehouseId: string
    name: string
  }
  order: {
    id: string
    orderId: string
  } | null
}

type PaginatedResponse = {
  movements: StockMovementData[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

const ProductTransactions: NextPageWithLayout = () => {
  const params = useParams()
  const productId = params.id as string

  const currentProject = useSelector(
    (state: RootState) => state.Project.currentProject
  )
  const projectId = currentProject?.id || ''

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [dateFilter, setDateFilter] = useState<Date | null>(null)
  const [appliedDateFilter, setAppliedDateFilter] = useState<Date | null>(null)
  const [showDateFilter, setShowDateFilter] = useState(false)

  const { data: product } = api.projectProduct.getById.useQuery(
    { id: productId },
    { enabled: !!productId }
  )

  const {
    data: movementsData,
    isLoading,
    error,
  } = api.projectProductStockMovement.getByProductId.useQuery(
    {
      productId,
      projectId,
      page: currentPage,
      limit: itemsPerPage,
      createdAt: appliedDateFilter || undefined,
    },
    {
      enabled: !!productId && !!projectId,
      retry: 1,
    }
  )

  useEffect(() => {
    if (error) {
      console.error('Error loading stock movements:', error)
      toast.error('Error loading stock movements: ' + error.message)
    }
  }, [error])

  const movements = movementsData?.movements || []
  const pagination = movementsData?.pagination
  const filteredMovements = movements

  const handleDateFilter = (dates: Date[]) => {
    const date = dates[0]
    setDateFilter(date)
    setAppliedDateFilter(date)
    setCurrentPage(1)
  }

  const handleClearDateFilter = () => {
    setDateFilter(null)
    setAppliedDateFilter(null)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
  }

  const formatMovementType = (type: string) => {
    return type.replace(/_/g, ' ')
  }

  const formatQuantity = (quantity: number) => {
    return quantity > 0 ? `+${quantity}` : `${quantity}`
  }

  const getQuantityClass = (quantity: number) => {
    return quantity > 0 ? 'text-green-600' : 'text-red-600'
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString()
  }

  const columns = [
    {
      id: 'movementId',
      header: () => 'Movement ID',
      accessorKey: 'movementId',
    },
    {
      id: 'productId',
      header: () => 'Product ID',
      accessorKey: 'productId',
    },
    {
      id: 'warehouseId',
      header: () => 'Warehouse ID',
      accessorKey: 'warehouse.warehouseId',
      cell: ({ row }: { row: { original: StockMovementData } }) => (
        <span>{row.original.warehouse.warehouseId}</span>
      ),
    },
    {
      id: 'movementType',
      header: () => 'Movement Type',
      accessorKey: 'movementType',
      cell: ({ row }: { row: { original: StockMovementData } }) => (
        <span className="badge badge-blue">
          {formatMovementType(row.original.movementType)}
        </span>
      ),
    },
    {
      id: 'orderId',
      header: () => 'Order ID',
      accessorKey: 'order.orderId',
      cell: ({ row }: { row: { original: StockMovementData } }) => (
        <span>{row.original.order?.orderId || '-'}</span>
      ),
    },
    {
      id: 'quantity',
      header: () => 'Quantity',
      accessorKey: 'quantity',
      cell: ({ row }: { row: { original: StockMovementData } }) => (
        <span className={getQuantityClass(row.original.quantity)}>
          {formatQuantity(row.original.quantity)}
        </span>
      ),
    },
    {
      id: 'previousStock',
      header: () => 'Previous Stock',
      accessorKey: 'previousStock',
    },
    {
      id: 'newStock',
      header: () => 'New Stock',
      accessorKey: 'newStock',
    },
    {
      id: 'createdAt',
      header: () => 'Created At',
      accessorKey: 'createdAt',
      cell: ({ row }: { row: { original: StockMovementData } }) => (
        <span>{formatDate(row.original.createdAt)}</span>
      ),
    },
  ]

  if (!projectId) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-500">No project selected</p>
      </div>
    )
  }

  if (error) {
    return (
      <React.Fragment>
        <BreadCrumb title="Stock Movements - Error" subTitle="Products" />
        <div className="card">
          <div className="card-body text-center py-8">
            <div className="text-red-500 mb-4">
              <svg
                className="w-16 h-16 mx-auto mb-4"
                fill="currentColor"
                viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error Loading Stock Movements
            </h3>
            <p className="text-gray-500 mb-4">
              {error.message ||
                'Unable to load stock movements for this product.'}
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/apps/ecommerce/products/list"
                className="btn btn-sub-gray">
                Back to Products
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="btn btn-primary">
                Try Again
              </button>
            </div>
          </div>
        </div>
      </React.Fragment>
    )
  }

  return (
    <React.Fragment>
      <BreadCrumb
        title={`Stock Movements - ${product?.name || 'Product'}`}
        subTitle="Products"
      />

      {product && (
        <div className="card mb-5">
          <div className="card-body">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {product.name}
                </h5>
                <p className="text-gray-500 text-sm">
                  {product.description || 'No description available'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Current Stock</p>
                <p className="text-lg font-semibold">
                  {product.warehouses?.reduce(
                    (total, wh) => total + wh.stock,
                    0
                  ) || 0}{' '}
                  units
                </p>
                <p className="text-xs text-gray-400">
                  across {product.warehouses?.length || 0} warehouses
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <div className="grid grid-cols-12 gap-5">
            <div className="col-span-12">
              <div className="flex items-center gap-3">
                <Link
                  href="/apps/ecommerce/products/list"
                  className="btn btn-sub-gray flex items-center gap-2">
                  <ArrowLeft className="size-4" />
                  Back to Products
                </Link>

                <button
                  className={`btn btn-icon btn-icon-text ${
                    showDateFilter ? 'btn btn-primary' : 'btn btn-sub-gray'
                  }`}
                  onClick={() => setShowDateFilter(!showDateFilter)}
                  title="Date filter">
                  <Calendar className="size-5" />
                </button>

                {showDateFilter && (
                  <div className="relative">
                    <Flatpickr
                      value={dateFilter || ''}
                      onChange={handleDateFilter}
                      options={{
                        dateFormat: 'Y-m-d',
                        allowInput: true,
                      }}
                      className="form-input w-36"
                      placeholder="Select date..."
                    />
                    {appliedDateFilter && (
                      <button
                        className="absolute inset-y-0 flex items-center text-gray-500 dark:text-dark-500 ltr:right-3 rtl:left-3 hover:text-red-500"
                        onClick={handleClearDateFilter}
                        type="button">
                        <span className="text-lg">×</span>
                      </button>
                    )}
                  </div>
                )}

                {appliedDateFilter && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>Active filters:</span>
                    <span className="badge badge-green">
                      Date: {appliedDateFilter.toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => {
                        handleClearDateFilter()
                        setShowDateFilter(false)
                      }}
                      className="text-red-500 hover:text-red-700">
                      Clear all
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-0 card-body">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) =>
                  handleItemsPerPageChange(Number(e.target.value))
                }
                className="form-select form-select-sm w-20">
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-600">per page</span>
            </div>
            {pagination && (
              <div className="text-sm text-gray-600">
                Showing{' '}
                {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} to{' '}
                {Math.min(
                  pagination.currentPage * pagination.itemsPerPage,
                  pagination.totalItems
                )}{' '}
                of {pagination.totalItems} movements
              </div>
            )}
          </div>

          <div>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredMovements.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No se encontraron movimientos de stock
                </p>
              </div>
            ) : (
              <>
                <TableContainer
                  columns={columns}
                  data={filteredMovements}
                  thClass="!font-medium"
                  isSearch={false}
                  divClass="overflow-x-auto table-box"
                  tableClass="table hovered"
                  PaginationClassName="pagination-container"
                  thtrClass="text-gray-500 bg-gray-100 dark:bg-dark-850 dark:text-dark-500"
                  isTableFooter={false}
                />

                {pagination && pagination.totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination
                      totalItems={pagination.totalItems}
                      itemsPerPage={pagination.itemsPerPage}
                      currentPage={pagination.currentPage}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </React.Fragment>
  )
}

ProductTransactions.getLayout = (
  page: React.ReactElement
): React.ReactElement => {
  return <Layout breadcrumbTitle="Stock Movements">{page}</Layout>
}

export default ProductTransactions
