'use client'

import React, { useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'

import { Modal } from '@src/components/custom/modal/modal'
import { UserVideoCallModalProps } from '@src/dtos/apps/chat'
import { Mic, MicOff, PhoneMissed, Video, VideoOff } from 'lucide-react'

const UserVideoCallModal: React.FC<UserVideoCallModalProps> = ({
  open,
  closeModal,
  currentContact,
}) => {
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)

  return (
    <React.Fragment>
      <Modal
        isOpen={open}
        onClose={() => closeModal()}
        position="modal-center"
        id="videoCallModal"
        contentClass="modal-content"
        size="modal-sm"
        content={(onClose) => (
          <>
            {currentContact && (
              <div>
                <div className="relative overflow-hidden rounded-md">
                  {/* main image */}
                  {currentContact.receiverImage ? (
                    <Image
                      src={
                        currentContact.receiverImage ||
                        '/assets/images/chat/video-dummy.png'
                      }
                      alt="userImg"
                      className="main-image"
                      width={600}
                      height={400}
                    />
                  ) : (
                    <Image
                      src={'/assets/images/chat/video-1.png'}
                      alt="userImg"
                      className="main-image"
                      width={600}
                      height={400}
                    />
                  )}

                  {/* profile image */}
                  <Link
                    href="#!"
                    className="absolute inline-block right-5 bottom-5">
                    {isVideoOff ? (
                      <Image
                        src={'/assets/images/chat/video-dummy.png'}
                        alt="userImg"
                        className="h-24 rounded-md"
                        width={144}
                        height={96}
                      />
                    ) : (
                      <Image
                        src={
                          currentContact.senderImage ||
                          '/assets/images/avatar/user-6.png'
                        }
                        alt="userImg"
                        className="h-24 rounded-md"
                        width={144}
                        height={96}
                      />
                    )}
                  </Link>
                </div>

                <div className="flex items-center justify-center gap-2 pt-5">
                  <button
                    className="btn btn-sub-gray btn-icon"
                    onClick={() => setIsMuted(!isMuted)}>
                    {isMuted ? (
                      <MicOff className="size-5" />
                    ) : (
                      <Mic className="size-5" />
                    )}
                  </button>
                  <button className="btn btn-red btn-icon" onClick={onClose}>
                    <PhoneMissed className="size-5" />
                  </button>
                  <button
                    className="btn btn-sub-gray btn-icon"
                    onClick={() => {
                      setIsVideoOff(!isVideoOff)
                      onClose()
                    }}>
                    {isVideoOff ? (
                      <VideoOff className="size-5" />
                    ) : (
                      <Video className="size-5" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      />
    </React.Fragment>
  )
}

export default UserVideoCallModal
