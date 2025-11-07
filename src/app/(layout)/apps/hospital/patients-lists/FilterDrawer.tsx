'use client'

import React, { useState } from 'react'

import { Drawer } from '@src/components/custom/drawer/drawer'
import { OptionType } from '@src/data/Projects/project'
import {
  FilterDrawerProps,
  cityOptions,
  doctorsOptions,
  genderOptions,
  insuranceOptions,
  statusOptions,
} from '@src/data/hospital/patients'
import { MoveLeft, MoveRight, Search, X } from 'lucide-react'
import Select from 'react-select'

const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isDrawerOpen,
  closeDrawer,
  onFilterChange,
}) => {
  const [selectedDoctors, setSelectedDoctors] = useState<OptionType | null>(
    null
  )
  const [selectedStatus, setSelectedStatus] = useState<OptionType | null>(null)
  const [insuranceType, setInsuranceType] = useState<OptionType | null>(null)
  const [selectedCity, setSelectedCity] = useState<OptionType | null>(null)
  const [selectedGender, setSelectedGender] = useState<OptionType | null>(null)

  const handleApplyFilters = () => {
    onFilterChange({
      doctor: selectedDoctors?.value,
      status: selectedStatus?.value,
      insurance: insuranceType?.value,
      city: selectedCity?.value,
      gender: selectedGender?.value,
    })
    closeDrawer()
  }

  return (
    <Drawer
      isOpen={isDrawerOpen}
      onClose={closeDrawer}
      position="right"
      title="Patients Filters"
      content={
        <>
          <div className="drawer">
            <div className="drawer-header">
              <h6>Patients Filters</h6>
              <button data-drawer-close="basicEnd">
                <X className="link link-red" onClick={closeDrawer}></X>
              </button>
            </div>
            <div className="drawer-content">
              <div className="relative mb-5 group/form">
                <input
                  type="text"
                  className="ltr:pl-9 rtl:pr-9 form-input"
                  placeholder="Search for patients..."
                  x-model="searchQuery"
                />
                <div className="absolute inset-y-0 flex items-center text-gray-500 dark:text-dark-500 ltr:left-3 rtl:right-3 focus:outline-hidden">
                  <Search className="size-4" />
                </div>
              </div>
              <div className="mb-5">
                <label>Doctor</label>
                <div className="mt-2">
                  <Select
                    classNamePrefix="select"
                    value={selectedDoctors}
                    onChange={setSelectedDoctors}
                    options={doctorsOptions}
                    placeholder="Select Doctor"
                  />
                </div>
              </div>
              <div className="mb-5">
                <label>Status</label>
                <div className="mt-2"></div>
                <Select
                  classNamePrefix="select"
                  value={selectedStatus}
                  onChange={setSelectedStatus}
                  options={statusOptions}
                  placeholder="Select Status"
                />
              </div>
              <div className="mb-5">
                <label>Insurance</label>
                <div className="mt-2"></div>
                <Select
                  classNamePrefix="select"
                  value={insuranceType}
                  onChange={setInsuranceType}
                  options={insuranceOptions}
                  placeholder="Select Insurance"
                />
              </div>
              <div className="mb-5">
                <label>City</label>
                <div className="mt-2">
                  <Select
                    classNamePrefix="select"
                    value={selectedCity}
                    onChange={setSelectedCity}
                    options={cityOptions}
                    placeholder="Select City"
                  />
                </div>
              </div>
              <div className="mb-5">
                <label>Gender</label>
                <div className="mt-2">
                  <Select
                    classNamePrefix="select"
                    value={selectedGender}
                    onChange={setSelectedGender}
                    options={genderOptions}
                    placeholder="Select Gender"
                  />
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between gap-2 p-4 border-t border-gray-200 dark:border-dark-800">
                <button
                  type="button"
                  className="btn btn-sub-gray"
                  onClick={() => {
                    setSelectedDoctors(null)
                    setSelectedStatus(null)
                    setInsuranceType(null)
                    setSelectedCity(null)
                    setSelectedGender(null)
                  }}>
                  Reset
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  data-drawer-close="filterSidebar"
                  onClick={handleApplyFilters}>
                  Filters
                  <MoveRight className="ml-1 ltr:inline-block rtl:hidden size-4" />
                  <MoveLeft className="mr-1 ltr:hidden rtl:inline-block size-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      }
      footer={<></>}
    />
  )
}

export default FilterDrawer
