'use client'

import React, { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { Modal } from '@src/components/custom/modal/modal'
import { RootState } from '@src/slices/reducer'
import { api } from '@src/trpc/react'
import { Phone, Plus, X } from 'lucide-react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'

const IntegrationPage = () => {
  const router = useRouter()
  const { currentProject } = useSelector((state: RootState) => state.Project)
  const projectId = currentProject?.id

  const [hovered, setHovered] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPhoneIds, setSelectedPhoneIds] = useState<Set<string>>(
    new Set()
  )
  const [isConfirmDeactivateOpen, setIsConfirmDeactivateOpen] = useState(false)
  const [phoneToDeactivate, setPhoneToDeactivate] = useState<{
    id: string
    displayName: string
  } | null>(null)

  const {
    data: availablePhoneNumbers = [],
    isLoading,
    refetch: refetchAvailable,
  } = api.projectPhoneNumber.getAvailableForProject.useQuery(
    { projectId: projectId as string },
    { enabled: !!projectId && isModalOpen }
  )

  const {
    data: allAssignedPhoneNumbers = [],
    isLoading: isLoadingAssigned,
    refetch: refetchAssigned,
  } = api.projectPhoneNumber.getByProject.useQuery(
    { projectId: projectId as string },
    { enabled: !!projectId }
  )

  const { data: affectedAgents = [], refetch: refetchAffectedAgents } =
    api.projectPhoneNumber.getAffectedAgents.useQuery(
      {
        projectId: projectId as string,
        phoneNumberId: phoneToDeactivate?.id || '',
      },
      {
        enabled:
          !!projectId && !!phoneToDeactivate?.id && isConfirmDeactivateOpen,
      }
    )

  const assignedPhoneNumbers = allAssignedPhoneNumbers.filter(
    (assignment) => assignment.isActiveInProject
  )

  const assignPhoneNumbersMutation =
    api.projectPhoneNumber.assignToProject.useMutation({
      onSuccess: () => {
        toast.success('Phone numbers assigned successfully!')
        setIsModalOpen(false)
        setSelectedPhoneIds(new Set())
        refetchAvailable()
        refetchAssigned()
      },
      onError: (error) => {
        toast.error(error.message || 'Error assigning phone numbers')
      },
    })

  const toggleActiveMutation =
    api.projectPhoneNumber.toggleActiveInProject.useMutation({
      onSuccess: (data) => {
        const message =
          data.deactivatedTriggersCount > 0
            ? `Phone number deactivated. ${data.deactivatedTriggersCount} trigger(s) also deactivated.`
            : 'Phone number status updated!'
        toast.success(message)
        setIsConfirmDeactivateOpen(false)
        setPhoneToDeactivate(null)
        refetchAvailable()
        refetchAssigned()
      },
      onError: (error) => {
        toast.error(error.message || 'Error updating phone number')
      },
    })

  useEffect(() => {
    if (availablePhoneNumbers.length > 0) {
      const activeAssignedIds = availablePhoneNumbers
        .filter(
          (phone) =>
            phone.projectAssignments.length > 0 &&
            phone.projectAssignments[0].isActiveInProject
        )
        .map((phone) => phone.id)
      setSelectedPhoneIds(new Set(activeAssignedIds))
    }
  }, [availablePhoneNumbers])

  const handleTogglePhone = (phoneId: string, displayName: string) => {
    const phone = availablePhoneNumbers.find((p) => p.id === phoneId)
    const isCurrentlyActive =
      (phone?.projectAssignments?.length ?? 0) > 0 &&
      phone?.projectAssignments?.[0]?.isActiveInProject === true
    const isChecked = selectedPhoneIds.has(phoneId)

    if (isChecked && isCurrentlyActive) {
      setIsModalOpen(false)
      setPhoneToDeactivate({ id: phoneId, displayName })
      setIsConfirmDeactivateOpen(true)
      return
    }

    setSelectedPhoneIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(phoneId)) {
        newSet.delete(phoneId)
      } else {
        newSet.add(phoneId)
      }
      return newSet
    })
  }

  const handleSave = async () => {
    if (!projectId) return

    const previouslyAssigned = availablePhoneNumbers.filter(
      (phone) => phone.projectAssignments.length > 0
    )

    for (const phone of previouslyAssigned) {
      const wasActive = phone.projectAssignments[0].isActiveInProject
      const shouldBeActive = selectedPhoneIds.has(phone.id)

      if (wasActive !== shouldBeActive) {
        await toggleActiveMutation.mutateAsync({
          projectId: projectId as string,
          phoneNumberId: phone.id,
          isActive: shouldBeActive,
        })
      }
    }

    const newAssignments = Array.from(selectedPhoneIds).filter((id) => {
      const phone = availablePhoneNumbers.find((p) => p.id === id)
      return !phone?.projectAssignments.length
    })

    if (newAssignments.length > 0) {
      const allActiveIds = Array.from(selectedPhoneIds)
      await assignPhoneNumbersMutation.mutateAsync({
        projectId: projectId as string,
        phoneNumberIds: allActiveIds,
      })
    }

    toast.success('Phone numbers updated successfully!')
    setIsModalOpen(false)
    refetchAvailable()
    refetchAssigned()
  }

  const handleRemovePhone = (
    e: React.MouseEvent,
    phoneNumberId: string,
    displayName: string
  ) => {
    e.stopPropagation()
    if (!projectId) return

    setPhoneToDeactivate({ id: phoneNumberId, displayName })
    setIsConfirmDeactivateOpen(true)
  }

  const confirmDeactivate = () => {
    if (!projectId || !phoneToDeactivate) return

    setSelectedPhoneIds((prev) => {
      const newSet = new Set(prev)
      newSet.delete(phoneToDeactivate.id)
      return newSet
    })

    toggleActiveMutation.mutate({
      projectId: projectId as string,
      phoneNumberId: phoneToDeactivate.id,
      isActive: false,
    })
  }

  if (!currentProject) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="text-center text-gray-500 dark:text-dark-500">
            <p>No project selected. Please select a project first.</p>
            <p className="mt-2 text-sm">
              Go to{' '}
              <a
                href="/apps/projects/grid"
                className="text-primary-500 hover:underline">
                Projects
              </a>{' '}
              to select a project.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-body">
        <div className="flex items-center justify-between mb-6">
          <h5 className="card-title">Integrations</h5>
        </div>

        {isLoadingAssigned ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
          </div>
        ) : assignedPhoneNumbers.length === 0 ? (
          <div className="text-center flex items-center justify-center">
            <div
              className={`items-center justify-center rounded-lg max-w-sm btn btn-outline items-center relative mx-auto mb-4 transition-opacity duration-200 ${
                hovered ? 'opacity-100' : 'opacity-100'
              }`}>
              <button
                onClick={() => setIsModalOpen(true)}
                onMouseEnter={() => setHovered(true)}
                className="flex flex-col items-center justify-center gap-2"
                onMouseLeave={() => setHovered(false)}>
                <div className="relative p-4">
                  <div className="flex items-center justify-center mb-2">
                    <Phone size={64} className="text-blue-500" />
                    <div
                      className={`overlay absolute inset-0 flex items-center justify-center transition-opacity duration-200 rounded-lg ${
                        hovered ? ' opacity-10 bg-black' : 'opacity-0'
                      }`}
                      style={{ pointerEvents: 'none' }}>
                      <Plus className="text-white font-bold" size={60} />
                    </div>
                  </div>
                  <h6 className="text-gray-600">Phone integrations</h6>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                {assignedPhoneNumbers.length} phone number(s) assigned to this
                project
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn btn-gray flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Manage Phone Numbers
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 card card-body place-content-center place-items-center">
              {assignedPhoneNumbers.map((assignment) => (
                <div
                  key={assignment.id}
                  className="p-3 border rounded-md border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 group relative cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 w-54"
                  onClick={() => setIsModalOpen(true)}>
                  {/* Remove button - only visible on hover */}
                  <button
                    onClick={(e) =>
                      handleRemovePhone(
                        e,
                        assignment.phoneNumber.id,
                        `${assignment.phoneNumber.countryCode} ${assignment.phoneNumber.phoneNumber}`
                      )
                    }
                    disabled={toggleActiveMutation.isPending}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-400 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed bg-white rounded-full p-1"
                    title="Deactivate from project">
                    <X className="w-4 h-4" />
                  </button>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {assignment.phoneNumber.provider}
                      </span>
                      <span
                        className={`inline-flex items-center mr-6 px-2 py-0.5 rounded-full text-xs font-medium ${
                          assignment.isActiveInProject
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                        {assignment.isActiveInProject ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <h5 className="font-normal text-sm truncate">
                      {assignment.phoneNumber.countryCode}{' '}
                      {assignment.phoneNumber.phoneNumber}
                    </h5>
                    <p className="text-[11px] text-gray-400">
                      {assignment.phoneNumber.friendlyName ||
                        'No friendly name'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Deactivation */}
      <Modal
        isOpen={isConfirmDeactivateOpen}
        onClose={() => {
          setIsConfirmDeactivateOpen(false)
          setPhoneToDeactivate(null)
        }}
        title="⚠️ Deactivate Phone Number"
        size="modal-md"
        position="modal-center"
        footerClass="flex justify-end"
        content={() => (
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              You are about to deactivate:{' '}
              <strong>{phoneToDeactivate?.displayName}</strong>
            </p>

            {affectedAgents.length > 0 ? (
              <>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                    This will affect {affectedAgents.length} agent trigger(s):
                  </p>
                  <ul className="space-y-2 text-sm text-yellow-700 dark:text-yellow-300">
                    {affectedAgents.map((agent, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200">
                          {agent.triggerType}
                        </span>
                        <span>
                          {agent.agentName || 'Unnamed Agent'} (
                          {agent.agentType})
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  These triggers will be automatically deactivated. You can
                  reactivate them later if needed.
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This phone number is not being used by any agents.
              </p>
            )}
          </div>
        )}
        footer={() => (
          <div className="space-x-3">
            <button
              type="button"
              onClick={() => {
                setIsConfirmDeactivateOpen(false)
                setPhoneToDeactivate(null)
              }}
              disabled={toggleActiveMutation.isPending}
              className="btn btn-outline-gray">
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDeactivate}
              disabled={toggleActiveMutation.isPending}
              className="btn btn-red">
              {toggleActiveMutation.isPending
                ? 'Deactivating...'
                : affectedAgents.length > 0
                  ? `Deactivate & Disable ${affectedAgents.length} Trigger(s)`
                  : 'Deactivate'}
            </button>
          </div>
        )}
      />

      {/* Phone Numbers Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)

          const activeAssignedIds = availablePhoneNumbers
            .filter(
              (phone) =>
                phone.projectAssignments.length > 0 &&
                phone.projectAssignments[0].isActiveInProject
            )
            .map((phone) => phone.id)
          setSelectedPhoneIds(new Set(activeAssignedIds))
        }}
        title="Assign Phone Numbers to Project"
        size="modal-md"
        position="modal-center"
        footerClass="flex justify-end"
        content={() => (
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
              </div>
            ) : availablePhoneNumbers.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <p>
                  No phone numbers available. Please create phone numbers first
                  in the Phone Numbers page.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {availablePhoneNumbers.map((phone) => {
                  const displayName = `${phone.countryCode} ${phone.phoneNumber}`
                  return (
                    <div
                      key={phone.id}
                      className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleTogglePhone(phone.id, displayName)}>
                      <input
                        type="checkbox"
                        checked={selectedPhoneIds.has(phone.id)}
                        onChange={(e) => {
                          e.stopPropagation()
                          handleTogglePhone(phone.id, displayName)
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {displayName}
                            </p>
                            {phone.friendlyName && (
                              <p className="text-xs text-gray-500">
                                {phone.friendlyName}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {phone.provider}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
        footer={() => (
          <div className="space-x-3">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false)

                const activeAssignedIds = availablePhoneNumbers
                  .filter(
                    (phone) =>
                      phone.projectAssignments.length > 0 &&
                      phone.projectAssignments[0].isActiveInProject
                  )
                  .map((phone) => phone.id)
                setSelectedPhoneIds(new Set(activeAssignedIds))
              }}
              disabled={
                assignPhoneNumbersMutation.isPending ||
                toggleActiveMutation.isPending
              }
              className="btn btn-outline-gray">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={
                assignPhoneNumbersMutation.isPending ||
                toggleActiveMutation.isPending ||
                availablePhoneNumbers.length === 0
              }
              className="btn btn-primary">
              {assignPhoneNumbersMutation.isPending ||
              toggleActiveMutation.isPending
                ? 'Saving...'
                : `Assign ${selectedPhoneIds.size} Phone Number(s)`}
            </button>
          </div>
        )}
      />
    </div>
  )
}

export default IntegrationPage
