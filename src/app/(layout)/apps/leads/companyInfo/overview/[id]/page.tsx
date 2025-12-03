'use client'

import React, { Suspense } from 'react'
import { useParams } from 'next/navigation'
import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import { RootState } from '@src/slices/reducer'
import { api } from '@src/trpc/react'
import { Building2, CalendarCheck, Target, Briefcase } from 'lucide-react'
import { useSelector } from 'react-redux'

const CompanyOverviewContent = () => {
    const params = useParams()
    const companyId = params?.id as string
    const { currentProject } = useSelector((state: RootState) => state.Project)

    const {
        data: company,
        isLoading,
    } = api.projectLeadsCompany.getById.useQuery(
        { id: companyId || '' },
        { enabled: !!companyId }
    )

    if (!currentProject) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-gray-500">Please select a project first</p>
            </div>
        )
    }

    if (!companyId) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-gray-500">No company selected</p>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-gray-500">Loading company data...</p>
            </div>
        )
    }

    if (!company) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-gray-500">Company not found</p>
            </div>
        )
    }

    return (
        <React.Fragment>
            <BreadCrumb title="Overview" subTitle="Company Lead Details" />
            <div className="col-span-12 xl:col-span-8 2xl:col-span-9 xl:row-span-3">
                {/* Basic Company Information - Always Visible */}
                <div className="card">
                    <div className="card-body">
                        <div className="relative gap-4 mb-5 md:flex">
                            {/* Company Logo/Icon */}
                            <div className="flex items-center justify-center rounded-md size-26 shrink-0 bg-gradient-to-br from-purple-500 to-purple-600">
                                <Building2 className="w-16 h-16 text-white" />
                            </div>

                            <div className="mt-5 grow md:mt-0">
                                <h6 className="mb-2">{company.companyName}</h6>
                                <div className="flex flex-wrap gap-3 mb-2 whitespace-nowrap item-center">
                                    {company.createdAt && (
                                        <p className="text-gray-500 dark:text-dark-500">
                                            <CalendarCheck className="inline-block size-4 fill-gray-100 dark:fill-dark-850 mr-1" />
                                            <span className="align-bottom">
                                                {new Date(company.createdAt).toLocaleDateString()}
                                            </span>
                                        </p>
                                    )}
                                </div>
                                <p className="mb-3 text-gray-500 dark:text-dark-500">
                                    {company.shortDescription}
                                </p>
                                <div className="flex gap-2 item-center">
                                    <span
                                        className={`badge ${company.status === 'COMPLETED'
                                            ? 'badge-sub-green'
                                            : company.status === 'FAILED'
                                                ? 'badge-sub-red'
                                                : 'badge-sub-yellow'
                                            }`}>
                                        {company.status === 'COMPLETED'
                                            ? 'Completed'
                                            : company.status === 'FAILED'
                                                ? 'Failed'
                                                : 'Processing'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-5 flex-wrap">
                            {/* Company Details */}
                            <div className="flex flex-wrap gap-y-5">
                                <div className="w-full md:w-1/2 flex-shrink-0 pr-4">
                                    <p className="mb-2 text-gray-500 dark:text-dark-500">
                                        <Briefcase className="inline-block size-4 mr-1" />
                                        Main Services
                                    </p>
                                    <div className="p-3 bg-gray-50 dark:bg-dark-850 rounded-lg">
                                        <p className="whitespace-pre-wrap">{company.mainServices}</p>
                                    </div>
                                </div>
                                <div className="w-full md:w-1/2 flex-shrink-0">
                                    <p className="mb-2 text-gray-500 dark:text-dark-500">
                                        <Target className="inline-block size-4 mr-1" />
                                        Target Audience
                                    </p>
                                    <div className="p-3 bg-gray-50 dark:bg-dark-850 rounded-lg">
                                        <p className="whitespace-pre-wrap">{company.targetAudience}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Analysis Section - Only show when status is COMPLETED and analysis exists */}
                {company.status === 'COMPLETED' && company.analysis && (
                    <>
                        {/* Contact Profile */}
                        <div className="card">
                            <div className="card-body space-y-4">
                                <h5 className="text-lg font-semibold">Contact Profile</h5>

                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-dark-500">Full Name</p>
                                        <p className="font-medium">{company.analysis.fullName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-dark-500">Job Position</p>
                                        <p className="font-medium">{company.analysis.jobPosition}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-dark-500">Seniority Level</p>
                                        <span className="badge badge-secondary">{company.analysis.seniorityLevel}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-dark-500">Role Type</p>
                                        <span className="badge badge-info">{company.analysis.roleType}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-dark-500">Decision Power</p>
                                        <span className={`badge ${company.analysis.decisionPower === 'HIGH' ? 'badge-success' :
                                            company.analysis.decisionPower === 'MEDIUM' ? 'badge-warning' : 'badge-secondary'
                                            }`}>
                                            {company.analysis.decisionPower}
                                        </span>
                                    </div>
                                    {company.analysis.age && (
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-dark-500">Age</p>
                                            <p className="font-medium">{company.analysis.age}</p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-dark-500">Email</p>
                                        <p className="font-medium text-sm">{company.analysis.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-dark-500">Email Type</p>
                                        <span className={`badge ${company.analysis.isEmailCorporate ? 'badge-success' : 'badge-secondary'
                                            }`}>
                                            {company.analysis.emailType}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-dark-500">Location</p>
                                        <p className="font-medium">{company.analysis.location}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-dark-500">Company</p>
                                        <p className="font-medium">{company.analysis.companyNameContact}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-dark-500">Industry</p>
                                        <p className="font-medium">{company.analysis.industryInferred}</p>
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
                                        {company.analysis.shortSummary}
                                    </p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    {/* Detected Needs */}
                                    <div>
                                        <h6 className="mb-2 font-medium">Detected Needs</h6>
                                        <ul className="space-y-1">
                                            {company.analysis.detectedNeeds.map((need, idx) => (
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
                                            {company.analysis.matchedServices.map((service, idx) => (
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
                                            {company.analysis.fitScore}
                                        </span>
                                        <span className={`badge badge-lg ${company.analysis.fitGrade === 'A' ? 'badge-success' :
                                            company.analysis.fitGrade === 'B' ? 'badge-primary' : 'badge-secondary'
                                            }`}>
                                            Grade {company.analysis.fitGrade}
                                        </span>
                                    </div>

                                    <div className="w-full h-3 bg-gray-200 rounded-full">
                                        <div
                                            className="h-3 rounded-full bg-purple-600"
                                            style={{ width: `${company.analysis.fitScore}%` }}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`size-3 rounded-full ${company.analysis.industryMatch ? 'bg-green-500' : 'bg-gray-300'
                                                }`} />
                                            <span className="text-sm">Industry Match</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`size-3 rounded-full ${company.analysis.companySizeMatch ? 'bg-green-500' : 'bg-gray-300'
                                                }`} />
                                            <span className="text-sm">Company Size Match</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`size-3 rounded-full ${company.analysis.geoMatch ? 'bg-green-500' : 'bg-gray-300'
                                                }`} />
                                            <span className="text-sm">Geographic Match</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`size-3 rounded-full ${company.analysis.isIdealCustomerProfile ? 'bg-green-500' : 'bg-gray-300'
                                                }`} />
                                            <span className="text-sm">Ideal Customer Profile</span>
                                        </div>
                                    </div>

                                    <div className="mt-3">
                                        <p className="text-sm font-medium mb-2">Reasons:</p>
                                        <ul className="space-y-1">
                                            {company.analysis.fitReasons.map((reason, idx) => (
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
                                            {company.analysis.urgencyScore}
                                        </span>
                                        <span className={`badge badge-lg ${company.analysis.urgencyLevel === 'CRITICAL' ? 'badge-danger' :
                                            company.analysis.urgencyLevel === 'HIGH' ? 'badge-warning' : 'badge-secondary'
                                            }`}>
                                            {company.analysis.urgencyLevel}
                                        </span>
                                    </div>

                                    <div className="w-full h-3 bg-gray-200 rounded-full">
                                        <div
                                            className={`h-3 rounded-full ${company.analysis.urgencyScore >= 80 ? 'bg-red-600' :
                                                company.analysis.urgencyScore >= 60 ? 'bg-orange-500' : 'bg-yellow-500'
                                                }`}
                                            style={{ width: `${company.analysis.urgencyScore}%` }}
                                        />
                                    </div>

                                    <div className="mt-3">
                                        <p className="text-sm font-medium mb-2">Urgency Signals:</p>
                                        <ul className="space-y-1">
                                            {company.analysis.urgencySignals.map((signal, idx) => (
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
                                            <span className={`badge ${company.analysis.dealSizePotential === 'HIGH' ? 'badge-success' :
                                                company.analysis.dealSizePotential === 'MEDIUM' ? 'badge-warning' : 'badge-secondary'
                                                }`}>
                                                {company.analysis.dealSizePotential}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-dark-500">Complexity</p>
                                            <span className="badge badge-info">{company.analysis.complexity}</span>
                                        </div>
                                    </div>

                                    {company.analysis.riskFlags.length > 0 && (
                                        <div>
                                            <p className="text-sm font-medium mb-2">Risk Flags:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {company.analysis.riskFlags.map((flag, idx) => (
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
                                            {company.analysis.dataQualityScore}
                                        </span>
                                        <span className={`badge badge-lg ${company.analysis.dataQualityLevel === 'EXCELLENT' || company.analysis.dataQualityLevel === 'GOOD'
                                            ? 'badge-success' : 'badge-warning'
                                            }`}>
                                            {company.analysis.dataQualityLevel}
                                        </span>
                                    </div>

                                    <div className="w-full h-3 bg-gray-200 rounded-full">
                                        <div
                                            className="h-3 rounded-full bg-green-600"
                                            style={{ width: `${company.analysis.dataQualityScore}%` }}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-dark-500">Completeness</p>
                                            <span className="badge badge-secondary">{company.analysis.fieldsCompleteness}</span>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-dark-500">Corporate Email</p>
                                            <span className={`badge ${company.analysis.isEmailCorporate ? 'badge-success' : 'badge-warning'
                                                }`}>
                                                {company.analysis.isEmailCorporate ? 'Yes' : 'No'}
                                            </span>
                                        </div>
                                    </div>

                                    {company.analysis.dataIssues.length > 0 && (
                                        <div>
                                            <p className="text-sm font-medium mb-2">Issues:</p>
                                            <ul className="space-y-1">
                                                {company.analysis.dataIssues.map((issue, idx) => (
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

                        {/* Classification & Recommended Actions */}
                        <div className="card">
                            <div className="card-body space-y-4">
                                <h5 className="text-lg font-semibold">Classification & Next Steps</h5>

                                <div className="grid md:grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-dark-500">Stage</p>
                                        <span className="badge badge-primary">{company.analysis.stage}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-dark-500">Priority</p>
                                        <span className={`badge ${company.analysis.priority === 'P1' ? 'badge-danger' :
                                            company.analysis.priority === 'P2' ? 'badge-warning' : 'badge-secondary'
                                            }`}>
                                            {company.analysis.priority}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-dark-500">Recommended Owner</p>
                                        <p className="font-medium">{company.analysis.recommendedOwner}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-dark-500">SLA Response Time</p>
                                        <p className="font-medium">{company.analysis.slaResponseMinutes} min</p>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <h6 className="mb-3 font-medium">Recommended Actions</h6>
                                    <div className="space-y-2">
                                        {company.analysis.recommendedActions.map((action, idx) => (
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
            </div>
        </React.Fragment>
    )
}

const CompanyOverviewPage: NextPageWithLayout = () => {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center h-screen">
                    <p className="text-gray-500">Loading...</p>
                </div>
            }>
            <CompanyOverviewContent />
        </Suspense>
    )
}

export default CompanyOverviewPage
