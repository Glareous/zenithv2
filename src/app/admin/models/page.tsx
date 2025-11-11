'use client'

import React, { useMemo, useState } from 'react'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import BreadCrumb from '@src/components/common/BreadCrumb'
import DeleteModal from '@src/components/common/DeleteModal'
import { Modal } from '@src/components/custom/modal/modal'
import TableContainer from '@src/components/custom/table/table'
import { NextPageWithLayout } from '@src/dtos'
import { RootState } from '@src/slices/reducer'
import { api } from '@src/trpc/react'
import { CirclePlus, Lock, Pencil, Trash2, Upload, X } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { Controller, useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import Select from 'react-select'
import { toast } from 'react-toastify'
import { z } from 'zod'

const modelSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  provider: z
    .string()
    .min(1, 'Provider is required')
    .max(50, 'Provider is too long'),
  modelName: z
    .string()
    .min(1, 'Model name is required')
    .max(100, 'Model name is too long'),
  apiKey: z.string().optional(),
  url: z.string().url('Invalid URL').optional().or(z.literal('')),
  type: z.string().min(1, 'Type is required'),
  isActive: z.boolean(),
  isDefault: z.boolean(),
})

type ModelFormData = z.infer<typeof modelSchema>

const typeOptions = [
  { value: 'GENERATIVE_MODEL', label: 'Generative Model' },
  { value: 'OTHERS', label: 'Others' },
]

