'use client'

import React, { useCallback, useState } from 'react'

import Link from 'next/link'

import { Modal } from '@src/components/custom/modal/modal'
import { Email } from '@src/dtos'
import { AddComposeModalProps } from '@src/dtos/apps/mail'
import { AppDispatch } from '@src/slices/reducer'
import { addEmailListRecordData } from '@src/slices/thunk'
import { ImagePlus, Link2, Pencil, Smile } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'

const AddComposeModal: React.FC<AddComposeModalProps> = ({
  isModalOpen,
  onClose,
  mailList,
}) => {
  const dispatch = useDispatch<AppDispatch>()

  const handleCloseModal = () => {
    onClose()
    resetForm()
  }

  const formatDate = (date: Date): string => {
    const day = date.getDate()
    const month = date.toLocaleString('default', { month: 'long' })
    const time = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
    return `${day} ${month}, ${time}`
  }

  const [defaultMail] = useState<Email>({
    id: mailList && mailList.length > 0 ? mailList.length + 1 : 1,
    sender: '',
    email: '',
    date: formatDate(new Date()),
    subject: '',
    message: '',
    avatarText: '',
    avatarColor: 'red',
    badges: ['Inbox'],
    type: 'sent',
    replies: [],
  })

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm<Email>({
    mode: 'onSubmit',
    defaultValues: defaultMail,
  })

  const validateEmailField = (email: string): string | true => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      return 'Email is required.'
    } else if (!emailPattern.test(email)) {
      return 'Invalid email format.'
    }
    return true
  }

  const submitForm = (data: Email, onClose: () => void) => {
    let isValid = true

    // Validate email field
    const emailValidation = validateEmailField(data.email || '')
    if (emailValidation !== true) {
      setError('email', { type: 'manual', message: emailValidation })
      isValid = false
    } else {
      clearErrors('email')
    }

    // Check if subject is empty
    if (!data.subject) {
      setError('subject', { type: 'manual', message: 'Subject is required.' })
      isValid = false
    } else {
      clearErrors('subject')
    }

    // Check if message is empty
    if (!data.message) {
      setError('message', { type: 'manual', message: 'Message is required.' })
      isValid = false
    } else {
      clearErrors('message')
    }

    if (isValid) {
      const newRecord: Email = {
        ...data,
        id: mailList && mailList.length > 0 ? mailList.length + 1 : 1,
        date: formatDate(new Date()),
        sender: data.email.split('@')[0],
        avatarText: data.email.split('@')[0].slice(0, 2).toUpperCase(),
      }
      dispatch(addEmailListRecordData(newRecord))
      resetForm()
      onClose()
    }
  }

  const resetForm = useCallback(() => {
    reset()
  }, [reset])

  return (
    <React.Fragment>
      <Modal
        isOpen={isModalOpen}
        onClose={() => handleCloseModal()}
        position="modal-top"
        id={'addComposeModals'}
        contentClass="modal-content"
        size="modal-lg"
        content={(onClose) => (
          <>
            <form
              action="#!"
              onSubmit={handleSubmit((data) => submitForm(data, onClose))}>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-gray-500 dark:text-dark-500">To:</p>
                  <input
                    type="text"
                    className="h-auto px-0 border-0 form-input"
                    placeholder="Type email"
                    {...register('email', { required: 'Email is required.' })}
                  />
                  <Link href="#!" className="link link-primary">
                    Cc
                  </Link>
                  <Link href="#!" className="link link-primary">
                    Bcc
                  </Link>
                </div>
                {errors.email && (
                  <span className="text-red-500">{errors.email.message}</span>
                )}
              </div>

              <div className="py-2 border-gray-200 dark:border-dark-800 border-y">
                <input
                  type="text"
                  className="h-auto p-0 border-0 form-input"
                  placeholder="Subject"
                  {...register('subject', { required: 'Subject is required.' })}
                />
                {errors.subject && (
                  <p className="text-red-500">{errors.subject.message}</p>
                )}
              </div>

              <div>
                <div>
                  <textarea
                    className="h-auto px-0 border-0 resize-none form-input"
                    rows={3}
                    placeholder="Type something ..."
                    {...register('message', {
                      required: 'Message is required.',
                    })}></textarea>
                  {errors.message && (
                    <p className="text-red-500">{errors.message.message}</p>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-2">
                  <div className="shrink-0">
                    <label
                      htmlFor="sendImages"
                      className="btn btn-active-gray btn-icon">
                      <ImagePlus className="size-5" />
                    </label>
                    <input type="file" id="sendImages" className="hidden" />
                  </div>
                  <button type="button" className="link link-primary shrink-0">
                    <Link2 className="size-5" />
                  </button>
                  <button type="button" className="link link-primary shrink-0">
                    <Pencil className="size-5" />
                  </button>
                  <button
                    type="button"
                    className="mr-auto link link-yellow shrink-0">
                    <Smile className="size-5" />
                  </button>
                  <button
                    type="button"
                    className="btn btn-sub-gray shrink-0"
                    onClick={onClose}>
                    Draft
                  </button>
                  <button type="submit" className="btn btn-primary shrink-0">
                    Send Now
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

export default AddComposeModal
