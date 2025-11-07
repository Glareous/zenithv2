'use client'

import React, { useEffect, useRef, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '@src/components/custom/modal/modal'
import SiriOrb from '@src/components/smoothui/ui/SiriOrb'
import {
  GripHorizontal,
  MessageCircle,
  Phone,
  Search,
  ShoppingCart,
  X,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { PhoneInput } from 'react-international-phone'
import 'react-international-phone/style.css'
import { z } from 'zod'

const testAgentSchema = z.object({
  phoneNumber: z.string().min(1, 'Phone number is required'),
  message: z.string().min(1, 'Message is required'),
})

type TestAgentFormData = z.infer<typeof testAgentSchema>

interface TestAgentModalProps {
  isOpen: boolean
  onClose: () => void
}

interface ChatMessage {
  id: string
  text: string
  timestamp: Date
  sender: 'user' | 'agent'
}

export const TestAgentModal: React.FC<TestAgentModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [position, setPosition] = useState({ x: 300, y: 90 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [activeTab, setActiveTab] = useState<'phone' | 'widget' | 'chat'>(
    'phone'
  )
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [chatMessage, setChatMessage] = useState('')
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false)
  const [phoneValue, setPhoneValue] = useState('')
  const modalRef = useRef<HTMLDivElement>(null)

  const {
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<TestAgentFormData>({
    resolver: zodResolver(testAgentSchema),
    defaultValues: {
      phoneNumber: '',
      message: '',
    },
  })

  const handleMouseDown = (e: React.MouseEvent) => {
    if (modalRef.current) {
      const rect = modalRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
      setIsDragging(true)
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragOffset])

  useEffect(() => {
    if (isOpen) {
      setPosition({ x: 300, y: 90 })
      setMessages([])
      setChatMessage('')
    }
  }, [isOpen])

  const handleSendChatMessage = () => {
    if (chatMessage.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        text: chatMessage,
        timestamp: new Date(),
        sender: 'user',
      }
      setMessages((prev) => {
        const updated = [...prev, newMessage]
        return updated
      })
      setChatMessage('')
    } else {
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal */}
      <div
        ref={modalRef}
        className="fixed bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 w-96"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? 'grabbing' : 'default',
        }}>
        {/* Header - Draggable */}
        <div
          className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}>
          <div className="flex items-center gap-2">
            <GripHorizontal className="w-4 h-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Test Your Agent
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Tab Buttons */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-4">
            <button
              onClick={() => setActiveTab('phone')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'phone'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}>
              Phone
            </button>
            <button
              onClick={() => setActiveTab('widget')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'widget'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}>
              Widget
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'chat'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}>
              Chat
            </button>
          </div>

          {/* Phone Tab Content */}
          {activeTab === 'phone' && (
            <div className="grid grid-cols-12 gap-4">
              {/* Phone Number Selection */}
              <div className="col-span-12">
                <div className="relative">
                  <input
                    type="text"
                    value="Select a phone number"
                    readOnly
                    className="form-input pr-16 cursor-pointer text-sm text-gray-400"
                  />
                  <button
                    onClick={() => setIsPhoneModalOpen(true)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 border border-gray-200 dark:border-gray-800 rounded-md p-1 text-xs">
                    Change
                  </button>
                </div>
              </div>

              {/* Message Input */}
              <div className="col-span-12">
                <input
                  type="text"
                  value={watch('message')}
                  placeholder="Enter message"
                  onChange={(e) => setValue('message', e.target.value)}
                  className={`form-input ${
                    errors.message ? 'border-red-500' : ''
                  }`}
                />
                {errors.message && (
                  <span className="text-red-500 text-sm">
                    {errors.message.message}
                  </span>
                )}
              </div>

              {/* Phone Number Display */}
              <div className="col-span-12">
                <PhoneInput
                  defaultCountry="us"
                  value={phoneValue}
                  onChange={(value) => {
                    setPhoneValue(value)
                    setValue('phoneNumber', value || '')
                  }}
                  className={`${errors.phoneNumber ? 'border-red-500' : ''}`}
                  placeholder="Enter phone number"
                />
                {errors.phoneNumber && (
                  <span className="text-red-500 text-sm">
                    {errors.phoneNumber.message}
                  </span>
                )}
              </div>

              {/* Status */}
              <div className="col-span-12">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {'{not_specified}'}
                </div>
              </div>

              {/* Call Button */}
              <div className="col-span-12">
                <button
                  onClick={handleSubmit((data) => {})}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
                  <Phone className="w-4 h-4" />
                  Call Me
                </button>
              </div>
            </div>
          )}

          {/* Widget Tab Content */}
          {activeTab === 'widget' && (
            <div className="flex flex-col items-center justify-center py-8 space-y-6">
              {/* Voice Assistant Orb - Animated Siri-style orb */}
              <SiriOrb
                size="128px"
                colors={{
                  c1: 'oklch(75% 0.15 120)', // Green theme
                  c2: 'oklch(80% 0.12 140)', // Light green
                  c3: 'oklch(78% 0.14 100)', // Emerald
                }}
                animationDuration={15}
              />

              {/* AI Agent Label */}
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  AI Agent
                </h3>
                <div className="flex items-center justify-center gap-2">
                  <div className="relative">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="absolute top-0 left-0 w-2 h-2 bg-green-500 rounded-full animate-ping opacity-75"></div>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Available
                  </span>
                </div>
              </div>

              {/* Input Section */}
              <div className="w-full space-y-4 justify-center">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    {'{not_specified}'}
                  </span>
                  <input
                    type="text"
                    placeholder="Enter value"
                    className="flex-1 px-3 py-2 border border-gr  ay-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-center">
                  <button className="btn btn-green">Start a call</button>
                </div>
              </div>
            </div>
          )}

          {/* Chat Tab Content */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-96">
              {/* Header with History and New simulation */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    History
                  </span>
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                  <button className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 border border-gray-200 dark:border-gray-600 rounded-md">
                    New simulation
                  </button>
                </div>
              </div>

              {/* Chat Messages Area */}
              <div className="flex-1 overflow-y-auto py-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center h-full">
                    <p className="text-gray-500 dark:text-gray-400 mb-2">
                      No messages
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      Type your first message to get started
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 px-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender === 'user'
                            ? 'justify-end'
                            : 'justify-start'
                        }`}>
                        <div
                          className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                            message.sender === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                          }`}>
                          <p>{message.text}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex items-center justify-between gap-3">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Use Shift + Enter to create a new line..."
                    className="flex-1 px-3 py-2 text-xs text-gray-400 border-none outline-none bg-transparent placeholder-gray-400 dark:placeholder-gray-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendChatMessage()
                      }
                    }}
                  />
                  <button
                    onClick={handleSendChatMessage}
                    className="border border-gray-200 dark:border-gray-700 rounded-md p-3 hover:bg-gray-100 text-xs font-light">
                    Send
                    <span className="text-[11px] font-normal card p-2 ml-1 bg-blue-50 dark:bg-gray-700 text-gray-500">
                      Enter
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Phone Numbers Modal - Moved outside to cover full screen */}
      <Modal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        position="modal-center"
        size="modal-lg"
        title="Phone Numbers"
        content={() => (
          <div className="p-6">
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search number"
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-1"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <ShoppingCart className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Empty State */}
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <Phone className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No active phone numbers
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Purchase a phone number in order to make phone calls.
              </p>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors">
                <ShoppingCart className="w-4 h-4" />
                Buy a Phone Number
              </button>
            </div>
          </div>
        )}
      />
    </>
  )
}
