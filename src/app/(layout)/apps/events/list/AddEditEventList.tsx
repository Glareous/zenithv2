'use client'

import React, { useEffect, useState } from 'react'

import Image from 'next/image'

import { Modal } from '@src/components/custom/modal/modal'
import { OptionType, eventType, status } from '@src/data/event/event'
import { EventList } from '@src/dtos'
import { AppDispatch } from '@src/slices/reducer'
import { addEventListData, editEventListData } from '@src/slices/thunk'
import { Upload } from 'lucide-react'
import Flatpickr from 'react-flatpickr'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import Select, { SingleValue } from 'react-select'

const AddEditEventList = ({
  modalState,
  closeModal,
  eventList,
  editMode = false,
  currentEvent = null,
}: {
  modalState: { showEditContactForm: boolean; showAddContactForm: boolean }
  closeModal: (modal: string) => void
  eventList: EventList[]
  editMode?: boolean
  currentEvent?: EventList | null
}) => {
  const dispatch: AppDispatch = useDispatch()

  // Image preview
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [categoryList, setCategoryList] =
    useState<SingleValue<OptionType> | null>(null)
  const [statusOption, setStatusOption] =
    useState<SingleValue<OptionType> | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null) // For event time handling

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPreview(null)
    }
  }

  // Handle event type change
  const handleEventTypeChange = (selected: SingleValue<OptionType>) => {
    setCategoryList(selected)
    setValue('eventType', selected ? selected.value : '')
    if (selected) {
      clearErrors('eventType') // Clear the event type error
    }
  }

  // Handle status change
  const handleStatusChange = (selected: SingleValue<OptionType>) => {
    setStatusOption(selected)
    setValue('status', selected ? selected.value : '')
    if (selected) {
      clearErrors('status') // Clear the status error
    }
  }

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm<EventList>()

  // Handle form initialization on edit mode
  useEffect(() => {
    clearErrors()
    if (editMode && currentEvent) {
      Object.keys(currentEvent).forEach((key) => {
        setValue(key as keyof EventList, currentEvent[key as keyof EventList])
      })
      setPreview(currentEvent.image)
      setSelectedDate(new Date(currentEvent.eventDate))
      setSelectedTime(currentEvent.time || null) // Set time in edit mode

      if (currentEvent.eventType) {
        const selectedEvent = eventType.find(
          (item) => item.value === currentEvent.eventType
        )
        setCategoryList(selectedEvent || null)
      }
      if (currentEvent.status) {
        const selectedStatus = status.find(
          (item) => item.value === currentEvent.status
        )
        setStatusOption(selectedStatus || null)
      }
    } else {
      reset({
        image: '',
        eventName: '',
        eventDate: '',
        time: '',
        peopleSize: '',
        location: '',
        eventType: '',
        status: '',
        price: '',
      })
      setSelectedDate(null)
      setSelectedTime(null)
      setCategoryList(null)
      setStatusOption(null)
    }
  }, [editMode, currentEvent, setValue, reset, clearErrors])

  // Handle form submission
  const submitForm = (data: EventList, onClose: () => void) => {
    if (editMode && currentEvent) {
      const updatedEvent: EventList = { ...data, image: preview || '' }
      dispatch(editEventListData(updatedEvent))
    } else {
      const newEvent = {
        ...data,
        id: eventList.length + 1,
        image: preview || '/assets/images/avatar/user-3.png',
      }
      dispatch(addEventListData(newEvent))
    }
    reset()
    onClose()
    clearErrors()
  }

  const formatDate = (date: Date) => {
    const day = date.getDate()
    const month = date.toLocaleString('default', { month: '2-digit' })
    const year = date.getFullYear()
    return `${year}-${month}-${day}`
  }

  const handleCloseModal = (modal: string) => {
    closeModal(modal)
    clearErrors()
    setPreview(null)
  }

  return (
    <React.Fragment>
      <Modal
        isOpen={
          modalState &&
          (editMode == true
            ? modalState.showEditContactForm
            : modalState.showAddContactForm)
        }
        title={editMode ? 'Edit Event' : 'Add New Event'}
        onClose={() =>
          handleCloseModal(
            editMode ? 'showEditContactForm' : 'showAddContactForm'
          )
        }
        position="modal-center"
        id={editMode ? 'showEditContactForm' : 'showAddContactForm'}
        contentClass="modal-content"
        content={(onClose) => (
          <>
            <form onSubmit={handleSubmit((data) => submitForm(data, onClose))}>
              <div className="grid grid-cols-12 gap-5">
                {/* Event Logo */}
                <div className="col-span-12">
                  <h6 className="form-label">Event Logo</h6>
                  <div>
                    <label htmlFor="logo">
                      <span className="inline-flex items-center justify-center w-full h-32 overflow-hidden bg-gray-100 border border-gray-200 rounded-md cursor-pointer dark:bg-dark-850 dark:border-dark-800">
                        {preview ? (
                          <Image
                            src={preview}
                            alt="previewImg"
                            width={92}
                            height={92}
                            className="object-cover h-24"
                          />
                        ) : (
                          <div className="flex flex-col items-center text-gray-500">
                            <Upload />
                            <span className="block mt-3">
                              Upload Your Event Logo
                            </span>
                          </div>
                        )}
                      </span>
                    </label>
                    <input
                      type="file"
                      name="logo"
                      id="logo"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Event Name */}
                <div className="col-span-12">
                  <label htmlFor="eventNameInput" className="form-label">
                    Event Name
                  </label>
                  <input
                    type="text"
                    id="eventNameInput"
                    className="form-input"
                    placeholder="Event name"
                    {...register('eventName', {
                      required: 'Event name is required.',
                    })}
                  />
                  {errors.eventName && (
                    <span className="text-red-500">
                      {errors.eventName.message}
                    </span>
                  )}
                </div>

                {/* Event Date */}
                <div className="col-span-6">
                  <label htmlFor="eventDateInput" className="form-label">
                    Event Date
                  </label>
                  <Flatpickr
                    id="eventDateInput"
                    className="form-input"
                    placeholder="Select event date"
                    value={selectedDate || undefined}
                    options={{
                      mode: 'single',
                    }}
                    onChange={(date) => {
                      const formattedDate = formatDate(date[0])
                      setValue('eventDate', formattedDate)
                      clearErrors('eventDate')
                    }}
                  />
                  <input
                    type="hidden"
                    {...register('eventDate', {
                      required: 'Event Date is required.',
                    })}
                  />
                  {errors.eventDate?.message &&
                    typeof errors.eventDate.message === 'string' && (
                      <span className="text-red-500">
                        {errors.eventDate.message}
                      </span>
                    )}
                </div>

                {/* Event Time */}
                <div className="col-span-6">
                  <label htmlFor="eventDurationInput" className="form-label">
                    Event Duration
                  </label>
                  <Flatpickr
                    options={{
                      enableTime: true,
                      noCalendar: true,
                      dateFormat: 'h:i K', // AM/PM format
                      time_24hr: false,
                    }}
                    value={selectedTime || undefined}
                    onChange={(date) => {
                      setSelectedTime(
                        date[0].toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      )
                      setValue(
                        'time',
                        date[0].toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        })
                      )
                      clearErrors('time')
                    }}
                    placeholder="Select time"
                    className="form-input"
                  />
                  <input
                    type="hidden"
                    {...register('time', {
                      required: 'Event Time is required.',
                    })}
                  />
                  {errors.time && (
                    <span className="text-red-500">{errors.time.message}</span>
                  )}
                </div>

                {/* Total People */}
                <div className="col-span-6">
                  <label htmlFor="peopleInput" className="form-label">
                    Total People
                  </label>
                  <input
                    type="text"
                    placeholder="0"
                    id="peopleInput"
                    className="form-input"
                    {...register('peopleSize', {
                      required: 'Please enter number of people.',
                    })}
                  />
                  {errors.peopleSize && (
                    <span className="text-red-500">
                      {errors.peopleSize.message}
                    </span>
                  )}
                </div>

                {/* Location */}
                <div className="col-span-6">
                  <label htmlFor="priceInput" className="form-label">
                    Price
                  </label>
                  <input
                    type="text"
                    placeholder="$0"
                    id="priceInput"
                    className="form-input"
                    {...register('price', { required: 'Price is required.' })}
                  />
                  {errors.price && (
                    <span className="text-red-500">{errors.price.message}</span>
                  )}
                </div>

                <div className="col-span-12">
                  <label htmlFor="locationInput" className="form-label">
                    Location
                  </label>
                  <input
                    type="text"
                    id="locationInput"
                    className="form-input"
                    placeholder="Location"
                    {...register('location', {
                      required: 'Location is required.',
                    })}
                  />
                  {errors.location && (
                    <span className="text-red-500">
                      {errors.location.message}
                    </span>
                  )}
                </div>

                {/* Event Type */}
                <div className="col-span-6">
                  <label htmlFor="eventTypeInput" className="form-label">
                    Event Type
                  </label>
                  <Select
                    classNamePrefix="select"
                    id="eventTypeInput"
                    options={eventType}
                    value={categoryList}
                    onChange={handleEventTypeChange}
                    placeholder="Event Type"
                  />
                  <input
                    type="hidden"
                    {...register('eventType', {
                      required: 'Event Type is required.',
                    })}
                  />
                  {errors.eventType && (
                    <span className="text-red-500">
                      {errors.eventType.message}
                    </span>
                  )}
                </div>

                {/* Status */}
                <div className="col-span-6">
                  <label htmlFor="statusInput" className="form-label">
                    Status
                  </label>
                  <Select
                    classNamePrefix="select"
                    id="statusInput"
                    options={status}
                    value={statusOption}
                    onChange={handleStatusChange}
                    placeholder="Status"
                  />
                  <input
                    type="hidden"
                    {...register('status', { required: 'status is required.' })}
                  />
                  {errors.status && (
                    <span className="text-red-500">
                      {errors.status.message}
                    </span>
                  )}
                </div>

                {/* Submit Button */}
                <div className="col-span-12">
                  <button type="submit" className="btn btn-primary">
                    {editMode ? 'Update' : 'Save'}
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

export default AddEditEventList
