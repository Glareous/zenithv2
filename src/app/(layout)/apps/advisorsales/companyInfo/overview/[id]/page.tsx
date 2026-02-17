'use client'

import React, { Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import { RootState } from '@src/slices/reducer'
import { api } from '@src/trpc/react'
import { Building2, CalendarCheck, Target, Briefcase, ArrowLeft } from 'lucide-react'
import { useSelector } from 'react-redux'

const CompanyOverviewContent = () => {
    const params = useParams()
    const router = useRouter()
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
                {/* Back Button */}
                <div className="mb-4">
                    <button
                        onClick={() => router.push('/apps/leads/companyInfo/company-list')}
                        className="btn btn-outline-primary">
                        <ArrowLeft className="inline-block size-4 mr-1" />
                        Back to Company Info
                    </button>
                </div>

                {/* Basic Company Information */}
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
