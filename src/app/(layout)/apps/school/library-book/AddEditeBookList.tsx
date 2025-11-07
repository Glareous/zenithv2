'use client'

import React, { useEffect, useState } from 'react'

import Image, { StaticImageData } from 'next/image'

import { Modal } from '@src/components/custom/modal/modal'
import { LibraryBook } from '@src/dtos'
import { OptionType, bookType } from '@src/dtos/apps/school'
import { AppDispatch } from '@src/slices/reducer'
import { addBookListData, editBookListData } from '@src/slices/thunk'
import { Plus, Upload, X } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import Select, { SingleValue } from 'react-select'

interface AddEditBookListProps {
  modalState: { showEditBookForm: boolean; showAddBookForm: boolean }
  closeModal: (modal: string) => void
  bookList: LibraryBook[]
  editMode: boolean
  currentBook?: LibraryBook | null | undefined
}

const AddEditBookList: React.FC<AddEditBookListProps> = ({
  modalState,
  closeModal,
  bookList,
  editMode,
  currentBook,
}) => {
  const dispatch: AppDispatch = useDispatch()
  const [preview, setPreview] = useState<string | StaticImageData | null>(null)
  const [bookTypeList, setBookTypeList] =
    useState<SingleValue<OptionType> | null>(null)

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

  const {
    register,
    handleSubmit,
    setValue,
    control,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm<LibraryBook>()

  useEffect(() => {
    clearErrors()
    if (editMode && currentBook) {
      Object.keys(currentBook).forEach((key) => {
        if (key in currentBook) {
          setValue(
            key as keyof LibraryBook,
            currentBook[key as keyof LibraryBook]
          )
        }
      })
      setPreview(currentBook?.image || '')

      // Check if currentBook exists before accessing its properties
      if (currentBook?.type) {
        const selectedType = bookType.find(
          (item) => item.value === currentBook?.type
        )
        setBookTypeList(selectedType || null)
      }
    } else {
      reset({
        id: 0,
        title: '',
        author: '',
        image: '',
        rating: 0,
        reviewCount: '89',
        price: '',
        type: '',
      })
      setBookTypeList(null)
    }
  }, [editMode, currentBook, setValue, reset, clearErrors])

  const submitForm = (data: LibraryBook, onClose: () => void) => {
    clearErrors()
    if (editMode && currentBook) {
      const updatedBookList: LibraryBook = { ...data, image: preview || '' }
      dispatch(editBookListData(updatedBookList))
      setPreview(null)
      clearErrors()
    } else {
      const newBook = {
        ...data,
        id: bookList.length + 1,
        image: preview || '',
      }
      dispatch(addBookListData(newBook))
      setPreview(null)
      clearErrors()
    }
    reset()
    onClose()
  }

  const handlecloseModal = (modal: string) => {
    closeModal(modal)
    reset()
  }

  return (
    <React.Fragment>
      <Modal
        isOpen={
          modalState &&
          (editMode == true
            ? modalState.showEditBookForm
            : modalState.showAddBookForm)
        }
        onClose={() =>
          handlecloseModal(editMode ? 'showEditBookForm' : 'showAddBookForm')
        }
        position="modal-center"
        id={editMode ? 'showEditBookForm' : 'showAddBookForm'}
        contentClass="modal-content"
        title={editMode ? 'Edit Book' : 'Add Book'}
        content={(onClose) => (
          <>
            <form onSubmit={handleSubmit((data) => submitForm(data, onClose))}>
              <div className="grid grid-cols-12 gap-space">
                <div className="col-span-12">
                  <div className="text-center">
                    <label htmlFor="logo">
                      <div className="inline-flex items-center justify-center mx-auto overflow-hidden bg-gray-100 border border-gray-200 rounded-md cursor-pointer dark:bg-dark-850 dark:border-dark-800 h-44">
                        {preview ? (
                          <Image
                            src={preview}
                            alt="previewImg"
                            width={92}
                            height={92}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="flex flex-col items-center mx-8 text-gray-500 dark:text-dark-500">
                            <Upload />
                            <div className="mt-2">Book Poster</div>
                          </div>
                        )}
                      </div>
                    </label>
                    <input
                      type="file"
                      name="logo"
                      id="logo"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>
                <div className="col-span-12">
                  <label htmlFor="bookTitleInput" className="form-label">
                    Book Title
                  </label>
                  <input
                    type="text"
                    id="bookTitleInput"
                    className="form-input"
                    placeholder="Enter book title"
                    {...register('title', { required: 'Title is required.' })}
                  />
                  {errors.title && (
                    <span className="text-red-500">{errors.title.message}</span>
                  )}
                </div>
                <div className="col-span-12">
                  <label htmlFor="writerNameInput" className="form-label">
                    Writer Name
                  </label>
                  <input
                    type="text"
                    id="writerNameInput"
                    className="form-input"
                    placeholder="Enter writer name"
                    {...register('author', {
                      required: 'Author name is required.',
                    })}
                  />
                  {errors.author && (
                    <span className="text-red-500">
                      {errors.author.message}
                    </span>
                  )}
                </div>

                <div className="col-span-12">
                  <label htmlFor="typeInput" className="form-label">
                    Type
                  </label>
                  <Controller
                    name="type"
                    control={control}
                    rules={{ required: 'Type is required.' }}
                    render={({ field: { onChange } }) => (
                      <Select
                        classNamePrefix="select"
                        options={bookType}
                        value={bookTypeList}
                        onChange={(selected) => {
                          setBookTypeList(selected)
                          onChange(selected?.value)
                        }}
                        placeholder="Select book type"
                        id="typeInput"
                      />
                    )}
                  />
                  {errors.type && (
                    <span className="text-red-500">{errors.type.message}</span>
                  )}
                </div>

                <div className="col-span-12">
                  <label htmlFor="priceInput" className="form-label">
                    Price
                  </label>
                  <input
                    type="text"
                    id="priceInput"
                    className="form-input"
                    placeholder="$00.00"
                    {...register('price', { required: 'Price is required.' })}
                  />
                  {errors.price && (
                    <span className="text-red-500">{errors.price.message}</span>
                  )}
                </div>

                <div className="col-span-12">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      className="btn btn-active-red"
                      onClick={() => onClose()}>
                      <X className="inline-block size-4" />
                      Close
                    </button>
                    <button className="btn btn-primary" type="submit">
                      <Plus className="inline-block ltr:mr-1 rtl:ml-1 size-4" />
                      {editMode ? 'Update Book' : 'Add Book'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </>
        )}
      />
    </React.Fragment>
  )
}

export default AddEditBookList
