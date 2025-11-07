'use client'

import React, { useMemo, useState } from 'react'

import { useRouter } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import BreadCrumb from '@src/components/common/BreadCrumb'
import DeleteModal from '@src/components/common/DeleteModal'
import { Modal } from '@src/components/custom/modal/modal'
import TableContainer from '@src/components/custom/table/table'
import ModalSelectAgent from '@src/components/organisms/ModalSelectAgent'
import { NextPageWithLayout } from '@src/dtos'
import { RootState } from '@src/slices/reducer'
import { api } from '@src/trpc/react'
import { CirclePlus, Eye, Pencil, Settings, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { z } from 'zod'

const pqrSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Invalid email').min(1, 'Email is required'),
  city: z.string().min(1, 'City is required'),
  documentType: z.enum(['CC', 'CE', 'PASSPORT', 'NIT']),
  documentNumber: z.string().min(1, 'Document number is required'),
  message: z.string().min(1, 'Message is required'),
  status: z.enum(['PROCESSING', 'COMPLETED']),
})

type PQRFormData = z.infer<typeof pqrSchema>

const PQRListPage: NextPageWithLayout = () => {
  const { currentProject } = useSelector((state: RootState) => state.Project)

  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showAgentModal, setShowAgentModal] = useState(false)
  const [selectedPQR, setSelectedPQR] = useState<any>(null)
  const [isEditMode, setIsEditMode] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PQRFormData>({
    resolver: zodResolver(pqrSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      city: '',
      documentType: 'CC',
      documentNumber: '',
      message: '',
    },
  })

  const {
    data: pqrs = [],
    isLoading,
    refetch,
  } = api.projectPQR.getByProject.useQuery(
    { projectId: currentProject?.id || '' },
    { enabled: !!currentProject?.id }
  )

  const { data: agents = [] } = api.projectAgent.getByProject.useQuery(
    { projectId: currentProject?.id || '' },
    { enabled: !!currentProject?.id }
  )

  const { data: projectDetails } = api.project.getById.useQuery(
    { id: currentProject?.id || '' },
    { enabled: !!currentProject?.id }
  )

  const createMutation = api.projectPQR.create.useMutation({
    onSuccess: () => {
      toast.success('PQR created successfully')
      refetch()
      closeModal()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create PQR')
    },
  })

  const updateMutation = api.projectPQR.update.useMutation({
    onSuccess: () => {
      toast.success('PQR updated successfully')
      refetch()
      closeModal()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update PQR')
    },
  })
  const router = useRouter()
  const deleteMutation = api.projectPQR.delete.useMutation({
    onSuccess: () => {
      toast.success('PQR deleted successfully')
      refetch()
      setShowDeleteModal(false)
      setSelectedPQR(null)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete PQR')
    },
  })

  const openCreateModal = () => {
    setIsEditMode(false)
    reset({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      city: '',
      documentType: 'CC',
      documentNumber: '',
      message: '',
    })
    setShowModal(true)
  }

  const openEditModal = (pqr: any) => {
    setIsEditMode(true)
    setSelectedPQR(pqr)
    reset({
      firstName: pqr.firstName,
      lastName: pqr.lastName,
      phone: pqr.phone,
      email: pqr.email,
      city: pqr.city,
      documentType: pqr.documentType,
      documentNumber: pqr.documentNumber,
      message: pqr.message,
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setIsEditMode(false)
    setSelectedPQR(null)
    reset()
  }

  const upsertTriggerMutation = api.projectAgentTrigger.upsert.useMutation({
    onError: (error) => {
      toast.error(`Error creating webhook trigger: ${error.message}`)
    },
  })

  const upsertWebhookActionMutation =
    api.projectAction.upsertWebhookAction.useMutation({
      onError: (error) => {
        toast.error(`Error creating webhook action: ${error.message}`)
      },
    })

  const updatePQRAgentMutation = api.project.updatePQRAgent.useMutation({
    onSuccess: () => {
      toast.success('PQR agent configured successfully!')
      setShowAgentModal(false)

      utils.project.getById.invalidate({ id: currentProject?.id || '' })
    },
    onError: (error) => {
      toast.error(`Error configuring PQR agent: ${error.message}`)
    },
  })

  const removePQRAgentMutation = api.project.removePQRAgent.useMutation({
    onSuccess: () => {
      toast.success('PQR agent removed successfully!')
      setShowAgentModal(false)

      utils.project.getById.invalidate({ id: currentProject?.id || '' })
    },
    onError: (error) => {
      toast.error(`Error removing PQR agent: ${error.message}`)
    },
  })

  const utils = api.useUtils()

  const handleRemovePQRAgent = () => {
    if (!currentProject?.id) {
      toast.error('No project selected')
      return
    }

    removePQRAgentMutation.mutate({
      projectId: currentProject.id,
    })
  }

  const handleSelectAgent = async (agentId: string) => {
    if (!currentProject?.id) {
      toast.error('No project selected')
      return
    }

    try {
      const triggers = await utils.projectAgentTrigger.getByAgentId.fetch({
        agentId: agentId,
      })

      const existingWebhook = triggers?.find((t) => t.type === 'WEBHOOK')

      let webhookConfig: {
        requestBody: string
        variables: Array<{
          id: string
          key: string
          type: 'STRING' | 'NUMBER' | 'BOOLEAN'
          value: string
        }>
      }

      if (existingWebhook?.webhookConfig) {
        const existingConfig = existingWebhook.webhookConfig as any
        const existingVariables = existingConfig.variables || []

        const hasIdVariable = existingVariables.some((v: any) => v.key === 'id')

        if (hasIdVariable) {
          webhookConfig = existingConfig
        } else {
          webhookConfig = {
            requestBody: existingConfig.requestBody || '',
            variables: [
              ...existingVariables,
              {
                id: `pqr-id-${Date.now()}`,
                key: 'id',
                type: 'STRING' as const,
                value: 'id',
              },
            ],
          }
        }
      } else {
        webhookConfig = {
          requestBody: '',
          variables: [
            {
              id: `pqr-id-${Date.now()}`,
              key: 'id',
              type: 'STRING' as const,
              value: 'id',
            },
          ],
        }
      }

      upsertTriggerMutation.mutate(
        {
          agentId: agentId,
          type: 'WEBHOOK',
          webhookConfig: webhookConfig,
        },
        {
          onSuccess: () => {
            upsertWebhookActionMutation.mutate(
              {
                agentId: agentId,
                projectId: currentProject.id,
                variables: webhookConfig.variables,
              },
              {
                onSuccess: () => {
                  updatePQRAgentMutation.mutate({
                    projectId: currentProject.id,
                    agentId: agentId,
                  })
                },
              }
            )
          },
        }
      )
    } catch (error) {
      console.error('Error configuring PQR agent:', error)
      toast.error('Failed to configure PQR agent')
    }
  }

  const onSubmit = async (data: PQRFormData) => {
    if (!currentProject?.id) {
      toast.error('No project selected')
      return
    }

    try {
      if (isEditMode && selectedPQR) {
        await updateMutation.mutateAsync({
          id: selectedPQR.id,
          ...data,
        })
      } else {
        await createMutation.mutateAsync({
          ...data,
          projectId: currentProject.id,
        })
      }

      refetch()
    } catch (error) {
      console.error('Submit error:', error)
    }
  }

  const handleDelete = (pqr: any) => {
    setSelectedPQR(pqr)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    if (selectedPQR) {
      deleteMutation.mutate({ id: selectedPQR.id })
    }
  }

  const columns = useMemo(
    () => [
      {
        header: 'Name',
        cell: ({ row }: { row: { original: any } }) => {
          return (
            <span>
              {row.original.firstName} {row.original.lastName}
            </span>
          )
        },
      },
      {
        header: 'Email',
        accessorKey: 'email',
      },
      {
        header: 'Phone',
        accessorKey: 'phone',
      },
      {
        header: 'Document Type',
        accessorKey: 'documentType',
      },
      {
        header: 'Document Number',
        accessorKey: 'documentNumber',
      },
      {
        header: 'City',
        accessorKey: 'city',
      },
      {
        header: 'Actions',
        cell: ({ row }: { row: { original: any } }) => {
          return (
            <div className="flex gap-2">
              <button
                onClick={() => openEditModal(row.original)}
                className="btn btn-sub-gray btn-icon !size-8">
                <Pencil className="size-4" />
              </button>
              <button
                onClick={() => handleDelete(row.original)}
                className="btn btn-sub-red btn-icon !size-8">
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                className="btn btn-sub-primary btn-icon !size-8"
                onClick={() => {
                  router.push(`/apps/pqr/pqr-overview?id=${row.original.id}`)
                }}>
                <Eye className="size-4" />
              </button>
            </div>
          )
        },
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

  return (
    <React.Fragment>
      <BreadCrumb
        title="PQR Management"
        subTitle="Manage customer requests, complaints and claims"
      />

      <div className="card">
        <div className="card-body">
          <div className="flex items-center justify-between mb-5">
            <h6 className="text-15">PQRs</h6>
            <div className="flex gap-3">
              <button
                type="button"
                className="btn btn-primary"
                onClick={openCreateModal}>
                <CirclePlus className="inline-block size-4 mr-1" />
                <span className="align-middle">Add PQR</span>
              </button>
              <button
                type="button"
                className="btn btn-sub-primary btn-icon"
                onClick={() => setShowAgentModal(true)}>
                <Settings className="size-5" />
              </button>
            </div>
          </div>

          <TableContainer
            isPagination={false}
            columns={columns || []}
            data={pqrs || []}
            customPageSize={pqrs?.length || 0}
            divClass="overflow-x-auto"
            tableClass="table flush"
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
        id="pqrModal"
        position="modal-center"
        size="modal-xl"
        title={isEditMode ? 'Edit PQR' : 'Add New PQR'}
        content={
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-4">
              {/* First Name */}
              <div className="mb-4">
                <label
                  htmlFor="firstName"
                  className="block mb-2 text-sm font-medium">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  {...register('firstName')}
                  className={`form-input ${errors.firstName ? 'border-red-500' : ''}`}
                  placeholder="Enter first name"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div className="mb-4">
                <label
                  htmlFor="lastName"
                  className="block mb-2 text-sm font-medium">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  {...register('lastName')}
                  className={`form-input ${errors.lastName ? 'border-red-500' : ''}`}
                  placeholder="Enter last name"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.lastName.message}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="mb-4">
                <label
                  htmlFor="phone"
                  className="block mb-2 text-sm font-medium">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="phone"
                  {...register('phone')}
                  className={`form-input ${errors.phone ? 'border-red-500' : ''}`}
                  placeholder="Enter phone number"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  {...register('email')}
                  className={`form-input ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="Enter email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* City */}
              <div className="mb-4">
                <label
                  htmlFor="city"
                  className="block mb-2 text-sm font-medium">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="city"
                  {...register('city')}
                  className={`form-input ${errors.city ? 'border-red-500' : ''}`}
                  placeholder="Enter city"
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.city.message}
                  </p>
                )}
              </div>

              {/* Document Type */}
              <div className="mb-4">
                <label
                  htmlFor="documentType"
                  className="block mb-2 text-sm font-medium">
                  Document Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="documentType"
                  {...register('documentType')}
                  className={`form-input ${errors.documentType ? 'border-red-500' : ''}`}>
                  <option value="CC">CC - Citizenship Card</option>
                  <option value="CE">CE - Foreign ID</option>
                  <option value="PASSPORT">Passport</option>
                  <option value="NIT">NIT - Tax ID</option>
                </select>
                {errors.documentType && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.documentType.message}
                  </p>
                )}
              </div>

              {/* Document Number */}
              <div className="mb-4">
                <label
                  htmlFor="documentNumber"
                  className="block mb-2 text-sm font-medium">
                  Document Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="documentNumber"
                  {...register('documentNumber')}
                  className={`form-input ${errors.documentNumber ? 'border-red-500' : ''}`}
                  placeholder="Enter document number"
                />
                {errors.documentNumber && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.documentNumber.message}
                  </p>
                )}
              </div>

              {/* Status */}
              <div className="mb-4">
                <label
                  htmlFor="status"
                  className="block mb-2 text-sm font-medium">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  id="status"
                  {...register('status')}
                  className={`form-input ${errors.status ? 'border-red-500' : ''}`}>
                  <option value="PROCESSING">Processing</option>
                  <option value="COMPLETED">Completed</option>
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.status.message}
                  </p>
                )}
              </div>

              {/* Message */}
              <div className="mb-4 col-span-2">
                <label
                  htmlFor="message"
                  className="block mb-2 text-sm font-medium">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  {...register('message')}
                  rows={4}
                  className={`form-input ${errors.message ? 'border-red-500' : ''}`}
                  placeholder="Enter your request, complaint or claim"
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.message.message}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                className="btn btn-outline-secondary"
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
                    ? 'Update PQR'
                    : 'Create PQR'}
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
        title="Delete PQR"
        message={
          selectedPQR
            ? `Are you sure you want to delete the PQR from "${selectedPQR.firstName} ${selectedPQR.lastName}"? This action cannot be undone.`
            : 'Are you sure you want to delete this PQR?'
        }
        confirmText="Delete"
        cancelText="Cancel"
        type="delete"
      />

      {/* Agent Selection Modal */}
      <ModalSelectAgent
        isOpen={showAgentModal}
        onClose={() => setShowAgentModal(false)}
        agents={agents}
        onSelect={handleSelectAgent}
        isLoading={
          upsertTriggerMutation.isPending ||
          upsertWebhookActionMutation.isPending ||
          updatePQRAgentMutation.isPending
        }
        title="Select Agent for PQR Analysis"
        buttonText="Save Configuration"
        initialSelectedId={projectDetails?.pqrAgentId}
        onDelete={handleRemovePQRAgent}
        deleteButtonText="Remove Agent"
        isDeleting={removePQRAgentMutation.isPending}
      />
    </React.Fragment>
  )
}

export default PQRListPage
