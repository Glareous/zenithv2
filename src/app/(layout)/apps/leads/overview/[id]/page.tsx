'use client'

import React, { useState } from 'react'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

import BreadCrumb from '@src/components/common/BreadCrumb'
import DeleteModal from '@src/components/common/DeleteModal'
import { api } from '@src/trpc/react'
import { ArrowLeft, RefreshCw, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'

interface LeadOverviewPageProps {
  params: Promise<{ id: string }>
}

const LeadOverviewPage = ({ params }: LeadOverviewPageProps) => {
  const { id } = React.use(params)
  const router = useRouter()
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const {
    data: lead,
    isLoading,
    refetch,
  } = api.projectLead.getById.useQuery({ id }, { enabled: !!id })

  const deleteMutation = api.projectLead.delete.useMutation()

  const handleDelete = async () => {
    if (!lead) return

    try {
      await deleteMutation.mutateAsync({ id: lead.id, projectId: lead.projectId })
      toast.success('Lead deleted successfully')
      setShowDeleteModal(false)
      router.push('/apps/leads/list')
    } catch (error) {
      console.error('Lead deletion error:', error)
      toast.error('Failed to delete lead')
    }
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'FAILED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getGenderText = (gender: string | null) => {
    switch (gender) {
      case 'MALE':
        return 'Male'
      case 'FEMALE':
        return 'Female'
      case 'OTHER':
        return 'Other'
      default:
        return 'Not specified'
    }
  }

  const DEFAULT_AVATAR = '/assets/images/user-avatar.jpg'

  const getFirstImage = () => {
    if (!lead) return DEFAULT_AVATAR

    const profileImage = lead.files?.find(
      (file) => file.fileType === 'IMAGE'
    )?.s3Url

    if (profileImage && !profileImage.includes('undefined')) {
      return profileImage
    }

    return DEFAULT_AVATAR
  }

  if (isLoading) {
    return (
      <div className="container-fluid group-data-[content=boxed]:max-w-boxed mx-auto">
        <div className="flex items-center justify-center h-96">
          <div className="text-lg text-gray-500">Loading...</div>
        </div>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="container-fluid group-data-[content=boxed]:max-w-boxed mx-auto">
        <div className="flex items-center justify-center h-96">
          <div className="text-lg text-red-500">Lead not found</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid group-data-[content=boxed]:max-w-boxed mx-auto">
      <BreadCrumb title="Lead Overview" subTitle="CRM" />

      <div className="card">
        <div className="card-body">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.push('/apps/leads/list')}
              className="btn btn-outline-primary">
              <ArrowLeft className="inline-block size-4 mr-1" />
              Back to List
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => refetch()}
                className="btn btn-outline-primary hidden">
                <RefreshCw className="inline-block size-4 mr-1" />
                Refresh
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="btn btn-red">
                <Trash2 className="inline-block size-4 mr-1" />
                Delete
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Profile Section */}
            <div className="flex items-center gap-4">
              <Image
                src={getFirstImage()}
                alt="Lead Profile"
                width={96}
                height={96}
                className="rounded-full object-cover size-24"
              />
              <div>
                <h5 className="text-xl font-semibold">{lead.name}</h5>
                <p className="text-sm text-gray-500">
                  {lead.companyName || 'No company'}
                </p>
              </div>
            </div>

            {/* Lead Details */}
            <div>
              <h6 className="text-15 font-semibold mb-4">Lead Information</h6>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">ID</p>
                  <p className="text-sm font-medium font-mono">
                    {lead.id.slice(-12)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="text-sm font-medium">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(
                        lead.status
                      )}`}>
                      {lead.status === 'PROCESSING'
                        ? 'Processing'
                        : lead.status === 'COMPLETED'
                          ? 'Completed'
                          : lead.status === 'FAILED'
                            ? 'Failed'
                            : lead.status}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-sm font-medium">{lead.email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="text-sm font-medium">{lead.phoneNumber || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Company</p>
                  <p className="text-sm font-medium">{lead.companyName || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="text-sm font-medium">{lead.location || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="text-sm font-medium">{getGenderText(lead.gender)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p className="text-sm font-medium">
                    {new Date(lead.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Updated At</p>
                  <p className="text-sm font-medium">
                    {new Date(lead.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            {lead.description && (
              <div>
                <h6 className="text-15 font-semibold mb-4">Description</h6>
                <p className="text-sm text-gray-700">{lead.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {lead.status === 'FAILED' && (
        <div className="card card-body">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex-shrink-0">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h6 className="text-15 font-semibold text-red-800 mb-1">
                  Lead Processing Failed
                </h6>
                <p className="text-sm text-red-700">
                  The lead processing encountered an error and could not be
                  completed. Please verify the lead data and try again, or
                  contact support if the issue persists.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {lead.status === 'COMPLETED' && (
        <div className="card card-body">
          <div className="space-y-4">
            <h6 className="text-15 font-semibold">Summary</h6>
            {lead.summary ? (
              <p className="text-sm text-gray-700">{lead.summary}</p>
            ) : (
              <p className="text-sm text-gray-500 italic">
                No summary available yet.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Delete Lead Modal */}
      <DeleteModal
        show={showDeleteModal}
        handleHide={() => setShowDeleteModal(false)}
        deleteModalFunction={handleDelete}
        title="Delete Lead"
        message="Are you sure you want to delete this lead? This action cannot be undone."
        confirmText="Delete Lead"
        cancelText="Cancel"
        type="delete"
      />
    </div>
  )
}

export default LeadOverviewPage
