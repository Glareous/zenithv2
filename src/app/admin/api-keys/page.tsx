'use client'

import React, { useState } from 'react'

import { Modal } from '@src/components/custom/modal/modal'
import { api } from '@src/trpc/react'
import {
  Ban,
  Check,
  CircleCheckBig,
  Copy,
  Key,
  Plus,
  Trash2,
} from 'lucide-react'
import { toast } from 'react-toastify'

const ApiKeysPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedApiKey, setSelectedApiKey] = useState<any>(null)
  const [newKeyName, setNewKeyName] = useState('')
  const [showNewKey, setShowNewKey] = useState(false)
  const [newApiKeyData, setNewApiKeyData] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  // Queries
  const { data: apiKeysRaw, refetch } = api.apiKeys.list.useQuery()

  // Filter out system-generated API keys
  const apiKeys = apiKeysRaw?.filter(
    (key) => key.name !== '__internal_system_api_key__'
  )

  // Mutations
  const createApiKey = api.apiKeys.create.useMutation({
    onSuccess: (data) => {
      setNewApiKeyData(data)
      setShowNewKey(true)
      setIsCreateModalOpen(false)
      setNewKeyName('')
      refetch()
      toast.success('API key created successfully!')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create API key')
    },
  })

  const deleteApiKey = api.apiKeys.delete.useMutation({
    onSuccess: () => {
      setIsDeleteModalOpen(false)
      setSelectedApiKey(null)
      refetch()
      toast.success('API key deleted successfully!')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete API key')
    },
  })

  const toggleApiKey = api.apiKeys.toggle.useMutation({
    onSuccess: () => {
      refetch()
      toast.success('API key status updated!')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update API key')
    },
  })

  const handleCreateApiKey = () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a name for the API key')
      return
    }
    createApiKey.mutate({ name: newKeyName.trim() })
  }

  const handleDeleteApiKey = () => {
    if (selectedApiKey) {
      deleteApiKey.mutate({ id: selectedApiKey.id })
    }
  }

  const handleToggleStatus = (apiKey: any) => {
    toggleApiKey.mutate({
      id: apiKey.id,
      isActive: !apiKey.isActive,
    })
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('API key copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Key className="w-6 h-6" />
              API Keys
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your API keys for external integrations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => (window.location.href = '/docs')}
              className="btn btn-outline flex items-center gap-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              API Docs
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Generate API Key
            </button>
          </div>
        </div>
      </div>

      {/* API Keys Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Key Preview
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Last Used
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {apiKeys?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Key className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                      No API keys
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Get started by creating a new API key.
                    </p>
                  </td>
                </tr>
              ) : (
                apiKeys?.map((apiKey) => (
                  <tr key={apiKey.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {apiKey.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                        {apiKey.keyPreview}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          apiKey.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                            : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                        }`}>
                        {apiKey.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {apiKey.lastUsedAt
                        ? formatDate(apiKey.lastUsedAt.toISOString())
                        : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(apiKey.createdAt.toISOString())}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleStatus(apiKey)}
                          className={`btn btn-xs btn-outline ${
                            apiKey.isActive ? 'btn-primary' : 'btn-green'
                          }`}
                          title={apiKey.isActive ? 'Disable' : 'Enable'}>
                          {apiKey.isActive ? (
                            <Ban className="w-4 h-4" />
                          ) : (
                            <CircleCheckBig className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedApiKey(apiKey)
                            setIsDeleteModalOpen(true)
                          }}
                          className="btn btn-xs btn-red"
                          title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create API Key Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        position="modal-center"
        size="modal-md"
        title="Generate New API Key"
        content={
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Name
            </label>
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="Enter API key name"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        }
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setIsCreateModalOpen(false)
                setNewKeyName('')
              }}
              className="btn btn-red">
              Cancel
            </button>
            <button
              onClick={handleCreateApiKey}
              disabled={createApiKey.isPending}
              className="btn btn-primary">
              {createApiKey.isPending ? 'Creating...' : 'Generate'}
            </button>
          </div>
        }
      />

      {/* Show New API Key Modal */}
      <Modal
        isOpen={showNewKey}
        onClose={() => {
          setShowNewKey(false)
          setNewApiKeyData(null)
        }}
        position="modal-center"
        size="modal-md"
        title="Your New API Key"
        content={
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Copy this key now. You won&apos;t be able to see it again!
            </p>
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
              <div className="flex items-center justify-between">
                <code className="text-sm font-mono text-gray-900 dark:text-white break-all">
                  {newApiKeyData?.rawKey}
                </code>
                <button
                  onClick={() => copyToClipboard(newApiKeyData?.rawKey || '')}
                  className="ml-2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        }
        footer={
          <div className="flex justify-end">
            <button
              onClick={() => {
                setShowNewKey(false)
                setNewApiKeyData(null)
              }}
              className="btn btn-primary">
              Done
            </button>
          </div>
        }
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedApiKey(null)
        }}
        position="modal-center"
        size="modal-md"
        title="Delete API Key"
        content={
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Are you sure you want to delete the API key &quot;
            {selectedApiKey?.name}&quot;? This action cannot be undone.
          </p>
        }
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setIsDeleteModalOpen(false)
                setSelectedApiKey(null)
              }}
              className="btn btn-primary">
              Cancel
            </button>
            <button
              onClick={handleDeleteApiKey}
              disabled={deleteApiKey.isPending}
              className="btn btn-red">
              {deleteApiKey.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        }
      />
    </div>
  )
}

export default ApiKeysPage
