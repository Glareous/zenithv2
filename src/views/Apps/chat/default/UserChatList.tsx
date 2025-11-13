'use client'

import React, { useState } from 'react'

import { RootState } from '@src/slices/reducer'
import { api } from '@src/trpc/react'
import { Search, Plus } from 'lucide-react'
import { useSelector } from 'react-redux'
import SimpleBar from 'simplebar-react'
import { toast } from 'react-toastify'

interface UserChatListProps {
  selectedEmployeeId: string | null
  selectedChatId: string | null
  onSelectChat: (chatId: string) => void
}

const UserChatList: React.FC<UserChatListProps> = ({
  selectedEmployeeId,
  selectedChatId,
  onSelectChat,
}) => {
  const { currentProject } = useSelector((state: RootState) => state.Project)
  const [searchValue, setSearchValue] = useState('')

  // Get chats for selected employee
  const {
    data: chatsData,
    isLoading,
    refetch,
  } = api.projectChat.getByEmployeeId.useQuery(
    {
      employeeId: selectedEmployeeId || '',
      status: 'ACTIVE',
    },
    {
      enabled: !!selectedEmployeeId,
    }
  )

  // Get project to access organization
  const { data: project } = api.project.getById.useQuery(
    { id: currentProject?.id || '' },
    { enabled: !!currentProject?.id }
  )

  // Get organization to access agentChatId
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
    if (!selectedEmployeeId) {
      toast.error('Please select an employee first')
      return
    }

    if (!organization?.agentChatId) {
      toast.error('No chat agent configured for this organization')
      return
    }

    if (!employee) {
      toast.error('Employee not found')
      return
    }

    createChatMutation.mutate({
      userId: employee.employeeId,
      agentId: organization.agentChatId,
      employeeId: selectedEmployeeId,
      metadata: {
        employeeName: `${employee.firstName} ${employee.lastName}`,
        source: 'web',
      },
    })
  }

  const chats = chatsData?.chats || []

  // Filter chats by search
  const filteredChats = chats.filter((chat) => {
    if (!searchValue.trim()) return true
    const searchLower = searchValue.toLowerCase()
    return (
      chat.userId.toLowerCase().includes(searchLower) ||
      chat.employee?.firstName?.toLowerCase().includes(searchLower) ||
      chat.employee?.lastName?.toLowerCase().includes(searchLower)
    )
  })

  if (!selectedEmployeeId) {
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
              disabled={createChatMutation.isPending || !organization?.agentChatId}>
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
                  filteredChats.map((chat) => {
                    const isActive = selectedChatId === chat.id
                    const employeeName = chat.employee
                      ? `${chat.employee.firstName} ${chat.employee.lastName}`
                      : chat.userId
                    const initials = chat.employee
                      ? `${chat.employee.firstName.charAt(0)}${chat.employee.lastName.charAt(0)}`
                      : chat.userId.substring(0, 2).toUpperCase()

                    return (
                      <li key={chat.id} onClick={() => onSelectChat(chat.id)}>
                        <button
                          className={`${
                            isActive ? 'active' : ''
                          } flex items-center gap-2 px-space py-2.5 hover:bg-gray-50 dark:hover:bg-dark-850 [&.active]:bg-primary-500/10 transition ease-linear duration-300 group/item w-full text-left`}>
                          <div className="relative flex items-center justify-center font-semibold transition duration-200 ease-linear bg-gray-100 rounded-full dark:bg-dark-850 size-10 shrink-0">
                            <span className="text-sm">{initials}</span>
                            {chat.status === 'ACTIVE' && (
                              <span className="absolute bottom-0 bg-green-500 border-2 border-white dark:border-dark-900 rounded-full ltr:right-0.5 rtl:left-0.5 size-2.5"></span>
                            )}
                          </div>
                          <div className="overflow-hidden grow">
                            <h6 className="mb-0.5 truncate">{employeeName}</h6>
                            <p className="text-sm text-gray-500 dark:text-dark-500 truncate">
                              {chat._count?.messages || 0} messages
                            </p>
                          </div>
                          <div className="ltr:text-right rtl:text-left shrink-0">
                            <p className="mb-1 text-xs text-gray-500 dark:text-dark-500">
                              {new Date(chat.updatedAt).toLocaleDateString()}
                            </p>
                            {chat.status === 'ACTIVE' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                Active
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
