'use client'

import React from 'react'

import { EmployeeFormData } from '@src/app/(layout)/apps/rrhh/rrhh-admission/page'
import { MoveLeft } from 'lucide-react'
import { useFormContext } from 'react-hook-form'

interface ApplicationOverviewTabProps {
  onPreviousTab: () => void
  onSubmit: () => void
  isLoading?: boolean
}

const ApplicationOverviewTab: React.FC<ApplicationOverviewTabProps> = ({
  onPreviousTab,
  onSubmit,
  isLoading,
}) => {
  const { watch } = useFormContext<EmployeeFormData>()

  const formData = watch()

  return (
    <React.Fragment>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }}>
        <h6 className="mb-3">Application Overview</h6>
        <p className="mb-4 text-gray-500 dark:text-dark-500">
          Review all information before submitting
        </p>

        {/* Personal Details Summary */}
        <div className="mb-6">
          <h6 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Personal Details
          </h6>
          <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 rounded-lg dark:bg-dark-850">
            <div className="col-span-12 sm:col-span-6 md:col-span-4">
              <p className="text-xs text-gray-500 dark:text-dark-500">
                Employee ID
              </p>
              <p className="font-medium">{formData.employeeId || '-'}</p>
            </div>
            <div className="col-span-12 sm:col-span-6 md:col-span-4">
              <p className="text-xs text-gray-500 dark:text-dark-500">
                Full Name
              </p>
              <p className="font-medium">
                {formData.firstName} {formData.middleName}{' '}
                {formData.lastName}
              </p>
            </div>
            <div className="col-span-12 sm:col-span-6 md:col-span-4">
              <p className="text-xs text-gray-500 dark:text-dark-500">Gender</p>
              <p className="font-medium">{formData.gender || '-'}</p>
            </div>
            <div className="col-span-12 sm:col-span-6 md:col-span-4">
              <p className="text-xs text-gray-500 dark:text-dark-500">
                Date of Birth
              </p>
              <p className="font-medium">{formData.birthDate || '-'}</p>
            </div>
            <div className="col-span-12 sm:col-span-6 md:col-span-4">
              <p className="text-xs text-gray-500 dark:text-dark-500">Age</p>
              <p className="font-medium">{formData.age || '-'}</p>
            </div>
            <div className="col-span-12 sm:col-span-6 md:col-span-4">
              <p className="text-xs text-gray-500 dark:text-dark-500">Phone</p>
              <p className="font-medium">{formData.phone || '-'}</p>
            </div>
            <div className="col-span-12 sm:col-span-6 md:col-span-4">
              <p className="text-xs text-gray-500 dark:text-dark-500">Email</p>
              <p className="font-medium">{formData.email || '-'}</p>
            </div>
            <div className="col-span-12 sm:col-span-6 md:col-span-4">
              <p className="text-xs text-gray-500 dark:text-dark-500">
                Roll No
              </p>
              <p className="font-medium">{formData.rollNo || '-'}</p>
            </div>
            <div className="col-span-12 sm:col-span-6 md:col-span-4">
              <p className="text-xs text-gray-500 dark:text-dark-500">Class</p>
              <p className="font-medium">{formData.class || '-'}</p>
            </div>
            <div className="col-span-12">
              <p className="text-xs text-gray-500 dark:text-dark-500">
                Address
              </p>
              <p className="font-medium">
                {formData.address || '-'}
                {formData.city && `, ${formData.city}`}
                {formData.country && `, ${formData.country}`}
                {formData.pinCode && ` - ${formData.pinCode}`}
              </p>
            </div>
          </div>
        </div>

        {/* Educational Background Summary */}
        {(formData.religion ||
          formData.fatherName ||
          formData.motherName ||
          formData.fatherOccupation ||
          formData.parentsPhone) && (
          <div className="mb-6">
            <h6 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
              Educational Background
            </h6>
            <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 rounded-lg dark:bg-dark-850">
              {formData.religion && (
                <div className="col-span-12 sm:col-span-6 md:col-span-4">
                  <p className="text-xs text-gray-500 dark:text-dark-500">
                    Religion
                  </p>
                  <p className="font-medium">{formData.religion}</p>
                </div>
              )}
              {formData.fatherName && (
                <div className="col-span-12 sm:col-span-6 md:col-span-4">
                  <p className="text-xs text-gray-500 dark:text-dark-500">
                    Father Name
                  </p>
                  <p className="font-medium">{formData.fatherName}</p>
                </div>
              )}
              {formData.motherName && (
                <div className="col-span-12 sm:col-span-6 md:col-span-4">
                  <p className="text-xs text-gray-500 dark:text-dark-500">
                    Mother Name
                  </p>
                  <p className="font-medium">{formData.motherName}</p>
                </div>
              )}
              {formData.fatherOccupation && (
                <div className="col-span-12 sm:col-span-6 md:col-span-4">
                  <p className="text-xs text-gray-500 dark:text-dark-500">
                    Father Occupation
                  </p>
                  <p className="font-medium">{formData.fatherOccupation}</p>
                </div>
              )}
              {formData.parentsPhone && (
                <div className="col-span-12 sm:col-span-6 md:col-span-4">
                  <p className="text-xs text-gray-500 dark:text-dark-500">
                    Parents Phone
                  </p>
                  <p className="font-medium">{formData.parentsPhone}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 mt-5 ltr:justify-end rtl:justify-start">
          <button
            type="button"
            className="btn btn-sub-gray"
            onClick={onPreviousTab}>
            <MoveLeft className="mr-1 ltr:inline-block rtl:hidden size-4" />
            Previous
          </button>
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Submit Form'}
          </button>
        </div>
      </form>
    </React.Fragment>
  )
}

export default ApplicationOverviewTab
