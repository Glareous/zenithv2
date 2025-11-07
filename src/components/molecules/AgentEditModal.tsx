'use client'

import React, { useEffect, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '@src/components/custom/modal/modal'
import { api } from '@src/trpc/react'
import { File, Trash2, Upload, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { z } from 'zod'

// Schema de validación para el formulario
const agentEditSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  systemInstructions: z.string().optional(),
  model: z.string(),
})

type AgentEditFormData = z.infer<typeof agentEditSchema>

interface AgentEditModalProps {
  isOpen: boolean
  onClose: () => void
  agent: {
    id: string
    name: string | null
    type: string
    systemInstructions: string | null
    isActive: boolean
  } | null
}

const AgentEditModal: React.FC<AgentEditModalProps> = ({
  isOpen,
  onClose,
  agent,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadingFiles, setUploadingFiles] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AgentEditFormData>({
    resolver: zodResolver(agentEditSchema),
    defaultValues: {
      name: '',
      systemInstructions: '',
      model: 'GPT-4',
    },
  })

  // Fetch archivos del agente
  const { data: agentFiles = [], refetch: refetchFiles } =
    api.projectAgentFile.getAll.useQuery(
      { agentId: agent?.id || '' },
      { enabled: !!agent?.id }
    )

  // Agregar este console.log para debuggear
  console.log('Agent ID:', agent?.id)
  console.log('Agent Files:', agentFiles)
  console.log('Agent Files length:', agentFiles.length)

  // Mutations
  const updateAgentMutation = api.projectAgent.update.useMutation({
    onSuccess: () => {
      toast.success('Agent updated successfully!')
      onClose()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update agent')
    },
  })

  const uploadFileMutation = api.projectAgentFile.uploadAndCreate.useMutation({
    onSuccess: (data) => {
      console.log('Upload success:', data)
      toast.success('Image uploaded successfully!')
      refetchFiles()
      setSelectedFiles([])
    },
    onError: (error) => {
      console.log('Upload error:', error)
      toast.error(error.message || 'Failed to upload image')
    },
  })

  const deleteFileMutation = api.projectAgentFile.delete.useMutation({
    onSuccess: () => {
      toast.success('Image deleted successfully!')
      refetchFiles()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete image')
    },
  })

  // Agregar la mutation para crear el registro en la DB
  const createFileMutation = api.projectAgentFile.create.useMutation({
    onSuccess: () => {
      toast.success('Image uploaded successfully!')
      refetchFiles()
      setSelectedFiles([])
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save image record')
    },
  })

  // Reset form when agent changes
  useEffect(() => {
    if (agent) {
      reset({
        name: agent.name || '',
        systemInstructions: agent.systemInstructions || '',
        model: 'GPT-4',
      })
      setSelectedFiles([])
    }
  }, [agent, reset])

  const onSubmit = (data: AgentEditFormData) => {
    if (!agent) return

    updateAgentMutation.mutate({
      id: agent.id,
      name: data.name,
      systemInstructions: data.systemInstructions,
    })
  }

  const handleClose = () => {
    reset()
    setSelectedFiles([])
    onClose()
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setSelectedFiles((prev) => [...prev, ...files])
  }

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const uploadFiles = async () => {
    if (!agent || selectedFiles.length === 0) return

    setUploadingFiles(true)

    try {
      for (const file of selectedFiles) {
        // 1. Obtener presigned URL
        const uploadResult = await uploadFileMutation.mutateAsync({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          agentId: agent.id,
        })

        // 2. Subir archivo a S3
        const uploadResponse = await fetch(uploadResult.uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        })

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload ${file.name}`)
        }

        // 3. Crear registro en la base de datos
        await createFileMutation.mutateAsync({
          agentId: agent.id,
          name: file.name,
          fileName: uploadResult.fileName,
          fileType: 'IMAGE', // Para imágenes
          mimeType: file.type,
          fileSize: file.size,
          s3Key: uploadResult.s3Key,
        })
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload some images')
    } finally {
      setUploadingFiles(false)
    }
  }

  const handleDeleteFile = (fileId: string) => {
    if (confirm('Are you sure you want to delete this image?')) {
      deleteFileMutation.mutate({ id: fileId })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Agent"
      size="modal-lg"
      position="modal-center"
      content={
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Agent Type Display */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Agent Type
            </label>
            <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-md border">
              <span className="text-sm text-gray-900 dark:text-gray-100">
                {agent?.type || 'Unknown'}
              </span>
            </div>
          </div>

          {/* Agent Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Agent Name *
            </label>
            <input
              {...register('name')}
              type="text"
              id="name"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.name
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white'
              }`}
              placeholder="Enter agent name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* System Instructions */}
          <div>
            <label
              htmlFor="systemInstructions"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              System Instructions
            </label>
            <textarea
              {...register('systemInstructions')}
              id="systemInstructions"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
              placeholder="Enter system instructions for the agent..."
            />
            {errors.systemInstructions && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.systemInstructions.message}
              </p>
            )}
          </div>

          {/* Model Selection */}
          <div>
            <label
              htmlFor="model"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Model
            </label>
            <select
              {...register('model')}
              id="model"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white">
              <option value="GPT-4">GPT-4</option>
            </select>
          </div>

          {/* File Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Files
            </label>

            {/* File Upload Area */}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-6 text-center">
              <div className="space-y-2">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                    <span>Upload images</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      multiple
                      className="sr-only"
                      onChange={handleFileSelect}
                      accept=".jpg,.jpeg,.png,.gif,.webp"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  JPG, JPEG, PNG, GIF, WEBP up to 10MB each
                </p>
              </div>
            </div>

            {/* Selected Files to Upload */}
            {selectedFiles.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Images to Upload:
                </h4>
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                      <div className="flex items-center space-x-2">
                        <File className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {file.name} ({formatFileSize(file.size)})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSelectedFile(index)}
                        className="text-red-500 hover:text-red-700">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={uploadFiles}
                    disabled={uploadingFiles}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed">
                    {uploadingFiles
                      ? 'Uploading...'
                      : `Upload ${selectedFiles.length} image(s)`}
                  </button>
                </div>
              </div>
            )}

            {/* Existing Files */}
            {agentFiles.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Existing Images:
                </h4>
                <div className="space-y-2">
                  {agentFiles.map((file: any) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                      <div className="flex items-center space-x-2">
                        <File className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {file.fileName} ({formatFileSize(file.fileSize)})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteFile(file.id)}
                        className="text-red-500 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Status Display */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-md border">
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  agent?.isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                }`}>
                {agent?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </form>
      }
      footer={
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleClose}
            className="btn btn-outline-red">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            onClick={handleSubmit(onSubmit)}
            className="btn btn-primary">
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      }
    />
  )
}

export default AgentEditModal
