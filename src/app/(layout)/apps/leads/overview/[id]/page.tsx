'use client'

import React, { useState } from 'react'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

import BreadCrumb from '@src/components/common/BreadCrumb'
import DeleteModal from '@src/components/common/DeleteModal'
import { api } from '@src/trpc/react'
import { ArrowLeft, RefreshCw, Trash2, Building2, CalendarCheck, Target, Briefcase } from 'lucide-react'
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

      {lead.status === 'COMPLETED' && lead.analysis && (
        <>
          {/* Contact Profile */}
          <div className="card">
            <div className="card-body space-y-4">
              <h5 className="text-lg font-semibold">Contact Profile</h5>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-500">Full Name</p>
                  <p className="font-medium">{lead.analysis.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-500">Job Position</p>
                  <p className="font-medium">{lead.analysis.jobPosition}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-500">Seniority Level</p>
                  <span className="badge badge-secondary">{lead.analysis.seniorityLevel}</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-500">Role Type</p>
                  <span className="badge badge-info">{lead.analysis.roleType}</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-500">Decision Power</p>
                  <span className={`badge ${lead.analysis.decisionPower === 'HIGH' ? 'badge-success' :
                    lead.analysis.decisionPower === 'MEDIUM' ? 'badge-warning' : 'badge-secondary'
                    }`}>
                    {lead.analysis.decisionPower}
                  </span>
                </div>
                {lead.analysis.age && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-dark-500">Age</p>
                    <p className="font-medium">{lead.analysis.age}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-500">Email</p>
                  <p className="font-medium text-sm">{lead.analysis.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-500">Email Type</p>
                  <span className={`badge ${lead.analysis.isEmailCorporate ? 'badge-success' : 'badge-secondary'
                    }`}>
                    {lead.analysis.emailType}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-500">Location</p>
                  <p className="font-medium">{lead.analysis.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-500">Company</p>
                  <p className="font-medium">{lead.analysis.companyNameContact}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-500">Industry</p>
                  <p className="font-medium">{lead.analysis.industryInferred}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Lead Overview */}
          <div className="card">
            <div className="card-body space-y-4">
              <h5 className="text-lg font-semibold">Lead Overview</h5>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h6 className="mb-2 font-medium">Summary</h6>
                <p className="text-gray-700 dark:text-gray-300">
                  {lead.analysis.shortSummary}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Detected Needs */}
                <div>
                  <h6 className="mb-2 font-medium">Detected Needs</h6>
                  <ul className="space-y-1">
                    {lead.analysis.detectedNeeds.map((need: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span className="text-gray-700 dark:text-gray-300">{need}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Matched Services */}
                <div>
                  <h6 className="mb-2 font-medium">Matched Services</h6>
                  <div className="flex flex-wrap gap-2">
                    {lead.analysis.matchedServices.map((service: string, idx: number) => (
                      <span key={idx} className="badge badge-primary">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fit & Urgency Scores */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Fit Score */}
            <div className="card">
              <div className="card-body space-y-3">
                <h5 className="text-lg font-semibold">Fit Analysis</h5>

                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-purple-600">
                    {lead.analysis.fitScore}
                  </span>
                  <span className={`badge badge-lg ${lead.analysis.fitGrade === 'A' ? 'badge-success' :
                    lead.analysis.fitGrade === 'B' ? 'badge-primary' : 'badge-secondary'
                    }`}>
                    Grade {lead.analysis.fitGrade}
                  </span>
                </div>

                <div className="w-full h-3 bg-gray-200 rounded-full">
                  <div
                    className="h-3 rounded-full bg-purple-600"
                    style={{ width: `${lead.analysis.fitScore}%` }}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`size-3 rounded-full ${lead.analysis.industryMatch ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                    <span className="text-sm">Industry Match</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`size-3 rounded-full ${lead.analysis.companySizeMatch ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                    <span className="text-sm">Company Size Match</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`size-3 rounded-full ${lead.analysis.geoMatch ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                    <span className="text-sm">Geographic Match</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`size-3 rounded-full ${lead.analysis.isIdealCustomerProfile ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                    <span className="text-sm">Ideal Customer Profile</span>
                  </div>
                </div>

                <div className="mt-3">
                  <p className="text-sm font-medium mb-2">Reasons:</p>
                  <ul className="space-y-1">
                    {lead.analysis.fitReasons.map((reason: string, idx: number) => (
                      <li key={idx} className="text-sm text-gray-600 dark:text-gray-400">
                        • {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Urgency Score */}
            <div className="card">
              <div className="card-body space-y-3">
                <h5 className="text-lg font-semibold">Urgency Analysis</h5>

                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-red-600">
                    {lead.analysis.urgencyScore}
                  </span>
                  <span className={`badge badge-lg ${lead.analysis.urgencyLevel === 'CRITICAL' ? 'badge-danger' :
                    lead.analysis.urgencyLevel === 'HIGH' ? 'badge-warning' : 'badge-secondary'
                    }`}>
                    {lead.analysis.urgencyLevel}
                  </span>
                </div>

                <div className="w-full h-3 bg-gray-200 rounded-full">
                  <div
                    className={`h-3 rounded-full ${lead.analysis.urgencyScore >= 80 ? 'bg-red-600' :
                      lead.analysis.urgencyScore >= 60 ? 'bg-orange-500' : 'bg-yellow-500'
                      }`}
                    style={{ width: `${lead.analysis.urgencyScore}%` }}
                  />
                </div>

                <div className="mt-3">
                  <p className="text-sm font-medium mb-2">Urgency Signals:</p>
                  <ul className="space-y-1">
                    {lead.analysis.urgencySignals.map((signal: string, idx: number) => (
                      <li key={idx} className="text-sm text-gray-600 dark:text-gray-400">
                        • {signal}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Opportunity & Data Quality */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Opportunity */}
            <div className="card">
              <div className="card-body space-y-3">
                <h5 className="text-lg font-semibold">Opportunity</h5>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-dark-500">Deal Size Potential</p>
                    <span className={`badge ${lead.analysis.dealSizePotential === 'HIGH' ? 'badge-success' :
                      lead.analysis.dealSizePotential === 'MEDIUM' ? 'badge-warning' : 'badge-secondary'
                      }`}>
                      {lead.analysis.dealSizePotential}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-dark-500">Complexity</p>
                    <span className="badge badge-info">{lead.analysis.complexity}</span>
                  </div>
                </div>

                {lead.analysis.riskFlags.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Risk Flags:</p>
                    <div className="flex flex-wrap gap-1">
                      {lead.analysis.riskFlags.map((flag: string, idx: number) => (
                        <span key={idx} className="badge badge-danger badge-sm">
                          {flag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Data Quality */}
            <div className="card">
              <div className="card-body space-y-3">
                <h5 className="text-lg font-semibold">Data Quality</h5>

                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-green-600">
                    {lead.analysis.dataQualityScore}
                  </span>
                  <span className={`badge badge-lg ${lead.analysis.dataQualityLevel === 'EXCELLENT' || lead.analysis.dataQualityLevel === 'GOOD'
                    ? 'badge-success' : 'badge-warning'
                    }`}>
                    {lead.analysis.dataQualityLevel}
                  </span>
                </div>

                <div className="w-full h-3 bg-gray-200 rounded-full">
                  <div
                    className="h-3 rounded-full bg-green-600"
                    style={{ width: `${lead.analysis.dataQualityScore}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-dark-500">Completeness</p>
                    <span className="badge badge-secondary">{lead.analysis.fieldsCompleteness}</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-dark-500">Corporate Email</p>
                    <span className={`badge ${lead.analysis.isEmailCorporate ? 'badge-success' : 'badge-warning'
                      }`}>
                      {lead.analysis.isEmailCorporate ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                {lead.analysis.dataIssues.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Issues:</p>
                    <ul className="space-y-1">
                      {lead.analysis.dataIssues.map((issue: string, idx: number) => (
                        <li key={idx} className="text-sm text-gray-600 dark:text-gray-400">
                          • {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Classification & Next Steps */}
          <div className="card">
            <div className="card-body space-y-4">
              <h5 className="text-lg font-semibold">Classification & Next Steps</h5>

              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-500">Stage</p>
                  <span className="badge badge-primary">{lead.analysis.stage}</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-500">Priority</p>
                  <span className={`badge ${lead.analysis.priority === 'P1' ? 'badge-danger' :
                    lead.analysis.priority === 'P2' ? 'badge-warning' : 'badge-secondary'
                    }`}>
                    {lead.analysis.priority}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-500">Recommended Owner</p>
                  <p className="font-medium">{lead.analysis.recommendedOwner}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-500">SLA Response Time</p>
                  <p className="font-medium">{lead.analysis.slaResponseMinutes} min</p>
                </div>
              </div>

              <div className="mt-4">
                <h6 className="mb-3 font-medium">Recommended Actions</h6>
                <div className="space-y-2">
                  {lead.analysis.recommendedActions.map((action: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-dark-850 rounded-lg">
                      <span className="flex items-center justify-center size-6 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 text-sm font-medium">
                        {idx + 1}
                      </span>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{action}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Simple summary for leads without analysis */}
      {lead.status === 'COMPLETED' && !lead.analysis && (
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
