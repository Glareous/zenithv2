'use client'

import React, { useCallback, useEffect } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '@src/components/custom/modal/modal'
import { api } from '@src/trpc/react'
import { Project } from '@src/types/project'
import { useSession } from 'next-auth/react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { z } from 'zod'

const projectCreateSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(100, 'Project name must be less than 100 characters'),
  description: z.string().optional(),
  status: z.enum(['CREATED', 'ACTIVE', 'COMPLETED']),
})

type ProjectCreateInput = z.infer<typeof projectCreateSchema>

const AddEditProjectGrid = ({
  modalState,
  closeModal,
  projectGrid,
  editMode = false,
  currentProjectGrid = null,
}: {
  modalState: { showEditProjectForm: boolean; showAddProjectForm: boolean }
  closeModal: () => void
  projectGrid: Project[]
  editMode?: boolean
  currentProjectGrid?: Project | null
}) => {
  const { data: session } = useSession()
  const utils = api.useUtils()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectCreateInput>({
    resolver: zodResolver(projectCreateSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'CREATED' as const,
    },
  })

  const createProjectMutation = api.project.create.useMutation({
    onSuccess: async () => {
      await utils.project.getAll.invalidate()
      toast.success('Project created successfully!')
      reset({
        // Resetear el formulario después de crear
        name: '',
        description: '',
        status: 'CREATED' as const,
      })
      closeModal()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create project')
    },
  })

  const updateProjectMutation = api.project.update.useMutation({
    onSuccess: async () => {
      await utils.project.getAll.invalidate()
      toast.success('Project updated successfully!')
      closeModal()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update project')
    },
  })
  const resetForm = useCallback(() => {
    reset({
      name: '',
      description: '',
    })
  }, [reset])

  useEffect(() => {
    if (editMode && currentProjectGrid) {
      reset({
        name: currentProjectGrid.name,
        description: currentProjectGrid.description || '',
        status: currentProjectGrid.status,
      })
    } else {
      reset({
        name: '',
        description: '',
        status: 'CREATED',
      })
    }
  }, [editMode, currentProjectGrid, reset])

  const submitForm: SubmitHandler<ProjectCreateInput> = (data) => {
    if (!session?.user?.defaultOrganization?.id) {
      console.error('No organization selected')
      return
    }

    if (editMode && currentProjectGrid) {
      updateProjectMutation.mutate({
        id: currentProjectGrid.id,
        name: data.name,
        description: data.description,
        status: data.status,
      })
    } else {
      createProjectMutation.mutate({
        name: data.name,
        description: data.description,
        organizationId: session?.user?.defaultOrganization?.id || '',
        status: data.status,
      })
    }
  }

  return (
    <Modal
      isOpen={modalState.showAddProjectForm || modalState.showEditProjectForm}
      onClose={() => {
        reset({
          // Resetear el formulario al cerrar
          name: '',
          description: '',
          status: 'CREATED' as const,
        })
        closeModal()
      }}
      title={editMode ? 'Edit Project' : 'Add Project'}
      position="modal-center"
      contentClass="modal-content"
      content={() => (
        <form onSubmit={handleSubmit(submitForm)}>
          <div className="mb-4">
            <label className="form-label">Project Name</label>
            <input
              className="form-input"
              {...register('name')}
              placeholder="Enter project name"
            />
            {errors.name && (
              <span className="text-red-500">{errors.name.message}</span>
            )}
          </div>
          <div className="mb-4">
            <label className="form-label">Description (Optional)</label>
            <textarea
              className="form-input resize-none"
              rows={3}
              {...register('description')}
              placeholder="Enter project description"
            />
            {errors.description && (
              <span className="text-red-500">{errors.description.message}</span>
            )}
          </div>
          <div className="mb-4">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              {...register('status')}
              defaultValue="CREATED">
              <option value="CREATED">Created</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
            </select>
            {errors.status && (
              <span className="text-red-500">{errors.status.message}</span>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="btn btn-outline-red"
              onClick={closeModal}
              disabled={
                isSubmitting ||
                createProjectMutation.isPending ||
                updateProjectMutation.isPending
              }>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={
                isSubmitting ||
                createProjectMutation.isPending ||
                updateProjectMutation.isPending
              }>
              {isSubmitting ||
              createProjectMutation.isPending ||
              updateProjectMutation.isPending ? (
                <>
                  {editMode ? 'Updating' : 'Creating'}
                  <span className="ml-2 animate-pulse">...</span>
                </>
              ) : editMode ? (
                'Update'
              ) : (
                'Create'
              )}
            </button>
          </div>
        </form>
      )}
    />
  )
}

export default AddEditProjectGrid
