'use client'

import React, { ChangeEvent, useEffect, useRef, useState } from 'react'

import Image from 'next/image'

import { videoGroupChat } from '@src/data'
import { GroupVideoCallChatRecord } from '@src/dtos'
import { SendHorizontal } from 'lucide-react'
import SimpleBar from 'simplebar-react'

const GroupVideoChat: React.FC = () => {
  const [chatMessageList, setChatMessageList] = useState<
    GroupVideoCallChatRecord[]
  >([])
  const [newMessage, setNewMessage] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (videoGroupChat) {
      setChatMessageList(videoGroupChat)
    }
  }, [])

  // Send message
  const handleSendMessage = () => {
    if (newMessage.trim() === '') return
    const newChatMessage: GroupVideoCallChatRecord = {
      id:
        chatMessageList && chatMessageList.length > 0
          ? chatMessageList.length + 1
          : 1,
      roomId: 3,
      avatar: '/assets/images/avatar/user-17.png',
      name: 'Sophia Mia',
      message: newMessage,
      time: new Date().toLocaleTimeString([], {
        minute: '2-digit',
        second: '2-digit',
      }),
    }
    setChatMessageList([...chatMessageList, newChatMessage])
    setNewMessage('')
  }

  return (
    <React.Fragment>
      <div className="card">
        <div className="card-header">
          <h6 className="card-title">Group Chat</h6>
        </div>
        <div className="card-body">
          <SimpleBar className="max-h-64 -mx-space px-space">
            <div className="flex flex-col gap-2" id="chat-messages">
              {chatMessageList &&
                chatMessageList.length > 0 &&
                chatMessageList.map(
                  (message: GroupVideoCallChatRecord, index: number) => (
                    <div className="flex gap-2" key={index}>
                      <div className="relative flex items-center justify-center font-semibold transition duration-200 ease-linear bg-gray-100 dark:bg-dark-850 rounded-full size-10 shrink-0 group-[&.right]/chat:order-2">
                        <Image
                          src={message.avatar}
                          alt="avatar"
                          className="rounded-full"
                          width={40}
                          height={40}
                        />
                      </div>
                      <div className="grow">
                        <h6 className="mb-1">{message.name}</h6>
                        <p className="text-gray-500 dark:text-dark-500">
                          {message.message}
                        </p>
                      </div>
                      <div className="self-end ml-3 text-gray-500 dark:text-dark-500 shrink-0">
                        {message.time}
                      </div>
                    </div>
                  )
                )}
              <div ref={messagesEndRef} />
            </div>
          </SimpleBar>
        </div>
        <div className="flex items-center gap-2 pt-0 card-body">
          <label htmlFor="sendMessage" className="hidden">
            sendMessage
          </label>
          <input
            type="text"
            id="sendMessage"
            className="form-input"
            placeholder="Type something ..."
            value={newMessage}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setNewMessage(e.target.value)
            }
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button
            title="send btn"
            className="btn btn-primary btn-icon shrink-0"
            onClick={handleSendMessage}>
            <SendHorizontal className="size-4" />
          </button>
        </div>
      </div>
    </React.Fragment>
  )
}

export default GroupVideoChat
