'use client'

import React, { useEffect, useRef, useState } from 'react'

import Image, { StaticImageData } from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import MessageComponent from '@src/components/common/MessageComponent'
import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
} from '@src/components/custom/dropdown/dropdown'
import { GroupChatMessage, GroupChatRecord } from '@src/dtos'
import { GroupChatBoardProps } from '@src/dtos/apps/chat'
import { AppDispatch } from '@src/slices/reducer'
import {
  addGroupChatMessageRecord,
  deleteGroupChatMessageRecord,
  editGroupChatListRecordData,
} from '@src/slices/thunk'
import Picker, { EmojiClickData } from 'emoji-picker-react'
import {
  AudioLines,
  ChevronsLeft,
  Ellipsis,
  FileImage,
  Phone,
  Send,
  Video,
} from 'lucide-react'
import { useDispatch } from 'react-redux'
import SimpleBar from 'simplebar-react'

const GroupChatBoard: React.FC<GroupChatBoardProps> = ({
  handleAudioCallModal,
  currentGroupChat,
  handleDeleteGroupModal,
  onBack,
}) => {
  const dispatch = useDispatch<AppDispatch>()

  const [message, setMessage] = useState('')
  const [showPicker, setShowPicker] = useState(false)
  const [isCopySuccess, setIsCopySuccess] = useState(false)
  const [isReplyMessage, setIsReplyMessage] = useState<boolean>(false)

  const pickerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const [replyMessage, setReplyMessage] = useState<GroupChatMessage | null>(
    null
  )

  const router = useRouter()

  // formate time
  const formatTime = (date: Date): string => {
    const today = new Date()
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()

    // Options to format the time as "10:00 AM"
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }

    // Format time as "10:00 AM"
    const timeString = new Intl.DateTimeFormat('en-US', timeOptions).format(
      date
    )

    // Return "Today" if the date is today, otherwise format as "MM/DD/YYYY"
    return isToday
      ? `Today, ${timeString}`
      : `${date.toLocaleDateString()}, ${timeString}`
  }

  // handle add mesage
  const handleAddNewMessage = () => {
    if (message.trim() === '') {
      return
    }

    if (replyMessage && isReplyMessage) {
      const newMessage: GroupChatMessage = {
        ...replyMessage,
        id:
          currentGroupChat.messages && currentGroupChat.messages.length > 0
            ? currentGroupChat.messages.length + 1
            : 1,
        user: {
          name: 'Shopia',
          avatar: '/assets/images/avatar/user-17.png',
          status: 'online',
        },
        timestamp: formatTime(new Date()),
        message: message,
        type: 'sent',
      }
      if (newMessage) {
        dispatch(addGroupChatMessageRecord(currentGroupChat.id, newMessage))
        setMessage('')
        setIsReplyMessage(false)
        setReplyMessage(null)
        return true
      }
    }

    const newMessage: GroupChatMessage = {
      id:
        currentGroupChat.messages && currentGroupChat.messages.length > 0
          ? currentGroupChat.messages.length + 1
          : 1,
      user: {
        name: 'Shopia',
        avatar: '/assets/images/avatar/user-17.png',
        status: 'online',
      },
      timestamp: formatTime(new Date()),
      message: message,
      type: 'sent',
    }

    if (newMessage) {
      dispatch(addGroupChatMessageRecord(currentGroupChat.id, newMessage))
      setMessage('')
      return true
    }
  }

  // handle emoji
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessage((prev) => prev + emojiData.emoji)
  }

  // handle video call
  const handleVideoCallModal = () => {
    router.push('/apps/chat/video')
  }

  // Scroll to bottom function
  const scrollToBottom = () => {
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
      }
    }, 200)
  }

  // handle copy message
  const handleCopyMessage = (message: string) => {
    setIsCopySuccess(true)
    scrollToBottom()
    navigator.clipboard.writeText(message)
    setTimeout(() => {
      setIsCopySuccess(false)
    }, 2000)
  }

  // handle reply message
  const handleReplyMessage = (value: boolean, message: GroupChatMessage) => {
    setIsReplyMessage(value)

    // set reply message of text
    if (message.message) {
      const newMessage: GroupChatMessage = {
        ...message,
        id:
          currentGroupChat.messages && currentGroupChat.messages.length > 0
            ? currentGroupChat.messages.length + 1
            : 1,
        replyText: message.message,
        contentType: 'content',
      }
      if (newMessage) {
        setReplyMessage(newMessage)
      }
    }

    // set reply message of image
    if (message.images) {
      const newMessage: GroupChatMessage = {
        ...message,
        id:
          currentGroupChat.messages && currentGroupChat.messages.length > 0
            ? currentGroupChat.messages.length + 1
            : 1,
        replyText:
          message.images && message.images.length > 0
            ? Array.isArray(message.images)
              ? message.images.join(', ') // Convert array to string
              : message.images
            : undefined,
        contentType: 'image',
      }
      if (newMessage) {
        setReplyMessage(newMessage)
      }
    }
  }

  // handle close reply message
  const handleCloseReplyMessage = () => {
    setIsReplyMessage(false)
    setReplyMessage(null)
  }

  // handle delete message
  const handleDeleteMessage = (message: GroupChatMessage) => {
    dispatch(deleteGroupChatMessageRecord(currentGroupChat.id, message))
  }

  // handle chat clear
  const handleChatClear = (record: GroupChatRecord) => {
    const newContact: GroupChatRecord = {
      ...record,
      messages: [],
    }
    if (newContact) {
      dispatch(editGroupChatListRecordData(newContact))
    }
  }

  // Handle outsideClick based close picker
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Close picker when clicked outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setShowPicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [pickerRef])

  // Call scrollToBottom when key moments are added
  useEffect(() => {
    scrollToBottom()
  }, [currentGroupChat])

  return (
    <React.Fragment>
      <div className="col-span-12 overflow-hidden 2xl:col-span-6 card">
        <SimpleBar className="max-h-[calc(100vh_-_19rem)] min-h-[calc(100vh_-_19rem)] relative">
          {/* top bar */}
          <div className="sticky inset-x-0 top-0 z-50 flex items-center gap-3 border-b border-gray-200 card-body bg-white/30 dark:bg-dark-900/90 dark:border-dark-800 backdrop-blur-lg">
            <div className="xl:hidden shrink-0">
              <button className="btn btn-sub-gray btn-icon" onClick={onBack}>
                <ChevronsLeft className="size-5" />
              </button>
            </div>
            <div className="relative flex items-center justify-center p-2 font-semibold transition duration-200 ease-linear bg-gray-100 rounded-full dark:bg-dark-850 size-11 shrink-0">
              <Image
                src={
                  (currentGroupChat && currentGroupChat.image) ||
                  '/assets/images/brands/img-12.png'
                }
                alt="userImg"
                className="rounded-full"
                width={28}
                height={28}
              />
            </div>
            <div className="grow">
              <h6>
                <Link href="#!">
                  {(currentGroupChat && currentGroupChat.name) ||
                    'Social Medium Team'}
                </Link>
              </h6>
              <p className="text-gray-500 dark:text-dark-500">
                {currentGroupChat && currentGroupChat.active}
              </p>
            </div>
            <button
              title="phone call btn"
              className="btn btn-active-red btn-icon shrink-0"
              onClick={handleAudioCallModal}>
              <Phone className="size-5" />
            </button>
            <button
              title="video call btn"
              className="btn btn-active-purple btn-icon shrink-0"
              onClick={handleVideoCallModal}>
              <Video className="size-5" />
            </button>
          </div>

          <div className="pb-0 card-body">
            <div
              className="flex flex-col justify-end min-h-[calc(100vh_-_24rem)] gap-5"
              id="groupchat-messages">
              {/* message */}
              {currentGroupChat &&
                currentGroupChat.messages &&
                currentGroupChat.messages.length > 0 &&
                currentGroupChat.messages.map(
                  (message: GroupChatMessage, index: number) => (
                    <div
                      className={`flex items-end max-w-xl gap-3 ltr:[&.right]:ml-auto rtl:[&.right]:mr-auto group/chat ${
                        message.type === 'sent' ? 'right' : ''
                      } `}
                      key={index}>
                      {message.replyText ? (
                        <>
                          {/* render reply text message */}
                          {message.contentType === 'content' &&
                            message.message && (
                              <>
                                <div className="relative flex items-center justify-center font-semibold transition duration-200 ease-linear bg-gray-100 dark:bg-dark-850 rounded-full size-8 shrink-0 group-[&.right]/chat:order-2">
                                  <Image
                                    src={message.user.avatar}
                                    alt="userImg"
                                    className="rounded-full"
                                    width={32}
                                    height={32}
                                  />
                                  <span className="absolute bottom-0 bg-green-500 border-2 border-white dark:border-dark-900 rounded-full ltr:right-0 rtl:left-0 size-2.5"></span>
                                </div>
                                <div className="flex items-end gap-2 last:mb-0">
                                  <div className="alert alert-primary px-4 ">
                                    <div className="grow">
                                      <p className="ltr:group-[&.right]/chat:text-right rtl:group-[&.right]/chat:text-left text-gray-500 dark:text-dark-500 mb-1 text-xs">
                                        {message.timestamp}
                                      </p>
                                      <div className="card border-0 shadow-none mb-1">
                                        <div className="card-body p-3">
                                          <h6 className="mb-2">
                                            {message.user.name}
                                          </h6>
                                          <p className="mb-0">
                                            <MessageComponent
                                              message={
                                                message.replyText as string
                                              }
                                            />
                                          </p>
                                        </div>
                                      </div>
                                      <MessageComponent
                                        message={message.message}
                                      />
                                    </div>
                                  </div>
                                  <Dropdown
                                    position="right"
                                    trigger="click"
                                    dropdownClassName="dropdown">
                                    <DropdownButton colorClass="flex items-center text-gray-500 dark:text-dark-500">
                                      <i className="ri-more-2-fill"></i>
                                    </DropdownButton>
                                    <DropdownMenu>
                                      <Link
                                        href="#!"
                                        className="dropdown-item"
                                        onClick={(e) => {
                                          e.preventDefault()
                                          handleReplyMessage(true, message)
                                        }}>
                                        <i className="align-middle ltr:mr-2 rtl:ml-2 ri-reply-line"></i>
                                        <span>Reply</span>
                                      </Link>

                                      <Link
                                        href="#!"
                                        className="dropdown-item "
                                        onClick={(e) => {
                                          e.preventDefault()
                                          handleCopyMessage(
                                            message.message ?? ''
                                          )
                                        }}>
                                        <i className="align-middle ltr:mr-2 rtl:ml-2 ri-file-copy-line"></i>
                                        <span>Copy</span>
                                      </Link>

                                      <Link
                                        href="#!"
                                        className="dropdown-item "
                                        onClick={(e) => {
                                          e.preventDefault()
                                          handleDeleteMessage(message)
                                        }}>
                                        <i className="align-middle ltr:mr-2 rtl:ml-2 ri-delete-bin-line"></i>
                                        <span>Delete</span>
                                      </Link>
                                    </DropdownMenu>
                                  </Dropdown>
                                </div>
                              </>
                            )}

                          {/* render reply image message */}
                          {message.contentType === 'image' && (
                            <>
                              <div className="relative flex items-center justify-center font-semibold transition duration-200 ease-linear bg-gray-100 dark:bg-dark-850 rounded-full size-8 shrink-0 group-[&.right]/chat:order-2">
                                <Image
                                  src={message.user.avatar}
                                  alt="userImg"
                                  className="rounded-full"
                                  width={32}
                                  height={32}
                                />
                                <span className="absolute bottom-0 bg-green-500 border-2 border-white dark:border-dark-900 rounded-full ltr:right-0 rtl:left-0 size-2.5"></span>
                              </div>
                              <div className="alert alert-primary px-4">
                                <div className="grow">
                                  <p className="ltr:group-[&.right]/chat:text-right rtl:group-[&.right]/chat:text-left text-gray-500 dark:text-dark-500 mb-1 text-xs">
                                    {message.timestamp}
                                  </p>
                                  <div className="card border-0 shadow-none mb-1">
                                    <div className="card-body p-3">
                                      <h6 className="mb-2">
                                        {message.user.name}
                                      </h6>
                                      <div className="last:mb-0">
                                        <div
                                          className={`flex ${
                                            message.type === 'sent'
                                              ? 'flex-end'
                                              : 'flex-start'
                                          } items-center flex-wrap gap-4`}>
                                          {message &&
                                            message.images &&
                                            message.images.length > 0 &&
                                            Array.isArray(message.images) &&
                                            message.images.map(
                                              (
                                                img: string | StaticImageData,
                                                index: number
                                              ) => {
                                                return (
                                                  <div
                                                    className="w-[121px] h-[81px]"
                                                    key={index}>
                                                    <Link
                                                      href="#!"
                                                      title="Gallery Images"
                                                      // onClick={() => handleImageClick(index)}
                                                    >
                                                      <Image
                                                        src={
                                                          img ||
                                                          '/assets/images/avatar/user-18.png'
                                                        }
                                                        alt="userImg"
                                                        className="rounded-md"
                                                        width={121}
                                                        height={81}
                                                      />
                                                    </Link>
                                                  </div>
                                                )
                                              }
                                            )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  {message.message && (
                                    <MessageComponent
                                      message={message.message}
                                    />
                                  )}
                                </div>
                              </div>
                              <Dropdown
                                position="right"
                                trigger="click"
                                dropdownClassName="dropdown">
                                <DropdownButton colorClass="flex items-center text-gray-500 dark:text-dark-500">
                                  <i className="ri-more-2-fill"></i>
                                </DropdownButton>
                                <DropdownMenu>
                                  <Link
                                    href="#!"
                                    className="dropdown-item"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      handleReplyMessage(true, message)
                                    }}>
                                    <i className="align-middle ltr:mr-2 rtl:ml-2 ri-reply-line"></i>
                                    <span>Reply</span>
                                  </Link>

                                  <Link
                                    href="#!"
                                    className="dropdown-item "
                                    onClick={(e) => {
                                      e.preventDefault()
                                      handleCopyMessage(message.message ?? '')
                                    }}>
                                    <i className="align-middle ltr:mr-2 rtl:ml-2 ri-file-copy-line"></i>
                                    <span>Copy</span>
                                  </Link>

                                  <Link
                                    href="#!"
                                    className="dropdown-item "
                                    onClick={(e) => {
                                      e.preventDefault()
                                      handleDeleteMessage(message)
                                    }}>
                                    <i className="align-middle ltr:mr-2 rtl:ml-2 ri-delete-bin-line"></i>
                                    <span>Delete</span>
                                  </Link>
                                </DropdownMenu>
                              </Dropdown>
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="relative flex items-center justify-center font-semibold transition duration-200 ease-linear bg-gray-100 dark:bg-dark-850 rounded-full size-8 shrink-0 group-[&.right]/chat:order-2">
                            <Image
                              src={message.user.avatar}
                              alt="userImg"
                              className="rounded-full"
                              width={32}
                              height={32}
                            />
                            <span className="absolute bottom-0 bg-green-500 border-2 border-white dark:border-dark-900 rounded-full ltr:right-0 rtl:left-0 size-2.5"></span>
                          </div>
                          <div className="*:mb-3">
                            {/* render text messages */}
                            {message.message && (
                              <div className="flex items-end gap-2 last:mb-0">
                                <div className="grow">
                                  <p className="ltr:group-[&.right]/chat:text-right rtl:group-[&.right]/chat:text-left text-gray-500 dark:text-dark-500 mb-1 text-xs">
                                    {message.timestamp}
                                  </p>
                                  <div className="px-4 py-2.5 last:mb-0 bg-gray-100 dark:bg-dark-850 rounded-xl ltr:rounded-bl-none rtl:rounded-br-none group-[&.right]/chat:order-1 ltr:group-[&.right]/chat:rounded-bl-lg rtl:group-[&.right]/chat:rounded-br-lg ltr:group-[&.right]/chat:rounded-br-none rtl:group-[&.right]/chat:rounded-bl-none">
                                    <MessageComponent
                                      message={message.message}
                                    />
                                  </div>
                                </div>
                                <Dropdown
                                  position="right"
                                  trigger="click"
                                  dropdownClassName="dropdown">
                                  <DropdownButton colorClass="flex items-center text-gray-500 dark:text-dark-500">
                                    <i className="ri-more-2-fill"></i>
                                  </DropdownButton>
                                  <DropdownMenu>
                                    <Link
                                      href="#!"
                                      className="dropdown-item"
                                      onClick={(e) => {
                                        e.preventDefault()
                                        handleReplyMessage(true, message)
                                      }}>
                                      <i className="align-middle ltr:mr-2 rtl:ml-2 ri-reply-line"></i>
                                      <span>Reply</span>
                                    </Link>

                                    <Link
                                      href="#!"
                                      className="dropdown-item "
                                      onClick={(e) => {
                                        e.preventDefault()
                                        handleCopyMessage(message.message ?? '')
                                      }}>
                                      <i className="align-middle ltr:mr-2 rtl:ml-2 ri-file-copy-line"></i>
                                      <span>Copy</span>
                                    </Link>

                                    <Link
                                      href="#!"
                                      className="dropdown-item "
                                      onClick={(e) => {
                                        e.preventDefault()
                                        handleDeleteMessage(message)
                                      }}>
                                      <i className="align-middle ltr:mr-2 rtl:ml-2 ri-delete-bin-line"></i>
                                      <span>Delete</span>
                                    </Link>
                                  </DropdownMenu>
                                </Dropdown>
                              </div>
                            )}

                            {/* render images messages */}
                            {message && message.images && (
                              <div className="last:mb-0">
                                <div
                                  className={`flex ${
                                    message.type === 'sent'
                                      ? 'flex-end'
                                      : 'flex-start'
                                  } items-center flex-wrap gap-4`}>
                                  {message.images.length > 0 &&
                                    Array.isArray(message.images) &&
                                    message.images.map(
                                      (
                                        img: string | StaticImageData,
                                        index: number
                                      ) => {
                                        return (
                                          <div
                                            className="w-[121px] h-[81px]"
                                            key={index}>
                                            <Link
                                              href="#!"
                                              title="Gallery Images"
                                              // onClick={() => handleImageClick(index)}
                                            >
                                              <Image
                                                src={
                                                  img ||
                                                  '/assets/images/avatar/user-18.png'
                                                }
                                                alt="userImg"
                                                className="rounded-md"
                                                width={121}
                                                height={81}
                                              />
                                            </Link>
                                          </div>
                                        )
                                      }
                                    )}
                                </div>
                              </div>
                            )}
                          </div>
                          <span>
                            {message && !message.message && (
                              <Dropdown
                                position="right"
                                trigger="click"
                                dropdownClassName="dropdown">
                                <DropdownButton colorClass="flex items-center text-gray-500 dark:text-dark-500">
                                  <i className="ri-more-2-fill"></i>
                                </DropdownButton>
                                <DropdownMenu>
                                  <Link
                                    href="#!"
                                    className="dropdown-item"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      handleReplyMessage(true, message)
                                    }}>
                                    <i className="align-middle ltr:mr-2 rtl:ml-2 ri-reply-line"></i>
                                    <span>Reply</span>
                                  </Link>

                                  <Link
                                    href="#!"
                                    className="dropdown-item "
                                    onClick={(e) => {
                                      e.preventDefault()
                                      handleDeleteMessage(message)
                                    }}>
                                    <i className="align-middle ltr:mr-2 rtl:ml-2 ri-delete-bin-line"></i>
                                    <span>Delete</span>
                                  </Link>
                                </DropdownMenu>
                              </Dropdown>
                            )}
                          </span>
                        </>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  )
                )}
            </div>
            {/* Message copied alert */}
            {isCopySuccess && (
              <div
                className="bg-green-100 m-5 text-sm w-max mx-auto mb-0 border border-green-400 text-green-700 px-4 py-2 rounded relative"
                role="alert">
                Message copied
              </div>
            )}

            {/* reply message alert */}
            {isReplyMessage && (
              <div className="card absolute bottom-0 m-0 left-0 right-0 mx-5 w-[calc(100%_-_40px)]">
                <div className="alert m-4 alert-primary">
                  <h5 className="mb-2">You</h5>
                  {/* render text message as reply message */}
                  {replyMessage && replyMessage.contentType === 'content' && (
                    <p className="mb-0">
                      <MessageComponent
                        message={replyMessage.replyText || ''}
                      />
                    </p>
                  )}

                  {/* render image message as reply message */}
                  {replyMessage && replyMessage.contentType === 'image' && (
                    <div className="flex flex-wrap gap-2">
                      {/* reply images */}
                      {Array.isArray(replyMessage.replyText) &&
                        replyMessage.replyText.map(
                          (image: string, index: number) => (
                            <Image
                              key={index}
                              src={image || '/assets/images/avatar/user-18.png'}
                              width={84}
                              height={56}
                              className="rounded-md"
                              alt="image"
                            />
                          )
                        )}
                    </div>
                  )}

                  {/* render image message as reply message */}
                  <Link
                    href="#!"
                    className="btn-close text-primary-400 hover:text-primary-500"
                    onClick={(e) => {
                      e.preventDefault()
                      handleCloseReplyMessage()
                    }}>
                    <i className="ri-close-fill"></i>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </SimpleBar>

        <div className="card-body">
          <div className="flex items-center gap-2 p-2 border border-gray-200 rounded-md dark:border-dark-800">
            <button
              title="voice audio"
              className="btn btn-active-gray btn-icon shrink-0">
              <AudioLines className="size-5" />
            </button>
            <input
              type="text"
              className="border-0 form-input grow"
              placeholder="Type something ..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddNewMessage()}
            />
            <button
              title="submit"
              type="submit"
              className="btn btn-active-primary btn-icon shrink-0"
              onClick={() => handleAddNewMessage()}>
              <Send className="size-5" />
            </button>
            <div className="shrink-0">
              <label
                htmlFor="sendImages"
                className="btn btn-active-gray btn-icon">
                <FileImage className="size-5" />
              </label>
              <input
                title="Images upload"
                type="file"
                id="sendImages"
                className="hidden"
              />
            </div>
            <button
              title="emoji"
              className="text-lg btn btn-active-gray btn-icon shrink-0"
              onClick={() => setShowPicker(!showPicker)}>
              😊
            </button>
            {showPicker && (
              <div className="relative" ref={pickerRef}>
                <Picker
                  onEmojiClick={(emoji) => handleEmojiClick(emoji)}
                  className="!absolute bottom-0 end-0 !w-full min-w-[250px] sm:min-w-[350px]"
                />
              </div>
            )}
            <Dropdown
              position="right"
              trigger="click"
              dropdownClassName="dropdown">
              <DropdownButton colorClass="text-lg btn btn-active-gray btn-icon shrink-0">
                <Ellipsis className="size-5" />
              </DropdownButton>
              <DropdownMenu>
                <button
                  className="dropdown-item "
                  onClick={(e) => {
                    e.preventDefault()
                    handleChatClear(currentGroupChat)
                  }}>
                  <i className="align-middle ltr:mr-2 rtl:ml-2 ri-chat-4-line"></i>
                  <span>Clear Chat</span>
                </button>

                <button
                  className="dropdown-item "
                  onClick={(e) => {
                    e.preventDefault()
                    handleDeleteGroupModal()
                    // handleChatDelete(currentGroupChat);
                  }}>
                  <i className="align-middle ltr:mr-2 rtl:ml-2 ri-delete-bin-line"></i>
                  <span>Delete</span>
                </button>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default GroupChatBoard
