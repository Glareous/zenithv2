'use client'

import React, { useState } from 'react'

import Image from 'next/image'

import { RootState } from '@src/slices/reducer'
import { api } from '@src/trpc/react'
import { Plus, Search } from 'lucide-react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import SimpleBar from 'simplebar-react'

interface UserChatListProps {
  selectedEmployeeId?: string | null  // Optional for ADVISOR type
  selectedChatId: string | null
  onSelectChat: (chatId: string) => void
  chatType?: 'EMPLOYEE' | 'ADVISOR'   // Type of chat
  userId?: string                      // Current user ID for ADVISOR chats
}

const UserChatList: React.FC<UserChatListProps> = ({
  selectedEmployeeId,
  selectedChatId,
  onSelectChat,
  chatType = 'EMPLOYEE',
  userId,
}) => {
  const { currentProject } = useSelector((state: RootState) => state.Project)
  const [searchValue, setSearchValue] = useState('')

  // Get chats - either by employee or by user (for ADVISOR)
  const {
    data: chatsData,
    isLoading,
    refetch,
  } = chatType === 'EMPLOYEE'
    ? api.projectChat.getByEmployeeId.useQuery(
        {
          employeeId: selectedEmployeeId || '',
          status: 'ACTIVE',
        },
        {
          enabled: !!selectedEmployeeId,
        }
      )
    : api.projectChat.getByUserId.useQuery(
        {
          userId: userId || '',
          status: 'ACTIVE',
          chatType: 'ADVISOR',
        },
        {
          enabled: !!userId,
        }
      )

  // Get project to access organization
  const { data: project } = api.project.getById.useQuery(
    { id: currentProject?.id || '' },
    { enabled: !!currentProject?.id }
  )

  // Get organization to access chat agent IDs
  const { data: organization } = api.organization.getById.useQuery(
    { id: project?.organization?.id || '' },
    { enabled: !!project?.organization?.id }
  )

  // Get employee details
  const { data: employee } = api.projectEmployee.getById.useQuery(
    { id: selectedEmployeeId || '' },
    { enabled: !!selectedEmployeeId }
  )

  // Create new chat mutation
  const createChatMutation = api.projectChat.create.useMutation({
    onSuccess: (newChat) => {
      toast.success('New chat created!')
      refetch()
      onSelectChat(newChat.id)
    },
    onError: (error) => {
      toast.error(`Error creating chat: ${error.message}`)
    },
  })

  const handleCreateNewChat = () => {
    if (chatType === 'EMPLOYEE') {
      if (!selectedEmployeeId) {
        toast.error('Please select an employee first')
        return
      }

      if (!organization?.agentRrhhChatId) {
        toast.error('No RRHH chat agent configured for this organization')
        return
      }

      if (!employee) {
        toast.error('Employee not found')
        return
      }

      createChatMutation.mutate({
        userId: employee.employeeId,
        agentId: organization.agentRrhhChatId,
        employeeId: selectedEmployeeId,
        chatType: 'EMPLOYEE',
        metadata: {
          employeeName: `${employee.firstName} ${employee.lastName}`,
          source: 'web',
        },
      })
    } else {
      // ADVISOR chat
      if (!userId) {
        toast.error('User not authenticated')
        return
      }

      if (!organization?.agentAdvisorChatId) {
        toast.error('No advisor chat agent configured for this organization')
        return
      }

      createChatMutation.mutate({
        userId: userId,
        agentId: organization.agentAdvisorChatId,
        chatType: 'ADVISOR',
        metadata: {
          source: 'web-advisor',
        },
      })
    }
  }

  const chats = chatsData?.chats || []

  // Filter chats by search
  const filteredChats = chats.filter((chat: any) => {
    if (!searchValue.trim()) return true
    const searchLower = searchValue.toLowerCase()

    // For ADVISOR chats, only search by userId
    if (chatType === 'ADVISOR') {
      return chat.userId.toLowerCase().includes(searchLower)
    }

    // For EMPLOYEE chats, search by userId and employee name
    return (
      chat.userId.toLowerCase().includes(searchLower) ||
      chat.employee?.firstName?.toLowerCase().includes(searchLower) ||
      chat.employee?.lastName?.toLowerCase().includes(searchLower)
    )
  })

  if (chatType === 'EMPLOYEE' && !selectedEmployeeId) {
    return (
      <div className="col-span-12 xl:col-span-4 2xl:col-span-3 card">
        <div className="card-body">
          <div className="flex items-center justify-center h-64 text-gray-500 dark:text-dark-500">
            <p>Select an employee to view their chats</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <React.Fragment>
      <div className="col-span-12 xl:col-span-4 2xl:col-span-3 card">
        <div className="card-body">
          <div className="relative group/form">
            <input
              type="text"
              className="ltr:pl-9 rtl:pr-9 form-input ltr:group-[&.right]/form:pr-9 rtl:group-[&.right]/form:pl-9 ltr:group-[&.right]/form:pl-4 rtl:group-[&.right]/form:pr-4"
              placeholder="Search chats..."
              value={searchValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchValue(e.target.value)
              }
            />
            <button
              title="search btn"
              className="absolute inset-y-0 flex items-center text-gray-500 ltr:left-3 rtl:right-3 ltr:group-[&.right]/form:right-3 rtl:group-[&.right]/form:left-3 ltr:group-[&.right]/form:left-auto rtl:group-[&.right]/form:right-auto focus:outline-hidden">
              <Search className="size-4" />
            </button>
          </div>
          <div className="py-4">
            <button
              type="button"
              className="w-full btn btn-primary flex items-center justify-center gap-2"
              onClick={handleCreateNewChat}
              disabled={
                createChatMutation.isPending ||
                (chatType === 'EMPLOYEE'
                  ? !organization?.agentRrhhChatId
                  : !organization?.agentAdvisorChatId)
              }>
              {createChatMutation.isPending ? (
                'Creating...'
              ) : (
                <>
                  <Plus className="size-4" />
                  Start New Chat
                </>
              )}
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <SimpleBar className="max-h-[calc(100vh_-_22.5rem)] -mx-space">
              <ul className="flex flex-col gap-3">
                {filteredChats && filteredChats.length > 0 ? (
                  filteredChats.map((chat: any) => {
                    const isActive = selectedChatId === chat.id

                    // For ADVISOR chats, use agent name; for EMPLOYEE, use employee name
                    const displayName =
                      chatType === 'ADVISOR'
                        ? chat.agent?.name || 'Digital Advisor'
                        : chat.employee
                          ? `${chat.employee.firstName} ${chat.employee.lastName}`
                          : chat.userId

                    const initials =
                      chatType === 'ADVISOR'
                        ? chat.agent?.name?.substring(0, 2).toUpperCase() || 'AI'
                        : chat.employee
                          ? `${chat.employee.firstName.charAt(0)}${chat.employee.lastName.charAt(0)}`
                          : chat.userId.substring(0, 2).toUpperCase()

                    return (
                      <li key={chat.id} onClick={() => onSelectChat(chat.id)}>
                        <button
                          className={`${
                            isActive ? 'active' : ''
                          } flex items-center gap-2 px-space py-2.5 hover:bg-gray-50 dark:hover:bg-dark-850 [&.active]:bg-primary-500/10 transition ease-linear duration-300 group/item w-full text-left`}>
                          <div className={`relative flex items-center justify-center font-semibold transition duration-200 ease-linear rounded-full size-10 shrink-0 ${
                            chatType === 'ADVISOR'
                              ? 'bg-gradient-to-br from-primary-500 to-purple-500 text-white'
                              : 'bg-gray-100 dark:bg-dark-850'
                          }`}>
                            {chatType === 'EMPLOYEE' && chat.employee?.image ? (
                              <Image
                                src={chat.employee.image}
                                alt={displayName}
                                className="rounded-full size-10 object-cover"
                                width={40}
                                height={40}
                              />
                            ) : (
                              <span className="text-sm">{initials}</span>
                            )}
                            {chat.status === 'ACTIVE' && (
                              <span className="absolute bottom-0 bg-green-500 border-2 border-white dark:border-dark-900 rounded-full ltr:right-0.5 rtl:left-0.5 size-2.5"></span>
                            )}
                          </div>
                          <div className="overflow-hidden grow">
                            <h6 className="mb-0.5 truncate">{displayName}</h6>
                            <p
                              className={`text-sm truncate ${
                                chat._count?.messages > 0
                                  ? 'text-gray-900 dark:text-white font-medium'
                                  : 'text-gray-500 dark:text-dark-500'
                              }`}>
                              {chat.messages?.[0]?.content || 'No messages yet'}
                            </p>
                          </div>
                          <div className="ltr:text-right rtl:text-left shrink-0">
                            <p className="mb-1 text-xs text-gray-500 dark:text-dark-500">
                              {new Date(chat.updatedAt).toLocaleDateString()}
                            </p>
                            {chat._count?.messages > 0 && (
                              <span className="btn btn-xs btn-sub-red">
                                {chat._count.messages}
                              </span>
                            )}
                          </div>
                        </button>
                      </li>
                    )
                  })
                ) : (
                  <li className="text-center text-gray-500 dark:text-dark-500 py-8">
                    {searchValue.trim()
                      ? 'No chats found'
                      : 'No chats yet. Start a new chat!'}
                  </li>
                )}
              </ul>
            </SimpleBar>
          )}
        </div>
      </div>
    </React.Fragment>
  )
}

export default UserChatList
