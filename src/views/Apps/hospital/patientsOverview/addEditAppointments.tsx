'use client'

import React, { useEffect, useState } from 'react'

import { Modal } from '@src/components/custom/modal/modal'
import { Appointments } from '@src/dtos'
import { OptionType } from '@src/dtos/apps/crm'
import { categoryItems } from '@src/dtos/apps/hospital'
import { AppDispatch } from '@src/slices/reducer'
import { addAppointmentsData, editAppointmentsData } from '@src/slices/thunk'
import { Plus, X } from 'lucide-react'
import Flatpickr from 'react-flatpickr'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import Select, { SingleValue } from 'react-select'

const AddEditAppointments = ({
  modalState,
  closeModal,
  appointmentsList,
  editMode = false,
  currentAppointment = null,
}: {
  modalState: {
    showAppointmentsForm: boolean
    showAddAppointmentsForm: boolean
  }
  closeModal: (modal: string) => void
  appointmentsList: Appointments[]
  editMode?: boolean
  currentAppointment?: Appointments | null
}) => {
  const dispatch: AppDispatch = useDispatch()
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [categoryList, setCategoryList] =
    useState<SingleValue<OptionType> | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm<Appointments>()

  const handleStatusChange = (selected: SingleValue<OptionType>) => {
    setCategoryList(selected)
    setValue('status', selected ? selected.value : '')
    clearErrors('status')
  }

  useEffect(() => {
    if (editMode && currentAppointment) {
      Object.keys(currentAppointment).forEach((key) => {
        if (key in currentAppointment) {
          setValue(
            key as keyof Appointments,
            currentAppointment[key as keyof Appointments]
          )
        }
      })
      setSelectedDate(new Date(currentAppointment.date))
      setSelectedTime(currentAppointment.time)

      if (currentAppointment.status) {
        const selectedStatus = categoryItems.find(
          (item) => item.value === currentAppointment.status
        )
        setCategoryList(selectedStatus || null)
      }
    } else {
      reset({
        id: 0,
        date: '',
        time: '',
        treatmentType: '',
        doctor: '',
        reasonCondition: '',
        notes: '',
        status: '',
      })
      setSelectedDate(null)
      setSelectedTime(null)
      setCategoryList(null)
      clearErrors()
    }
  }, [editMode, currentAppointment, setValue, reset, clearErrors])

  const submitForm = (data: Appointments, onClose: () => void) => {
    clearErrors()
    if (editMode && currentAppointment) {
      const updatedContact: Appointments = { ...data }
      dispatch(editAppointmentsData(updatedContact))
    } else {
      const newContact = { ...data, id: appointmentsList.length + 1 }
      dispatch(addAppointmentsData(newContact))
    }
    reset()
    onClose()
  }

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0')
    const month = date.toLocaleString('default', { month: 'short' })
    const year = date.getFullYear()
    return `${day} ${month}, ${year}`
  }

  const handleCloseModal = (modal: string) => {
    closeModal(modal)
    reset()
    clearErrors()
  }

  return (
    <React.Fragment>
      <Modal
        isOpen={
          editMode
            ? modalState.showAppointmentsForm
            : modalState.showAddAppointmentsForm
        }
        title={editMode ? 'Edit Appointments ' : 'Add New Appointments '}
        onClose={() =>
          handleCloseModal(
            editMode ? 'showAppointmentsForm' : 'showAddAppointmentsForm'
          )
        }
        position="modal-center"
        id={editMode ? 'showAppointmentsForm' : 'showAddAppointmentsForm'}
        contentClass="modal-content"
        content={(onClose) => (
          <form onSubmit={handleSubmit((data) => submitForm(data, onClose))}>
            <div className="grid grid-cols-12 gap-space">
              {/* Date Picker */}
              <div className="col-span-12">
                <label htmlFor="medicineNameInput" className="form-label">
                  Date
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

              {/* Time Picker */}
              <div className="col-span-6">
                <label htmlFor="timeInput" className="form-label">
                  Time
                </label>
                <Flatpickr
                  options={{
                    enableTime: true,
                    noCalendar: true,
                    dateFormat: 'h:i K',
                    time_24hr: false,
                  }}
                  placeholder="00:00"
                  className="form-input"
                  value={selectedTime || undefined}
                  onChange={(selectedDates) => {
                    const selectedTime = selectedDates[0]?.toLocaleTimeString(
                      [],
                      {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      }
                    )
                    setValue('time', selectedTime || '')
                    setSelectedTime(selectedTime || '')
                    clearErrors('time')
                  }}
                />
                <input
                  type="hidden"
                  {...register('time', { required: 'Time is required.' })}
                />
                {errors.time && (
                  <span className="text-red-500">{errors.time.message}</span>
                )}
              </div>

              {/* Treatment Type */}
              <div className="col-span-6">
                <label htmlFor="treatmentTypeInput" className="form-label">
                  Treatment Type
                </label>
                <input
                  type="text"
                  id="treatmentTypeInput"
                  className="form-input"
                  placeholder="Enter treatment type"
                  {...register('treatmentType', {
                    required: 'Treatment type is required.',
                  })}
                />
                {errors.treatmentType && (
                  <span className="text-red-500">
                    {errors.treatmentType.message}
                  </span>
                )}
              </div>

              {/* Doctor */}
              <div className="col-span-12">
                <label htmlFor="doctorInput" className="form-label">
                  Doctor
                </label>
                <input
                  type="text"
                  id="doctorInput"
                  className="form-input"
                  placeholder="Enter doctor's name"
                  {...register('doctor', { required: 'Doctor is required.' })}
                />
                {errors.doctor && (
                  <span className="text-red-500">{errors.doctor.message}</span>
                )}
              </div>

              {/* Reason/Condition */}
              <div className="col-span-12">
                <label htmlFor="reasonConditionInput" className="form-label">
                  Reason/Condition
                </label>
                <input
                  type="text"
                  id="reasonConditionInput"
                  className="form-input"
                  placeholder="Reason/Condition"
                  {...register('reasonCondition', {
                    required: 'Reason/Condition is required.',
                  })}
                />
                {errors.reasonCondition && (
                  <span className="text-red-500">
                    {errors.reasonCondition.message}
                  </span>
                )}
              </div>

              {/* Notes */}
              <div className="col-span-12">
                <label htmlFor="notesInput" className="form-label">
                  Notes
                </label>
                <textarea
                  id="notesInput"
                  rows={2}
                  className="h-auto form-input"
                  placeholder="Enter notes"
                  {...register('notes', { required: 'Notes is required' })}
                />
                {errors.notes && (
                  <span className="text-red-500">{errors.notes.message}</span>
                )}
              </div>

              {/* Status */}
              <div className="col-span-6">
                <label className="form-label">Status</label>
                <Select
                  classNamePrefix="select"
                  options={categoryItems}
                  onChange={handleStatusChange}
                  value={categoryList}
                  placeholder="Select status"
                />
                <input
                  type="hidden"
                  {...register('status', { required: 'status is required.' })}
                />
                {errors.status && (
                  <span className="text-red-500">{errors.status.message}</span>
                )}
              </div>

              {/* Buttons */}
              <div className="col-span-12">
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    className="btn btn-active-red"
                    onClick={() => onClose()}>
                    <X className="inline-block size-4" />
                    Cancel
                  </button>
                  <button className="btn btn-primary" type="submit">
                    <Plus className="inline-block mr-1 size-4" />
                    {editMode ? 'Edit Appointment' : 'Add Appointment'}
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

export default AddEditAppointments
