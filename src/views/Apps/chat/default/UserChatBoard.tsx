'use client'

import React, { useEffect, useRef } from 'react'

import { api } from '@src/trpc/react'
import { ChevronsLeft, Phone, Video } from 'lucide-react'
import SimpleBar from 'simplebar-react'

interface UserChatBoardProps {
  selectedChatId: string | null
  selectedEmployeeId: string | null
  onBack: () => void
}

const UserChatBoard: React.FC<UserChatBoardProps> = ({
  selectedChatId,
  selectedEmployeeId,
  onBack,
}) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  // Get chat details
  const { data: chat, isLoading: isLoadingChat } =
    api.projectChat.getById.useQuery(
      { id: selectedChatId || '' },
      { enabled: !!selectedChatId }
    )

  // Get messages
  const { data: messagesData, isLoading: isLoadingMessages } =
    api.projectMessage.getByChatId.useQuery(
      { chatId: selectedChatId || '' },
      { enabled: !!selectedChatId }
    )

  const messages = messagesData?.messages || []

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Format time
  const formatTime = (date: Date | string): string => {
    const messageDate = new Date(date)
    const today = new Date()
    const isToday =
      messageDate.getDate() === today.getDate() &&
      messageDate.getMonth() === today.getMonth() &&
      messageDate.getFullYear() === today.getFullYear()

    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }

    if (isToday) {
      return messageDate.toLocaleTimeString('en-US', timeOptions)
    }

    const dateOptions: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }

    return messageDate.toLocaleString('en-US', dateOptions)
  }

  if (!selectedChatId) {
    return (
      <div className="col-span-12 xl:col-span-8 2xl:col-span-9 card">
        <div className="card-body">
          <div className="flex items-center justify-center h-96 text-gray-500 dark:text-dark-500">
            <div className="text-center">
              <p className="text-lg">Select a chat to view messages</p>
              <p className="text-sm mt-2">
                {selectedEmployeeId
                  ? 'Choose a chat from the list or create a new one'
                  : 'Select an employee first'}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isLoadingChat || isLoadingMessages) {
    return (
      <div className="col-span-12 xl:col-span-8 2xl:col-span-9 card">
        <div className="card-body">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!chat) {
    return (
      <div className="col-span-12 xl:col-span-8 2xl:col-span-9 card">
        <div className="card-body">
          <div className="flex items-center justify-center h-96 text-red-500">
            Chat not found
          </div>
        </div>
      </div>
    )
  }

  const employeeName = chat.employee
    ? `${chat.employee.firstName} ${chat.employee.lastName}`
    : chat.userId
  const initials = chat.employee
    ? `${chat.employee.firstName.charAt(0)}${chat.employee.lastName.charAt(0)}`
    : chat.userId.substring(0, 2).toUpperCase()

  return (
    <React.Fragment>
      <div className="col-span-12 xl:col-span-8 2xl:col-span-9 card">
        <div className="card-body">
          {/* Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-dark-800">
            <button
              onClick={onBack}
              className="xl:hidden p-2 hover:bg-gray-100 dark:hover:bg-dark-850 rounded-lg transition">
              <ChevronsLeft className="size-5" />
            </button>

            <div className="flex items-center gap-3 grow">
              <div className="relative flex items-center justify-center font-semibold bg-gray-100 rounded-full dark:bg-dark-850 size-12 shrink-0">
                <span>{initials}</span>
                {chat.status === 'ACTIVE' && (
                  <span className="absolute bottom-0 right-0 bg-green-500 border-2 border-white dark:border-dark-900 rounded-full size-3"></span>
                )}
              </div>

              <div className="grow">
                <h6 className="mb-0.5">{employeeName}</h6>
                <p className="text-sm text-gray-500 dark:text-dark-500">
                  {chat.agent?.name || 'Chat Agent'}
                </p>
              </div>
            </div>

            {/* Audio/Video call buttons (disabled for now) */}
            <div className="flex items-center gap-2">
              <button
                disabled
                className="p-2 hover:bg-gray-100 dark:hover:bg-dark-850 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
                <Phone className="size-5" />
              </button>
              <button
                disabled
                className="p-2 hover:bg-gray-100 dark:hover:bg-dark-850 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
                <Video className="size-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <SimpleBar className="h-[calc(100vh_-_25rem)] my-4">
            <div className="flex flex-col gap-4 p-4">
              {messages.length > 0 ? (
                messages.map((message) => {
                  const isAgent = message.type === 'AGENT'
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isAgent ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[70%] ${
                          isAgent
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 dark:bg-dark-850 text-gray-900 dark:text-gray-100'
                        } rounded-lg p-3`}>
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                        <p
                          className={`text-xs mt-1 ${
                            isAgent
                              ? 'text-primary-100'
                              : 'text-gray-500 dark:text-dark-500'
                          }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center text-gray-500 dark:text-dark-500 py-8">
                  No messages yet. Start the conversation!
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </SimpleBar>

          {/* Message Input (Disabled for now) */}
          <div className="pt-4 border-t border-gray-200 dark:border-dark-800">
            <div className="flex items-center gap-2">
              <input
                type="text"
                className="form-input flex-1"
                placeholder="Message sending will be implemented next..."
                disabled
              />
              <button className="btn btn-primary" disabled>
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default UserChatBoard
