'use client'

import React, { useEffect, useRef, useState } from 'react'

import Image from 'next/image'

import { api } from '@src/trpc/react'
import { Bot, ChevronsLeft, Phone, Send, Video } from 'lucide-react'
import { toast } from 'react-toastify'
import SimpleBar from 'simplebar-react'
import { Socket, io } from 'socket.io-client'

interface UserChatBoardProps {
  selectedChatId: string | null
  selectedEmployeeId: string | null
  onBack: () => void
}

interface Message {
  id: string
  content: string
  type: 'USER' | 'AGENT'
  mediaType: string
  timestamp: Date
  chatId: string
  metadata?: any
}

const UserChatBoard: React.FC<UserChatBoardProps> = ({
  selectedChatId,
  selectedEmployeeId,
  onBack,
}) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [realtimeMessages, setRealtimeMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const utils = api.useUtils()

  // Get chat details
  const { data: chat, isLoading: isLoadingChat } =
    api.projectChat.getById.useQuery(
      { id: selectedChatId || '' },
      {
        enabled: !!selectedChatId,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
      }
    )

  // Get initial messages
  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    refetch: refetchMessages,
  } = api.projectMessage.getByChatId.useQuery(
    { chatId: selectedChatId || '' },
    {
      enabled: !!selectedChatId,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    }
  )

  // Mark messages as read mutation
  const markAsReadMutation = api.projectMessage.markAsRead.useMutation({
    onSuccess: () => {
      // Invalidate chat list to update unread count badges
      utils.projectChat.getByEmployeeId.invalidate()
    },
  })

  // Initialize WebSocket connection
  useEffect(() => {
    if (!selectedChatId) return

    // Clear realtime messages when changing chat
    setRealtimeMessages([])
    setIsTyping(false)

    // Explicitly refetch messages from DB for this chat
    refetchMessages()

    // Mark all agent messages as read when opening chat
    markAsReadMutation.mutate({ chatId: selectedChatId })

    // Connect to WebSocket server
    const socket = io('http://localhost:4000', {
      transports: ['websocket'],
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('WebSocket connected:', socket.id)
      // Join the chat room
      socket.emit('join-chat', {
        chatId: selectedChatId,
        userId: selectedEmployeeId,
      })
    })

    socket.on('joined-chat', ({ chatId }) => {
      console.log('Joined chat:', chatId)
    })

    // Listen for new messages
    socket.on('message-received', ({ message }) => {
      console.log('Message received:', message)
      setRealtimeMessages((prev) => [...prev, message])
    })

    // Listen for typing indicators
    socket.on('user-typing', ({ userId, isTyping }) => {
      if (userId === 'agent') {
        setIsTyping(isTyping)
      }
    })

    socket.on('error', ({ message }) => {
      toast.error(message)
    })

    // Cleanup on unmount or chat change
    return () => {
      if (selectedChatId) {
        socket.emit('leave-chat', { chatId: selectedChatId })
      }
      socket.disconnect()
    }
  }, [selectedChatId, selectedEmployeeId, refetchMessages])

  // Combine initial messages with realtime messages
  const allMessages = [
    ...(messagesData?.messages || []),
    ...realtimeMessages.filter(
      (rtMsg) => !messagesData?.messages.some((msg) => msg.id === rtMsg.id)
    ),
  ].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [allMessages, isTyping])

  // Send message
  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedChatId || !socketRef.current) return

    setIsSending(true)

    socketRef.current.emit('send-message', {
      chatId: selectedChatId,
      content: messageInput.trim(),
      type: 'USER',
      metadata: {},
    })

    setMessageInput('')
    setIsSending(false)
  }

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

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
  const employeeInitials = chat.employee
    ? `${chat.employee.firstName.charAt(0)}${chat.employee.lastName.charAt(0)}`
    : chat.userId.substring(0, 2).toUpperCase()
  const agentInitials = chat.agent?.name
    ? chat.agent.name.substring(0, 2).toUpperCase()
    : 'AI'
  const agentImage = chat.agent?.files?.[0]?.s3Url || null

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
                {chat.employee?.image ? (
                  <Image
                    src={chat.employee.image}
                    alt={employeeName}
                    className="rounded-full size-12 object-cover"
                    width={48}
                    height={48}
                  />
                ) : (
                  <span>{employeeInitials}</span>
                )}
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
              {allMessages.length > 0 ? (
                allMessages.map((message) => {
                  const isAgent = message.type === 'AGENT'
                  return (
                    <div
                      key={message.id}
                      className={`flex gap-2 ${isAgent ? 'justify-end' : 'justify-start'}`}>
                      {/* Avatar - show on left for USER, right for AGENT */}
                      {!isAgent && (
                        <div className="flex items-center justify-center font-semibold bg-gray-100 rounded-full dark:bg-dark-850 size-8 shrink-0">
                          {chat.employee?.image ? (
                            <Image
                              src={chat.employee.image}
                              alt={employeeName}
                              className="rounded-full size-8 object-cover"
                              width={32}
                              height={32}
                            />
                          ) : (
                            <span className="text-xs">{employeeInitials}</span>
                          )}
                        </div>
                      )}

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

                      {/* Avatar - show on right for AGENT */}
                      {isAgent && (
                        <div className="flex items-center justify-center font-semibold bg-primary-100 dark:bg-primary-900 rounded-full size-8 shrink-0">
                          {agentImage ? (
                            <Image
                              src={agentImage}
                              alt={chat.agent?.name || 'Agent'}
                              className="rounded-full size-8 object-cover"
                              width={32}
                              height={32}
                            />
                          ) : (
                            <Bot className="size-6 text-gray-600 dark:text-gray-400" />
                          )}
                        </div>
                      )}
                    </div>
                  )
                })
              ) : (
                <div className="text-center text-gray-500 dark:text-dark-500 py-8">
                  No messages yet. Start the conversation!
                </div>
              )}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-end">
                  <div className="bg-primary-500 text-white rounded-lg p-3 max-w-[70%]">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-100"></span>
                      <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-200"></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </SimpleBar>

          {/* Message Input */}
          <div className="pt-4 border-t border-gray-200 dark:border-dark-800">
            <div className="flex items-center gap-2">
              <input
                type="text"
                className="form-input flex-1"
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isSending}
              />
              <button
                className="btn btn-primary flex items-center gap-2"
                onClick={handleSendMessage}
                disabled={!messageInput.trim() || isSending}>
                <Send className="size-4" />
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
