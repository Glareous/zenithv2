'use client'

import React, { useState } from 'react'

import Link from 'next/link'
import { useParams, usePathname, useRouter } from 'next/navigation'

import { Drawer } from '@src/components/custom/drawer/drawer'
import { TestAgentModal } from '@src/components/organisms/TestAgentModal'
import { ArrowLeft, Joystick, Phone } from 'lucide-react'

export const AgentSidebar = ({
  agentId,
  currentPath,
  isCollapsed,
  setIsCollapsed,
}: {
  agentId: string
  currentPath: string
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
}) => {
  const router = useRouter()
  const [isTestModalOpen, setIsTestModalOpen] = useState(false)

  // Detect if we're on PQR agent or admin agent page
  const isPQRAgent = currentPath.includes('/apps/pqr/pqr-agent/')
  const isAdminAgent = currentPath.includes('/admin/agents/')

  const baseRoute = isPQRAgent
    ? '/apps/pqr/pqr-agent'
    : isAdminAgent
      ? '/admin/agents'
      : '/apps/agents/default'

  const backRoute = isPQRAgent
    ? '/apps/pqr/pqr-agent'
    : isAdminAgent
      ? '/admin/agents'
      : '/apps/agents/default'

  const backText = isPQRAgent
    ? 'Back to PQR Agents'
    : isAdminAgent
      ? 'Back to Agents'
      : 'Back to Agents'

  const navigationItems = [
    {
      name: 'Configure',
      path: '/configure',
      href: `${baseRoute}/${agentId}/configure`,
    },
    {
      name: 'Workflow',
      path: '/workflow',
      href: `${baseRoute}/${agentId}/workflow`,
    },
    {
      name: 'Actions',
      path: '/action',
      href: `${baseRoute}/${agentId}/action`,
    },
  ]

  return (
    <div
      className={`transition-all duration-300 ease-in-out h-full ${isCollapsed ? 'w-16' : 'w-56'} flex-shrink-0`}>
      <div className="h-full border-r border-b border-gray-200 dark:border-gray-800 flex flex-col">
        {/* Header with back button */}
        <div className="flex items-center p-4">
          <button
            onClick={() => router.push(backRoute)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 w-full dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors ${isCollapsed ? 'justify-center px-2' : ''}`}
            title={isCollapsed ? backText : undefined}>
            <ArrowLeft className="w-4 h-4" />
            {!isCollapsed && (
              <span className="text-sm font-medium">{backText}</span>
            )}
          </button>
        </div>

        <div className="card p-3 m-2">
          <div className="space-y-2">
            <div className="flex">
              <div className="p-2.5 border rounded-md border-gray-200 dark:border-gray-800 items-center flex w-10 h-10 mr-1">
                <Joystick className="text-gray-400 dark:text-gray-600" />
              </div>
              <div>
                <p className="text-[13px] ">My Widget Assistant</p>
                <p className="text-[11px] font-light border rounded-md border-gray-200 dark:border-gray-800 py-0.5 px-1 text-gray-500 w-12">
                  Widget
                </p>
              </div>
            </div>
            <p className="text-gray-500 text-[11px] font-normal border-b border-gray-200 dark:border-gray-800 pb-1">
              No number : ID:09vng0...
            </p>
            <button
              onClick={() => setIsTestModalOpen(true)}
              className="btn btn-gray flex items-center justify-center gap-3 w-full">
              <Phone className="w-4 h-4" />
              Test Agent
            </button>
          </div>
        </div>
        {/* Navigation Links */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = currentPath.includes(item.path)
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                      ${
                        isActive
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400  border-primary-500'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400'
                      }
                      ${isCollapsed ? 'justify-center px-2' : ''}
                    `}
                    title={isCollapsed ? item.name : undefined}>
                    {isCollapsed ? (
                      <span className="text-xs font-bold">
                        {item.name.charAt(0)}
                      </span>
                    ) : (
                      item.name
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>

      {/* Test Agent Modal */}
      <TestAgentModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
      />
    </div>
  )
}

export const AgentMobileDrawer = ({
  agentId,
  currentPath,
  isOpen,
  onClose,
}: {
  agentId: string
  currentPath: string
  isOpen: boolean
  onClose: () => void
}) => {
  // Detect if we're on PQR agent or admin agent page
  const isPQRAgent = currentPath.includes('/apps/pqr/pqr-agent/')
  const isAdminAgent = currentPath.includes('/admin/agents/')

  const baseRoute = isPQRAgent
    ? '/apps/pqr/pqr-agent'
    : isAdminAgent
      ? '/admin/agents'
      : '/apps/agents/default'

  const navigationItems = [
    {
      name: 'Configure',
      path: '/configure',
      href: `${baseRoute}/${agentId}/configure`,
    },
    {
      name: 'Workflow',
      path: '/workflow',
      href: `${baseRoute}/${agentId}/workflow`,
    },
    {
      name: 'Actions',
      path: '/action',
      href: `${baseRoute}/${agentId}/action`,
    },
  ]

  const content = (
    <div className="">
      <nav>
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = currentPath.includes(item.path)
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={`
                    flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200
                    ${
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-primary-500'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400'
                    }
                  `}>
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      position="left"
      size="medium"
      title="Agent Navigation"
      content={content}
    />
  )
}
