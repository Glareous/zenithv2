'use client'

import React, { useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '@src/components/custom/modal/modal'
import { api } from '@src/trpc/react'
import { Globe, Plus } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { PhoneInput } from 'react-international-phone'
import 'react-international-phone/style.css'
import { toast } from 'react-toastify'
import { z } from 'zod'

const phoneInputStyles = `
  .react-international-phone-country-selector-dropdown {
    width: 250px !important;
    max-width: 250px !important;
  }
`

const phoneNumberSchema = z.object({
  provider: z
    .enum(['TWILIO', 'TELNYX', 'RINGCENTRAL', 'CUSTOM'])
    .refine((val) => val !== undefined, {
      message: 'Please select a provider',
    }),
  fullPhoneNumber: z.string().min(1, 'Phone number is required'),
  friendlyName: z.string().optional(),
  sipDomain: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  outboundProxy: z.string().optional(),
  authUsername: z.string().optional(),
  originationUri: z.string().optional(),
})

type PhoneNumberFormData = z.infer<typeof phoneNumberSchema>

const PhoneNumbersPage = () => {
  const { data: session } = useSession()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<string>('')
  const [phoneNumberValue, setPhoneNumberValue] = useState<string>('')
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)
  const [phoneToDelete, setPhoneToDelete] = useState<{
    id: string
    displayName: string
  } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<PhoneNumberFormData>({
    resolver: zodResolver(phoneNumberSchema),
  })

  const { data: isOwnerData } = api.phoneNumber.checkIsOwner.useQuery(
    { organizationId: session?.user?.defaultOrganization?.id || '' },
    { enabled: !!session?.user?.defaultOrganization?.id }
  )

  const isOwner = isOwnerData?.isOwner ?? false

  const {
    data: phoneNumbers = [],
    isLoading: isLoadingPhoneNumbers,
    refetch: refetchPhoneNumbers,
  } = api.phoneNumber.getByOrganization.useQuery(
    { organizationId: session?.user?.defaultOrganization?.id || '' },
    { enabled: !!session?.user?.defaultOrganization?.id && isOwner }
  )

  const { data: phoneUsage } = api.phoneNumber.getUsageByPhoneNumber.useQuery(
    { phoneNumberId: phoneToDelete?.id || '' },
    { enabled: !!phoneToDelete?.id && isConfirmDeleteOpen }
  )

  const createPhoneNumberMutation = api.phoneNumber.create.useMutation({
    onSuccess: () => {
      toast.success('Phone number created successfully!')
      setIsModalOpen(false)
      reset()
      setSelectedProvider('')
      setPhoneNumberValue('')
      refetchPhoneNumbers()
    },
    onError: (error) => {
      toast.error(error.message || 'Error creating phone number')
    },
  })

  const updatePhoneNumberMutation = api.phoneNumber.update.useMutation({
    onSuccess: () => {
      toast.success('Phone number updated successfully!')
      setIsModalOpen(false)
      setIsEditing(false)
      setSelectedPhoneNumber(null)
      reset()
      setSelectedProvider('')
      setPhoneNumberValue('')
      refetchPhoneNumbers()
    },
    onError: (error) => {
      toast.error(error.message || 'Error updating phone number')
    },
  })

  const deletePhoneNumberMutation = api.phoneNumber.delete.useMutation({
    onSuccess: () => {
      toast.success('Phone number deleted successfully!')
      setIsModalOpen(false)
      setIsEditing(false)
      setSelectedPhoneNumber(null)
      setIsConfirmDeleteOpen(false)
      setPhoneToDelete(null)
      reset()
      setSelectedProvider('')
      setPhoneNumberValue('')
      refetchPhoneNumbers()
    },
    onError: (error) => {
      toast.error(error.message || 'Error deleting phone number')
    },
  })

  const handleProviderSelect = (provider: string) => {
    setSelectedProvider(provider)
    setValue('provider', provider as any)
  }

  const onSubmit = async (data: PhoneNumberFormData) => {
    if (!session?.user?.defaultOrganization?.id) {
      toast.error('No organization found')
      return
    }

    if (!phoneNumberValue) {
      toast.error('Please enter a phone number')
      return
    }

    const countryCodeMatch = phoneNumberValue.match(/^\+(\d{1,3})/)
    const countryCode = countryCodeMatch ? `+${countryCodeMatch[1]}` : '+1'
    const phoneNumber = phoneNumberValue.replace(countryCode, '').trim()

    if (isEditing && selectedPhoneNumber) {
      updatePhoneNumberMutation.mutate({
        id: selectedPhoneNumber.id,
        provider: data.provider,
        phoneNumber: phoneNumber,
        countryCode: countryCode,
        friendlyName: data.friendlyName,
        sipDomain: data.sipDomain,
        username: data.username,
        password: data.password,
        outboundProxy: data.outboundProxy,
        authUsername: data.authUsername,
        originationUri: data.originationUri,
      })
    } else {
      createPhoneNumberMutation.mutate({
        organizationId: session.user.defaultOrganization.id,
        provider: data.provider,
        phoneNumber: phoneNumber,
        countryCode: countryCode,
        friendlyName: data.friendlyName,
        sipDomain: data.sipDomain,
        username: data.username,
        password: data.password,
        outboundProxy: data.outboundProxy,
        authUsername: data.authUsername,
        originationUri: data.originationUri,
      })
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setIsEditing(false)
    setSelectedPhoneNumber(null)
    reset()
    setSelectedProvider('')
    setPhoneNumberValue('')
  }

  const handleCardClick = (phoneNumber: any) => {
    setSelectedPhoneNumber(phoneNumber)
    setIsEditing(true)
    setSelectedProvider(phoneNumber.provider)
    setPhoneNumberValue(`${phoneNumber.countryCode}${phoneNumber.phoneNumber}`)

    reset({
      provider: phoneNumber.provider,
      fullPhoneNumber: `${phoneNumber.countryCode}${phoneNumber.phoneNumber}`,
      friendlyName: phoneNumber.friendlyName || '',
      sipDomain: phoneNumber.sipDomain || '',
      username: phoneNumber.username || '',
      password: phoneNumber.password || '',
      outboundProxy: phoneNumber.outboundProxy || '',
      authUsername: phoneNumber.authUsername || '',
      originationUri: phoneNumber.originationUri || '',
    })

    setIsModalOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedPhoneNumber) return
    const displayName = `${selectedPhoneNumber.countryCode} ${selectedPhoneNumber.phoneNumber}`
    setPhoneToDelete({ id: selectedPhoneNumber.id, displayName })
    setIsModalOpen(false)
    setIsConfirmDeleteOpen(true)
  }

  const confirmDelete = () => {
    if (!phoneToDelete) return
    deletePhoneNumberMutation.mutate({ id: phoneToDelete.id })
  }

  if (session && session.user?.defaultOrganization && !isOwner) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="mb-4">
            <Globe className="w-16 h-16 mx-auto text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Access Restricted
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Only organization owners can access phone numbers management.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Please contact your organization owner for access.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="m-6">
      <style>{phoneInputStyles}</style>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-md font-semibold mb-2">Phone Numbers</h3>
          <p className="text-gray-500">
            Welcome to your phone numbers management page. Your numbers will
            appear here.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-gray flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Phone Number
        </button>
      </div>

      {/* Phone Numbers Cards */}
      {isLoadingPhoneNumbers ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
        </div>
      ) : phoneNumbers.length === 0 ? (
        <div className="card card-body text-center">
          <p className="font-normal text-sm">
            No phone numbers yet <br />
            <span className="text-gray-500">
              Add a new phone number using the button above
            </span>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 card card-body place-content-center place-items-center">
          {phoneNumbers.map((phoneNumber) => (
            <div
              key={phoneNumber.id}
              className="p-3 border rounded-md border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 group relative cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 w-56"
              onClick={() => handleCardClick(phoneNumber)}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {phoneNumber.provider}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      phoneNumber.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                    {phoneNumber.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <h5 className="font-normal text-sm truncate">
                  {phoneNumber.countryCode} {phoneNumber.phoneNumber}
                </h5>
                <p className="text-[11px] text-gray-400">
                  {phoneNumber.friendlyName || 'No friendly name'}
                </p>
                <p className="text-[11px] text-gray-400">
                  Created:{' '}
                  {new Date(phoneNumber.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Phone Number Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={isEditing ? 'Edit Phone Number' : 'Create Phone Number'}
        size="modal-lg"
        position="modal-center"
        footerClass={isEditing ? 'flex justify-between' : 'flex justify-end'}
        content={(onClose) => (
          <form
            id="phone-number-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5 overflow-y-auto max-h-[480px] pr-4">
            {/* Phone Provider */}
            <div className="flex justify-between border-b border-gray-300 dark:border-gray-800 pb-5 ">
              <div>
                <label className="block text-xm font-medium">
                  Phone Provider
                </label>
                <p className="text-xs text-gray-500 mb-4 max-w-66">
                  Select the endpoint method to define how the API will interact
                  with the data.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {/* Twilio */}
                <button
                  type="button"
                  onClick={() => handleProviderSelect('TWILIO')}
                  className={`p-2 h-14 w-34 border rounded-md text-center transition-all ${
                    selectedProvider === 'TWILIO'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                  <div className="text-red-500 text-md">⊗</div>
                  <div className="text-xs text-gray-700">Twilio</div>
                </button>

                {/* Telnyx */}
                <button
                  type="button"
                  onClick={() => handleProviderSelect('TELNYX')}
                  className={`p-2 h-14 w-34 border rounded-md text-center transition-all ${
                    selectedProvider === 'TELNYX'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                  <div className="text-teal-500 text-md">▲</div>
                  <div className="text-xs text-gray-700">Telnyx</div>
                </button>

                {/* RingCentral */}
                <button
                  type="button"
                  onClick={() => handleProviderSelect('RINGCENTRAL')}
                  className={`p-2 h-14 w-34 border rounded-md text-center transition-all ${
                    selectedProvider === 'RINGCENTRAL'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                  <div className="text-orange-500 text-xs">◉◉◉</div>
                  <div className="text-xs text-gray-700">RingCentral</div>
                </button>

                {/* Custom */}
                <button
                  type="button"
                  onClick={() => handleProviderSelect('CUSTOM')}
                  className={`p-2 h-14 w-34 border rounded-md text-center transition-all ${
                    selectedProvider === 'CUSTOM'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                  <Globe className="w-4 h-4 mx-auto text-purple-500 " />
                  <div className="text-xs text-gray-700">Custom</div>
                </button>
              </div>
              {errors.provider && (
                <p className="text-red-500 text-xs translate-y-14 translate-x-4">
                  {errors.provider.message}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div className="flex justify-between border-b border-gray-300 dark:border-gray-800 pb-3">
              <div>
                <label className="block text-sm font-medium">
                  Phone Number
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  The phone number you wish to import.
                </p>
              </div>
              <PhoneInput
                defaultCountry="us"
                value={phoneNumberValue}
                onChange={(phone: string) => {
                  setPhoneNumberValue(phone)
                  setValue('fullPhoneNumber', phone)
                }}
                inputClassName="w-55"
              />
              {errors.fullPhoneNumber && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.fullPhoneNumber.message}
                </p>
              )}
            </div>

            {/* SIP Domain */}
            <div className="flex justify-between">
              <label className="block text-sm font-medium mb-2">
                SIP Domain
              </label>
              <input
                type="text"
                {...register('sipDomain')}
                placeholder="sip.provider.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-66 text-xs"
              />
            </div>

            {/* Username */}
            <div className="flex justify-between">
              <label className="block text-sm font-medium mb-2">
                Username
                <span className="text-gray-400 text-xs font-normal ml-2">
                  Optional
                </span>
              </label>
              <input
                type="text"
                {...register('username')}
                placeholder="user123"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-66 text-xs"
              />
            </div>

            {/* Password */}
            <div className="flex justify-between border-b border-gray-300 dark:border-gray-800 pb-5">
              <label className="block text-sm font-medium mb-2">
                Password
                <span className="text-gray-400 text-xs font-normal ml-2">
                  Optional
                </span>
              </label>
              <input
                type="password"
                {...register('password')}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-66 text-xs"
              />
            </div>

            {/* Outbound Proxy */}
            <div className="flex justify-between">
              <label className="block text-sm font-medium mb-2">
                Outbound Proxy
                <span className="text-gray-400 font-normal text-xs ml-2">
                  Optional
                </span>
              </label>
              <input
                type="text"
                {...register('outboundProxy')}
                placeholder="sip:proxy.provider.com:5060"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-66 text-xs"
              />
            </div>

            {/* Auth Username */}
            <div className="flex justify-between border-b border-gray-300 dark:border-gray-800 pb-5">
              <label className="block text-sm font-medium mb-2">
                Auth Username
                <span className="text-gray-400 font-normal text-xs ml-2">
                  Optional
                </span>
              </label>
              <input
                type="text"
                {...register('authUsername')}
                placeholder="auth-user123"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-66 text-xs"
              />
            </div>

            {/* Origination URI */}
            <div className="flex justify-between">
              <label className="block text-sm font-medium mb-2">
                Origination URI
              </label>
              <div className="flex gap-2 max-w-66">
                <input
                  type="text"
                  {...register('originationUri')}
                  placeholder="sip:sipin.synthflow.ai:32681"
                  className="flex-1 pl-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs pr-5"
                  readOnly
                />
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-xs">
                  Copy
                </button>
              </div>
            </div>

            {/* Friendly Name */}
            <div className="flex justify-between">
              <label className="block text-sm font-medium mb-2">
                Friendly Name
                <span className="text-gray-400 font-normal text-xs ml-2">
                  Optional
                </span>
              </label>
              <input
                type="text"
                {...register('friendlyName')}
                placeholder="My Phone Number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-66 text-xs"
              />
            </div>
          </form>
        )}
        footer={(onClose) => (
          <div
            className={`${isEditing ? 'flex justify-between w-full' : 'space-x-3'}`}>
            {isEditing && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deletePhoneNumberMutation.isPending}
                className="btn btn-outline-red">
                {deletePhoneNumberMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            )}
            <div className={isEditing ? 'space-x-3' : 'space-x-3'}>
              <button
                type="button"
                onClick={onClose}
                disabled={
                  createPhoneNumberMutation.isPending ||
                  updatePhoneNumberMutation.isPending
                }
                className="btn btn-outline-gray">
                Cancel
              </button>
              <button
                type="submit"
                form="phone-number-form"
                disabled={
                  createPhoneNumberMutation.isPending ||
                  updatePhoneNumberMutation.isPending
                }
                className="btn btn-primary">
                {isEditing
                  ? updatePhoneNumberMutation.isPending
                    ? 'Updating...'
                    : 'Update Phone Number'
                  : createPhoneNumberMutation.isPending
                    ? 'Creating...'
                    : 'Create Phone Number'}
              </button>
            </div>
          </div>
        )}
      />

      {/* Confirmation Modal for Deletion */}
      <Modal
        isOpen={isConfirmDeleteOpen}
        onClose={() => {
          setIsConfirmDeleteOpen(false)
          setPhoneToDelete(null)
        }}
        title="⚠️ Delete Phone Number"
        size="modal-md"
        position="modal-center"
        footerClass="flex justify-end"
        content={() => (
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              You are about to delete:{' '}
              <strong>{phoneToDelete?.displayName}</strong>
            </p>

            {phoneUsage && phoneUsage.totalProjects > 0 ? (
              <>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-3">
                    This phone number is being used in{' '}
                    {phoneUsage.totalProjects} project(s):
                  </p>

                  <div className="space-y-3">
                    {phoneUsage.projectsWithTriggers.map((project) => (
                      <div key={project.projectId} className="space-y-2">
                        <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
                          📁 {project.projectName}
                        </p>
                        {project.triggers.length > 0 && (
                          <div className="ml-4 space-y-1">
                            <p className="text-xs text-yellow-700 dark:text-yellow-300">
                              {project.triggers.length} active trigger(s):
                            </p>
                            <ul className="space-y-1">
                              {project.triggers.map((trigger, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-center gap-2 text-xs">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200">
                                    {trigger.triggerType}
                                  </span>
                                  <span className="text-yellow-700 dark:text-yellow-300">
                                    {trigger.agentName || 'Unnamed Agent'} (
                                    {trigger.agentType})
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                  ⚠️ Deleting this phone number will remove it from all projects
                  and deactivate all associated triggers.
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This phone number is not being used in any projects.
              </p>
            )}
          </div>
        )}
        footer={() => (
          <div className="space-x-3">
            <button
              type="button"
              onClick={() => {
                setIsConfirmDeleteOpen(false)
                setPhoneToDelete(null)
              }}
              disabled={deletePhoneNumberMutation.isPending}
              className="btn btn-outline-gray">
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              disabled={deletePhoneNumberMutation.isPending}
              className="btn btn-red">
              {deletePhoneNumberMutation.isPending
                ? 'Deleting...'
                : phoneUsage && phoneUsage.totalProjects > 0
                  ? `Delete & Remove from ${phoneUsage.totalProjects} Project(s)`
                  : 'Delete'}
            </button>
          </div>
        )}
      />
    </div>
  )
}

export default PhoneNumbersPage
