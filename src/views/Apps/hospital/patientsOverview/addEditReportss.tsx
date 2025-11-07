'use client'

import React, { useCallback, useEffect, useState } from 'react'

import { Modal } from '@src/components/custom/modal/modal'
import { Reports } from '@src/dtos'
import { OptionType } from '@src/dtos/apps/crm'
import {
  Recommendations,
  categoryItems,
  reportsTypeData,
} from '@src/dtos/apps/hospital'
import { AppDispatch } from '@src/slices/reducer'
import { addReportstData, editReportstData } from '@src/slices/thunk'
import { Plus, X } from 'lucide-react'
import Flatpickr from 'react-flatpickr'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import Select, { SingleValue } from 'react-select'

const AddEditReports = ({
  modalState,
  closeModal,
  reportsList,
  editMode = false,
  currentReports = null,
}: {
  modalState: { showAddReportForm: boolean }
  closeModal: (formId: string) => void
  reportsList: Reports[]
  editMode?: boolean
  currentReports?: Reports | null
}) => {
  const dispatch: AppDispatch = useDispatch()

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    clearErrors,
    formState: { errors },
  } = useForm<Reports>()

  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [categoryList, setCategoryList] =
    useState<SingleValue<OptionType> | null>(null)
  const [recommendations, setRecommendations] =
    useState<SingleValue<OptionType> | null>(null)
  const [reportsType, setReportsType] =
    useState<SingleValue<OptionType> | null>(null)

  const handleStatusChange = (
    selected: SingleValue<OptionType>,
    onChange: (value: string) => void
  ) => {
    setCategoryList(selected)
    onChange(selected ? selected.value : '')
  }

  const handleRecommendChange = (
    selected: SingleValue<OptionType>,
    onChange: (value: string) => void
  ) => {
    setRecommendations(selected)
    onChange(selected ? selected.value : '') // Handle case where selected could be null
  }

  const handleReportsTypeChange = (
    selected: SingleValue<OptionType>,
    onChange: (value: string) => void
  ) => {
    setReportsType(selected)
    onChange(selected ? selected.value : '')
  }

  const resetForm = useCallback(() => {
    reset({
      id: 0,
      name: '',
      clinical: '',
      impressions: '',
      recommendations: '',
      date: '',
      status: '',
      doctor: '',
    })
    setSelectedDate(null)
    setCategoryList(null)
    setRecommendations(null)
    setReportsType(null)
  }, [reset])

  useEffect(() => {
    clearErrors()
    if (editMode && currentReports) {
      Object.keys(currentReports).forEach((key) => {
        setValue(key as keyof Reports, currentReports[key as keyof Reports])
      })

      if (currentReports.date) {
        setSelectedDate(new Date(currentReports.date))
      }

      const selectedStatus = categoryItems.find(
        (item) => item.value === currentReports?.status
      )
      setCategoryList(selectedStatus || null)

      const selectedRecommendations = Recommendations.find(
        (item) => item.value === currentReports?.recommendations
      )
      setRecommendations(selectedRecommendations || null)

      const selectedReports = reportsTypeData?.find(
        (item) => item.value === currentReports?.name
      )
      setReportsType(selectedReports || null)
    } else {
      resetForm()
      clearErrors()
    }
  }, [editMode, currentReports, setValue, reset, clearErrors, resetForm])

  const submitForm = (data: Reports, onClose: () => void) => {
    try {
      const updatedData = {
        ...data,
        status: categoryList?.value || '',
        recommendations: recommendations?.value || '',
        name: reportsType?.value || '',
      }

      if (editMode && currentReports) {
        dispatch(editReportstData(updatedData))
      } else {
        const newReport = { ...updatedData, id: reportsList.length + 1 }
        dispatch(addReportstData(newReport))
      }

      reset()
      onClose()
    } catch (error) {
      console.error('Error during form submission:', error)
    }
    resetForm()
  }

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0')
    const month = date.toLocaleString('default', { month: 'short' })
    const year = date.getFullYear()
    return `${day} ${month}, ${year}`
  }

  const handleCloseModal = () => {
    closeModal(editMode ? 'showEditeReportForm' : 'showAddReportForm')
    resetForm()
    clearErrors()
  }

  return (
    <React.Fragment>
      <Modal
        isOpen={modalState.showAddReportForm}
        title="Add Report"
        onClose={() => handleCloseModal()}
        position="modal-center"
        id="showAddReportForm"
        contentClass="modal-content"
        content={(onClose) => (
          <form onSubmit={handleSubmit((data) => submitForm(data, onClose))}>
            <div className="grid grid-cols-12 gap-space">
              <div className="col-span-12">
                <label htmlFor="reportTypeSelect" className="form-label">
                  Report Type <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: 'Reports Type is required.' }}
                  render={({ field: { onChange } }) => (
                    <Select
                      classNamePrefix="select"
                      options={reportsTypeData}
                      value={reportsType}
                      onChange={(selected) =>
                        handleReportsTypeChange(selected, onChange)
                      }
                      placeholder="select report type"
                      id="reportTypeSelect"
                    />
                  )}
                />
                {errors.name && (
                  <span className="text-red-500">{errors.name.message}</span>
                )}
              </div>
              <div className="col-span-12">
                <label htmlFor="dateInput" className="form-label">
                  Date <span className="text-red-500">*</span>
                </label>
                <Flatpickr
                  id="dueDateInput"
                  className="form-input"
                  placeholder="Select due date"
                  value={selectedDate || undefined}
                  options={{ mode: 'single' }}
                  onChange={(date) => {
                    const formattedDate = formatDate(date[0])
                    setValue('date', formattedDate)
                    setSelectedDate(date[0])
                    clearErrors('date')
                  }}
                />
                <input
                  type="hidden"
                  {...register('date', { required: 'Date is required.' })}
                />
                {errors.date && (
                  <span className="text-red-500">{errors.date.message}</span>
                )}
              </div>
              <div className="col-span-12">
                <label htmlFor="doctorNameInput" className="form-label">
                  Doctor <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="doctorNameInput"
                  className="form-input"
                  placeholder="Enter doctor name"
                  {...register('doctor', {
                    required: 'doctor type is required.',
                  })}
                />
                {errors.doctor && (
                  <span className="text-red-500">{errors.doctor.message}</span>
                )}
              </div>
              <div className="col-span-12">
                <label htmlFor="textareaInput2" className="form-label">
                  Clinical Details
                </label>
                <textarea
                  id="textareaInput2"
                  rows={3}
                  className="h-auto form-input"
                  placeholder="Enter your description"
                  {...register('clinical', {
                    required: 'clinical type is required.',
                  })}></textarea>
                {errors.clinical && (
                  <span className="text-red-500">
                    {errors.clinical.message}
                  </span>
                )}
              </div>
              <div className="col-span-6">
                <label htmlFor="impressionsInput" className="form-label">
                  Impressions
                </label>
                <input
                  type="text"
                  id="impressionsInput"
                  className="form-input"
                  placeholder="Impressions"
                  {...register('impressions', {
                    required: 'impressions  is required.',
                  })}
                />
                {errors.impressions && (
                  <span className="text-red-500">
                    {errors.impressions.message}
                  </span>
                )}
              </div>
              <div className="col-span-6">
                <label htmlFor="recommendationsSelect" className="form-label">
                  Recommendations
                </label>
                <Controller
                  name="recommendations"
                  control={control}
                  rules={{ required: 'Recommendations is required.' }}
                  render={({ field: { onChange } }) => (
                    <Select
                      classNamePrefix="select"
                      options={Recommendations}
                      value={recommendations}
                      onChange={(selected) =>
                        handleRecommendChange(selected, onChange)
                      }
                      placeholder="recommendations"
                      id="recommendationsSelect"
                    />
                  )}
                />
                {errors.recommendations && (
                  <span className="text-red-500">
                    {errors.recommendations.message}
                  </span>
                )}
              </div>
              <div className="col-span-12">
                <label htmlFor="statusSelect" className="form-label">
                  Status <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="status"
                  control={control}
                  rules={{ required: 'Status is required.' }}
                  render={({ field: { onChange } }) => (
                    <Select
                      classNamePrefix="select"
                      options={categoryItems}
                      value={categoryList}
                      onChange={(selected) =>
                        handleStatusChange(selected, onChange)
                      }
                      placeholder="Select status"
                      id="statusSelect"
                    />
                  )}
                />
                {errors.status && (
                  <span className="text-red-500">{errors.status.message}</span>
                )}
              </div>

              <div className="col-span-12">
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="submit"
                    className="btn btn-active-red"
                    onClick={onClose}>
                    <X className="inline-block size-4" />
                    Cancel
                  </button>
                  <button className="btn btn-primary" type="submit">
                    <Plus className="inline-block mr-1 size-4" />
                    {editMode ? 'Edit Report' : 'Add Report'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      />
    </React.Fragment>
  )
}

export default AddEditReports
