'use client'

import React, { useEffect, useRef, useState } from 'react'

import Image from 'next/image'

import userImg from '@assets/images/avatar/user-14.png'
import { Modal } from '@src/components/custom/modal/modal'
import { DealMessage } from '@src/dtos'
import { messageModalItem } from '@src/dtos/apps/crmdeal'
import { api } from '@src/trpc/react'
import {
  Archive,
  CheckCircle,
  ChevronLeft,
  MoreVertical,
  Phone,
  SendHorizontal,
  XCircle,
} from 'lucide-react'
import { toast } from 'react-toastify'
import SimpleBar from 'simplebar-react'

const MessageModal = ({
  messageOpen,
  closeModal,
  selectedDeal,
  handleOpenModal,
}: messageModalItem) => {
  const utils = api.useUtils()
  const [newMessage, setNewMessage] = useState<string>('')
  const [messages, setMessages] = useState<DealMessage[]>([])
  const [dealMessage, setDealMessage] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const messageRef = useRef<HTMLDivElement | null>(null)

  const { data: dealMessageData, isLoading: isLoadingDealMessage } =
    api.projectDealMessage.getByDealId.useQuery(
      { dealId: selectedDeal?.id?.toString() || '' },
      { enabled: !!selectedDeal?.id }
    )

  const updateDealMessage = api.projectDealMessage.update.useMutation({
    onSuccess: () => {
      toast.success('Status updated successfully!')
      utils.projectDealMessage.getByDealId.invalidate({
        dealId: selectedDeal?.id?.toString() || '',
      })
      setShowStatusMenu(false)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update status')
    },
  })

  useEffect(() => {
    if (selectedDeal) {
      setMessages(selectedDeal.messages || [])
      setDealMessage(dealMessageData)
    }
  }, [selectedDeal, dealMessageData])

  const sendMessage = () => {
    if (newMessage.trim() !== '') {
      const newMessageObject: DealMessage = {
        id: Date.now(),
        text: newMessage,
        sender: 'user',
      }
      setMessages([...messages, newMessageObject])
      setNewMessage('')
    }
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      if (messageRef.current) {
        messageRef.current.scrollIntoView({ behavior: 'smooth' })
      }
    }, 200)
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleStatusUpdate = async (
    newStatus: 'ACTIVE' | 'CLOSED' | 'ARCHIVED'
  ) => {
    if (!dealMessage) return

    try {
      setIsLoading(true)
      await updateDealMessage.mutateAsync({
        id: dealMessage.id,
        dealId: dealMessage.dealId,
        dealName: dealMessage.dealName,
        dealImage: dealMessage.dealImage,
        status: newStatus,
      })
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500'
      case 'CLOSED':
        return 'bg-blue-500'
      case 'ARCHIVED':
        return 'bg-gray-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Active'
      case 'CLOSED':
        return 'Closed'
      case 'ARCHIVED':
        return 'Archived'
      default:
        return 'Unknown'
    }
  }

  const statusOptions = [
    {
      value: 'ACTIVE',
      label: 'Active',
      icon: CheckCircle,
      color: 'text-green-500',
    },
    { value: 'CLOSED', label: 'Closed', icon: XCircle, color: 'text-blue-500' },
    {
      value: 'ARCHIVED',
      label: 'Archived',
      icon: Archive,
      color: 'text-gray-500',
    },
  ]

  return (
    <React.Fragment>
      <Modal
        isOpen={messageOpen}
        onClose={() => closeModal()}
        position="modal-br"
        id="callModal"
        contentClass="modal-content"
        size="modal-sm"
        content={() => (
          <>
            {selectedDeal && (
              <>
                <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-md dark:bg-dark-850">
                  <button
                    data-modal-close="messageModal"
                    className="p-0 text-gray-500 dark:text-dark-500 btn btn-icon-text size-10 hover:text-gray-800 dark:hover:text-dark-50 shrink-0">
                    <ChevronLeft></ChevronLeft>
                  </button>
                  <Image
                    src={dealMessage?.dealImage || selectedDeal.userimage}
                    height={40}
                    width={40}
                    alt="deal image"
                    className="rounded-full size-10"
                  />
                  <div className="grow">
                    <h6>{dealMessage?.dealName || selectedDeal.projectName}</h6>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-500 dark:text-dark-500">
                        <span
                          className={`inline-block ${getStatusColor(dealMessage?.status || 'ACTIVE')} size-1.5 rounded-full ltr:mr-0.5 rtl:ml-0.5 align-middle`}></span>
                        {getStatusLabel(dealMessage?.status || 'ACTIVE')}
                      </p>
                      {dealMessage?.deal?.revenue && (
                        <p className="text-xs font-medium text-green-600 dark:text-green-400">
                          ${dealMessage.deal.revenue.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowStatusMenu(!showStatusMenu)}
                      className="p-0 btn btn-icon-text size-10 text-gray-500 dark:text-dark-500 hover:text-gray-800 dark:hover:text-dark-50">
                      <MoreVertical className="size-4" />
                    </button>

                    {showStatusMenu && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-md shadow-lg z-50">
                        <div className="py-1">
                          <p className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-dark-500 border-b border-gray-100 dark:border-dark-700">
                            Update Status
                          </p>
                          {statusOptions.map((option) => {
                            const Icon = option.icon
                            return (
                              <button
                                key={option.value}
                                onClick={() =>
                                  handleStatusUpdate(
                                    option.value as
                                      | 'ACTIVE'
                                      | 'CLOSED'
                                      | 'ARCHIVED'
                                  )
                                }
                                disabled={
                                  isLoading ||
                                  dealMessage?.status === option.value
                                }
                                className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed ${
                                  dealMessage?.status === option.value
                                    ? 'bg-gray-50 dark:bg-dark-700'
                                    : ''
                                }`}>
                                <Icon className={`size-4 ${option.color}`} />
                                <span>{option.label}</span>
                                {dealMessage?.status === option.value && (
                                  <CheckCircle className="size-4 text-green-500 ml-auto" />
                                )}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    data-modal-close="messageModal"
                    data-modal-target="callModal"
                    onClick={() => handleOpenModal(selectedDeal)}
                    className="p-0 btn btn-sub-red shrink-0 btn-icon-text size-10">
                    <Phone className="size-5" />
                  </button>
                </div>
                <SimpleBar className="px-5 mt-4 -mx-5 min-h-72 max-h-72">
                  <div className="flex flex-col gap-3">
                    {messages.map((message) => (
                      <div key={message.id}>
                        {message.sender === 'user' ? (
                          <div className="flex gap-2 group [&.right]:justify-end">
                            <div className="rounded-full size-9 group-[&.right]:order-2">
                              <Image
                                src={
                                  dealMessage?.dealImage ||
                                  selectedDeal.userimage
                                }
                                height={36}
                                width={36}
                                alt="userimage"
                                className="rounded-full"
                              />
                            </div>
                            <div className="py-2 px-3 text-sm font-medium rounded-md bg-gray-100 dark:bg-dark-850 max-w-64 text-gray-500 dark:text-dark-500 ltr:rounded-bl-none rtl:rounded-br-none group-[&.right]:bg-primary-100 group-[&.right]:text-primary-500 group-[&.right]:order-1 ltr:group-[&.right]:rounded-br-none rtl:group-[&.right]:rounded-bl-none ltr:group-[&.right]:rounded-bl-md rtl:group-[&.right]:rounded-br-md">
                              {message.text}
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2 right group [&.right]:justify-end">
                            <div className="rounded-full size-9 group-[&.right]:order-2">
                              <Image
                                src={userImg}
                                height={36}
                                width={36}
                                alt="userImg"
                                className="rounded-full"
                              />
                            </div>
                            <div className="py-2 px-3 text-sm font-medium rounded-md bg-gray-100 dark:bg-dark-850 max-w-64 text-gray-500 dark:text-dark-500 ltr:rounded-bl-none rtl:rounded-br-none group-[&.right]:bg-primary-100 group-[&.right]:text-primary-500 group-[&.right]:order-1 ltr:group-[&.right]:rounded-br-none rtl:group-[&.right]:rounded-bl-none ltr:group-[&.right]:rounded-bl-md rtl:group-[&.right]:rounded-br-md">
                              {message.text}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div ref={messageRef}></div>
                </SimpleBar>
                <div className="relative flex mt-4 hidden">
                  <input
                    type="text"
                    placeholder="Say something..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    autoComplete="off"
                    autoFocus
                    className="ltr:pr-12 rtl:pl-12 form-input "
                  />
                  <div className="absolute inset-y-0 items-center hidden ltr:right-1 rtl:left-1 sm:flex">
                    <button
                      type="button"
                      onClick={sendMessage}
                      className="inline-flex items-center justify-center text-white transition duration-200 ease-in-out rounded-md size-8 bg-primary-500 hover:bg-primary-600 focus:outline-hidden">
                      <SendHorizontal className="size-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      />
    </React.Fragment>
  )
}

export default MessageModal
