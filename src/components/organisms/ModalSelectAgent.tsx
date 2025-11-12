import React, { useEffect, useState } from 'react'

import { Ban, Search, X } from 'lucide-react'

interface Agent {
  id: string
  name: string | null
  type: string
  isActive: boolean
}

interface ModalSelectAgentProps {
  isOpen: boolean
  onClose: () => void
  agents: Agent[]
  onSelect: (agentId: string) => void
  isLoading?: boolean
  title?: string
  buttonText?: string
  initialSelectedId?: string | null
  onDelete?: () => void
  deleteButtonText?: string
  isDeleting?: boolean
}

const ModalSelectAgent: React.FC<ModalSelectAgentProps> = ({
  isOpen,
  onClose,
  agents,
  onSelect,
  isLoading = false,
  title = 'Select Agent for Action',
  buttonText = 'Create Action',
  initialSelectedId = null,
  onDelete,
  deleteButtonText = 'Remove Agent',
  isDeleting = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setSelectedAgentId(initialSelectedId || null)
    }
  }, [isOpen, initialSelectedId])

  const filteredAgents = agents.filter(
    (agent) =>
      agent.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelect = () => {
    if (selectedAgentId) {
      onSelect(selectedAgentId)
    }
  }

  const handleClose = () => {
    setSearchQuery('')
    setSelectedAgentId(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-overlay backdrop-blur-sm"
      onClick={handleClose}>
      <div
        className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[500px]">
          {/* Search Section */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by agent name or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 dark:bg-gray-800 dark:text-gray-200"
              />
            </div>
          </div>

          {/* Agents List or Empty State */}
          {filteredAgents.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <Ban className="w-7 h-7 text-gray-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                {searchQuery
                  ? "Sorry — we couldn't find any results"
                  : 'No agents available'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {searchQuery
                  ? 'Please try a different search term'
                  : 'Please add agents to this project first'}
              </p>
            </div>
          ) : (
            /* Agents List */
            <div className="space-y-2">
              {filteredAgents.map((agent) => (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgentId(agent.id)}
                  className={`p-4 border rounded-md cursor-pointer transition-all ${
                    selectedAgentId === agent.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}>
                  <div className="flex items-center gap-3">
                    {/* Radio Button */}
                    <input
                      type="radio"
                      checked={selectedAgentId === agent.id}
                      onChange={() => setSelectedAgentId(agent.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500 cursor-pointer"
                    />

                    {/* Agent Info */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {agent.name || 'Unnamed Agent'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {agent.type}
                          </span>
                          {agent.isActive && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              Active
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            {onDelete && initialSelectedId && (
              <button
                onClick={onDelete}
                disabled={isDeleting || isLoading}
                className="btn btn-outline-danger disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                {isDeleting && (
                  <div className="spin loader-spin loader-danger w-4 h-4"></div>
                )}
                {isDeleting ? 'Removing...' : deleteButtonText}
              </button>
            )}
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedAgentId ? `1 agent selected` : 'No agent selected'}
            </span>
          </div>
          <div className="flex gap-3">
            <button onClick={handleClose} className="btn btn-outline-gray">
              Cancel
            </button>
            <button
              onClick={handleSelect}
              disabled={!selectedAgentId || isLoading}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              {isLoading && <div className="spin loader-spin w-4 h-4"></div>}
              {isLoading ? 'Saving...' : buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModalSelectAgent
