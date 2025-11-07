'use client'

import React from 'react'
import { Suspense } from 'react'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import { api } from '@src/trpc/react'
import { CircleArrowDown, Pencil } from 'lucide-react'

export default function OrderOverviewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderOverviewForm />
    </Suspense>
  )
}

function OrderOverviewForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('id')

  const { data: orderData, isLoading } = api.projectOrders.getById.useQuery(
    { id: orderId! },
    { enabled: !!orderId }
  )

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

  const formatDate = (date: Date | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString()
  }

  const getFirstImage = (product: any) => {
    const firstImage = product.files?.[0]?.s3Url || product.imageUrl
    return firstImage
  }

  if (isLoading) {
    return (
      <React.Fragment>
        <BreadCrumb title="Overview" subTitle="Orders" />
        <div className="card">
          <div className="card-body">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading order details...</p>
            </div>
          </div>
        </div>
      </React.Fragment>
    )
  }

  if (!orderData) {
    return (
      <React.Fragment>
        <BreadCrumb title="Overview" subTitle="Orders" />
        <div className="card">
          <div className="card-body">
            <div className="text-center">
              <p className="text-red-500">Order not found</p>
              <Link
                href="/apps/ecommerce/orders/list"
                className="btn btn-primary mt-4">
                Back to Orders
              </Link>
            </div>
          </div>
        </div>
      </React.Fragment>
    )
  }

  const totalItems = orderData.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  )

  return (
    <React.Fragment>
      <BreadCrumb title="Overview" subTitle="Orders" />

      {/* Order Header */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-wrap items-center gap-5">
            <div className="grow">
              <h6 className="mb-1">Order ID: {orderData.orderId}</h6>
              <p className="mb-3 text-gray-500 dark:text-dark-500">
                Order Date: {formatDate(orderData.orderDate)}
              </p>
              <span className={getPaymentClass(orderData.payment)}>
                {orderData.payment}
              </span>
            </div>
            <div className="items-center gap-2 sm:flex shrink-0">
              <button className="btn btn-primary btn-icon-overlay">
                <span className="icon">
                  <CircleArrowDown className="size-4"></CircleArrowDown>
                </span>
                Download Invoice
              </button>
              <button
                className="mt-3 btn btn-sub-gray sm:mt-0"
                onClick={() =>
                  router.push(
                    `/apps/ecommerce/orders/create-order?id=${orderData.id}`
                  )
                }>
                <Pencil className="inline-block ltr:mr-1 rtl:ml-1 size-4"></Pencil>
                <span className="align-center">Edit</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Information */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <p className="text-gray-500 dark:text-dark-500">
                Customer Name:
                <span className="font-medium text-gray-800 dark:text-dark-50">
                  {orderData.customer?.name || 'N/A'}
                </span>
              </p>
              <p className="text-gray-500 dark:text-dark-500">
                Email:
                <span className="font-medium text-gray-800 dark:text-dark-50">
                  {orderData.customer?.email || 'N/A'}
                </span>
              </p>
              <p className="text-gray-500 dark:text-dark-500">
                Total Items:
                <span className="font-medium text-gray-800 dark:text-dark-50">
                  {totalItems} items
                </span>
              </p>
              <p className="text-gray-500 dark:text-dark-500">
                Payment Method:
                <span className="font-medium text-gray-800 dark:text-dark-50">
                  {orderData.payment}
                </span>
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-gray-500 dark:text-dark-500">
                Order Date:
                <span className="font-medium text-gray-800 dark:text-dark-50">
                  {formatDate(orderData.orderDate)}
                </span>
              </p>
              <p className="text-gray-500 dark:text-dark-500">
                Delivered Date:
                <span className="font-medium text-gray-800 dark:text-dark-50">
                  {formatDate(orderData.deliveredDate)}
                </span>
              </p>
              <p className="text-gray-500 dark:text-dark-500">
                Created:
                <span className="font-medium text-gray-800 dark:text-dark-50">
                  {formatDate(orderData.createdAt)}
                </span>
              </p>
              <p className="text-gray-500 dark:text-dark-500">
                Delivery Status:{' '}
                <span className={getStatusClass(orderData.status)}>
                  {orderData.status}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="card">
        <div className="card-header">
          <h6 className="card-title">Product Items</h6>
        </div>
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="table flush whitespace-nowrap">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product Name</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {orderData.items.map((item, index) => {
                  return (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td className="whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="p-2 border border-gray-200 rounded-md dark:border-dark-800 shrink-0 size-16">
                            {getFirstImage(item.product) ? (
                              <Image
                                src={getFirstImage(item.product)}
                                alt={item.product.name}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover rounded"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.src =
                                    '/assets/images/products/product-placeholder.png'
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                                <span className="text-xs text-gray-500">
                                  {item.product.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div>
                            <h6 className="mb-2">
                              <Link
                                href="#!"
                                className="text-current link link-primary">
                                {item.product.name}
                              </Link>
                            </h6>
                          </div>
                        </div>
                      </td>
                      <td>${item.price.toFixed(2)}</td>
                      <td>{item.quantity}</td>
                      <td>${item.total.toFixed(2)}</td>
                    </tr>
                  )
                })}
                <tr>
                  <td colSpan={4} className="text-right font-bold">
                    Total Amount:
                  </td>
                  <td className="font-bold text-lg">
                    ${orderData.totalAmount.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delivery Status Timeline */}
      <div className="card">
        <div className="flex items-center gap-5 card-header">
          <h6 className="card-title grow">Delivery Status</h6>
          <Link href="/apps/ecommerce/orders/track" className="btn btn-sub-red">
            Track Order
          </Link>
        </div>
        <div className="card-body">
          <div className="px-12 py-2">
            <div className="relative flex items-center justify-between lg:w-full horizontal timeline before:absolute before:block before:w-full before:h-[0.2em] before:bg-gray-200 dark:before:bg-dark-800">
              <div className="relative flex items-center justify-between w-full ltr:pl-0 rtl:pr-0 steps before:!hidden after:!hidden">
                <div className="relative z-10 block p-1.5 mx-1 border-2 border-white dark:border-dark-900 rounded-full bg-primary-500 bottom-1.5 ltr:first:ml-0 rtl:first:mr-0 ltr:last:mr-0 rtl:last:ml-0 done">
                  <span className="absolute text-gray-500 -translate-x-1/2 dark:text-dark-500 top-5 left-1/2 whitespace-nowrap">
                    Order Placed
                  </span>
                </div>
                <div
                  className={`relative z-10 block p-1.5 mx-1 border-2 border-white dark:bord er-dark-900 rounded-full bottom-1.5 ltr:first:ml-0 rtl:first:mr-0 ltr:last:mr-0 rtl:last:ml-0 ${
                    ['PENDING', 'SHIPPING', 'DELIVERED'].includes(
                      orderData.status
                    )
                      ? 'bg-primary-500 done'
                      : 'bg-gray-200 dark:bg-gray-800'
                  }`}>
                  <span className="absolute text-gray-500 -translate-x-1/2 dark:text-dark-500 top-5 left-1/2 whitespace-nowrap">
                    Processing
                  </span>
                </div>
                <div
                  className={`relative z-10 block p-1.5 mx-1 border-2 border-white dark:border-dark-900 rounded-full bottom-1.5 ltr:first:ml-0 rtl:first:mr-0 ltr:last:mr-0 rtl:last:ml-0 ${
                    ['SHIPPING', 'DELIVERED'].includes(orderData.status)
                      ? 'bg-primary-500 done'
                      : 'bg-gray-200 dark:bg-gray-800'
                  }`}>
                  <span className="absolute text-gray-500 -translate-x-1/2 dark:text-dark-500 top-5 left-1/2 whitespace-nowrap">
                    Shipped
                  </span>
                </div>
                <div
                  className={`relative z-10 block p-1.5 mx-1 border-2 border-white dark:border-dark-900 rounded-full bottom-1.5 ltr:first:ml-0 rtl:first:mr-0 ltr:last:mr-0 rtl:last:ml-0 ${
                    orderData.status === 'DELIVERED'
                      ? 'bg-green-500 done'
                      : 'bg-gray-200 dark:bg-gray-800'
                  }`}>
                  <span className="absolute text-gray-500 -translate-x-1/2 dark:text-dark-500 top-5 left-1/2 whitespace-nowrap">
                    Delivered
                  </span>
                </div>
              </div>

              <div
                className={`line block absolute h-[0.2em] bg-primary-500 !pb-0 before:!hidden after:!hidden ${
                  orderData.status === 'DELIVERED'
                    ? 'w-full'
                    : ['SHIPPING'].includes(orderData.status)
                      ? 'w-3/4'
                      : ['PENDING'].includes(orderData.status)
                        ? 'w-1/2'
                        : 'w-0'
                }`}></div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}
