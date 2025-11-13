'use client'

import React, { useEffect, useState } from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import { RootState } from '@src/slices/reducer'
import EmployeeMenu from '@src/views/Apps/chat/default/EmployeeMenu'
import UserChatBoard from '@src/views/Apps/chat/default/UserChatBoard'
import UserChatList from '@src/views/Apps/chat/default/UserChatList'
import { useSelector } from 'react-redux'

const Default: NextPageWithLayout = () => {
  const { currentProject } = useSelector((state: RootState) => state.Project)

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null)
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [isMobileView, setIsMobileView] = useState<boolean>(false)
  const [currentView, setCurrentView] = useState<'chatList' | 'chatBoard'>('chatList')

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

  const handleSelectEmployee = (employeeId: string) => {
    setSelectedEmployeeId(employeeId)
    setSelectedChatId(null) // Reset chat selection when changing employee
  }

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId)
    if (isMobileView) {
      setCurrentView('chatBoard')
    }
  }

  const handleBackToChatList = () => {
    setCurrentView('chatList')
  }

  if (!currentProject) {
    return (
      <React.Fragment>
        <BreadCrumb title="Chat" subTitle="Chats" />
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
      <BreadCrumb title="Employee Chat" subTitle="Chats" />
      <div className="grid grid-cols-12 gap-x-space">
        {/* Employee menu */}
        <EmployeeMenu
          selectedEmployeeId={selectedEmployeeId}
          onSelectEmployee={handleSelectEmployee}
        />

        {/* Conditionally render based on mobile or desktop view */}
        {isMobileView ? (
          currentView === 'chatList' ? (
            <UserChatList
              selectedEmployeeId={selectedEmployeeId}
              selectedChatId={selectedChatId}
              onSelectChat={handleSelectChat}
            />
          ) : (
            <UserChatBoard
              selectedChatId={selectedChatId}
              selectedEmployeeId={selectedEmployeeId}
              onBack={handleBackToChatList}
            />
          )
        ) : (
          // If not mobile view, display both components
          <>
            <UserChatList
              selectedEmployeeId={selectedEmployeeId}
              selectedChatId={selectedChatId}
              onSelectChat={handleSelectChat}
            />
            <UserChatBoard
              selectedChatId={selectedChatId}
              selectedEmployeeId={selectedEmployeeId}
              onBack={handleBackToChatList}
            />
          </>
        )}
      </div>
    </React.Fragment>
  )
}

export default Default
