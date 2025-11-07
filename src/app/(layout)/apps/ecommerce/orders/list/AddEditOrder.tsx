'use client'

import React, { useCallback, useEffect, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '@src/components/custom/modal/modal'
import {
  OptionType,
  paymentNameOptions,
  paymentOptions,
  statusOptions,
} from '@src/data/ecommerce/order-list'
import { RootState } from '@src/slices/reducer'
import { api } from '@src/trpc/react'
import { Minus, Plus, Trash } from 'lucide-react'
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
  status: z.enum(['NEW', 'DELIVERED', 'PENDING', 'SHIPPING']),
  payment: z.enum(['PAID', 'UNPAID', 'COD']),
})

type OrderFormData = z.infer<typeof orderFormSchema>

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

const AddEditOrder = ({
  modalState,
  closeModal,
  orders,
  editMode,
  currentOrderList,
}: {
  modalState: { showEditOrderForm: boolean; showAddOrderForm: boolean }
  closeModal: (formType: string) => void
  orders: any[]
  editMode?: boolean
  currentOrderList?: any
}) => {
  const { data: session } = useSession()

  const currentProject = useSelector(
    (state: RootState) => state.Project.currentProject
  )
  const projectId = currentProject?.id || ''

  const utils = api.useUtils()

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
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(
    null
  )
  const [quantity, setQuantity] = useState(1)
  const [totalAmount, setTotalAmount] = useState(0)
  const [orderDate, setOrderDate] = useState<Date | null>(null)
  const [deliveredDate, setDeliveredDate] = useState<Date | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<OptionType | null>(null)
  const [orderStatus, setOrderStatus] = useState<OptionType | null>(null)
  const [selectedWarehouse, setSelectedWarehouse] = useState<{
    warehouseId: string
    warehouseName: string
    stock: number
  } | null>(null)

  const { data: customersData } = api.projectCustomer.getAll.useQuery(
    { projectId, page: 1, limit: 100 },
    { enabled: !!projectId }
  )

  const { data: productsData } = api.projectProduct.getAll.useQuery(
    { projectId, page: 1, limit: 100 },
    { enabled: !!projectId }
  )

  const createOrder = api.projectOrders.create.useMutation({
    onSuccess: async (newOrder) => {
      if (!newOrder) return

      for (const item of orderItems) {
        await createOrderItem.mutateAsync({
          orderId: newOrder.id,
          productId: item.productId,
          warehouseId: item.warehouseId,
          quantity: item.quantity,
          price: item.price,
        })
      }

      toast.success('Order created successfully')
      utils.projectOrders.getAll.invalidate({ projectId })
      handleCloseModal()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const updateOrder = api.projectOrders.update.useMutation({
    onSuccess: async (updatedOrder) => {
      if (currentOrderList?.items) {
        for (const item of currentOrderList.items) {
          await deleteOrderItem.mutateAsync({ id: item.id })
        }
      }

      for (const item of orderItems) {
        await createOrderItem.mutateAsync({
          orderId: updatedOrder.id,
          productId: item.productId,
          warehouseId: item.warehouseId,
          quantity: item.quantity,
          price: item.price,
        })
      }

      toast.success('Order updated successfully')
      utils.projectOrders.getAll.invalidate({ projectId })
      handleCloseModal()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const createOrderItem = api.projectOrdersItems.create.useMutation()
  const deleteOrderItem = api.projectOrdersItems.delete.useMutation()

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    mode: 'onChange',
    defaultValues: {
      customerId: '',
      orderDate: new Date(),
      deliveredDate: undefined,
      status: 'NEW',
      payment: 'UNPAID',
    },
  })

  useEffect(() => {
    const total = orderItems.reduce((sum, item) => sum + item.total, 0)
    setTotalAmount(total)
  }, [orderItems])

  const submitForm = (data: OrderFormData) => {
    if (orderItems.length === 0) {
      toast.error('Please add at least one product to the order')
      return
    }

    if (editMode && currentOrderList) {
      updateOrder.mutate({
        id: currentOrderList.id,
        customerId: data.customerId,
        orderDate: data.orderDate,
        deliveredDate: data.deliveredDate,
        status: data.status,
        payment: data.payment,
      })
    } else {
      createOrder.mutate({
        projectId,
        customerId: data.customerId,
        orderDate: data.orderDate,
        deliveredDate: data.deliveredDate,
        status: data.status,
        payment: data.payment,
      })
    }
  }

  const handleProductSelect = (product: ProductData) => {
    setSelectedProduct(product)
    setQuantity(1)
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

    if (quantity > selectedWarehouse.stock) {
      toast.error(
        `Only ${selectedWarehouse.stock} items available in this warehouse`
      )
      return
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
    setSelectedProduct(null)
    setSelectedWarehouse(null)
    setQuantity(1)
  }

  const handleRemoveProduct = (index: number) => {
    setOrderItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleQtyChange = (delta: number) => {
    setQuantity((prevQty) => Math.max(1, prevQty + delta))
  }

  const handlePaymentStatusChange = (
    selected: OptionType | null,
    onChange: (value: OptionType | null) => void
  ) => {
    setPaymentStatus(selected)
    onChange(selected)
  }

  const handleOrderStatusChange = (
    selected: OptionType | null,
    onChange: (value: OptionType | null) => void
  ) => {
    setOrderStatus(selected)
    onChange(selected)
  }

  const resetForm = useCallback(() => {
    reset({
      customerId: '',
      orderDate: new Date(),
      deliveredDate: undefined,
      status: 'NEW',
      payment: 'UNPAID',
    })
    setOrderItems([])
    setSelectedProduct(null)
    setQuantity(1)
    setTotalAmount(0)
    setOrderDate(null)
    setDeliveredDate(null)
    setPaymentStatus(null)
    setOrderStatus(null)
    clearErrors()
  }, [reset, clearErrors])

  useEffect(() => {
    if (editMode && currentOrderList) {
      clearErrors()

      setValue('customerId', currentOrderList.customer.id)
      setValue('orderDate', new Date(currentOrderList.orderDate))
      if (currentOrderList.deliveredDate) {
        setValue('deliveredDate', new Date(currentOrderList.deliveredDate))
      }
      setValue('status', currentOrderList.status)
      setValue('payment', currentOrderList.payment)

      setOrderItems(
        currentOrderList.items.map((item: any) => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
          stock: 0,
          warehouseId: item.warehouseId,
          warehouseName: item.warehouseName,
        }))
      )

      setOrderDate(new Date(currentOrderList.orderDate))
      if (currentOrderList.deliveredDate) {
        setDeliveredDate(new Date(currentOrderList.deliveredDate))
      }

      setPaymentStatus({
        value: currentOrderList.payment,
        label: currentOrderList.payment,
      })
      setOrderStatus({
        value: currentOrderList.status,
        label: currentOrderList.status,
      })
    } else {
      resetForm()
    }
  }, [editMode, currentOrderList, setValue, reset, clearErrors, resetForm])

  const handleCloseModal = () => {
    closeModal(editMode ? 'showEditOrderForm' : 'showAddOrderForm')
    resetForm()
  }

  const formatDate = (date: Date) => {
    const day = date.getDate()
    const month = date.toLocaleString('default', { month: 'short' })
    const year = date.getFullYear()
    return `${day} ${month}, ${year}`
  }

  return (
    <React.Fragment>
      <Modal
        isOpen={
          modalState &&
          (editMode == true
            ? modalState.showEditOrderForm
            : modalState.showAddOrderForm)
        }
        onClose={() => handleCloseModal()}
        position="modal-center"
        title={editMode ? 'Edit Order' : 'Add Order'}
        id={editMode ? 'showEditOrderForm' : 'showAddOrderForm'}
        contentClass="modal-content"
        content={(onClose) => (
          <>
            <form onSubmit={handleSubmit(submitForm)}>
              <div className="grid grid-cols-12 gap-5">
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
                        isDisabled={editMode}
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
                        options={statusOptions}
                        value={orderStatus}
                        onChange={(selected) => {
                          field.onChange(selected?.value || 'NEW')
                          handleOrderStatusChange(selected, () => {})
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
                          field.onChange(selected?.value || 'UNPAID')
                          handlePaymentStatusChange(selected, () => {})
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

                <div className="col-span-12">
                  <h6 className="mb-3">Add Products</h6>
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-6">
                      <Select
                        classNamePrefix="select"
                        options={
                          productsData?.products.map((product) => ({
                            value: product.id,
                            label: `${product.name} - $${product.price}`,
                            data: {
                              id: product.id,
                              name: product.name,
                              price: product.price || 0,
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
                    <div className="col-span-6">
                      <Select
                        classNamePrefix="select"
                        options={
                          selectedProduct?.warehouses.map((warehouse) => ({
                            value: warehouse.warehouseId,
                            label: `${warehouse.warehouseName} - Stock: ${warehouse.stock}`,
                            data: warehouse,
                          })) || []
                        }
                        value={
                          selectedWarehouse
                            ? {
                                value: selectedWarehouse.warehouseId,
                                label: `${selectedWarehouse.warehouseName} - Stock: ${selectedWarehouse.stock}`,
                                data: selectedWarehouse,
                              }
                            : null
                        }
                        onChange={(selected) => {
                          if (selected?.data) {
                            setSelectedWarehouse(selected.data)
                          }
                        }}
                        placeholder="Select warehouse"
                        isDisabled={!selectedProduct}
                      />
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleQtyChange(-1)}>
                          <Minus className="size-3" />
                        </button>
                        <input
                          type="number"
                          className="form-input text-center"
                          value={quantity}
                          onChange={(e) =>
                            setQuantity(parseInt(e.target.value) || 1)
                          }
                          min="1"
                        />
                        <button
                          type="button"
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleQtyChange(1)}>
                          <Plus className="size-3" />
                        </button>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm text-gray-600">
                        Stock: {selectedWarehouse ? selectedWarehouse.stock : 0}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={handleAddProduct}>
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {orderItems.length > 0 && (
                  <div className="col-span-12">
                    <h6 className="mb-3">Order Items</h6>
                    <div className="overflow-x-auto">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Total</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orderItems.map((item, index) => (
                            <tr key={index}>
                              <td>{item.productName}</td>
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
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan={3} className="text-right font-bold">
                              Total:
                            </td>
                            <td className="font-bold">
                              ${totalAmount.toFixed(2)}
                            </td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                <div className="col-span-12 flex justify-end gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseModal}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={createOrder.isPending || updateOrder.isPending}>
                    {createOrder.isPending || updateOrder.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {editMode ? 'Updating...' : 'Creating...'}
                      </div>
                    ) : editMode ? (
                      'Update Order'
                    ) : (
                      'Create Order'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </>
        )}
      />
    </React.Fragment>
  )
}

export default AddEditOrder
