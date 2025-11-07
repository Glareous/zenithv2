import React, { useState } from 'react'

import { ChevronDown, Cpu, Plus, X } from 'lucide-react'
import Select from 'react-select'

import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownMenu,
} from '@/components/custom/dropdown/dropdown'
import ModalMcpClient from '@/components/organisms/ModalMcpClient'

interface ModalMcpProtocolProps {
  isOpen: boolean
  onClose: () => void
  onSave: (config: McpProtocolConfig) => void
  onExecute: () => void
  isLoading?: boolean
  isExecuting?: boolean
}

interface McpProtocolConfig {
  credential: string
  toolDescription: string
  operation: string
}

const toolDescriptionOptions = [
  { value: '1', label: 'Option 1' },
  { value: '2', label: 'Option 2' },
  { value: '3', label: 'Option 3' },
]

const operationOptions = [
  { value: '1', label: 'Option 1' },
  { value: '2', label: 'Option 2' },
  { value: '3', label: 'Option 3' },
]

const ModalMcpProtocol: React.FC<ModalMcpProtocolProps> = ({
  isOpen,
  onClose,
  onSave,
  onExecute,
  isLoading = false,
  isExecuting = false,
}) => {
  const [activeTab, setActiveTab] = useState<'parameters' | 'settings'>(
    'parameters'
  )
  const [credential, setCredential] = useState<string>('')
  const [toolDescription, setToolDescription] = useState<string>('')
  const [operation, setOperation] = useState<string>('')
  const [isMcpClientModalOpen, setIsMcpClientModalOpen] = useState(false)

  const handleCreateNewCredential = () => {
    setIsMcpClientModalOpen(true)
  }

  const handleSaveMcpClient = (config: any) => {
    console.log('MCP Client config saved:', config)
    setCredential(config.name)
    setIsMcpClientModalOpen(false)
    // TODO: Save to database and refresh credential list
  }

  const handleSave = () => {
    onSave({
      credential,
      toolDescription,
      operation,
    })
  }

  const handleClose = () => {
    setCredential('')
    setToolDescription('')
    setOperation('')
    setActiveTab('parameters')
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-overlay backdrop-blur-sm"
        onClick={handleClose}>
        <div
          className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-2xl mx-4"
          onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
                <Cpu className="w-4 h-4 text-primary-500" />
              </div>
              <h2 className="text-lg font-semibold">MCP Client</h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onExecute}
                disabled={isExecuting}
                className="btn btn-outline-red disabled:opacity-50 disabled:cursor-not-allowed">
                {isExecuting ? 'Executing...' : 'Execute stop'}
              </button>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'parameters' ? (
              <div className="space-y-6">
                {/* Credential to connect with */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Credential to connect with
                  </label>
                  <Dropdown>
                    <DropdownButton colorClass="w-full text-left bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:border-primary-400 dark:hover:border-gray-600 px-4 py-2 rounded-md flex items-center justify-between focus:ring-1 ring-primary-500">
                      <span className="text-gray-900 dark:text-gray-100">
                        {credential || 'Select credential...'}
                      </span>
                      <ChevronDown className="w-4 h-4 ml-2 text-gray-500" />
                    </DropdownButton>
                    <DropdownMenu menuClass="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md mt-1 z-[9999] max-w-[625px]">
                      <ul className="py-2">
                        <li>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCreateNewCredential()
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                            MCP Client account
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCreateNewCredential()
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Create new credential
                          </button>
                        </li>
                      </ul>
                    </DropdownMenu>
                  </Dropdown>
                </div>

                {/* Tool Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tool Description
                  </label>
                  <Select
                    value={toolDescriptionOptions.find(
                      (opt) => opt.value === toolDescription
                    )}
                    onChange={(option) =>
                      option && setToolDescription(option.value)
                    }
                    options={toolDescriptionOptions}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="Set Automatically"
                  />
                </div>

                {/* Operation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Operation
                  </label>
                  <Select
                    value={operationOptions.find(
                      (opt) => opt.value === operation
                    )}
                    onChange={(option) => option && setOperation(option.value)}
                    options={operationOptions}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="List Tools"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Settings tab
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end items-center gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800">
            <button onClick={handleClose} className="btn btn-outline-gray">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* MCP Client Modal */}
      <ModalMcpClient
        isOpen={isMcpClientModalOpen}
        onClose={() => setIsMcpClientModalOpen(false)}
        onSave={handleSaveMcpClient}
      />
    </>
  )
}

export default ModalMcpProtocol
