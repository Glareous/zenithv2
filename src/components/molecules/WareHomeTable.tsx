import React, { useCallback, useEffect, useState } from 'react'

import { api } from '@src/trpc/react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'

type WarehouseStockData = {
  id: string
  warehouseId: string
  name: string
  isDefault: boolean
  stock: number
  minQuantity: number
}

interface WareHomeTableProps {
  onWarehouseDataChange: (data: WarehouseStockData[]) => void
  initialData?: WarehouseStockData[]
  projectId: string
  disabled?: boolean
}

const WareHomeTable: React.FC<WareHomeTableProps> = ({
  onWarehouseDataChange,
  initialData = [],
  projectId,
  disabled = false,
}) => {
  const { data: session } = useSession()
  const [warehouseData, setWarehouseData] = useState<WarehouseStockData[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const { data: warehouses, isLoading: loadingWarehouses } =
    api.projectProductWarehouse.getAll.useQuery(
      { projectId },
      { enabled: !!projectId }
    )

  const memoizedOnWarehouseDataChange = useCallback(onWarehouseDataChange, [
    onWarehouseDataChange,
  ])

  useEffect(() => {
    if (warehouses && warehouses.length > 0) {
      let initialWarehouseData: WarehouseStockData[]

      if (initialData && initialData.length > 0) {
        console.log('🔄 Updating table with initialData:', initialData)
        setWarehouseData(initialData)
        memoizedOnWarehouseDataChange(initialData)
      } else {
        if (warehouseData.length === 0) {
          const defaultWarehouse =
            warehouses.find((w) => w.isDefault) || warehouses[0]
          initialWarehouseData = [
            {
              id: defaultWarehouse.id,
              warehouseId: defaultWarehouse.warehouseId,
              name: defaultWarehouse.name,
              isDefault: defaultWarehouse.isDefault,
              stock: 0,
              minQuantity: 0,
            },
          ]

          setWarehouseData(initialWarehouseData)
          memoizedOnWarehouseDataChange(initialWarehouseData)
        }
      }
    }
  }, [
    warehouses,
    initialData,
    memoizedOnWarehouseDataChange,
    warehouseData.length,
  ])

  const validateStock = (value: number): number => {
    if (value < 0) return 0
    if (value > 999999) return 999999
    return value
  }

  const handleStockChange = useCallback(
    (warehouseId: string, newStock: number) => {
      const validatedStock = validateStock(newStock)

      const updatedData = warehouseData.map((warehouse) =>
        warehouse.id === warehouseId
          ? { ...warehouse, stock: validatedStock }
          : warehouse
      )

      setWarehouseData(updatedData)
      memoizedOnWarehouseDataChange(updatedData)

      if (newStock !== validatedStock) {
        toast.warning('Stock value adjusted to valid range (0-999,999)')
      }
    },
    [warehouseData, memoizedOnWarehouseDataChange]
  )

  const handleMinQuantityChange = useCallback(
    (warehouseId: string, newMinQuantity: number) => {
      const validatedMinQuantity = validateStock(newMinQuantity)

      const updatedData = warehouseData.map((warehouse) =>
        warehouse.id === warehouseId
          ? { ...warehouse, minQuantity: validatedMinQuantity }
          : warehouse
      )

      setWarehouseData(updatedData)
      memoizedOnWarehouseDataChange(updatedData)

      if (newMinQuantity !== validatedMinQuantity) {
        toast.warning('Minimum quantity adjusted to valid range (0-999,999)')
      }
    },
    [warehouseData, memoizedOnWarehouseDataChange]
  )

  const totalStock = warehouseData.reduce((sum, w) => sum + w.stock, 0)
  const totalMinQuantity = warehouseData.reduce(
    (sum, w) => sum + w.minQuantity,
    0
  )

  if (loadingWarehouses) {
    return (
      <div className="card">
        <div className="card-header">
          <h6 className="card-title">Warehouse Management</h6>
        </div>
        <div className="card-body">
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading warehouses...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-header">
        <h6 className="card-title">Warehouse Management</h6>
        <p className="text-sm text-gray-500">
          Manage stock and minimum quantities for each warehouse
        </p>
      </div>
      <div className="card-body">
        <div className="overflow-x-auto">
          <table className="table table-hover">
            <thead>
              <tr className="text-gray-500 bg-gray-100 dark:bg-dark-850 dark:text-dark-500">
                <th className="font-medium">Warehouse ID</th>
                <th className="font-medium">Warehouse Name</th>
                <th className="font-medium">Stock</th>
                <th className="font-medium">Min Quantity</th>
                <th className="font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {warehouseData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8">
                    <p className="text-gray-500">No warehouses available</p>
                  </td>
                </tr>
              ) : (
                warehouseData.map((warehouse) => {
                  const isLowStock =
                    warehouse.stock <= warehouse.minQuantity &&
                    warehouse.stock > 0
                  const isOutOfStock = warehouse.stock === 0

                  return (
                    <tr
                      key={warehouse.id}
                      className={`border-b border-gray-200 dark:border-dark-800 ${
                        isLowStock ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''
                      } ${isOutOfStock ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
                      <td className="py-3">
                        <span className="font-mono text-sm text-gray-600 dark:text-dark-400">
                          {warehouse.warehouseId}
                        </span>
                        {warehouse.isDefault && (
                          <span className="ml-2 text-xs text-gray-500">
                            (Default)
                          </span>
                        )}
                      </td>
                      <td className="py-3">
                        <span className="font-medium text-gray-800 dark:text-white">
                          {warehouse.name}
                        </span>
                      </td>
                      <td className="py-3">
                        <input
                          type="number"
                          min="0"
                          max="999999"
                          className={`form-input w-20 text-center ${
                            isLowStock ? 'border-yellow-500' : ''
                          } ${isOutOfStock ? 'border-red-500' : ''}`}
                          value={warehouse.stock}
                          onChange={(e) =>
                            handleStockChange(
                              warehouse.id,
                              parseInt(e.target.value) || 0
                            )
                          }
                          placeholder="0"
                          disabled={disabled}
                        />
                      </td>
                      <td className="py-3">
                        <input
                          type="number"
                          min="0"
                          max="999999"
                          className="form-input w-20 text-center"
                          value={warehouse.minQuantity}
                          onChange={(e) =>
                            handleMinQuantityChange(
                              warehouse.id,
                              parseInt(e.target.value) || 0
                            )
                          }
                          placeholder="0"
                          disabled={disabled}
                        />
                      </td>
                      <td className="py-3">
                        {isOutOfStock ? (
                          <span className="badge badge-red">Out of Stock</span>
                        ) : isLowStock ? (
                          <span className="badge badge-yellow">Low Stock</span>
                        ) : (
                          <span className="badge badge-green">In Stock</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {warehouseData.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-dark-850 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-dark-400">
                  Total Warehouses:
                </span>
                <span className="ml-2 font-medium">{warehouseData.length}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-dark-400">
                  Total Stock:
                </span>
                <span className="ml-2 font-medium">{totalStock}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-dark-400">
                  Min Quantity:
                </span>
                <span className="ml-2 font-medium">{totalMinQuantity}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-dark-400">
                  Available:
                </span>
                <span className="ml-2 font-medium">
                  {totalStock - totalMinQuantity}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default WareHomeTable
