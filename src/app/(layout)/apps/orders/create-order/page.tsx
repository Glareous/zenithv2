'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Suspense } from 'react'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import BreadCrumb from '@src/components/common/BreadCrumb'
import DeleteModal from '@src/components/common/DeleteModal'
import {
  OptionType,
  paymentOptions,
  statusOptions,
} from '@src/data/ecommerce/order-list'
import { NextPageWithLayout } from '@src/dtos'
import { RootState } from '@src/slices/reducer'
import { api } from '@src/trpc/react'
import { Minus, Plus, Trash } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Flatpickr from 'react-flatpickr'
import { Controller, useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import Select from 'react-select'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { z } from 'zod'

declare global {
  interface Window {
    plusInterval: NodeJS.Timeout | null
    minusInterval: NodeJS.Timeout | null
  }
}

const getOrderFormSchema = (isEditMode: boolean) => {
  const statusEnum = isEditMode
    ? ['NEW', 'DELIVERED', 'PENDING', 'SHIPPING', 'CANCELLED']
    : ['NEW', 'DELIVERED', 'PENDING', 'SHIPPING']

  return z.object({
    customerId: z.string().min(1, 'Customer is required'),
    orderDate: z.date(),
    deliveredDate: z.date().optional(),
    status: z.enum(statusEnum as [string, ...string[]]),
    payment: z.enum(['PAID', 'UNPAID', 'COD']),
  })
}

type OrderFormData = z.infer<ReturnType<typeof getOrderFormSchema>>

type ProductData = {
  id: string
  name: string
  price: number
  stock: number
  warehouses: Array<{
    warehouseId: string
    warehouseName: string
    stock: number
  }>
}

const CreateOrder: NextPageWithLayout = () => {
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

  const [orderType, setOrderType] = useState<'PRODUCT' | 'SERVICE' | 'MIXED'>(
    'PRODUCT'
  )
  const [showProductSection, setShowProductSection] = useState(true)
  const [showServiceSection, setShowServiceSection] = useState(false)
  const [orderItems, setOrderItems] = useState<
    Array<{
      productId: string
      productName: string
      quantity: number
      price: number
      total: number
      stock: number
      warehouseId: string
      warehouseName: string
    }>
  >([])
  const [serviceItems, setServiceItems] = useState<
    Array<{
      serviceId: string
      serviceName: string
      quantity: number
      price: number
      total: number
    }>
  >([])
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(
    null
  )
  const [selectedService, setSelectedService] = useState<{
    id: string
    name: string
    price: number
  } | null>(null)
  const [selectedWarehouse, setSelectedWarehouse] = useState<{
    warehouseId: string
    warehouseName: string
    stock: number
  } | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [quantityInput, setQuantityInput] = useState('1')
  const [isHoldingPlus, setIsHoldingPlus] = useState(false)
  const [isHoldingMinus, setIsHoldingMinus] = useState(false)
  const [subtotalAmount, setSubtotalAmount] = useState(0)
  const [taxPercentage, setTaxPercentage] = useState(0)
  const [taxAmount, setTaxAmount] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0)
  const [orderDate, setOrderDate] = useState<Date | null>(null)
  const [deliveredDate, setDeliveredDate] = useState<Date | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<OptionType | null>(null)
  const [orderStatus, setOrderStatus] = useState<OptionType | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const statusOptionsForCreate = statusOptions.filter(
    (option) => option.value !== 'CANCELLED'
  )
  const statusOptionsForEdit = statusOptions

  const { data: customersData, isLoading: loadingCustomers } =
    api.projectCustomer.getAll.useQuery(
      { projectId, page: 1, limit: 100 },
      { enabled: !!projectId }
    )

  const { data: productsData, isLoading: loadingProducts } =
    api.projectProduct.getAll.useQuery(
      { projectId, page: 1, limit: 100 },
      { enabled: !!projectId && showProductSection }
    )

  const { data: servicesData, isLoading: loadingServices } =
    api.projectService.getAll.useQuery(
      { projectId, page: 1, limit: 100 },
      { enabled: !!projectId && showServiceSection }
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
      if (!newOrder) {
        return
      }

      utils.projectOrders.getAll.invalidate({ projectId })
      utils.projectProduct.getAll.invalidate({ projectId })

      const orderTypeLabel =
        newOrder.type === 'MIXED'
          ? 'Mixed'
          : newOrder.type === 'PRODUCT'
            ? 'Product'
            : 'Service'

      toast.success(`${orderTypeLabel} order created successfully`)
      router.push('/apps/orders/list')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const updateOrder = api.projectOrders.update.useMutation({
    onSuccess: async (updatedOrder) => {
      try {
        if (orderData?.items && orderData.items.length > 0) {
          for (const item of orderData.items) {
            await deleteOrderItem.mutateAsync({ id: item.id })
          }
        }

        if (orderServicesData && orderServicesData.length > 0) {
          for (const item of orderServicesData) {
            await deleteOrderService.mutateAsync({ id: item.id })
          }
        }

        if (orderItems.length > 0) {
          for (const item of orderItems) {
            await createOrderItem.mutateAsync({
              orderId: updatedOrder.id,
              productId: item.productId,
              warehouseId: item.warehouseId,
              quantity: item.quantity,
              price: item.price,
            })
          }
        }

        if (serviceItems.length > 0) {
          for (const item of serviceItems) {
            await createOrderService.mutateAsync({
              orderId: updatedOrder.id,
              serviceId: item.serviceId,
              quantity: item.quantity,
              price: item.price,
            })
          }
        }

        utils.projectOrders.getAll.invalidate({ projectId })
        utils.projectProduct.getAll.invalidate({ projectId })

        toast.success('Order updated successfully')
        router.push('/apps/orders/list')
      } catch (error) {
        console.error('❌ ERROR in onSuccess:', error)
        toast.error('Failed to update order items: ' + (error as any).message)
      }
    },
    onError: (error) => {
      console.error('❌ Mutation error:', error)
      toast.error(error.message)
    },
  })

  const deleteOrder = api.projectOrders.delete.useMutation({
    onSuccess: () => {
      utils.projectOrders.getAll.invalidate({ projectId })

      toast.success('Order deleted successfully')
      router.push('/apps/orders/list')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const createOrderItem = api.projectOrdersItems.create.useMutation()
  const deleteOrderItem = api.projectOrdersItems.delete.useMutation()
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
    resolver: zodResolver(getOrderFormSchema(isEditMode)),
    mode: 'onChange',
    defaultValues: {
      customerId: '',
      orderDate: new Date(),
      deliveredDate: undefined,
      status: 'NEW' as any,
      payment: 'UNPAID',
    },
  })

  const watchedValues = watch()

  useEffect(() => {
    if (!isEditMode) {
      setOrderStatus({ value: 'NEW', label: 'New' })
      setPaymentStatus({ value: 'UNPAID', label: 'Unpaid' })
    }
  }, [isEditMode])

  useEffect(() => {
    const productsTotal = orderItems.reduce((sum, item) => sum + item.total, 0)
    const servicesTotal = serviceItems.reduce(
      (sum, item) => sum + item.total,
      0
    )
    const subtotal = productsTotal + servicesTotal
    setSubtotalAmount(subtotal)

    const calculatedTax = subtotal * (taxPercentage / 100)
    setTaxAmount(calculatedTax)

    const total = subtotal + calculatedTax
    setTotalAmount(total)
  }, [orderItems, serviceItems, taxPercentage])

  useEffect(() => {
    if (isEditMode && orderData) {
      clearErrors()

      if (orderData.type) {
        setOrderType(orderData.type as 'PRODUCT' | 'SERVICE' | 'MIXED')
      }

      setValue('customerId', orderData.customer?.id || '')
      setValue('orderDate', new Date(orderData.orderDate))
      if (orderData.deliveredDate) {
        setValue('deliveredDate', new Date(orderData.deliveredDate))
      }
      setValue('status', orderData.status as any)
      setValue('payment', orderData.payment as any)

      if (orderData.taxPercentage !== undefined) {
        setTaxPercentage(orderData.taxPercentage)
      }

      if (
        (orderData.type === 'PRODUCT' || orderData.type === 'MIXED') &&
        orderData.items &&
        orderData.items.length > 0
      ) {
        const newItems = orderData.items.map((item: any) => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
          stock: item.warehouse?.stock || 0,
          warehouseId: item.warehouseId || '',
          warehouseName: item.warehouse?.name || 'Unknown Warehouse',
        }))
        setOrderItems(newItems)
      }

      if (
        (orderData.type === 'SERVICE' || orderData.type === 'MIXED') &&
        orderServicesData &&
        orderServicesData.length > 0
      ) {
        const newServices = orderServicesData.map((item: any) => ({
          serviceId: item.service.id,
          serviceName: item.service.name,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
        }))
        setServiceItems(newServices)
      }

      if (orderData.type === 'MIXED') {
        setShowProductSection(true)
        setShowServiceSection(true)
      } else if (orderData.type === 'PRODUCT') {
        setShowProductSection(true)
        setShowServiceSection(false)
      } else if (orderData.type === 'SERVICE') {
        setShowProductSection(false)
        setShowServiceSection(true)
      }

      setOrderDate(new Date(orderData.orderDate))
      if (orderData.deliveredDate) {
        setDeliveredDate(new Date(orderData.deliveredDate))
      }

      setPaymentStatus({
        value: orderData.payment,
        label: orderData.payment,
      })
      setOrderStatus({
        value: orderData.status,
        label: orderData.status,
      })
    }
  }, [isEditMode, orderData, orderServicesData])

  const onSubmit = (data: OrderFormData) => {
    if (orderItems.length === 0 && serviceItems.length === 0) {
      toast.error('Please add at least one product or service to the order')
      return
    }

    const productsTotal = orderItems.reduce((sum, item) => sum + item.total, 0)
    const servicesTotal = serviceItems.reduce(
      (sum, item) => sum + item.total,
      0
    )
    const calculatedSubtotal = productsTotal + servicesTotal
    const calculatedTax = calculatedSubtotal * (taxPercentage / 100)
    const calculatedTotal = calculatedSubtotal + calculatedTax

    const hasProducts = orderItems.length > 0
    const hasServices = serviceItems.length > 0

    if (orderType === 'PRODUCT' && hasServices && !hasProducts) {
      toast.error(
        'Cannot set order type to PRODUCT when only services exist. Please change to SERVICE or add products.'
      )
      return
    }

    if (orderType === 'SERVICE' && hasProducts && !hasServices) {
      toast.error(
        'Cannot set order type to SERVICE when only products exist. Please change to PRODUCT or add services.'
      )
      return
    }

    if (orderType === 'PRODUCT' && hasServices) {
      toast.error(
        'Cannot set order type to PRODUCT when services exist. Please remove services or change to MIXED.'
      )
      return
    }

    if (orderType === 'SERVICE' && hasProducts) {
      toast.error(
        'Cannot set order type to SERVICE when products exist. Please remove products or change to MIXED.'
      )
      return
    }

    if (orderType === 'MIXED' && (!hasProducts || !hasServices)) {
      toast.error(
        'MIXED order type requires both products and services. Please add both or change to PRODUCT/SERVICE.'
      )
      return
    }

    if (isEditMode && orderId) {
      updateOrder.mutate({
        id: orderId,
        customerId: data.customerId,
        orderDate: data.orderDate,
        deliveredDate: data.deliveredDate || undefined,
        status: data.status as any,
        payment: data.payment,
        type: orderType as 'PRODUCT' | 'SERVICE' | 'MIXED',
        taxPercentage: taxPercentage,
        totalAmount: calculatedTotal,
      })
    } else {
      createOrder.mutate({
        projectId,
        customerId: data.customerId,

        orderDate: data.orderDate,
        deliveredDate: data.deliveredDate || undefined,
        status: data.status as any,
        payment: data.payment,
        taxPercentage: taxPercentage,
        totalAmount: calculatedTotal,
        items:
          orderItems.length > 0
            ? orderItems.map((item) => ({
                productId: item.productId,
                warehouseId: item.warehouseId,
                quantity: item.quantity,
                price: item.price,
              }))
            : undefined,
        services:
          serviceItems.length > 0
            ? serviceItems.map((item) => ({
                serviceId: item.serviceId,
                quantity: item.quantity,
                price: item.price,
              }))
            : undefined,
      })
    }
  }

  const handleProductSelect = (product: ProductData) => {
    setSelectedProduct(product)
    setSelectedWarehouse(null)
    setQuantity(1)
    setQuantityInput('1')
  }

  const handleAddProduct = () => {
    if (!selectedProduct) {
      toast.error('Please select a product')
      return
    }

    if (!selectedWarehouse) {
      toast.error('Please select a warehouse')
      return
    }

    if (quantity <= 0) {
      toast.error('Quantity must be greater than 0')
      return
    }

    const availableStock = getAvailableStock(
      selectedProduct.id,
      selectedWarehouse.warehouseId
    )

    if (quantity > availableStock) {
      toast.error(
        `Insufficient stock. Available: ${availableStock}, Requested: ${quantity}`
      )
      return
    }

    const remainingStock = availableStock - quantity
    if (remainingStock <= 5 && remainingStock > 0) {
      toast.warning(
        `Low stock warning: Only ${remainingStock} items will remain in ${selectedWarehouse.warehouseName}`
      )
    }

    const newItem = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantity,
      price: selectedProduct.price,
      total: quantity * selectedProduct.price,
      stock: selectedWarehouse.stock,
      warehouseId: selectedWarehouse.warehouseId,
      warehouseName: selectedWarehouse.warehouseName,
    }

    setOrderItems((prev) => [...prev, newItem])

    if (serviceItems.length > 0) {
      setShowProductSection(true)
      setShowServiceSection(true)
    }

    setSelectedProduct(null)
    setSelectedWarehouse(null)
    setQuantity(1)
    setQuantityInput('1')
  }

  const handleRemoveProduct = (index: number) => {
    setOrderItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleServiceSelect = (service: {
    id: string
    name: string
    price: number
  }) => {
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

    setServiceItems((prev) => [...prev, newItem])

    if (orderItems.length > 0) {
      setShowProductSection(true)
      setShowServiceSection(true)
    }

    setSelectedService(null)
    setQuantity(1)
    setQuantityInput('1')
  }

  const handleRemoveService = (index: number) => {
    setServiceItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleQtyChange = (delta: number) => {
    if (!selectedProduct || !selectedWarehouse) return

    const newQty = Math.max(1, quantity + delta)
    const validation = validateQuantity(
      newQty,
      selectedProduct.id,
      selectedWarehouse.warehouseId
    )

    if (validation.isValid) {
      setQuantity(newQty)
      setQuantityInput(newQty.toString())
    } else {
      if (delta > 0) {
        toast.error(validation.message)
      }
    }
  }

  const startContinuousChange = (delta: number) => {
    handleQtyChange(delta)

    const interval = setInterval(() => {
      handleQtyChange(delta)
    }, 150)

    if (delta > 0) {
      setIsHoldingPlus(true)

      window.plusInterval = interval
    } else {
      setIsHoldingMinus(true)

      window.minusInterval = interval
    }
  }

  const stopContinuousChange = () => {
    setIsHoldingPlus(false)
    setIsHoldingMinus(false)

    if (window.plusInterval) {
      clearInterval(window.plusInterval)

      window.plusInterval = null
    }
    if (window.minusInterval) {
      clearInterval(window.minusInterval)

      window.minusInterval = null
    }
  }

  const handleReset = useCallback(() => {
    reset({
      customerId: '',
      orderDate: new Date(),
      deliveredDate: undefined,
      status: 'NEW',
      payment: 'UNPAID',
    })
    setOrderItems([])
    setServiceItems([])
    setSelectedProduct(null)
    setSelectedService(null)
    setSelectedWarehouse(null)
    setQuantity(1)
    setQuantityInput('1')
    setTotalAmount(0)
    setOrderDate(null)
    setDeliveredDate(null)
    setPaymentStatus({ value: 'UNPAID', label: 'Unpaid' })
    setOrderStatus({ value: 'NEW', label: 'New' })
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

  const getAvailableStock = (productId: string, warehouseId: string) => {
    const product = productsData?.products.find((p) => p.id === productId)
    const warehouse = product?.warehouses.find(
      (w) => w.warehouseId === warehouseId
    )

    if (isEditMode) {
      return warehouse ? warehouse.stock : 0
    } else {
      const existingItemsForProduct = orderItems.filter(
        (item) =>
          item.productId === productId && item.warehouseId === warehouseId
      )

      const alreadyOrderedQuantity = existingItemsForProduct.reduce(
        (sum, item) => sum + item.quantity,
        0
      )

      return warehouse ? warehouse.stock - alreadyOrderedQuantity : 0
    }
  }

  const validateQuantity = (
    qty: number,
    productId: string,
    warehouseId: string
  ) => {
    const availableStock = getAvailableStock(productId, warehouseId)

    if (qty > availableStock) {
      return {
        isValid: false,
        message: `Maximum available: ${availableStock}`,
        availableStock,
      }
    }

    if (qty <= 0) {
      return {
        isValid: false,
        message: 'Quantity must be greater than 0',
        availableStock,
      }
    }

    return {
      isValid: true,
      message: '',
      availableStock,
    }
  }

  const handleQuantityInputChange = (value: string) => {
    setQuantityInput(value)

    if (value === '') {
      setQuantity(1)
    } else {
      const numValue = parseInt(value)
      if (!isNaN(numValue) && numValue > 0) {
        if (!selectedProduct || !selectedWarehouse) {
          setQuantity(numValue)
        } else {
          const validation = validateQuantity(
            numValue,
            selectedProduct.id,
            selectedWarehouse.warehouseId
          )
          if (validation.isValid) {
            setQuantity(numValue)
          } else {
            toast.error(validation.message)
          }
        }
      }
    }
  }

  const handleWarehouseSelect = (warehouse: {
    warehouseId: string
    warehouseName: string
    stock: number
  }) => {
    setSelectedWarehouse(warehouse)

    if (selectedProduct) {
      const availableStock = getAvailableStock(
        selectedProduct.id,
        warehouse.warehouseId
      )

      const newQuantity = Math.min(1, availableStock)
      setQuantity(newQuantity)
      setQuantityInput(newQuantity.toString())

      if (availableStock <= 5 && availableStock > 0) {
        toast.warning(
          `Low stock: Only ${availableStock} items available in ${warehouse.warehouseName}`
        )
      }
    } else {
      setQuantity(1)
      setQuantityInput('1')
    }
  }

  return (
    <React.Fragment>
      <ToastContainer />
      <BreadCrumb
        title={isEditMode ? 'Edit Order' : 'Create Order'}
        subTitle="Orders"
      />

      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h6 className="card-title">
              {isEditMode ? 'Edit Order' : 'Create New Order'}
            </h6>
            <div className="flex items-center gap-2">
              <Link href="/apps/orders/list" className="btn btn-sub-gray">
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

                  {/* Status */}
                  <div className="col-span-6">
                    <label className="form-label">Status</label>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <Select
                          classNamePrefix="select"
                          options={
                            isEditMode
                              ? statusOptionsForEdit
                              : statusOptionsForCreate
                          }
                          value={orderStatus}
                          onChange={(selected) => {
                            setOrderStatus(selected)
                            field.onChange(selected?.value || 'NEW')
                          }}
                          placeholder="Select status"
                        />
                      )}
                    />
                    {errors.status && (
                      <span className="text-red-500 text-sm">
                        {errors.status.message}
                      </span>
                    )}
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

                  {/* Order Type */}
                  <div className="col-span-6">
                    <label className="form-label">Order Type</label>
                    <Select
                      classNamePrefix="select"
                      options={[
                        { value: 'PRODUCT', label: 'Product Order' },
                        { value: 'SERVICE', label: 'Service Order' },
                        {
                          value: 'MIXED',
                          label: 'Mixed Order (Products + Services)',
                        },
                      ]}
                      value={{
                        value: orderType,
                        label:
                          orderType === 'PRODUCT'
                            ? 'Product Order'
                            : orderType === 'SERVICE'
                              ? 'Service Order'
                              : 'Mixed Order (Products + Services)',
                      }}
                      onChange={(selected) => {
                        if (selected?.value) {
                          const newType = selected.value as
                            | 'PRODUCT'
                            | 'SERVICE'
                            | 'MIXED'
                          setOrderType(newType)

                          if (newType === 'PRODUCT') {
                            setShowProductSection(true)
                            setShowServiceSection(false)
                          } else if (newType === 'SERVICE') {
                            setShowServiceSection(true)
                            setShowProductSection(false)
                          } else if (newType === 'MIXED') {
                            setShowProductSection(true)
                            setShowServiceSection(true)
                          }

                          setSelectedProduct(null)
                          setSelectedService(null)
                          setSelectedWarehouse(null)
                          setQuantity(1)
                          setQuantityInput('1')
                        }
                      }}
                      placeholder="Select order type"
                    />
                  </div>

                  {/* Tax Percentage Input */}
                  <div className="col-span-4">
                    <label className="form-label">Tax (%)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={taxPercentage}
                      onWheel={(e) => e.currentTarget.blur()}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        setTaxPercentage(Math.min(Math.max(value, 0), 100))
                      }}
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="0"
                    />
                    <span className="text-xs text-gray-500 mt-1">
                      Tax will be calculated on subtotal
                    </span>
                  </div>
                </div>
              </div>

              {/* Product Selection */}
              {showProductSection && (
                <div className="col-span-12">
                  <h6 className="mb-4">Add Products</h6>
                  <div className="grid grid-cols-12 gap-3">
                    {/* Product Selection */}
                    <div className="col-span-4">
                      <label className="form-label">Product</label>
                      <Select
                        classNamePrefix="select"
                        options={
                          productsData?.products.map((product) => ({
                            value: product.id,
                            label: `${product.name} - $${product.price}`,
                            data: {
                              id: product.id,
                              name: product.name,
                              price: product.price,
                              stock: product.warehouses.reduce(
                                (sum, w) => sum + w.stock,
                                0
                              ),
                              warehouses: product.warehouses.map((w) => ({
                                warehouseId: w.warehouseId,
                                warehouseName:
                                  w.warehouse?.name || 'Unknown Warehouse',
                                stock: w.stock,
                              })),
                            } as ProductData,
                          })) || []
                        }
                        value={
                          selectedProduct
                            ? {
                                value: selectedProduct.id,
                                label: `${selectedProduct.name} - $${selectedProduct.price}`,
                                data: selectedProduct,
                              }
                            : null
                        }
                        onChange={(selected) => {
                          if (selected?.data) {
                            handleProductSelect(selected.data)
                          }
                        }}
                        placeholder="Select product"
                      />
                    </div>

                    {/* Warehouse Selection */}
                    <div className="col-span-3">
                      <label className="form-label">Warehouse</label>
                      <Select
                        classNamePrefix="select"
                        options={
                          selectedProduct?.warehouses.map((warehouse) => ({
                            value: warehouse.warehouseId,
                            label: `${warehouse.warehouseName} (${getAvailableStock(
                              selectedProduct.id,
                              warehouse.warehouseId
                            )})`,
                            data: warehouse,
                          })) || []
                        }
                        value={
                          selectedWarehouse
                            ? {
                                value: selectedWarehouse.warehouseId,
                                label: `${selectedWarehouse.warehouseName} (${getAvailableStock(
                                  selectedProduct?.id || '',
                                  selectedWarehouse.warehouseId
                                )})`,
                                data: selectedWarehouse,
                              }
                            : null
                        }
                        onChange={(selected) => {
                          if (selected?.data) {
                            handleWarehouseSelect(selected.data)
                          }
                        }}
                        placeholder="Select warehouse"
                        isDisabled={!selectedProduct}
                      />
                    </div>

                    {/* Quantity Controls */}
                    <div className="col-span-2">
                      <label className="form-label">Quantity</label>
                      <div className="flex items-center">
                        <button
                          type="button"
                          className="btn btn-sm btn-secondary hidden"
                          onMouseDown={(e) => {
                            e.preventDefault()
                            startContinuousChange(-1)
                          }}
                          onMouseUp={stopContinuousChange}
                          onMouseLeave={stopContinuousChange}
                          onTouchStart={(e) => {
                            e.preventDefault()
                            startContinuousChange(-1)
                          }}
                          onTouchEnd={stopContinuousChange}>
                          <Minus className="size-3" />
                        </button>
                        <input
                          type="number"
                          className="form-input text-center w-20"
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
                          onKeyDown={(e) => {
                            if (
                              [46, 8, 9, 27, 13].indexOf(e.keyCode) !== -1 ||
                              (e.keyCode === 65 && e.ctrlKey === true) ||
                              (e.keyCode === 67 && e.ctrlKey === true) ||
                              (e.keyCode === 86 && e.ctrlKey === true) ||
                              (e.keyCode === 88 && e.ctrlKey === true) ||
                              (e.keyCode >= 35 && e.keyCode <= 39)
                            ) {
                              return
                            }
                            if (
                              (e.shiftKey ||
                                e.keyCode < 48 ||
                                e.keyCode > 57) &&
                              (e.keyCode < 96 || e.keyCode > 105)
                            ) {
                              e.preventDefault()
                            }
                          }}
                          min="1"
                          max={
                            selectedWarehouse
                              ? getAvailableStock(
                                  selectedProduct?.id || '',
                                  selectedWarehouse.warehouseId
                                )
                              : 1
                          }
                          step="1"
                        />
                        <button
                          type="button"
                          className="btn btn-sm btn-secondary hidden"
                          onMouseDown={(e) => {
                            e.preventDefault()
                            startContinuousChange(1)
                          }}
                          onMouseUp={stopContinuousChange}
                          onMouseLeave={stopContinuousChange}
                          onTouchStart={(e) => {
                            e.preventDefault()
                            startContinuousChange(1)
                          }}
                          onTouchEnd={stopContinuousChange}>
                          <Plus className="size-3" />
                        </button>
                      </div>
                    </div>

                    {/* Stock Display */}
                    <div className="col-span-2 flex items-end">
                      <span className="text-sm text-gray-600">
                        Stock:{' '}
                        {selectedWarehouse
                          ? getAvailableStock(
                              selectedProduct?.id || '',
                              selectedWarehouse.warehouseId
                            )
                          : 0}
                        {selectedWarehouse && selectedProduct && (
                          <span className="text-xs text-gray-400 ml-1">
                            (Total: {selectedWarehouse.stock})
                          </span>
                        )}
                      </span>
                    </div>

                    {/* Add Button */}
                    <div className="col-span-1 flex items-end">
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={handleAddProduct}>
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Service Selection */}
              {showServiceSection && (
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
                            label: `${service.name} - $${service.price ?? 0}`,
                            data: {
                              id: service.id,
                              name: service.name,
                              price: service.price ?? 0,
                            },
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
              )}

              {/* Unified Order Items Table (Products + Services) */}
              {(orderItems.length > 0 || serviceItems.length > 0) && (
                <div className="col-span-12">
                  <h6 className="mb-4">
                    Order Items
                    {orderItems.length > 0 && serviceItems.length > 0 && (
                      <span className="ml-2 badge badge-green">
                        Mixed Order
                      </span>
                    )}
                  </h6>
                  <div className="overflow-x-auto">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Item Name</th>
                          <th>Type</th>
                          <th>Warehouse</th>
                          <th>Quantity</th>
                          <th>Price</th>
                          <th>Total</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderItems.map((item, index) => (
                          <tr key={`product-${index}`}>
                            <td>{item.productName}</td>
                            <td>
                              <span className="badge badge-blue">Product</span>
                            </td>
                            <td>{item.warehouseName}</td>
                            <td>{item.quantity}</td>
                            <td>${item.price.toFixed(2)}</td>
                            <td>${item.total.toFixed(2)}</td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-sm btn-red"
                                onClick={() => handleRemoveProduct(index)}>
                                <Trash className="size-3" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {serviceItems.map((item, index) => (
                          <tr key={`service-${index}`}>
                            <td>{item.serviceName}</td>
                            <td>
                              <span className="badge badge-purple">
                                Service
                              </span>
                            </td>
                            <td className="text-gray-400 italic">None</td>
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
                          <td colSpan={5} className="text-right">
                            Subtotal:
                          </td>
                          <td className="font-medium">
                            ${subtotalAmount.toFixed(2)}
                          </td>
                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan={5} className="text-right">
                            Tax ({taxPercentage}%):
                          </td>
                          <td className="font-medium">
                            ${taxAmount.toFixed(2)}
                          </td>
                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan={5} className="text-right font-bold">
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
        title="Delete Order"
        message="Are you sure you want to delete this order? This action cannot be undone."
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
