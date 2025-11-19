'use client'

import React, { useEffect, useState } from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import { RootState } from '@src/slices/reducer'
import UserChatBoard from '@src/views/Apps/chat/default/UserChatBoard'
import UserChatList from '@src/views/Apps/chat/default/UserChatList'
import { useSession } from 'next-auth/react'
import { useSelector } from 'react-redux'

const AdvisorChat: NextPageWithLayout = () => {
  const { data: session, status } = useSession()
  const { currentProject } = useSelector((state: RootState) => state.Project)

  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [isMobileView, setIsMobileView] = useState<boolean>(false)
  const [currentView, setCurrentView] = useState<'chatList' | 'chatBoard'>(
    'chatList'
  )

  // Detect window resize and set mobile view state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        const mobileView = window.innerWidth <= 1024
        setIsMobileView(mobileView)

        // Reset to chat list on small screens when switching from larger screens
        if (mobileView) {
          setCurrentView('chatList')
        }
      }

      window.addEventListener('resize', handleResize)
      handleResize()

      return () => {
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [])

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId)
    if (isMobileView) {
      setCurrentView('chatBoard')
    }
  }

  const handleBackToChatList = () => {
    setCurrentView('chatList')
  }

  // Loading state
  if (status === 'loading') {
    return (
      <React.Fragment>
        <BreadCrumb title="Advisor Chat" subTitle="Digital Advisor" />
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
      </React.Fragment>
    )
  }

  // Not authenticated
  if (!session?.user) {
    return (
      <React.Fragment>
        <BreadCrumb title="Advisor Chat" subTitle="Digital Advisor" />
        <div className="card">
          <div className="card-body">
            <div className="text-center text-gray-500 dark:text-dark-500">
              <p>Please login to access the Digital Advisor chat.</p>
              <p className="mt-2 text-sm">
                You need to be authenticated to start a conversation.
              </p>
            </div>
          </div>
        </div>
      </React.Fragment>
    )
  }

  // No project selected
  if (!currentProject) {
    return (
      <React.Fragment>
        <BreadCrumb title="Advisor Chat" subTitle="Digital Advisor" />
        <div className="card">
          <div className="card-body">
            <div className="text-center text-gray-500 dark:text-dark-500">
              <p>No project selected. Please select a project first.</p>
              <p className="mt-2 text-sm">
                Go to{' '}
                <a
                  href="/apps/projects/grid"
                  className="text-primary-500 hover:underline">
                  Projects
                </a>{' '}
                to select a project.
              </p>
            </div>
          </div>
        </div>
      </React.Fragment>
    )
  }

  return (
    <React.Fragment>
      <BreadCrumb title="Advisor Chat" subTitle="Digital Advisor" />
      <div className="grid grid-cols-12 gap-x-space">
        {/* NO Employee Menu for Advisor - direct chat with agent */}

        {/* Conditionally render based on mobile or desktop view */}
        {isMobileView ? (
          currentView === 'chatList' ? (
            <UserChatList
              selectedChatId={selectedChatId}
              onSelectChat={handleSelectChat}
              chatType="ADVISOR"
              userId={session.user.id}
            />
          ) : (
            <UserChatBoard
              selectedChatId={selectedChatId}
              onBack={handleBackToChatList}
              chatType="ADVISOR"
              showEmployeeInfo={false}
            />
          )
        ) : (
          <>
            <UserChatList
              selectedChatId={selectedChatId}
              onSelectChat={handleSelectChat}
              chatType="ADVISOR"
              userId={session.user.id}
            />
            <UserChatBoard
              selectedChatId={selectedChatId}
              chatType="ADVISOR"
              showEmployeeInfo={false}
            />
          </>
        )}
      </div>
    </React.Fragment>
  )
}

export default AdvisorChat
