'use client'

import React, { useEffect, useState } from 'react'

import { env } from '@src/env'
import { RootState } from '@src/slices/reducer'
import { api } from '@src/trpc/react'
import { MessageSquare, Plus, Search } from 'lucide-react'
import { useSelector } from 'react-redux'
import SimpleBar from 'simplebar-react'

interface ChatSession {
  sessionId: string
  lastMessage: string
  lastTimestamp: string
  messageCount: number
}

interface ApiMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  session_id: string
  conversationId?: string
}

interface UserChatListProps {
  selectedEmployeeId?: string | null
  selectedChatId: string | null
  onSelectChat: (chatId: string) => void
  chatType?: 'EMPLOYEE' | 'ADVISOR' | 'NIM_FRAUD'
  userId?: string
  refreshTrigger?: number
}

const UserChatList: React.FC<UserChatListProps> = ({
  selectedEmployeeId,
  selectedChatId,
  onSelectChat,
  chatType = 'EMPLOYEE',
  userId,
  refreshTrigger = 0,
}) => {
  const { currentProject } = useSelector((state: RootState) => state.Project)
  const [searchValue, setSearchValue] = useState('')
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [allApiMessages, setAllApiMessages] = useState<ApiMessage[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  // Get employee details (needed to get employee.id for the external API) — skip for ADVISOR
  const { data: employee, isLoading: isLoadingEmployee } =
    api.projectEmployee.getById.useQuery(
      { id: selectedEmployeeId || '' },
      { enabled: chatType === 'EMPLOYEE' && !!selectedEmployeeId }
    )

  // Fetch chat history from external API
  useEffect(() => {
    const isAdvisor = chatType === 'ADVISOR'
    const fetchId = isAdvisor ? userId : employee?.id

    console.log('[ChatList] useEffect entry:', { chatType, isAdvisor, userId, employeeId: employee?.id, fetchId, refreshTrigger })

    if (!fetchId) {
      console.log('[ChatList] No fetchId — bailing out early')
      setSessions([])
      setAllApiMessages([])
      return
    }

    const fetchHistory = async () => {
      setIsLoadingHistory(true)
      try {
        const url = isAdvisor
          ? `${env.NEXT_PUBLIC_BACKEND_URL}/api/advisor/advisor/history/${fetchId}`
          : `${env.NEXT_PUBLIC_BACKEND_URL}/api/rrhh/chat/history/${fetchId}?limit=1000`

        console.log('[ChatList] Fetching URL:', url)
        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`Failed to fetch chat history: ${response.status}`)
        }

        const data = await response.json()
        console.log('[ChatList] API response data:', data)
        const messages: ApiMessage[] = data.messages || []
        console.log('[ChatList] Parsed messages count:', messages.length, 'first message:', messages[0])
        setAllApiMessages(messages)

        // Group messages by conversationId (ADVISOR) or session_id (EMPLOYEE)
        const sessionMap = new Map<string, ApiMessage[]>()
        for (const msg of messages) {
          const sid = isAdvisor
            ? msg.conversationId || ''
            : msg.session_id
          if (!sid) continue
          if (!sessionMap.has(sid)) {
            sessionMap.set(sid, [])
          }
          sessionMap.get(sid)!.push(msg)
        }

        console.log('[ChatList] Session grouping done. sessionMap size:', sessionMap.size, 'keys:', [...sessionMap.keys()])

        // Build session list
        const sessionList: ChatSession[] = []
        for (const [sessionId, sessionMessages] of sessionMap) {
          const sorted = sessionMessages.sort(
            (a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          )
          const last = sorted[sorted.length - 1]!
          sessionList.push({
            sessionId,
            lastMessage: last.content,
            lastTimestamp: last.timestamp,
            messageCount: sorted.length,
          })
        }

        // Sort sessions by most recent first
        sessionList.sort(
          (a, b) =>
            new Date(b.lastTimestamp).getTime() -
            new Date(a.lastTimestamp).getTime()
        )

        console.log('[ChatList] Final sessionList:', sessionList.length, sessionList)
        setSessions(sessionList)
      } catch (error) {
        console.error('[ChatList] CATCH block — full error:', error)
        setSessions([])
        setAllApiMessages([])
      } finally {
        setIsLoadingHistory(false)
      }
    }

    fetchHistory()
  }, [chatType, userId, employee?.id, refreshTrigger])

  // Filter sessions by search
  const filteredSessions = sessions.filter((session) => {
    if (!searchValue.trim()) return true
    const searchLower = searchValue.toLowerCase()

    // Search in session ID
    if (session.sessionId.toLowerCase().includes(searchLower)) return true

    // Search in messages belonging to this session
    const sessionMessages = allApiMessages.filter((m) => {
      const sid =
        chatType === 'ADVISOR' ? m.conversationId || '' : m.session_id
      return sid === session.sessionId
    })
    return sessionMessages.some((m) =>
      m.content.toLowerCase().includes(searchLower)
    )
  })

  console.log('[ChatList] Render — sessions:', sessions.length, 'filtered:', filteredSessions.length, 'isLoadingHistory:', isLoadingHistory)

  const isLoading =
    (chatType === 'EMPLOYEE' && isLoadingEmployee) || isLoadingHistory

  // Format session display name
  const formatSessionName = (session: ChatSession): string => {
    const date = new Date(session.lastTimestamp)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    })
  }

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
              placeholder="Search sessions..."
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

          {/* Start new chat button */}
          <button
            onClick={() => {
              const uuid = typeof crypto.randomUUID === 'function'
                ? crypto.randomUUID()
                : '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) =>
                  (Number(c) ^ (crypto.getRandomValues(new Uint8Array(1))[0]! & (15 >> (Number(c) / 4)))).toString(16)
                )
              onSelectChat(uuid)
            }}
            className="btn btn-primary w-full mt-3 flex items-center justify-center gap-2">
            <Plus className="size-4" />
            Start new chat
          </button>

          {isLoading ? (
            <div className="flex items-center justify-center h-64 mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <SimpleBar className="max-h-[calc(100vh_-_22.5rem)] -mx-space mt-4">
              <ul className="flex flex-col gap-3">
                {filteredSessions.length > 0 ? (
                  filteredSessions.map((session) => {
                    const isActive = selectedChatId === session.sessionId

                    return (
                      <li
                        key={session.sessionId}
                        onClick={() => onSelectChat(session.sessionId)}>
                        <button
                          className={`${isActive ? 'active' : ''
                            } flex items-center gap-2 px-space py-2.5 hover:bg-gray-50 dark:hover:bg-dark-850 [&.active]:bg-primary-500/10 transition ease-linear duration-300 group/item w-full text-left`}>
                          <div className="relative flex items-center justify-center font-semibold bg-gray-100 dark:bg-dark-850 rounded-full size-10 shrink-0">
                            <MessageSquare className="size-5 text-gray-500 dark:text-dark-500" />
                          </div>
                          <div className="overflow-hidden grow">
                            <h6 className="mb-0.5 truncate text-sm">
                              {formatSessionName(session)}
                            </h6>
                            <p className="text-sm truncate text-gray-500 dark:text-dark-500">
                              {session.lastMessage}
                            </p>
                          </div>
                          <div className="ltr:text-right rtl:text-left shrink-0">
                            <p className="mb-1 text-xs text-gray-500 dark:text-dark-500">
                              {new Date(
                                session.lastTimestamp
                              ).toLocaleDateString()}
                            </p>
                            <span className="btn btn-xs btn-sub-primary">
                              {session.messageCount}
                            </span>
                          </div>
                        </button>
                      </li>
                    )
                  })
                ) : (
                  <li className="text-center text-gray-500 dark:text-dark-500 py-8">
                    {searchValue.trim()
                      ? 'No sessions found'
                      : 'No chat sessions yet'}
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
