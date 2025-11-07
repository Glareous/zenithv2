'use client'

import React, { useEffect, useRef, useState } from 'react'

import Image, { StaticImageData } from 'next/image'
import Link from 'next/link'

import MessageComponent from '@src/components/common/MessageComponent'
import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
} from '@src/components/custom/dropdown/dropdown'
import {
  ContactChatRecord,
  UserChatMessageRecord,
  UserChatRecord,
} from '@src/dtos'
import { UserChatBoardProps } from '@src/dtos/apps/chat'
import { AppDispatch } from '@src/slices/reducer'
import {
  addContactChatRecordData,
  addDefaultChatMessageRecord,
  deleteDefaultChatMessageRecord,
  deleteDefaultChatRecordData,
  editDefaultChatListRecordData,
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

const UserChatBoard: React.FC<UserChatBoardProps> = ({
  currentChat,
  handleAudioCallModal,
  handleVideoCallModal,
  contactList,
  onBack,
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const [showPicker, setShowPicker] = useState(false)
  const [isCopySuccess, setIsCopySuccess] = useState(false)
  const [isReplyMessage, setIsReplyMessage] = useState<boolean>(false)
  const [replyMessage, setReplyMessage] =
    useState<UserChatMessageRecord | null>(null)
  const [message, setMessage] = useState('')

  const pickerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  // handle chat delete
  const handleChatDelete = (record: UserChatRecord) => {
    const newContact: ContactChatRecord = {
      id: contactList && contactList.length > 0 ? contactList.length + 1 : 1,
      roomId: record.roomId,
      name: record.name,
      avatar: record.receiverImage ?? '/assets/images/chat/video-dummy.png',
    }
    if (newContact) {
      dispatch(addContactChatRecordData(newContact))
    }
    dispatch(deleteDefaultChatRecordData([record.id]))
  }

  // handle chat clear
  const handleChatClear = (record: UserChatRecord) => {
    const newContact: UserChatRecord = {
      ...record,
      messages: [],
    }
    if (newContact) {
      dispatch(editDefaultChatListRecordData(newContact))
    }
  }

  // handle delete individual  message
  const handleDeleteMessage = (id: number, message: UserChatMessageRecord) => {
    dispatch(deleteDefaultChatMessageRecord(id, message))
  }

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

  // handle add new message
  const handleAddNewMessage = () => {
    const trimmedMessage = message.trim()

    // Don't do anything if message is empty or only whitespace
    if (trimmedMessage === '') return

    if (replyMessage && isReplyMessage) {
      const newMessage = {
        ...replyMessage,
        sender: 'You',
        time: formatTime(new Date()),
        text: message,
        avatar: '/assets/images/avatar/user-17.png',
        type: 'sent',
      }
      if (newMessage) {
        dispatch(addDefaultChatMessageRecord(currentChat.id, newMessage))
        setMessage('')
        setIsReplyMessage(false)
        setReplyMessage(null)
        return true
      }
    }

    const newMessage = {
      id:
        currentChat && currentChat.messages.length > 0
          ? currentChat.messages.length + 1
          : 1,
      sender: 'You',
      time: formatTime(new Date()),
      text: message,
      avatar: '/assets/images/avatar/user-17.png',
      type: 'sent',
    }
    if (newMessage) {
      dispatch(addDefaultChatMessageRecord(currentChat.id, newMessage))
      setMessage('')
    }
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

  // Scroll to bottom function
  const scrollToBottom = () => {
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
      }
    }, 200)
  }

  // handle emoji
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessage((prev) => prev + emojiData.emoji)
  }

  // handle reply message
  const handleReplyMessage = (
    value: boolean,
    message: UserChatMessageRecord
  ) => {
    setIsReplyMessage(value)

    // set reply message of text
    if (message.text) {
      const newMessage: UserChatMessageRecord = {
        ...message,
        id:
          currentChat.messages && currentChat.messages.length > 0
            ? currentChat.messages.length + 1
            : 1,
        replyText: message.text,
        contentType: 'content',
      }
      if (newMessage) {
        setReplyMessage(newMessage)
      }
    }

    // set reply message of image
    if (message.images) {
      const newMessage: UserChatMessageRecord = {
        ...message,
        id:
          currentChat.messages && currentChat.messages.length > 0
            ? currentChat.messages.length + 1
            : 1,
        replyText: message.images,
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
  }, [currentChat])

  return (
    <React.Fragment>
      <div
        className="col-span-12 overflow-hidden xl:col-span-8 card"
        id="chat-wrapper">
        <SimpleBar className="max-h-[calc(100vh_-_19rem)] min-h-[calc(100vh_-_19rem)] relative chat-body">
          <div className="sticky inset-x-0 top-0 z-50 flex items-center gap-3 border-b border-gray-200 card-body bg-white/30 dark:bg-dark-900/90 dark:border-dark-800 backdrop-blur-lg">
            <div className="xl:hidden shrink-0">
              <button
                className="btn btn-sub-gray btn-icon"
                title="back btn"
                onClick={onBack}>
                <ChevronsLeft className="size-5" />
              </button>
            </div>
            <div className="relative flex items-center justify-center font-semibold transition duration-200 ease-linear bg-gray-100 rounded-full dark:bg-dark-850 size-10 shrink-0">
              {currentChat && currentChat.receiverImage ? (
                <Image
                  src={currentChat.receiverImage}
                  alt="userImg"
                  className="rounded-full"
                  width={40}
                  height={40}
                />
              ) : (
                <span className="uppercase">
                  {currentChat && currentChat.name[0]}
                </span>
              )}
            </div>
            <div className="grow">
              <h6 className="mb-0.5">
                <Link href="#!">{currentChat && currentChat.name}</Link>
              </h6>
              <p className="text-gray-500 dark:text-dark-500">
                {currentChat && currentChat.lastSeen}
              </p>
            </div>
            <button
              title="call btn"
              className="btn btn-active-red shrink-0 btn-icon"
              onClick={handleAudioCallModal}>
              <Phone className="size-5" />
            </button>
            <button
              title="video call btn"
              className="btn btn-active-purple shrink-0 btn-icon"
              onClick={handleVideoCallModal}>
              <Video className="size-5" />
            </button>
          </div>
          <div className="pb-0 card-body relative">
            <div
              className="flex flex-col justify-end min-h-[calc(100vh_-_24rem)] gap-5 "
              id="chat-messages">
              {currentChat &&
                currentChat.messages &&
                currentChat.messages.map(
                  (msg: UserChatMessageRecord, index: number) => {
                    return (
                      <div
                        className={`messages flex items-end max-w-xl gap-3 ltr:[&.right]:ml-auto rtl:[&.right]:mr-auto group/chat ${
                          msg.type == 'sent' ? 'right' : ''
                        } `}
                        key={index}>
                        {msg.replyText ? (
                          <>
                            {/* render text message */}
                            {msg.contentType === 'content' && msg.text && (
                              <>
                                <div className="relative flex items-center justify-center font-semibold transition duration-200 ease-linear bg-gray-100 dark:bg-dark-850 rounded-full size-8 shrink-0 group-[&.right]/chat:order-2">
                                  {msg.avatar ? (
                                    <Image
                                      src={msg.avatar}
                                      alt="userImg"
                                      className="rounded-full"
                                      width={32}
                                      height={32}
                                    />
                                  ) : (
                                    <span>{msg.avatarName}</span>
                                  )}
                                  <span className="absolute bottom-0 bg-green-500 border-2 border-white dark:border-dark-900 rounded-full ltr:right-0 rtl:left-0 size-2.5"></span>
                                </div>
                                <div className="flex items-end gap-2 last:mb-0">
                                  {/* in below line class have to add */}
                                  <div className="alert alert-primary px-4 ">
                                    <div className="grow">
                                      <p className="ltr:group-[&.right]/chat:text-right rtl:group-[&.right]/chat:text-left text-gray-500 dark:text-dark-500 mb-1 text-xs">
                                        {msg.time}
                                      </p>
                                      <div className="card border-0 shadow-none mb-1">
                                        <div className="card-body p-3">
                                          <h6 className="mb-2">{msg.sender}</h6>
                                          <p className="mb-0">
                                            <MessageComponent
                                              message={msg.text.toString()}
                                            />
                                          </p>
                                        </div>
                                      </div>
                                      <MessageComponent message={msg.text} />
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
                                          handleReplyMessage(true, msg)
                                        }}>
                                        <i className="align-middle ltr:mr-2 rtl:ml-2 ri-reply-line"></i>
                                        <span>Reply</span>
                                      </Link>

                                      <Link
                                        href="#!"
                                        className="dropdown-item "
                                        onClick={(e) => {
                                          e.preventDefault()
                                          handleCopyMessage(msg.text ?? '')
                                        }}>
                                        <i className="align-middle ltr:mr-2 rtl:ml-2 ri-file-copy-line"></i>
                                        <span>Copy</span>
                                      </Link>

                                      <Link
                                        href="#!"
                                        className="dropdown-item "
                                        onClick={(e) => {
                                          e.preventDefault()
                                          handleDeleteMessage(
                                            currentChat.id,
                                            msg
                                          )
                                        }}>
                                        <i className="align-middle ltr:mr-2 rtl:ml-2 ri-delete-bin-line"></i>
                                        <span>Delete</span>
                                      </Link>
                                    </DropdownMenu>
                                  </Dropdown>
                                </div>
                              </>
                            )}

                            {/* render reply images */}
                            {msg.contentType === 'image' && (
                              <>
                                <div className="relative flex items-center justify-center font-semibold transition duration-200 ease-linear bg-gray-100 dark:bg-dark-850 rounded-full size-8 shrink-0 group-[&.right]/chat:order-2">
                                  {msg.avatar ? (
                                    <Image
                                      src={msg.avatar}
                                      alt="userImg"
                                      className="rounded-full"
                                      width={32}
                                      height={32}
                                    />
                                  ) : (
                                    <span>{msg.avatarName}</span>
                                  )}
                                  <span className="absolute bottom-0 bg-green-500 border-2 border-white dark:border-dark-900 rounded-full ltr:right-0 rtl:left-0 size-2.5"></span>
                                </div>
                                {/* in below line class have to add */}
                                <div className="alert alert-primary px-4 ">
                                  <div className="grow">
                                    <p className="ltr:group-[&.right]/chat:text-right rtl:group-[&.right]/chat:text-left text-gray-500 dark:text-dark-500 mb-1 text-xs">
                                      {msg.time}
                                    </p>
                                    <div className="card border-0 shadow-none mb-1">
                                      <div className="card-body p-3">
                                        <h6 className="mb-2">{msg.sender}</h6>
                                        <div className="last:mb-0">
                                          <div className="grid grid-cols-12 gap-4">
                                            {msg.images &&
                                              Array.isArray(msg.images) &&
                                              msg.images.length > 0 &&
                                              msg.images.map(
                                                (
                                                  img: string | StaticImageData,
                                                  index: number
                                                ) => {
                                                  return (
                                                    <div
                                                      className="col-span-3"
                                                      key={index}>
                                                      <Link
                                                        href="#!"
                                                        title="Gallery Images">
                                                        <Image
                                                          src={img}
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
                                            {msg &&
                                              msg.extraImagesCount &&
                                              msg.extraImagesCount > 0 && (
                                                <Link
                                                  href="#!"
                                                  className="flex items-center justify-center col-span-3 p-3 bg-gray-100 rounded-md dark:bg-dark-850">
                                                  <h6>
                                                    {msg.extraImagesCount}+
                                                  </h6>
                                                </Link>
                                              )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    {msg.text && (
                                      <MessageComponent message={msg.text} />
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
                                        handleReplyMessage(true, msg)
                                      }}>
                                      <i className="align-middle ltr:mr-2 rtl:ml-2 ri-reply-line"></i>
                                      <span>Reply</span>
                                    </Link>

                                    <Link
                                      href="#!"
                                      className="dropdown-item "
                                      onClick={(e) => {
                                        e.preventDefault()
                                        handleCopyMessage(msg.text ?? '')
                                      }}>
                                      <i className="align-middle ltr:mr-2 rtl:ml-2 ri-file-copy-line"></i>
                                      <span>Copy</span>
                                    </Link>

                                    <Link
                                      href="#!"
                                      className="dropdown-item "
                                      onClick={(e) => {
                                        e.preventDefault()
                                        handleDeleteMessage(currentChat.id, msg)
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
                              {msg.avatar ? (
                                <Image
                                  src={msg.avatar}
                                  alt="userImg"
                                  className="rounded-full"
                                  width={32}
                                  height={32}
                                />
                              ) : (
                                <span>{msg.sender[0]}</span>
                              )}
                              <span className="absolute bottom-0 bg-green-500 border-2 border-white dark:border-dark-900 rounded-full ltr:right-0 rtl:left-0 size-2.5"></span>
                            </div>
                            <div className="grow *:mb-3">
                              {/* render text messages */}
                              {msg.text && (
                                <div className="flex items-end gap-2 last:mb-0">
                                  <div className="grow">
                                    <p className="ltr:group-[&.right]/chat:text-right rtl:group-[&.right]/chat:text-left text-gray-500 dark:text-dark-500 mb-1 text-xs">
                                      {msg.time}
                                    </p>
                                    <div className="px-4 py-2.5 last:mb-0 bg-gray-100 dark:bg-dark-850 rounded-xl ltr:rounded-bl-none rtl:rounded-br-none group-[&.right]/chat:order-1 ltr:group-[&.right]/chat:rounded-bl-lg rtl:group-[&.right]/chat:rounded-br-lg ltr:group-[&.right]/chat:rounded-br-none rtl:group-[&.right]/chat:rounded-bl-none">
                                      <MessageComponent message={msg.text} />
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* render images message */}
                              {msg.images && Array.isArray(msg.images) && (
                                <div className="last:mb-0">
                                  <div className="grid grid-cols-12 gap-4">
                                    {msg.images.length > 0 &&
                                      msg.images.map(
                                        (
                                          img: string | StaticImageData,
                                          index: number
                                        ) => {
                                          return (
                                            <div
                                              className="col-span-3"
                                              key={index}>
                                              <Link
                                                href="#!"
                                                title="Gallery Images"
                                                // onClick={() => handleImageClick(index)}
                                              >
                                                <Image
                                                  src={img}
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
                                    {msg &&
                                      msg.extraImagesCount &&
                                      msg.extraImagesCount > 0 && (
                                        <Link
                                          href="#!"
                                          className="flex items-center justify-center col-span-3 p-3 bg-gray-100 rounded-md dark:bg-dark-850">
                                          <h6>{msg.extraImagesCount}+</h6>
                                        </Link>
                                      )}
                                  </div>
                                </div>
                              )}
                            </div>
                            <span>
                              {msg && (
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
                                        handleReplyMessage(true, msg)
                                      }}>
                                      <i className="align-middle ltr:mr-2 rtl:ml-2 ri-reply-line"></i>
                                      <span>Reply</span>
                                    </Link>

                                    <Link
                                      href="#!"
                                      className="dropdown-item "
                                      onClick={(e) => {
                                        e.preventDefault()
                                        handleDeleteMessage(currentChat.id, msg)
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
                  }
                )}
            </div>

            {/* reply message alert */}
            {isReplyMessage && (
              <div className="card absolute bottom-0 m-0 left-0 right-0 mx-5 w-[calc(100%_-_40px)]">
                <div className="alert m-4 alert-primary">
                  <h5 className="mb-2">You</h5>
                  {/* render text message as reply message */}
                  {replyMessage && replyMessage.contentType === 'content' && (
                    <p className="mb-0">
                      {typeof replyMessage.replyText === 'string' && (
                        <MessageComponent message={replyMessage.replyText} />
                      )}
                    </p>
                  )}

                  {/* render image message as reply message */}
                  {replyMessage && replyMessage.contentType === 'image' && (
                    <div className="flex flex-wrap gap-2">
                      {/* reply images */}
                      {Array.isArray(replyMessage.replyText) &&
                        replyMessage.replyText.map(
                          (image: string | StaticImageData, index: number) => (
                            <Image
                              key={index}
                              src={image}
                              width={84}
                              height={56}
                              className="rounded-md"
                              alt="image"
                            />
                          )
                        )}

                      {/* reply extra images count */}
                      {replyMessage &&
                        replyMessage.extraImagesCount &&
                        replyMessage.extraImagesCount > 0 && (
                          <div className="flex items-center justify-center w-20 max-h-14 p-3 bg-gray-300 rounded-md dark:bg-dark-850">
                            <h6>{replyMessage.extraImagesCount}+</h6>
                          </div>
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

          {/* Message copied alert */}
          {isCopySuccess && (
            <div
              className="bg-green-100 m-5 text-sm w-max mx-auto mb-0 border border-green-400 text-green-700 px-4 py-2 rounded relative"
              role="alert">
              Message copied
            </div>
          )}
        </SimpleBar>
        <div className="card-body">
          <div className="flex items-center gap-2 p-2 border border-gray-200 rounded-md dark:border-dark-800">
            <button className="btn btn-active-gray btn-icon shrink-0">
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
              type="submit"
              className="btn btn-active-primary btn-icon shrink-0"
              onClick={() => handleAddNewMessage()}>
              <Send className="size-5" />
            </button>
            <div className="hidden shrink-0 md:flex">
              <label
                htmlFor="sendImages"
                className="btn btn-active-gray btn-icon">
                <FileImage className="size-5" />
              </label>
              <input type="file" id="sendImages" className="hidden" />
            </div>
            <button
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
                    handleChatClear(currentChat)
                  }}>
                  <i className="align-middle ltr:mr-2 rtl:ml-2 ri-chat-4-line"></i>
                  <span>Clear Chat</span>
                </button>

                <button
                  className="dropdown-item "
                  onClick={(e) => {
                    e.preventDefault()
                    handleChatDelete(currentChat)
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

export default UserChatBoard
