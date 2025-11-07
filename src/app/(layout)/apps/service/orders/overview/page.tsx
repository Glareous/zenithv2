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

  const { data: orderData, isLoading: loadingOrder } =
    api.projectOrders.getById.useQuery({ id: orderId! }, { enabled: !!orderId })

  const { data: orderServicesData, isLoading: loadingServices } =
    api.projectOrdersServices.getByOrderId.useQuery(
      { orderId: orderId! },
      { enabled: !!orderId }
    )

  const isLoading = loadingOrder || loadingServices

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
      case 'CANCELLED':
        return 'badge badge-red'
      default:
        return 'badge'
    }
  }

  const getStatusLabel = (status: string | undefined) => {
    if (status === 'DELIVERED') {
      return 'Realizado'
    }
    return status
  }

  const formatDate = (date: Date | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString()
  }

  const getFirstImage = (service: any) => {
    const firstImage = service.files?.[0]?.s3Url || service.imageUrl
    return firstImage
  }

  if (isLoading) {
    return (
      <React.Fragment>
        <BreadCrumb title="Overview" subTitle="Service Orders" />
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
        <BreadCrumb title="Overview" subTitle="Service Orders" />
        <div className="card">
          <div className="card-body">
            <div className="text-center">
              <p className="text-red-500">Order not found</p>
              <Link
                href="/apps/service/orders/list"
                className="btn btn-primary mt-4">
                Back to Orders
              </Link>
            </div>
          </div>
        </div>
      </React.Fragment>
    )
  }

  const totalItems = orderServicesData?.reduce(
    (sum, item) => sum + item.quantity,
    0
  ) || 0

  return (
    <React.Fragment>
      <BreadCrumb title="Overview" subTitle="Service Orders" />

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
                    `/apps/service/orders/create-orders?id=${orderData.id}`
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
                Customer Name:{' '}
                <span className="font-medium text-gray-800 dark:text-dark-50">
                  {orderData.customer?.name || 'N/A'}
                </span>
              </p>
              <p className="text-gray-500 dark:text-dark-500">
                Email:{' '}
                <span className="font-medium text-gray-800 dark:text-dark-50">
                  {orderData.customer?.email || 'N/A'}
                </span>
              </p>
              <p className="text-gray-500 dark:text-dark-500">
                Total Services:{' '}
                <span className="font-medium text-gray-800 dark:text-dark-50">
                  {totalItems} service{totalItems !== 1 ? 's' : ''}
                </span>
              </p>
              <p className="text-gray-500 dark:text-dark-500">
                Payment Method:{' '}
                <span className="font-medium text-gray-800 dark:text-dark-50">
                  {orderData.payment}
                </span>
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-gray-500 dark:text-dark-500">
                Order Date:{' '}
                <span className="font-medium text-gray-800 dark:text-dark-50">
                  {formatDate(orderData.orderDate)}
                </span>
              </p>
              <p className="text-gray-500 dark:text-dark-500">
                Delivered Date:{' '}
                <span className="font-medium text-gray-800 dark:text-dark-50">
                  {formatDate(orderData.deliveredDate)}
                </span>
              </p>
              <p className="text-gray-500 dark:text-dark-500">
                Created:{' '}
                <span className="font-medium text-gray-800 dark:text-dark-50">
                  {formatDate(orderData.createdAt)}
                </span>
              </p>
              <p className="text-gray-500 dark:text-dark-500">
                Status:{' '}
                <span className={getStatusClass(orderData.status)}>
                  {getStatusLabel(orderData.status)}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Services */}
      <div className="card">
        <div className="card-header">
          <h6 className="card-title">Service Items</h6>
        </div>
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="table flush whitespace-nowrap">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Service Name</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {orderServicesData?.map((item, index) => {
                  return (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td className="whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="p-2 border border-gray-200 rounded-md dark:border-dark-800 shrink-0 size-16">
                            {getFirstImage(item.service) ? (
                              <Image
                                src={getFirstImage(item.service)}
                                alt={item.service.name}
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
                                  {item.service.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div>
                            <h6 className="mb-2">
                              <Link
                                href="#!"
                                className="text-current link link-primary">
                                {item.service.name}
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
    </React.Fragment>
  )
}
