'use client'

import React, { useEffect, useRef, useState } from 'react'

import Image from 'next/image'

import { env } from '@src/env'
import { api } from '@src/trpc/react'
import { Bot, ChevronsLeft, Phone, Send, Video } from 'lucide-react'
import { toast } from 'react-toastify'
import SimpleBar from 'simplebar-react'
import { Socket, io } from 'socket.io-client'

interface UserChatBoardProps {
  selectedChatId: string | null
  selectedEmployeeId?: string | null
  onBack?: () => void
  chatType?: 'EMPLOYEE' | 'ADVISOR' | 'NIM_FRAUD'
  showEmployeeInfo?: boolean
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

interface ApiMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  session_id: string
}

const UserChatBoard: React.FC<UserChatBoardProps> = ({
  selectedChatId,
  selectedEmployeeId,
  onBack,
  chatType = 'EMPLOYEE',
  showEmployeeInfo = true,
}) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [realtimeMessages, setRealtimeMessages] = useState<Message[]>([])
  const [historyMessages, setHistoryMessages] = useState<Message[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [isSending, setIsSending] = useState(false)

  // Get employee details (needed for header display + id for external API)
  const { data: employee, isLoading: isLoadingEmployee } =
    api.projectEmployee.getById.useQuery(
      { id: selectedEmployeeId || '' },
      {
        enabled: !!selectedEmployeeId,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
      }
    )

  // Fetch chat history from external API filtered by session_id
  useEffect(() => {
    if (!employee?.id || !selectedChatId) {
      setHistoryMessages([])
      return
    }

    const fetchSessionMessages = async () => {
      setIsLoadingHistory(true)
      try {
        const response = await fetch(
          `${env.NEXT_PUBLIC_BACKEND_URL}/chat/history/${employee.id}`
        )

        if (!response.ok) {
          throw new Error(`Failed to fetch chat history: ${response.status}`)
        }

        const data = await response.json()
        const allMessages: ApiMessage[] = data.messages || []

        // Filter by selected session_id
        const sessionMessages = allMessages.filter(
          (msg) => msg.session_id === selectedChatId
        )

        // Map to internal Message format
        const mapped: Message[] = sessionMessages.map((msg, index) => ({
          id: `${index}-${msg.timestamp}`,
          content: msg.content,
          type: msg.role === 'user' ? 'USER' : 'AGENT',
          mediaType: 'TEXT',
          timestamp: new Date(msg.timestamp),
          chatId: selectedChatId,
        }))

        setHistoryMessages(mapped)
      } catch (error) {
        console.error('Error fetching session messages:', error)
        setHistoryMessages([])
      } finally {
        setIsLoadingHistory(false)
      }
    }

    fetchSessionMessages()
  }, [employee?.id, selectedChatId])

  // Initialize WebSocket connection
  useEffect(() => {
    if (!selectedChatId || !employee?.id) return

    // Clear realtime messages when changing session
    setRealtimeMessages([])
    setIsTyping(false)

    // Connect to WebSocket server
    const socket = io('http://localhost:4000', {
      transports: ['websocket'],
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('WebSocket connected:', socket.id)
      socket.emit('join-chat', {
        chatId: selectedChatId,
        userId: employee.id,
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

    // Cleanup on unmount or session change
    return () => {
      if (selectedChatId) {
        socket.emit('leave-chat', { chatId: selectedChatId })
      }
      socket.disconnect()
    }
  }, [selectedChatId, employee?.id])

  // Combine history messages with realtime messages
  const allMessages = [
    ...historyMessages,
    ...realtimeMessages.filter(
      (rtMsg) => !historyMessages.some((msg) => msg.id === rtMsg.id)
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
      <div className="col-span-12 xl:col-span-8 2xl:col-span-8 card">
        <div className="card-body">
          <div className="flex items-center justify-center h-96 text-gray-500 dark:text-dark-500">
            <div className="text-center">
              <p className="text-lg">Select a session to view messages</p>
              <p className="text-sm mt-2">
                {selectedEmployeeId
                  ? 'Choose a session from the list'
                  : 'Select an employee first'}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const isLoading = isLoadingEmployee || isLoadingHistory

  if (isLoading) {
    return (
      <div className="col-span-12 xl:col-span-8 2xl:col-span-8 card">
        <div className="card-body">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    )
  }

  // Employee info for header and messages
  const employeeName = employee
    ? `${employee.firstName} ${employee.lastName}`
    : 'Employee'
  const employeeInitials = employee
    ? `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`
    : 'EM'
  const employeeImage = employee?.image || null

  return (
    <React.Fragment>
      <div className="col-span-12 xl:col-span-8 2xl:col-span-8 card">
        <div className="card-body">
          {/* Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-dark-800">
            {onBack && (
              <button
                onClick={onBack}
                className="xl:hidden p-2 hover:bg-gray-100 dark:hover:bg-dark-850 rounded-lg transition">
                <ChevronsLeft className="size-5" />
              </button>
            )}

            <div className="flex items-center gap-3 grow">
              {showEmployeeInfo ? (
                <>
                  <div className="relative flex items-center justify-center font-semibold bg-gray-100 rounded-full dark:bg-dark-850 size-12 shrink-0">
                    {employeeImage ? (
                      <Image
                        src={employeeImage}
                        alt={employeeName}
                        className="rounded-full size-12 object-cover"
                        width={48}
                        height={48}
                      />
                    ) : (
                      <span>{employeeInitials}</span>
                    )}
                    <span className="absolute bottom-0 right-0 bg-green-500 border-2 border-white dark:border-dark-900 rounded-full size-3"></span>
                  </div>

                  <div className="grow">
                    <h6 className="mb-0.5">{employeeName}</h6>
                    <p className="text-xs text-gray-500 dark:text-dark-500">
                      Session: {selectedChatId.substring(0, 8)}...
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="relative flex items-center justify-center font-semibold bg-gradient-to-br from-primary-500 to-purple-500 rounded-full size-12 shrink-0">
                    <span className="text-white">AI</span>
                    <span className="absolute bottom-0 right-0 bg-green-500 border-2 border-white dark:border-dark-900 rounded-full size-3"></span>
                  </div>

                  <div className="grow">
                    <h6 className="mb-0.5">Digital Advisor</h6>
                    <p className="text-sm text-gray-500 dark:text-dark-500">
                      AI Assistant
                    </p>
                  </div>
                </>
              )}
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
                      {/* Avatar - show on left for USER */}
                      {!isAgent && (
                        <div className="flex items-center justify-center font-semibold bg-gray-100 rounded-full dark:bg-dark-850 size-8 shrink-0">
                          {employeeImage ? (
                            <Image
                              src={employeeImage}
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
                          <Bot className="size-6 text-gray-600 dark:text-gray-400" />
                        </div>
                      )}
                    </div>
                  )
                })
              ) : (
                <div className="text-center text-gray-500 dark:text-dark-500 py-8">
                  No messages in this session yet.
                </div>
              )}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-end">
                  <div className="bg-primary-500/50 text-white rounded-lg p-2 max-w-[70%]">
                    <div className="flex gap-1">
                      <span className="w-1 h-1 bg-white rounded-full animate-bounce"></span>
                      <span className="w-1 h-1 bg-white rounded-full animate-bounce delay-100"></span>
                      <span className="w-1 h-1 bg-white rounded-full animate-bounce delay-200"></span>
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