const ModelsPage: NextPageWithLayout = () => {
  const { data: session } = useSession()
  const { currentProject } = useSelector((state: RootState) => state.Project)
  const router = useRouter()

  // Check if we're on admin route
  const isAdminRoute =
    typeof window !== 'undefined' && window.location.pathname.startsWith('/admin/models')

  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedModel, setSelectedModel] = useState<any>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ModelFormData>({
    resolver: zodResolver(modelSchema),
    defaultValues: {
      name: '',
      provider: '',
      modelName: '',
      apiKey: '',
      url: '',
      type: 'GENERATIVE_MODEL',
      isActive: true,
      isDefault: false,
    },
  })

  const { data: isAdminData } = api.projectModel.checkIsAdmin.useQuery(
    { projectId: currentProject?.id || '' },
    { enabled: !isAdminRoute && !!currentProject?.id }
  )

  const isAdmin = isAdminData?.isAdmin ?? false
  const isSuperAdmin = session?.user?.role === 'SUPERADMIN'

  // For admin route, get all models; for app route, get project models
  const {
    data: projectModels = [],
    isLoading: isProjectModelsLoading,
    refetch: refetchProjectModels,
  } = api.projectModel.getByProject.useQuery(
    { projectId: currentProject?.id || '' },
    { enabled: !isAdminRoute && !!currentProject?.id && isAdmin }
  )

  const {
    data: allModels = [],
    isLoading: isAllModelsLoading,
    refetch: refetchAllModels,
  } = api.projectModel.getAll.useQuery(undefined, {
    enabled: isAdminRoute && isSuperAdmin,
  })

  const models = isAdminRoute ? allModels : projectModels
  const isLoading = isAdminRoute ? isAllModelsLoading : isProjectModelsLoading
  const refetch = isAdminRoute ? refetchAllModels : refetchProjectModels

  const createMutation = api.projectModel.create.useMutation({
    onSuccess: () => {
      toast.success('Model created successfully')
      refetch()
      closeModal()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create model')
    },
  })

  const updateMutation = api.projectModel.update.useMutation({
    onSuccess: () => {
      toast.success('Model updated successfully')
      refetch()
      closeModal()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update model')
    },
  })

  const deleteMutation = api.projectModel.delete.useMutation({
    onSuccess: () => {
      toast.success('Model deleted successfully')
      refetch()
      setShowDeleteModal(false)
      setSelectedModel(null)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete model')
    },
  })

  const getUploadUrlMutation = api.projectModelFile.getUploadUrl.useMutation()
  const createFileMutation = api.projectModelFile.create.useMutation()
  const deleteFileMutation = api.projectModelFile.delete.useMutation()

  const openCreateModal = () => {
    setIsEditMode(false)
    reset({
      name: '',
      provider: '',
      modelName: '',
      apiKey: '',
      url: '',
      type: 'GENERATIVE_MODEL',
      isActive: true,
      isDefault: false,
    })
    setSelectedFile(null)
    setPreviewUrl(null)
    setShowModal(true)
  }

  const openEditModal = (model: any) => {
    setIsEditMode(true)
    setSelectedModel(model)
    reset({
      name: model.name,
      provider: model.provider,
      modelName: model.modelName,
      apiKey: '••••••••',
      url: model.url || '',
      type: model.type || 'GENERATIVE_MODEL',
      isActive: model.isActive,
      isDefault: model.isDefault,
    })
    setPreviewUrl(model.files?.[0]?.s3Url || null)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setIsEditMode(false)
    setSelectedModel(null)
    reset()
    setSelectedFile(null)
    setPreviewUrl(null)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = async () => {
    if (isEditMode && selectedModel?.files?.[0]?.id) {
      try {
        await deleteFileMutation.mutateAsync({ id: selectedModel.files[0].id })
        toast.success('Image removed successfully')
        setPreviewUrl(null)
        setSelectedFile(null)
        refetch()
      } catch (error) {
        console.error('Error removing image:', error)
        toast.error('Failed to remove image')
      }
    } else {
      setPreviewUrl(null)
      setSelectedFile(null)
    }
  }

  const uploadIcon = async (modelId: string) => {
    if (!selectedFile) return

    try {
      // Delete old icon if exists
      if (isEditMode && selectedModel?.files?.[0]?.id) {
        await deleteFileMutation.mutateAsync({ id: selectedModel.files[0].id })
      }
      const uploadResult = await getUploadUrlMutation.mutateAsync({
        modelId,
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
      })

      const uploadResponse = await fetch(uploadResult.uploadUrl, {
        method: 'PUT',
        body: selectedFile,
        headers: {
          'Content-Type': selectedFile.type,
        },
      })

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload ${selectedFile.name}`)
      }

      await createFileMutation.mutateAsync({
        modelId,
        name: selectedFile.name,
        fileName: uploadResult.fileName,
        fileType: 'IMAGE',
        mimeType: selectedFile.type,
        fileSize: selectedFile.size,
        s3Key: uploadResult.s3Key,
        isPublic: true,
      })

      toast.success('Icon uploaded successfully')
      refetch()
    } catch (error) {
      console.error('Icon upload error:', error)
      toast.error('Failed to upload icon')
    }
  }

  const onSubmit = async (data: ModelFormData) => {
    if (!currentProject?.id) {
      toast.error('No project selected')
      return
    }

    if (!isEditMode && (!data.apiKey || data.apiKey.trim() === '')) {
      setError('apiKey', {
        type: 'manual',
        message: 'API key is required',
      })
      return
    }

    try {
      if (isEditMode && selectedModel) {
        const updateData: any = {
          id: selectedModel.id,
          name: data.name,
          provider: data.provider,
          modelName: data.modelName,
          url: data.url || '',
          type: data.type,
          isActive: data.isActive,
          isDefault: data.isDefault,
        }

        if (data.apiKey && data.apiKey !== '••••••••') {
          updateData.apiKey = data.apiKey
        }

        await updateMutation.mutateAsync(updateData)

        if (selectedFile) {
          await uploadIcon(selectedModel.id)
        }
      } else {
        const newModel = await createMutation.mutateAsync({
          name: data.name,
          provider: data.provider,
          modelName: data.modelName,
          apiKey: data.apiKey!,
          url: data.url || '',
          type: data.type,
          isActive: data.isActive,
          isDefault: data.isDefault,
          // For admin route, create global models without projectId
          isGlobal: isAdminRoute,
          projectId: isAdminRoute ? undefined : currentProject.id,
        })

        if (selectedFile && newModel.id) {
          await uploadIcon(newModel.id)
        }
      }

      refetch()
    } catch (error) {
      console.error('Submit error:', error)
    }
  }

  const handleDelete = (model: any) => {
    setSelectedModel(model)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    if (selectedModel) {
      deleteMutation.mutate({ id: selectedModel.id })
    }
  }

  const columns = useMemo(
    () => [
      {
        header: 'Icon',
        cell: ({ row }: { row: { original: any } }) => {
          const iconUrl = row.original.files?.[0]?.s3Url
          return (
            <div className="relative size-10">
              {iconUrl ? (
                <Image
                  src={iconUrl}
                  alt={row.original.name}
                  width={40}
                  height={40}
                  className="rounded-lg object-cover"
                />
              ) : (
                <div className="size-10 rounded-lg bg-gray-100 dark:bg-dark-850 flex items-center justify-center">
                  <span className="text-xs font-semibold text-gray-500 dark:text-dark-500">
                    {row.original.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
          )
        },
      },
      {
        header: 'Name',
        accessorKey: 'name',
      },
      {
        header: 'Provider',
        accessorKey: 'provider',
      },
      {
        header: 'Model',
        accessorKey: 'modelName',
      },
      {
        header: 'Agents Using',
        cell: ({ row }: { row: { original: any } }) => {
          return <span>{row.original._count?.agents || 0}</span>
        },
      },
      {
        header: 'Status',
        cell: ({ row }: { row: { original: any } }) => {
          const isActive = row.original.isActive
          const isDefault = row.original.isDefault
          return (
            <div className="flex gap-2">
              {isActive ? (
                <span className="badge badge-success">Active</span>
              ) : (
                <span className="badge badge-danger">Inactive</span>
              )}
              {isDefault && (
                <span className="badge badge-primary">Default</span>
              )}
            </div>
          )
        },
      },
      {
        header: 'Actions',
        cell: ({ row }: { row: { original: any } }) => (
          <div className="flex items-center gap-2">
            <button
              className="btn btn-sub-primary btn-icon !size-8"
              onClick={() => openEditModal(row.original)}>
              <Pencil className="size-4" />
            </button>
            <button
              className="btn btn-sub-red btn-icon !size-8"
              onClick={() => handleDelete(row.original)}>
              <Trash2 className="size-4" />
            </button>
          </div>
        ),
      },
    ],
    []
  )

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Please select a project first</p>
      </div>
    )
  }

  // For admin route, SUPERADMIN always has access
  // For app route, check if user is project admin
  if (!isAdminRoute && session && currentProject && !isAdmin) {
    return (
      <React.Fragment>
        <BreadCrumb
          title="AI Models"
          subTitle="Manage AI models for your agents"
        />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="mb-4">
              <Lock className="w-16 h-16 mx-auto text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Access Restricted
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Only project administrators can manage AI models.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Please contact your project administrator if you need access.
            </p>
          </div>
        </div>
      </React.Fragment>
    )
  }

  return (
    <React.Fragment>
      <BreadCrumb
        title="AI Models"
        subTitle="Manage AI models for your agents"
      />

      <div className="card">
        <div className="card-body">
          <div className="flex items-center justify-between mb-5">
            <h6 className="text-15">AI Models</h6>
            <button
              type="button"
              className="btn btn-primary"
              onClick={openCreateModal}>
              <CirclePlus className="inline-block size-4 mr-1" />
              <span className="align-middle">Add Model</span>
            </button>
          </div>

          <TableContainer
            isPagination={false}
            columns={columns || []}
            data={models || []}
            customPageSize={models?.length || 0}
            divClass="overflow-x-auto"
            tableClass="table hovered"
            theadClass="ltr:text-left rtl:text-right"
            thClass="px-3.5 py-2.5 font-semibold text-gray-500 bg-gray-100 dark:bg-dark-850 dark:text-dark-500"
            tdClass="px-3.5 py-2.5"
            PaginationClassName="flex flex-col items-center mt-5 md:flex-row"
          />
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        id="modelModal"
        position="modal-center"
        size="modal-lg"
        title={isEditMode ? 'Edit Model' : 'Add New Model'}
        content={
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Model Icon Upload */}
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium">
                Model Icon (Optional)
              </label>
              <div className="flex items-center gap-4">
                {previewUrl && (
                  <div className="relative size-20">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      width={80}
                      height={80}
                      className="rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-colors"
                      title="Remove image">
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                )}
                <label className="btn btn-sm btn-outline-primary cursor-pointer">
                  <Upload className="inline-block size-4 mr-1" />
                  Icon
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            <div className="flex justify-between items-center">
              {/* Model Name */}
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block mb-2 text-sm font-medium">
                  Model Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  {...register('name')}
                  className={`form-input w-70 ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="e.g., GPT-4 Production"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Provider */}
              <div className="mb-4">
                <label
                  htmlFor="provider"
                  className="block mb-2 text-sm font-medium">
                  Provider <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="provider"
                  {...register('provider')}
                  className={`form-input w-70 ${errors.provider ? 'border-red-500' : ''}`}
                  placeholder="e.g., OpenAI, Anthropic, Google"
                />
                {errors.provider && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.provider.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center">
              {/* Model Name (Technical) */}
              <div className="mb-4">
                <label
                  htmlFor="modelName"
                  className="block mb-2 text-sm font-medium">
                  Model Name (Technical) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="modelName"
                  {...register('modelName')}
                  className={`form-input w-70 ${errors.modelName ? 'border-red-500' : ''}`}
                  placeholder="e.g., gpt-4-turbo-preview"
                />
                {errors.modelName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.modelName.message}
                  </p>
                )}
              </div>

              {/* URL */}
              <div className="mb-4">
                <label htmlFor="url" className="block mb-2 text-sm font-medium">
                  URL
                </label>
                <input
                  type="text"
                  id="url"
                  {...register('url')}
                  className={`form-input w-70 ${errors.url ? 'border-red-500' : ''}`}
                  placeholder="e.g., https://api.example.com/v1"
                />
                {errors.url && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.url.message}
                  </p>
                )}
              </div>
            </div>

            {/* API Key */}
            <div className="mb-4">
              <label
                htmlFor="apiKey"
                className="block mb-2 text-sm font-medium">
                API Key <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="apiKey"
                {...register('apiKey')}
                className={`form-input ${errors.apiKey ? 'border-red-500' : ''}`}
                placeholder={
                  isEditMode ? 'Leave blank to keep current' : 'Enter API key'
                }
              />
              {errors.apiKey && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.apiKey.message}
                </p>
              )}
              {isEditMode && (
                <p className="mt-1 text-xs text-gray-500">
                  Leave blank to keep the current API key
                </p>
              )}
            </div>

            <div className="flex justify-between items-center">
              {/* Type */}
              <div className="mb-4">
                <label
                  htmlFor="type"
                  className="block mb-2 text-sm font-medium">
                  Type <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={typeOptions}
                      value={typeOptions.find(
                        (opt) => opt.value === field.value
                      )}
                      onChange={(option) => field.onChange(option?.value)}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      placeholder="Select model type..."
                    />
                  )}
                />
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.type.message}
                  </p>
                )}
              </div>

              {/* Checkboxes */}
              <div className="flex gap-4 mb-4 mt-8">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    {...register('isActive')}
                    className="form-checkbox"
                  />
                  <span className="ml-2">Active</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    {...register('isDefault')}
                    className="form-checkbox"
                  />
                  <span className="ml-2">Set as Default</span>
                </label>
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                className="btn btn-outline-red"
                onClick={closeModal}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={
                  isSubmitting ||
                  createMutation.isPending ||
                  updateMutation.isPending
                }>
                {isSubmitting ||
                createMutation.isPending ||
                updateMutation.isPending
                  ? 'Saving...'
                  : isEditMode
                    ? 'Update Model'
                    : 'Create Model'}
              </button>
            </div>
          </form>
        }
      />

      {/* Delete Modal */}
      <DeleteModal
        show={showDeleteModal}
        handleHide={() => setShowDeleteModal(false)}
        deleteModalFunction={confirmDelete}
        title="Delete Model"
        message={
          selectedModel
            ? `Are you sure you want to delete "${selectedModel.name}"? This action cannot be undone.`
            : 'Are you sure you want to delete this model?'
        }
        confirmText="Delete"
        cancelText="Cancel"
        type="delete"
      />
    </React.Fragment>
  )
}

ModelsPage.getLayout = (page: React.ReactElement) => {
  return <>{page}</>
}

export default ModelsPage
