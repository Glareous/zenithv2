'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Suspense } from 'react'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import BreadCrumb from '@src/components/common/BreadCrumb'
import DeleteModal from '@src/components/common/DeleteModal'
import { OptionType, paymentOptions } from '@src/data/ecommerce/order-list'
import { RootState } from '@src/slices/reducer'
import { api } from '@src/trpc/react'
import { Trash } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Flatpickr from 'react-flatpickr'
import { Controller, useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import Select from 'react-select'
import { toast } from 'react-toastify'
import { z } from 'zod'

const orderFormSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  orderDate: z.date(),
  deliveredDate: z.date().optional(),
  payment: z.enum(['PAID', 'UNPAID', 'COD']),
})

type OrderFormData = z.infer<typeof orderFormSchema>

type ServiceData = {
  id: string
  name: string
  price: number
}

const CreateOrder = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const orderId = searchParams.get('id')
  const isEditMode = !!orderId

  const currentProject = useSelector(
    (state: RootState) => state.Project.currentProject
  )
  const projectId = currentProject?.id || ''

  const utils = api.useUtils()

  const [orderItems, setOrderItems] = useState<
    Array<{
      serviceId: string
      serviceName: string
      quantity: number
      price: number
      total: number
    }>
  >([])
  const [selectedService, setSelectedService] = useState<ServiceData | null>(
    null
  )
  const [quantity, setQuantity] = useState(1)
  const [quantityInput, setQuantityInput] = useState('1')
  const [totalAmount, setTotalAmount] = useState(0)
  const [orderDate, setOrderDate] = useState<Date | null>(null)
  const [deliveredDate, setDeliveredDate] = useState<Date | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<OptionType | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const { data: customersData, isLoading: loadingCustomers } =
    api.projectCustomer.getAll.useQuery(
      { projectId, page: 1, limit: 100 },
      { enabled: !!projectId }
    )

  const { data: servicesData, isLoading: loadingServices } =
    api.projectService.getAll.useQuery(
      { projectId, page: 1, limit: 100 },
      { enabled: !!projectId }
    )

  const { data: orderData, refetch: refetchOrderData } =
    api.projectOrders.getById.useQuery(
      { id: orderId! },
      { enabled: !!orderId && !!projectId }
    )

  const { data: orderServicesData, refetch: refetchOrderServices } =
    api.projectOrdersServices.getByOrderId.useQuery(
      { orderId: orderId! },
      { enabled: !!orderId && !!projectId }
    )

  useEffect(() => {
    if (isEditMode && orderId) {
      refetchOrderData()
      refetchOrderServices()
    }
  }, [isEditMode, orderId, refetchOrderData, refetchOrderServices])

  const createOrder = api.projectOrders.create.useMutation({
    onSuccess: async (newOrder) => {
      if (!newOrder) return

      for (const item of orderItems) {
        await createOrderService.mutateAsync({
          orderId: newOrder.id,
          serviceId: item.serviceId,
          quantity: item.quantity,
          price: item.price,
        })
      }

      utils.projectOrders.getAll.invalidate({ projectId })

      toast.success('Service order created successfully')
      router.push('/apps/service/orders/list')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const updateOrder = api.projectOrders.update.useMutation({
    onSuccess: async (updatedOrder) => {
      if (orderServicesData) {
        for (const item of orderServicesData) {
          await deleteOrderService.mutateAsync({ id: item.id })
        }
      }

      for (const item of orderItems) {
        await createOrderService.mutateAsync({
          orderId: updatedOrder.id,
          serviceId: item.serviceId,
          quantity: item.quantity,
          price: item.price,
        })
      }

      utils.projectOrders.getAll.invalidate({ projectId })

      toast.success('Service order updated successfully')
      router.push('/apps/service/orders/list')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const deleteOrder = api.projectOrders.delete.useMutation({
    onSuccess: () => {
      utils.projectOrders.getAll.invalidate({ projectId })

      toast.success('Service order deleted successfully')
      router.push('/apps/service/orders/list')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const createOrderService = api.projectOrdersServices.create.useMutation()
  const deleteOrderService = api.projectOrdersServices.delete.useMutation()

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    clearErrors,
    formState: { errors },
    watch,
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    mode: 'onChange',
    defaultValues: {
      customerId: '',
      orderDate: new Date(),
      deliveredDate: undefined,
      payment: 'UNPAID',
    },
  })

  const watchedValues = watch()

  useEffect(() => {
    if (!isEditMode) {
      setPaymentStatus({ value: 'UNPAID', label: 'Unpaid' })
    }
  }, [isEditMode])

  useEffect(() => {
    const total = orderItems.reduce((sum, item) => sum + item.total, 0)
    setTotalAmount(total)
  }, [orderItems])

  useEffect(() => {
    if (isEditMode && orderData && orderServicesData) {
      clearErrors()

      setValue('customerId', orderData.customer?.id || '')
      setValue('orderDate', new Date(orderData.orderDate))
      if (orderData.deliveredDate) {
        setValue('deliveredDate', new Date(orderData.deliveredDate))
      }
      setValue('payment', orderData.payment as any)

      const newItems = orderServicesData.map((item: any) => ({
        serviceId: item.service.id,
        serviceName: item.service.name,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
      }))

      setOrderItems(newItems)

      setOrderDate(new Date(orderData.orderDate))
      if (orderData.deliveredDate) {
        setDeliveredDate(new Date(orderData.deliveredDate))
      }

      setPaymentStatus({
        value: orderData.payment,
        label: orderData.payment,
      })
    }
  }, [isEditMode, orderData?.id, orderServicesData])

  const onSubmit = (data: OrderFormData) => {
    if (orderItems.length === 0) {
      toast.error('Please add at least one service to the order')
      return
    }

    if (isEditMode && orderId) {
      updateOrder.mutate({
        id: orderId,
        customerId: data.customerId,
        orderDate: data.orderDate,
        deliveredDate: data.deliveredDate || undefined,
        payment: data.payment,
      })
    } else {
      createOrder.mutate({
        projectId,
        customerId: data.customerId,
        type: 'SERVICE',
        orderDate: data.orderDate,
        deliveredDate: data.deliveredDate || undefined,
        payment: data.payment,
        totalAmount: totalAmount,
      })
    }
  }

  const handleServiceSelect = (service: ServiceData) => {
    setSelectedService(service)
    setQuantity(1)
    setQuantityInput('1')
  }

  const handleAddService = () => {
    if (!selectedService) {
      toast.error('Please select a service')
      return
    }

    if (quantity <= 0) {
      toast.error('Quantity must be greater than 0')
      return
    }

    const newItem = {
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      quantity,
      price: selectedService.price,
      total: quantity * selectedService.price,
    }

    setOrderItems((prev) => [...prev, newItem])
    setSelectedService(null)
    setQuantity(1)
    setQuantityInput('1')
  }

  const handleRemoveService = (index: number) => {
    setOrderItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleReset = useCallback(() => {
    reset({
      customerId: '',
      orderDate: new Date(),
      deliveredDate: undefined,
      payment: 'UNPAID',
    })
    setOrderItems([])
    setSelectedService(null)
    setQuantity(1)
    setQuantityInput('1')
    setTotalAmount(0)
    setOrderDate(null)
    setDeliveredDate(null)
    setPaymentStatus({ value: 'UNPAID', label: 'Unpaid' })
    clearErrors()
  }, [reset, clearErrors])

  const handleDelete = () => {
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = () => {
    if (orderId) {
      deleteOrder.mutate({ id: orderId })
    }
    setShowDeleteModal(false)
  }

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false)
  }

  const handleQuantityInputChange = (value: string) => {
    setQuantityInput(value)

    if (value === '') {
      setQuantity(1)
    } else {
      const numValue = parseInt(value)
      if (!isNaN(numValue) && numValue > 0) {
        setQuantity(numValue)
      }
    }
  }

  return (
    <React.Fragment>
      <BreadCrumb
        title={isEditMode ? 'Edit Service Order' : 'Create Service Order'}
        subTitle="Service Orders"
      />

      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h6 className="card-title">
              {isEditMode ? 'Edit Service Order' : 'Create New Service Order'}
            </h6>
            <div className="flex items-center gap-2">
              <Link
                href="/apps/service/orders/list"
                className="btn btn-sub-gray">
                Back to List
              </Link>
              {isEditMode && (
                <button
                  type="button"
                  className="btn btn-red"
                  onClick={handleDelete}
                  disabled={deleteOrder.isPending}>
                  {deleteOrder.isPending ? 'Deleting...' : 'Delete Order'}
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-12 gap-5">
              {/* Order Information */}
              <div className="col-span-12">
                <h6 className="mb-4">Order Information</h6>
                <div className="grid grid-cols-12 gap-4">
                  {/* Customer Selection */}
                  <div className="col-span-12">
                    <label htmlFor="customerSelect" className="form-label">
                      Customer <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="customerId"
                      control={control}
                      render={({ field }) => (
                        <Select
                          classNamePrefix="select"
                          options={
                            customersData?.customers.map((customer) => ({
                              value: customer.id,
                              label: customer.name,
                            })) || []
                          }
                          value={
                            customersData?.customers
                              .filter((customer) => customer.id === field.value)
                              .map((customer) => ({
                                value: customer.id,
                                label: customer.name,
                              }))[0] || null
                          }
                          onChange={(selected) =>
                            field.onChange(selected?.value || '')
                          }
                          placeholder="Select customer"
                          isDisabled={isEditMode}
                        />
                      )}
                    />
                    {errors.customerId && (
                      <span className="text-red-500 text-sm">
                        {errors.customerId.message}
                      </span>
                    )}
                  </div>

                  {/* Order Date */}
                  <div className="col-span-6">
                    <label htmlFor="orderDateInput" className="form-label">
                      Order Date <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="orderDate"
                      control={control}
                      render={({ field }) => (
                        <Flatpickr
                          className="form-input"
                          placeholder="Select order date"
                          value={orderDate || undefined}
                          options={{
                            mode: 'single',
                            dateFormat: 'Y-m-d',
                          }}
                          onChange={(date) => {
                            const selectedDate = date[0]
                            setOrderDate(selectedDate)
                            field.onChange(selectedDate)
                          }}
                        />
                      )}
                    />
                    {errors.orderDate && (
                      <span className="text-red-500 text-sm">
                        {errors.orderDate.message}
                      </span>
                    )}
                  </div>

                  {/* Delivered Date */}
                  <div className="col-span-6">
                    <label htmlFor="deliveredDateInput" className="form-label">
                      Delivered Date
                    </label>
                    <Controller
                      name="deliveredDate"
                      control={control}
                      render={({ field }) => (
                        <Flatpickr
                          className="form-input"
                          placeholder="Select delivered date"
                          value={deliveredDate || undefined}
                          options={{
                            mode: 'single',
                            dateFormat: 'Y-m-d',
                          }}
                          onChange={(date) => {
                            const selectedDate = date[0]
                            setDeliveredDate(selectedDate)
                            field.onChange(selectedDate)
                          }}
                        />
                      )}
                    />
                  </div>

                  {/* Payment */}
                  <div className="col-span-6">
                    <label className="form-label">Payment</label>
                    <Controller
                      name="payment"
                      control={control}
                      render={({ field }) => (
                        <Select
                          classNamePrefix="select"
                          options={paymentOptions}
                          value={paymentStatus}
                          onChange={(selected) => {
                            setPaymentStatus(selected)
                            field.onChange(selected?.value || 'UNPAID')
                          }}
                          placeholder="Select payment"
                        />
                      )}
                    />
                    {errors.payment && (
                      <span className="text-red-500 text-sm">
                        {errors.payment.message}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Service Selection */}
              <div className="col-span-12">
                <h6 className="mb-4">Add Services</h6>
                <div className="grid grid-cols-12 gap-3">
                  {/* Service Selection */}
                  <div className="col-span-6">
                    <label className="form-label">Service</label>
                    <Select
                      classNamePrefix="select"
                      options={
                        servicesData?.services.map((service) => ({
                          value: service.id,
                          label: `${service.name} - $${service.price}`,
                          data: {
                            id: service.id,
                            name: service.name,
                            price: service.price,
                          } as ServiceData,
                        })) || []
                      }
                      value={
                        selectedService
                          ? {
                              value: selectedService.id,
                              label: `${selectedService.name} - $${selectedService.price}`,
                              data: selectedService,
                            }
                          : null
                      }
                      onChange={(selected) => {
                        if (selected?.data) {
                          handleServiceSelect(selected.data)
                        }
                      }}
                      placeholder="Select service"
                    />
                  </div>

                  {/* Quantity Controls */}
                  <div className="col-span-3">
                    <label className="form-label">Quantity</label>
                    <input
                      type="number"
                      className="form-input"
                      value={quantityInput}
                      onChange={(e) =>
                        handleQuantityInputChange(e.target.value)
                      }
                      onBlur={(e) => {
                        if (
                          e.target.value === '' ||
                          parseInt(e.target.value) < 1
                        ) {
                          setQuantity(1)
                          setQuantityInput('1')
                        } else {
                          setQuantityInput(e.target.value)
                        }
                      }}
                      min="1"
                      step="1"
                    />
                  </div>

                  {/* Add Button */}
                  <div className="col-span-3 flex items-end">
                    <button
                      type="button"
                      className="btn btn-primary w-full"
                      onClick={handleAddService}>
                      Add Service
                    </button>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              {orderItems.length > 0 && (
                <div className="col-span-12">
                  <h6 className="mb-4">Order Services</h6>
                  <div className="overflow-x-auto">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Service</th>
                          <th>Quantity</th>
                          <th>Price</th>
                          <th>Total</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderItems.map((item, index) => (
                          <tr key={index}>
                            <td>{item.serviceName}</td>
                            <td>{item.quantity}</td>
                            <td>${item.price.toFixed(2)}</td>
                            <td>${item.total.toFixed(2)}</td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-sm btn-red"
                                onClick={() => handleRemoveService(index)}>
                                <Trash className="size-3" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={3} className="text-right font-bold">
                            Total Amount:
                          </td>
                          <td className="font-bold text-lg">
                            ${totalAmount.toFixed(2)}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="col-span-12 flex justify-end gap-2 pt-4 ">
                <button
                  type="button"
                  className="btn btn-outline-red"
                  onClick={handleReset}>
                  Reset
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createOrder.isPending || updateOrder.isPending}>
                  {createOrder.isPending || updateOrder.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </div>
                  ) : isEditMode ? (
                    'Update Order'
                  ) : (
                    'Create Order'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteModal
        show={showDeleteModal}
        handleHide={handleCloseDeleteModal}
        deleteModalFunction={handleConfirmDelete}
        title="Delete Service Order"
        message="Are you sure you want to delete this service order? This action cannot be undone."
      />
    </React.Fragment>
  )
}

export default function CreateOrderPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateOrder />
    </Suspense>
  )
}
