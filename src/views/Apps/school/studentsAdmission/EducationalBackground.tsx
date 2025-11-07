'use client'

import React from 'react'

import { EmployeeFormData } from '@src/app/(layout)/apps/rrhh/rrhh-admission/page'
import { MoveLeft, MoveRight } from 'lucide-react'
import { useFormContext } from 'react-hook-form'

interface EducationalBackgroundProps {
  onPreviousTab: () => void
  onNextTab: () => void
  isLoading?: boolean
}

const EducationalBackground: React.FC<EducationalBackgroundProps> = ({
  onPreviousTab,
  onNextTab,
  isLoading,
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<EmployeeFormData>()

  return (
    <React.Fragment>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onNextTab()
        }}>
        <h6 className="mb-3">Educational Background</h6>
        <div className="grid grid-cols-12 gap-space">
          <div className="col-span-12 sm:col-span-4">
            <label htmlFor="religionInput" className="form-label">
              Religion
            </label>
            <input
              type="text"
              id="religionInput"
              className="form-input"
              placeholder="Enter religion"
              {...register('religion')}
            />
            {errors.religion && (
              <span className="text-red-500">{errors.religion.message}</span>
            )}
          </div>
          <div className="col-span-12 sm:col-span-4">
            <label htmlFor="fatherNameInput" className="form-label">
              Father Name
            </label>
            <input
              type="text"
              id="fatherNameInput"
              className="form-input"
              placeholder="Enter father's name"
              {...register('fatherName')}
            />
            {errors.fatherName && (
              <span className="text-red-500">{errors.fatherName.message}</span>
            )}
          </div>
          <div className="col-span-12 sm:col-span-4">
            <label htmlFor="motherNameInput" className="form-label">
              Mother Name
            </label>
            <input
              type="text"
              id="motherNameInput"
              className="form-input"
              placeholder="Enter mother's name"
              {...register('motherName')}
            />
            {errors.motherName && (
              <span className="text-red-500">{errors.motherName.message}</span>
            )}
          </div>
          <div className="col-span-12 sm:col-span-6">
            <label htmlFor="fatherOccupationInput" className="form-label">
              Father Occupation
            </label>
            <input
              type="text"
              id="fatherOccupationInput"
              className="form-input"
              placeholder="Enter father's occupation"
              {...register('fatherOccupation')}
            />
            {errors.fatherOccupation && (
              <span className="text-red-500">
                {errors.fatherOccupation.message}
              </span>
            )}
          </div>
          <div className="col-span-12 sm:col-span-6">
            <label htmlFor="parentsPhoneInput" className="form-label">
              Parents Phone
            </label>
            <input
              type="text"
              id="parentsPhoneInput"
              className="form-input"
              placeholder="Enter parents phone number"
              {...register('parentsPhone')}
            />
            {errors.parentsPhone && (
              <span className="text-red-500">
                {errors.parentsPhone.message}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 mt-5">
          <button
            type="button"
            className="btn btn-sub-gray"
            onClick={onPreviousTab}>
            <MoveLeft className="mr-1 ltr:inline-block rtl:hidden size-4" />
            <MoveRight className="ml-1 ltr:hidden rtl:inline-block size-4" />
            Previous
          </button>
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save to Next'}
            <MoveRight className="ml-1 ltr:inline-block rtl:hidden size-4" />
            <MoveLeft className="mr-1 ltr:hidden rtl:inline-block size-4" />
          </button>
        </div>
      </form>
    </React.Fragment>
  )
}

export default EducationalBackground
