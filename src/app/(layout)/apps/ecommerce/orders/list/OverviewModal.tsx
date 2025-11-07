'use client'

import React from 'react'

import Link from 'next/link'

import { Modal } from '@src/components/custom/modal/modal'
import { X } from 'lucide-react'

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
  }
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

interface orderList {
  overviewShow: boolean
  closeOverviewModal: () => void
  selectedOrder: OrderData | null
  handleOpenOverviewEditModal: (
    editMode: boolean,
    orderList: OrderData | null
  ) => void
}

const OverviewModal = ({
  overviewShow,
  closeOverviewModal,
  selectedOrder,
  handleOpenOverviewEditModal,
}: orderList) => {
  const getPaymentClass = (payment: string | undefined) => {
    switch (payment) {
      case 'PAID':
        return 'badge badge-green'
      case 'COD':
        return 'badge badge-blue'
      case 'UNPAID':
        return 'badge badge-red'
      default:
        return 'badge'
    }
  }

  const getStatusClass = (status: string | undefined) => {
    switch (status) {
      case 'DELIVERED':
        return 'badge badge-green'
      case 'NEW':
        return 'badge badge-primary'
      case 'PENDING':
        return 'badge badge-yellow'
      case 'SHIPPING':
        return 'badge badge-purple'
      default:
        return 'badge'
    }
  }

  if (!selectedOrder) {
    return null
  }

  const formatDate = (date: Date | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString()
  }

  const totalItems = selectedOrder.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  )

  return (
    <React.Fragment>
      <Modal
        isOpen={overviewShow}
        onClose={() => closeOverviewModal()}
        position="modal-center"
        id="overviewOrderModal"
        contentClass="modal-content"
        content={(onClose) => (
          <>
            {overviewShow === true && (
              <>
                <button
                  onClick={() => onClose()}
                  className="link link-red float-end">
                  <X className="size-5"></X>
                </button>

                <h6 className="mt-4 mb-2">
                  Order <Link href="#!">{selectedOrder.orderId}</Link>
                </h6>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="mb-1 text-gray-500 dark:text-dark-500">
                      Customer
                    </p>
                    <h6>{selectedOrder.customer.name}</h6>
                    {selectedOrder.customer.email && (
                      <p className="text-sm text-gray-600">
                        {selectedOrder.customer.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="mb-1 text-gray-500 dark:text-dark-500">
                      Total Items
                    </p>
                    <h6>{totalItems} items</h6>
                  </div>
                  <div>
                    <p className="mb-1 text-gray-500 dark:text-dark-500">
                      Order Date
                    </p>
                    <h6>{formatDate(selectedOrder.orderDate)}</h6>
                  </div>
                  <div>
                    <p className="mb-1 text-gray-500 dark:text-dark-500">
                      Delivered Date
                    </p>
                    <h6>{formatDate(selectedOrder.deliveredDate)}</h6>
                  </div>
                  <div>
                    <p className="mb-1 text-gray-500 dark:text-dark-500">
                      Payment
                    </p>
                    <span className={getPaymentClass(selectedOrder.payment)}>
                      {selectedOrder.payment}
                    </span>
                  </div>
                  <div>
                    <p className="mb-1 text-gray-500 dark:text-dark-500">
                      Status
                    </p>
                    <span className={getStatusClass(selectedOrder.status)}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div>
                    <p className="mb-1 text-gray-500 dark:text-dark-500">
                      Total Amount
                    </p>
                    <h6 className="font-bold text-lg">
                      ${selectedOrder.totalAmount.toFixed(2)}
                    </h6>
                  </div>
                  <div>
                    <p className="mb-1 text-gray-500 dark:text-dark-500">
                      Created
                    </p>
                    <h6>{formatDate(selectedOrder.createdAt)}</h6>
                  </div>
                </div>

                {/* Order Items */}
                {selectedOrder.items.length > 0 && (
                  <div className="mt-6">
                    <h6 className="mb-3">Order Items</h6>
                    <div className="overflow-x-auto">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedOrder.items.map((item, index) => (
                            <tr key={index}>
                              <td>{item.product.name}</td>
                              <td>{item.quantity}</td>
                              <td>${item.price.toFixed(2)}</td>
                              <td>${item.total.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 mt-5">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onClose}>
                    Close
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    onClick={(e) => {
                      e.preventDefault()
                      onClose()
                      handleOpenOverviewEditModal(true, selectedOrder)
                    }}>
                    Edit Order
                  </button>
                </div>
              </>
            )}
          </>
        )}
      />
    </React.Fragment>
  )
}

export default OverviewModal
