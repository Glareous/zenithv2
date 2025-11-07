'use client'

import React, { useState } from 'react'

import { EmployeeFormData } from '@src/app/(layout)/apps/rrhh/rrhh-admission/page'
import { OptionType, genderOptions } from '@src/dtos/apps/school'
import { MoveLeft, MoveRight } from 'lucide-react'
import Flatpickr from 'react-flatpickr'
import { useFormContext } from 'react-hook-form'
import Select from 'react-select'

interface PersonalDetailsTabProps {
  onNextTab: () => void
  isLoading?: boolean
}

const PersonalDetailsTab: React.FC<PersonalDetailsTabProps> = ({
  onNextTab,
  isLoading,
}) => {
  const {
    register,
    setValue,
    clearErrors,
    watch,
    formState: { errors },
  } = useFormContext<EmployeeFormData>()

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedGender, setSelectedGender] = useState<OptionType | null>(null)

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }
    return date.toLocaleDateString('en-GB', options).replace(',', '')
  }

  const handleGenderChange = (selectedOption: OptionType | null) => {
    setSelectedGender(selectedOption)
    setValue('gender', selectedOption?.value || '')
    clearErrors('gender')
  }

  return (
    <React.Fragment>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onNextTab()
        }}>
        <h6 className="mb-3">Personal Details</h6>
        <div className="grid grid-cols-12 gap-space">
          <div className="col-span-12 sm:col-span-6 2xl:col-span-4">
            <label htmlFor="employeeIdInput" className="form-label">
              Employee ID
            </label>
            <input
              type="text"
              id="employeeIdInput"
              className="form-input"
              placeholder="Enter employee ID"
              {...register('employeeId')}
            />
            {errors.employeeId && (
              <span className="text-red-500">{errors.employeeId.message}</span>
            )}
          </div>
          <div className="col-span-12 sm:col-span-6 2xl:col-span-4">
            <label htmlFor="firstNameInput" className="form-label">
              First Name
            </label>
            <input
              type="text"
              id="firstNameInput"
              className="form-input"
              placeholder="Enter first name"
              {...register('firstName')}
            />
            {errors.firstName && (
              <span className="text-red-500">{errors.firstName.message}</span>
            )}
          </div>
          <div className="col-span-12 sm:col-span-6 2xl:col-span-4">
            <label htmlFor="middleNameInput" className="form-label">
              Middle Name
            </label>
            <input
              type="text"
              id="middleNameInput"
              className="form-input"
              placeholder="Enter middle name"
              {...register('middleName')}
            />
            {errors.middleName && (
              <span className="text-red-500">{errors.middleName.message}</span>
            )}
          </div>
          <div className="col-span-12 sm:col-span-6 2xl:col-span-4">
            <label htmlFor="lastNameInput" className="form-label">
              Last Name
            </label>
            <input
              type="text"
              id="lastNameInput"
              className="form-input"
              placeholder="Enter last name"
              {...register('lastName')}
            />
            {errors.lastName && (
              <span className="text-red-500">{errors.lastName.message}</span>
            )}
          </div>
          <div className="col-span-12 sm:col-span-6 2xl:col-span-4">
            <label htmlFor="genderSelect" className="form-label">
              Gender
            </label>
            <div id="genderSelect">
              <Select
                classNamePrefix="select"
                id="genderSelect"
                options={genderOptions}
                value={selectedGender}
                onChange={handleGenderChange}
                placeholder="Select Gender"
              />
              <input type="hidden" {...register('gender')} />
              {errors.gender && (
                <span className="text-red-500">{errors.gender.message}</span>
              )}
            </div>
          </div>

          <div className="col-span-12 sm:col-span-6 2xl:col-span-4">
            <label htmlFor="ageInput" className="form-label">
              Age
            </label>
            <input
              type="number"
              id="ageInput"
              className="form-input"
              placeholder="Enter age"
              {...register('age')}
            />
            {errors.age && (
              <span className="text-red-500">{errors.age.message}</span>
            )}
          </div>

          <div className="col-span-12 sm:col-span-6 2xl:col-span-4">
            <label htmlFor="joiningdate" className="form-label">
              Date of Birth
            </label>
            <Flatpickr
              id="joiningdate"
              className="form-input"
              placeholder="Select date"
              value={selectedDate || undefined}
              options={{
                mode: 'single',
              }}
              onChange={(date: Date[]) => {
                const formattedDate = formatDate(date[0])
                setSelectedDate(date[0])
                setValue('birthDate', formattedDate)
                clearErrors('birthDate')
              }}
            />
            <input type="hidden" {...register('birthDate')} />
            {errors.birthDate && (
              <span className="text-red-500">{errors.birthDate.message}</span>
            )}
          </div>

          <div className="col-span-12 sm:col-span-6 2xl:col-span-4">
            <label htmlFor="rollNoInput" className="form-label">
              Roll No
            </label>
            <input
              type="text"
              id="rollNoInput"
              className="form-input"
              placeholder="Enter roll number"
              {...register('rollNo')}
            />
            {errors.rollNo && (
              <span className="text-red-500">{errors.rollNo.message}</span>
            )}
          </div>

          <div className="col-span-12 sm:col-span-6 2xl:col-span-4">
            <label htmlFor="classInput" className="form-label">
              Class
            </label>
            <input
              type="text"
              id="classInput"
              className="form-input"
              placeholder="Enter class"
              {...register('class')}
            />
            {errors.class && (
              <span className="text-red-500">{errors.class.message}</span>
            )}
          </div>
        </div>

        <h6 className="mt-6 mb-3">Contact Details</h6>
        <div className="grid grid-cols-12 gap-space">
          <div className="col-span-12 md:col-span-6">
            <label htmlFor="mobileNumberInput" className="form-label">
              Mobile Number
            </label>
            <input
              type="text"
              id="mobileNumberInput"
              className="form-input"
              placeholder="Enter mobile number"
              {...register('phone')}
            />
            {errors.phone && (
              <span className="text-red-500">{errors.phone.message}</span>
            )}
          </div>
          <div className="col-span-12 md:col-span-6">
            <label
              htmlFor="alternativeMobileNumberInput"
              className="form-label">
              Alternative Mobile Number
            </label>
            <input
              type="text"
              id="alternativeMobileNumberInput"
              className="form-input"
              placeholder="Enter alternative mobile number (optional)"
              {...register('alternativePhone')}
            />
            {errors.alternativePhone && (
              <span className="text-red-500">
                {errors.alternativePhone.message}
              </span>
            )}
          </div>
          <div className="col-span-12 md:col-span-6">
            <label htmlFor="emailIDInput" className="form-label">
              Email ID
            </label>
            <input
              type="email"
              id="emailIDInput"
              className="form-input"
              placeholder="example@example.com"
              {...register('email')}
            />
            {errors.email && (
              <span className="text-red-500">{errors.email.message}</span>
            )}
          </div>
          <div className="col-span-12 md:col-span-6">
            <label htmlFor="nationalityInput" className="form-label">
              Nationality
            </label>
            <input
              type="text"
              id="nationalityInput"
              className="form-input"
              placeholder="Enter nationality"
              {...register('nationality')}
            />
            {errors.nationality && (
              <span className="text-red-500">{errors.nationality.message}</span>
            )}
          </div>
          <div className="col-span-12">
            <label htmlFor="addressInput" className="form-label">
              Permanent Address
            </label>
            <input
              type="text"
              id="addressInput"
              className="form-input"
              placeholder="Enter address"
              {...register('address')}
            />
            {errors.address && (
              <span className="text-red-500">{errors.address.message}</span>
            )}
          </div>
          <div className="col-span-12 md:col-span-4">
            <label htmlFor="cityInput" className="form-label">
              City
            </label>
            <input
              type="text"
              id="cityInput"
              className="form-input"
              placeholder="Enter city"
              {...register('city')}
            />
            {errors.city && (
              <span className="text-red-500">{errors.city.message}</span>
            )}
          </div>
          <div className="col-span-12 md:col-span-4">
            <label htmlFor="countryInput" className="form-label">
              Country
            </label>
            <input
              type="text"
              id="countryInput"
              className="form-input"
              placeholder="Enter country"
              {...register('country')}
            />
            {errors.country && (
              <span className="text-red-500">{errors.country.message}</span>
            )}
          </div>
          <div className="col-span-12 md:col-span-4">
            <label htmlFor="pinCodeInput" className="form-label">
              Pin Code
            </label>
            <input
              type="text"
              id="pinCodeInput"
              className="form-input"
              placeholder="Enter pincode"
              {...register('pinCode')}
            />
            {errors.pinCode && (
              <span className="text-red-500">{errors.pinCode.message}</span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-5 ltr:justify-end rtl:justify-start">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save to Next'}
            <MoveRight className="ltr:inline-block rtl:hidden ltr:ml-1 rtl:mr-1 size-4" />
            <MoveLeft className="ltr:hidden rtl:inline-block ltr:ml-1 rtl:mr-1 size-4" />
          </button>
        </div>
      </form>
    </React.Fragment>
  )
}

export default PersonalDetailsTab
