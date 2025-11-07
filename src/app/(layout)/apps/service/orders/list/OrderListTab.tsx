'use client'

import React, { useMemo, useState } from 'react'

import Link from 'next/link'

import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
} from '@src/components/custom/dropdown/dropdown'
import { Filter, Plus, Trash } from 'lucide-react'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import Select from 'react-select'

type OptionType = {
  label: string
  value: string
}

const OrderListTab = ({
  activeTab,
  setActiveTab,
  deletedListData = [],
  handleRemoveSelectedRecords,
  onFilterChange,
}: {
  activeTab: string
  setActiveTab: (status: string) => void
  deletedListData: string[]
  handleRemoveSelectedRecords: () => void
  onFilterChange?: (filters: any) => void
}) => {
  const handleTabChange = (status: string) => {
    console.log('OrderListTab - Tab clicked:', status)
    setActiveTab(status)
  }

  // Estados para el filtro
  const [isPaidFilter, setIsPaidFilter] = useState(false)
  const [isUnpaidFilter, setIsUnpaidFilter] = useState(false)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])

  const handlePaidFilterChange = (e: {
    target: { checked: boolean | ((prevState: boolean) => boolean) }
  }) => {
    setIsPaidFilter(e.target.checked)
  }

  const handleUnpaidFilterChange = (e: {
    target: { checked: boolean | ((prevState: boolean) => boolean) }
  }) => {
    setIsUnpaidFilter(e.target.checked)
  }

  const handleApplyFilters = () => {
    console.log('Applying filters:', {
      isPaid: isPaidFilter,
      isUnpaid: isUnpaidFilter,
      priceRange,
      selectedStatuses,
    })

    const filters = {
      isPaid: isPaidFilter,
      isUnpaid: isUnpaidFilter,
      priceRange,
      selectedStatuses,
    }
    onFilterChange?.(filters)
  }

  const handleResetFilters = () => {
    console.log('Resetting filters')
    setIsPaidFilter(false)
    setIsUnpaidFilter(false)
    setPriceRange([0, 1000])
    setSelectedStatuses([])
    onFilterChange?.({
      isPaid: false,
      isUnpaid: false,
      priceRange: [0, 1000],
      selectedStatuses: [],
    })
  }

  const handleSliderChange = (value: number | number[]) => {
    if (Array.isArray(value) && value.length === 2) {
      setPriceRange([value[0], value[1]])
    }
  }

  const handleStatusSelect = (selectedOption: OptionType | null) => {
    console.log('Status selected:', selectedOption)
    if (selectedOption && selectedOption.value !== 'All') {
      setSelectedStatuses([selectedOption.value])
    } else {
      setSelectedStatuses([])
    }
  }

  // Opciones para el filtro de status - Sin SHIPPING para servicios
  const statusOptions = useMemo(() => {
    const options = [{ label: 'All Status', value: 'All' }]
    const statuses = ['NEW', 'PENDING', 'DELIVERED', 'CANCELLED']
    statuses.forEach((status) => {
      options.push({ label: status, value: status })
    })
    return options
  }, [])

  return (
    <div className="card-body">
      <div className="grid grid-cols-12">
        <div className="col-span-12 xl:col-span-10">
          <ul className="flex items-center gap-2 overflow-x-auto">
            {['All', 'NEW', 'PENDING', 'DELIVERED', 'CANCELLED'].map(
              (status) => (
                <li key={status}>
                  <Link
                    href="#!"
                    onClick={(e) => {
                      e.preventDefault()
                      handleTabChange(status)
                    }}
                    className={`whitespace-nowrap relative block px-4 py-2 font-medium text-center transition duration-200 ease-linear rounded-md text-gray-500 ${activeTab === status ? 'bg-gray-100 text-gray-900 dark:bg-dark-850 dark:text-dark-50' : 'hover:text-gray-900 dark:hover:text-dark-50'}`}>
                    <span className="align-middle">
                      {status === 'All'
                        ? 'All Orders'
                        : status === 'DELIVERED'
                          ? 'DONE'
                          : status}
                    </span>
                  </Link>
                </li>
              )
            )}
          </ul>
        </div>
        <div className="flex col-span-12 gap-3 mt-4 xl:mt-0 xl:justify-end xl:col-span-2">
          <Dropdown
            position="right"
            trigger="click"
            dropdownClassName="dropdown"
            closeOnOutsideClick={true}>
            <DropdownButton colorClass="btn btn-sub-gray flex items-center gap-2">
              <Filter className="align-center size-4" />
              Filters
            </DropdownButton>
            <DropdownMenu menuClass="!w-64 p-3">
              <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                <h6 className="mb-4">Filter Options</h6>

                <form onSubmit={(e) => e.preventDefault()}>
                  <h6 className="mb-2 text-sm">Payment Status</h6>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="input-check-group">
                      <input
                        id="paidCheckboxFilter"
                        className="input-check input-check-primary"
                        type="checkbox"
                        value="PAID"
                        checked={isPaidFilter}
                        onChange={handlePaidFilterChange}
                      />
                      <label
                        htmlFor="paidCheckboxFilter"
                        className="input-check-label">
                        Paid
                      </label>
                    </div>
                    <div className="input-check-group">
                      <input
                        id="unpaidCheckboxFilter"
                        className="input-check input-check-primary"
                        type="checkbox"
                        value="UNPAID"
                        checked={isUnpaidFilter}
                        onChange={handleUnpaidFilterChange}
                      />
                      <label
                        htmlFor="unpaidCheckboxFilter"
                        className="input-check-label">
                        Unpaid
                      </label>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="mb-3 form-label">
                      Total Amount Range
                    </label>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Min: ${priceRange[0].toLocaleString()}</span>
                        <span>Max: ${priceRange[1].toLocaleString()}</span>
                      </div>
                      <Slider
                        range
                        min={0}
                        max={1000}
                        value={priceRange}
                        onChange={handleSliderChange}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1 mt-5">
                    <button
                      type="reset"
                      className="btn-sm btn btn-outline-red"
                      onClick={handleResetFilters}>
                      Reset
                    </button>
                    <button
                      type="submit"
                      className="btn-sm btn btn-primary"
                      onClick={handleApplyFilters}>
                      Apply
                    </button>
                  </div>
                </form>
              </div>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
    </div>
  )
}

export default OrderListTab
