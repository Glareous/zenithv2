'use client'

import React, { useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import DeleteModal from '@src/components/common/DeleteModal'
import { RootState } from '@src/slices/reducer'
import { api } from '@src/trpc/react'
import { useQueryClient } from '@tanstack/react-query'
import {
  ArrowRight,
  Check,
  ChevronRight,
  File,
  PhoneCall,
  Settings,
  Trash2,
  Upload,
  Volume2,
  X,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import Select from 'react-select'
import { toast } from 'react-toastify'
import { z } from 'zod'

const agentEditSchema = z.object({
  name: z
    .string()
    .min(1, 'Agent name is required')
    .max(100, 'Name must be less than 100 characters'),
  type: z.enum(['INBOUND', 'OUTBOUND', 'PROCESS', 'RPA']),
  isActive: z.boolean(),
  systemInstructions: z.string().optional(),
  modelId: z.string().optional().nullable(),
})

type AgentEditFormData = z.infer<typeof agentEditSchema>

interface AgentEditPageProps {
  params: Promise<{ id: string }>
}

const AgentEditPage: React.FC<AgentEditPageProps> = ({ params }) => {
  const { id } = React.use(params)
  const router = useRouter()
  const queryClient = useQueryClient()

  const { currentProject } = useSelector((state: RootState) => state.Project)
  const [isNavigating, setIsNavigating] = useState(false)

  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // For admin pages, we don't need to fetch project-specific data
  const isAdminRoute =
    typeof window !== 'undefined' &&
    window.location.pathname.startsWith('/admin/agents')

  const {
    data: currentProjectAgents = [],
    isLoading: isCurrentProjectAgentsLoading,
  } = api.projectAgent.getByProject.useQuery(
    { projectId: currentProject?.id || '' },
    { enabled: !isAdminRoute && !!currentProject?.id }
  )

  // For admin route, get all models; for regular route, get project models
  const { data: projectModels = [], isLoading: isProjectModelsLoading } =
    api.projectModel.getByProject.useQuery(
      { projectId: currentProject?.id || '' },
      { enabled: !isAdminRoute && !!currentProject?.id }
    )

  const { data: allModels = [], isLoading: isAllModelsLoading } =
    api.projectModel.getAll.useQuery(undefined, {
      enabled: isAdminRoute,
    })

  const models = isAdminRoute ? allModels : projectModels
  const isLoadingModels = isAdminRoute ? isAllModelsLoading : isProjectModelsLoading

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
    setValue,
    watch,
  } = useForm<AgentEditFormData>({
    resolver: zodResolver(agentEditSchema as any),
    defaultValues: {
      name: '',
      type: 'INBOUND',
      isActive: false,
      systemInstructions: '',
      modelId: null,
    },
  })

  const {
    data: agent,
    isLoading: agentLoading,
    error: agentError,
    refetch: refetchProjectAgent,
  } = api.projectAgent.getById.useQuery(
    { id },
    {
      retry: 1,
      enabled: !!id && !!currentProject,
    }
  )

  const updateAgentMutation = api.projectAgent.update.useMutation({
    onSuccess: async () => {
      toast.success('Agent updated successfully!')

      await queryClient.invalidateQueries({
        queryKey: [['projectAgent', 'getByProject']],
      })
      refetchProjectAgent()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update agent')
    },
  })

  const deleteAgentMutation = api.projectAgent.delete.useMutation({
    onSuccess: async () => {
      toast.success('Agent deleted successfully!')
      await queryClient.invalidateQueries({
        queryKey: [['projectAgent', 'getByProject']],
      })
      router.push('/admin/agents')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete agent')
    },
  })

  const getUploadUrlMutation = api.projectAgentFile.getUploadUrl.useMutation()
  const createFileMutation = api.projectAgentFile.create.useMutation({
    onSuccess: () => {
      setSelectedFiles([])
      refetchProjectAgent()
    },
  })

  const deleteFileMutation = api.projectAgentFile.delete.useMutation({
    onSuccess: () => {
      toast.success('File deleted successfully!')
      refetchProjectAgent()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete file')
    },
  })

  useEffect(() => {
    if (agent) {
      reset({
        name: agent.name || '',
        type: agent.type as 'INBOUND' | 'OUTBOUND' | 'PROCESS' | 'RPA',
        isActive: agent.isActive,
        systemInstructions: agent.systemInstructions || '',
        modelId: agent.modelId || null,
      })
    }
  }, [agent, reset])

  useEffect(() => {
    // Skip project validation for admin pages - agents don't need to belong to a project
    const isAdminPage = window.location.pathname.startsWith('/admin/agents')
    if (isAdminPage) return

    if (
      !currentProject ||
      !agent ||
      isNavigating ||
      isCurrentProjectAgentsLoading
    )
      return

    if (agent.project?.id !== currentProject.id) {
      if (currentProjectAgents.length === 0) {
        return
      }

      setIsNavigating(true)

      const targetAgent = currentProjectAgents.find(
        (a) => a.type === agent.type
      )

      if (targetAgent) {
        router.push(`/admin/agents/${targetAgent.id}/configure`)
      } else {
        if (currentProjectAgents.length > 0) {
          router.push(`/admin/agents/${currentProjectAgents[0].id}/configure`)
        } else {
          router.push('/admin/agents')
        }
      }
    }
  }, [
    currentProject,
    agent,
    currentProjectAgents,
    id,
    router,
    isNavigating,
    isCurrentProjectAgentsLoading,
  ])

  const onSubmit = async (data: AgentEditFormData) => {
    if (!agent) return

    try {
      await updateAgentMutation.mutateAsync({
        id: agent.id,
        name: data.name,
        type: data.type,
        isActive: data.isActive,
        systemInstructions: data.systemInstructions,
        modelId: data.modelId,
      })

      if (selectedFiles.length > 0) {
        await uploadFiles()
      }
    } catch (error) {}
  }

  const uploadFiles = async () => {
    if (!agent || selectedFiles.length === 0) return

    setUploadingFiles(true)

    try {
      for (const file of selectedFiles) {
        console.log('📤 Uploading file:', file.name)

        const uploadResult = await getUploadUrlMutation.mutateAsync({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          agentId: agent.id,
        })

        console.log('✅ Got upload URL:', uploadResult)

        const uploadResponse = await fetch(uploadResult.uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        })

        console.log('📡 Upload response status:', uploadResponse.status)

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text()
          console.error('❌ Upload failed:', errorText)
          throw new Error(`Failed to upload ${file.name}: ${errorText}`)
        }

        const fileType = file.type.startsWith('image/')
          ? 'IMAGE'
          : file.type.startsWith('video/')
            ? 'VIDEO'
            : file.type.startsWith('audio/')
              ? 'AUDIO'
              : file.type.includes('pdf') || file.type.includes('document')
                ? 'DOCUMENT'
                : 'OTHER'

        await createFileMutation.mutateAsync({
          agentId: agent.id,
          name: file.name,
          fileName: uploadResult.fileName,
          fileType,
          mimeType: file.type,
          fileSize: file.size,
          s3Key: uploadResult.s3Key,
        })
      }

      toast.success(`Successfully uploaded ${selectedFiles.length} file(s)!`)
    } catch (error) {
      console.error('❌ Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload some files')
    } finally {
      setUploadingFiles(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setSelectedFiles((prev) => [...prev, ...files])
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    setSelectedFiles((prev) => [...prev, ...files])
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleDeleteFile = (fileId: string) => {
    if (confirm('Are you sure you want to delete this file?')) {
      deleteFileMutation.mutate({ id: fileId })
    }
  }

  const handleDeleteAgent = () => {
    if (!agent) return
    deleteAgentMutation.mutate({ id: agent.id })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Skip currentProject validation for admin pages
  const isAdminPage =
    typeof window !== 'undefined' &&
    window.location.pathname.startsWith('/admin/agents')

  if (!isAdminPage && !currentProject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center hidden">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            No Project Selected
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please select a project first.
          </p>
          <Link href="/apps/projects/grid" className="btn btn-primary">
            Go to Projects
          </Link>
        </div>
      </div>
    )
  }

  if (!isAdminPage && (isNavigating || isCurrentProjectAgentsLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (agentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (agentError || !agent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white ">
            Agent Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {agentError
              ? `Error loading agent: ${agentError.message}`
              : "The agent you're looking for doesn't exist or you don't have access to it."}
          </p>
          <Link href="/admin/agents" className="btn btn-primary">
            Back to Agents
          </Link>
        </div>
      </div>
    )
  }

  const renderGeneralTab = () => (
    <div className="p-6 space-y-6">
      {/* Agent Type */}
      <div className="flex border-b border-gray-200 pb-3">
        <div className="w-md">
          <label className="block">Agent Type</label>
          <p className="text-gray-400">Select the agent type.</p>
        </div>
        <div className="w-xs">
          <Select
            value={{
              value: watch('type'),
              label:
                watch('type') === 'INBOUND'
                  ? 'Inbound Agent'
                  : watch('type') === 'OUTBOUND'
                    ? 'Outbound Agent'
                    : watch('type') === 'PROCESS'
                      ? 'Process Agent'
                      : 'RPA Agent',
            }}
            onChange={(option) => {
              if (option) {
                setValue('type', option.value)
                const typeNames = {
                  INBOUND: 'Inbound Agent',
                  OUTBOUND: 'Outbound Agent',
                  PROCESS: 'Process Agent',
                  RPA: 'RPA Agent',
                }
                setValue(
                  'name',
                  typeNames[option.value as keyof typeof typeNames]
                )
              }
            }}
            options={[
              { value: 'INBOUND', label: 'Inbound Agent' },
              { value: 'OUTBOUND', label: 'Outbound Agent' },
              { value: 'PROCESS', label: 'Process Agent' },
              { value: 'RPA', label: 'RPA Agent' },
            ]}
            classNamePrefix="select"
          />
        </div>
      </div>

      {/* Agent Name */}
      <div className="flex border-b border-gray-200 pb-3">
        <div className="w-md">
          <label htmlFor="name" className="block">
            Agent Name
          </label>
          <p className="text-gray-400">What name will your agent go by.</p>
        </div>
        <div className="w-xs">
          <input
            {...register('name')}
            type="text"
            id="name"
            className={`form-input ${
              errors.name ? 'border-red-500 focus:ring-red-500' : ''
            }`}
            placeholder="Enter agent name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.name.message}
            </p>
          )}
        </div>
      </div>

      {/* Active Status */}
      <div className="flex border-b border-gray-200 pb-3">
        <div className="w-md">
          <label htmlFor="isActive" className="block">
            Active
          </label>
          <p className="text-gray-400">Set the agent status.</p>
        </div>
        <div className="w-xs">
          <Select
            value={
              watch('isActive')
                ? { value: true, label: 'Active' }
                : { value: false, label: 'Inactive' }
            }
            onChange={(option) => option && setValue('isActive', option.value)}
            options={[
              { value: true, label: 'Active' },
              { value: false, label: 'Inactive' },
            ]}
            classNamePrefix="select"
          />
        </div>
      </div>

      {/* System Instructions */}
      <div className="flex border-b border-gray-200 pb-3">
        <div className="w-md">
          <label htmlFor="systemInstructions" className="block">
            System Instructions
          </label>
        </div>
        <div>
          <textarea
            {...register('systemInstructions')}
            id="systemInstructions"
            rows={6}
            className="form-input h-32 max-h-40 max-w-[500px]"
            placeholder="Enter system instructions for the agent..."
          />
          <p className="mt-2 text-xs text-gray-400">
            Define how your agent should behave and respond to customers.
          </p>
        </div>
      </div>

      {/* Model Selection */}
      <div className="flex border-b border-gray-200 pb-3">
        <div className="w-md">
          <label htmlFor="modelId" className="block">
            IA Model
          </label>
          <p className="text-gray-400">
            Opt for speed or depth to suit your agent's role
          </p>
        </div>
        <div className="w-xs">
          {isLoadingModels ? (
            <div className="form-input flex items-center justify-center">
              <span className="text-sm text-gray-500">Loading models...</span>
            </div>
          ) : models.length === 0 ? (
            <div>
              <div className="form-input bg-gray-50 dark:bg-gray-700 cursor-not-allowed opacity-75">
                <span className="text-sm text-gray-500">
                  No models available
                </span>
              </div>
              <p className="mt-2 text-xs text-gray-400">
                <Link
                  href="/admin/models"
                  className="text-primary-600 hover:text-primary-500">
                  Create a model
                </Link>{' '}
                to assign to this agent.
              </p>
            </div>
          ) : (
            <Select
              value={
                watch('modelId')
                  ? {
                      value: watch('modelId'),
                      label:
                        models.find((m) => m.id === watch('modelId'))
                          ?.name || 'Select model',
                    }
                  : null
              }
              onChange={(option) => setValue('modelId', option?.value || null)}
              options={models
                .filter((model) => model.isActive)
                .map((model) => ({
                  value: model.id,
                  label: `${model.name} (${model.provider} - ${model.modelName})`,
                }))}
              isClearable
              placeholder="Select a model"
              classNamePrefix="select"
            />
          )}
          {!isLoadingModels && models.length > 0 && (
            <p className="mt-2 text-xs text-gray-400">
              Manage models in{' '}
              <Link
                href="/admin/models"
                className="text-primary-600 hover:text-primary-500">
                Models page
              </Link>
              .
            </p>
          )}
        </div>
      </div>

      {/* File Management Section */}
      <div className="flex border-b border-gray-200 pb-3">
        <div className="w-md">
          <label className="block">File Management</label>
          <p className="text-sm text-gray-400 mt-1">
            Upload images and documents for your agent to reference.
          </p>
        </div>

        <div className="space-y-6">
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-3 text-center transition-colors ${
              dragActive
                ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/10'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}>
            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <div className="space-y-2">
              <label
                htmlFor="file-upload"
                className="cursor-pointer text-primary-600 hover:text-primary-500 font-medium">
                Click to upload files
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  multiple
                  className="sr-only"
                  onChange={handleFileSelect}
                  accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.txt"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Files to Upload */}
      {selectedFiles.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Files to Upload ({selectedFiles.length})
          </h4>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                <div className="flex items-center space-x-3">
                  <File className="h-5 w-5 text-gray-400" />
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {file.name}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeSelectedFile(index)}
                  className="text-red-500 hover:text-red-700 p-1">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Existing Files */}
      {agent.files && agent.files.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Existing Files ({agent.files.length})
          </h4>
          <div className="space-y-2">
            {agent.files.map((file: any) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                <div className="flex items-center space-x-3">
                  <File className="h-5 w-5 text-gray-400" />
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {file.name}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.fileSize)} • {file.fileType}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteFile(file.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                  disabled={deleteFileMutation.isPending}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderVoiceTab = () => (
    <div className="px-6 py-6">
      <p className="text-gray-500">
        Voice configuration options will be available here.
      </p>
    </div>
  )

  const renderCallConfigurationTab = () => (
    <div className="px-6 py-6">
      <p className="text-gray-500">
        Call configuration options will be available here.
      </p>
    </div>
  )

  return (
    <div className="m-6">
      <h1 className="pb-4 text-xl">Configure</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="card">
        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              type="button"
              onClick={() => setActiveTab('general')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'general'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}>
              <Settings className="w-4 h-4 mr-1" />
              General
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('voice')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'voice'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}>
              <Volume2 className="w-4 h-4 mr-1" />
              Voice
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('call-configuration')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'call-configuration'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}>
              <PhoneCall className="w-4 h-4 mr-1" />
              Call Configuration
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'general' && renderGeneralTab()}
        {activeTab === 'voice' && renderVoiceTab()}
        {activeTab === 'call-configuration' && renderCallConfigurationTab()}

        {/* Form Actions */}
        <div className="flex justify-between card-body">
          {/* Delete Agent Button */}
          <div>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              disabled={deleteAgentMutation.isPending}
              className="btn btn-red flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              {deleteAgentMutation.isPending ? 'Deleting...' : 'Delete Agent'}
            </button>
          </div>

          {/* Save/Cancel Buttons */}
          <div className="flex space-x-4">
            <Link href="/admin/agents" className="btn btn-red">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || uploadingFiles}
              className="btn btn-primary">
              {isSubmitting || uploadingFiles ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>

      {/* Delete Agent Modal */}
      <DeleteModal
        show={showDeleteModal}
        handleHide={() => setShowDeleteModal(false)}
        deleteModalFunction={handleDeleteAgent}
        title="Delete Agent"
        message="Are you sure you want to delete this agent? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="delete"
      />
    </div>
  )
}

export default AgentEditPage
