import React, { useState } from 'react'

import { Info, X } from 'lucide-react'

interface ModalMcpClientProps {
  isOpen: boolean
  onClose: () => void
  onSave: (config: McpClientConfig) => void
  isLoading?: boolean
}

interface McpClientConfig {
  name: string
  connectionType: 'STDIO' | 'SSE' | 'HTTP'
  command: string
  arguments: string
  environments: string
}

const ModalMcpClient: React.FC<ModalMcpClientProps> = ({
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState<
    'connection' | 'sharing' | 'details'
  >('connection')
  const [name, setName] = useState('MCP Client account')
  const [connectionType, setConnectionType] = useState<
    'STDIO' | 'SSE' | 'HTTP'
  >('STDIO')
  const [command, setCommand] = useState('')
  const [argumentsValue, setArgumentsValue] = useState('')
  const [environments, setEnvironments] = useState('')

  const handleSave = () => {
    onSave({
      name,
      connectionType,
      command,
      arguments: argumentsValue,
      environments,
    })
  }

  const handleClose = () => {
    setName('MCP Client account')
    setConnectionType('STDIO')
    setCommand('')
    setArgumentsValue('')
    setEnvironments('')
    setActiveTab('connection')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center backdrop-overlay backdrop-blur-sm"
      onClick={handleClose}>
      <div
        className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-4xl mx-4 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h2 className="text-lg font-semibold">{name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              MCP Client (STDIO) API
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body with Sidebar and Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'connection' && (
              <div className="space-y-6">
                {/* Connect using */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Connect using <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setConnectionType('STDIO')}
                      className={`px-4 py-2 rounded-md text-sm font-medium border-2 transition-colors ${
                        connectionType === 'STDIO'
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                          : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-600'
                      }`}>
                      Command Line (STDIO)
                    </button>
                    <button
                      onClick={() => setConnectionType('SSE')}
                      className={`px-4 py-2 rounded-md text-sm font-medium border-2 transition-colors ${
                        connectionType === 'SSE'
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                          : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-600'
                      }`}>
                      Server-Sent Events (SSE)
                    </button>
                    <button
                      onClick={() => setConnectionType('HTTP')}
                      className={`px-4 py-2 rounded-md text-sm font-medium border-2 transition-colors ${
                        connectionType === 'HTTP'
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                          : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-600'
                      }`}>
                      HTTP Streamable
                    </button>
                  </div>
                </div>

                {/* Command */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Command <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder=""
                  />
                </div>

                {/* Arguments */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                    Arguments
                    <Info className="w-4 h-4 text-gray-400" />
                  </label>
                  <textarea
                    value={argumentsValue}
                    onChange={(e) => setArgumentsValue(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                    placeholder=""
                  />
                </div>

                {/* Environments */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Environments
                  </label>
                  <textarea
                    value={environments}
                    onChange={(e) => setEnvironments(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                    placeholder=""
                  />
                </div>

                {/* Info message */}
                <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>
                    Enterprise plan users can pull in credentials from external
                    vaults.{' '}
                    <a
                      href="#"
                      className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
                      More info
                    </a>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModalMcpClient
