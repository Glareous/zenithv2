'use client'

import React from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { ProjectRole } from '@prisma/client'
import { api } from '@src/trpc/react'
import { Mail, UserPlus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { z } from 'zod'

import { Modal } from '../custom/modal/modal'

const inviteMemberSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.nativeEnum(ProjectRole),
})

type InviteMemberFormData = z.infer<typeof inviteMemberSchema>

interface ModalInviteMemberProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  onSuccess?: () => void
}

const ModalInviteMember: React.FC<ModalInviteMemberProps> = ({
  isOpen,
  onClose,
  projectId,
  onSuccess,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<InviteMemberFormData>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: '',
      role: 'MEMBER',
    },
  })

  const inviteMember = api.projectMember.inviteByEmail.useMutation({
    onSuccess: () => {
      toast.success('Invitation sent successfully!')
      reset()
      onClose()
      onSuccess?.()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onSubmit = async (data: InviteMemberFormData) => {
    await inviteMember.mutateAsync({
      projectId,
      email: data.email,
      role: data.role,
    })
  }

  const handleClose = (): void => {
    reset()
    onClose()
  }

  const content = (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Email Input */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            {...register('email')}
            type="email"
            id="email"
            className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
              errors.email
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300'
            }`}
            placeholder="Enter email address"
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      {/* Role Selection */}
      <div>
        <label htmlFor="role" className="block text-sm font-medium mb-2">
          Role
        </label>
        <select
          {...register('role')}
          id="role"
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
            errors.role
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300'
          }`}>
          <option value="MEMBER">Member</option>
          <option value="ADMIN">Admin</option>
        </select>
        {errors.role && (
          <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          <strong>Member:</strong> Can view project data and interact with
          agents
          <br />
          <strong>Admin:</strong> Can manage project, add/remove users, and
          configure agents
        </p>
      </div>
      <div className="flex items-center justify-end gap-2 mt-5">
        <button
          type="button"
          className="btn btn-active-red"
          onClick={handleClose}
          disabled={isSubmitting}>
          Cancel
        </button>

        <button
          type="submit"
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting || inviteMember.isPending}
          className="flex items-center gap-2 btn btn-primary">
          {isSubmitting || inviteMember.isPending ? (
            <>
              <svg className="w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="opacity-25"
                  fill="none"
                />
                <path
                  fill="currentColor"
                  className="opacity-75"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Sending...
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4 mr-2" />
              Send Invitation
            </>
          )}
        </button>
      </div>
    </form>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Invite Member"
      content={content}
      size="modal-md"
      position="modal-center"
    />
  )
}

export default ModalInviteMember
