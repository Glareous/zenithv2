'use client'

import React, { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import { RootState } from '@src/slices/reducer'
import { api } from '@src/trpc/react'
import { Save, RotateCcw } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { z } from 'zod'

const companySchema = z.object({
    companyName: z.string().min(1, 'Company name is required').max(200),
    shortDescription: z.string().min(1, 'Short description is required').max(500),
    mainServices: z.string().min(1, 'Main services is required'),
    targetAudience: z.string().min(1, 'Target audience is required'),
})

type CompanyFormData = z.infer<typeof companySchema>

const CompanyFormPage: NextPageWithLayout = () => {
    const { currentProject } = useSelector((state: RootState) => state.Project)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<CompanyFormData>({
        resolver: zodResolver(companySchema),
        defaultValues: {
            companyName: '',
            shortDescription: '',
            mainServices: '',
            targetAudience: '',
        },
    })

    // Fetch existing company (if any) - using getByProjectId procedure
    const {
        data: existingCompany,
        isLoading,
        refetch,
    } = api.projectLeadsCompany.getByProjectId.useQuery(
        { projectId: currentProject?.id || '' },
        { enabled: !!currentProject?.id }
    )

    // Use upsert mutation
    const upsertMutation = api.projectLeadsCompany.upsert.useMutation({
        onSuccess: () => {
            toast.success(existingCompany ? 'Company updated successfully' : 'Company created successfully')
            refetch()
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to save company')
        },
    })

    // Pre-fill form when company data loads
    useEffect(() => {
        if (existingCompany) {
            reset({
                companyName: existingCompany.companyName,
                shortDescription: existingCompany.shortDescription,
                mainServices: existingCompany.mainServices,
                targetAudience: existingCompany.targetAudience,
            })
        }
    }, [existingCompany, reset])

    const onSubmit = async (data: CompanyFormData) => {
        if (!currentProject?.id) {
            toast.error('No project selected')
            return
        }

        await upsertMutation.mutateAsync({
            ...data,
            projectId: currentProject.id,
        })
    }

    const handleReset = () => {
        if (existingCompany) {
            reset({
                companyName: existingCompany.companyName,
                shortDescription: existingCompany.shortDescription,
                mainServices: existingCompany.mainServices,
                targetAudience: existingCompany.targetAudience,
            })
        } else {
            reset({
                companyName: '',
                shortDescription: '',
                mainServices: '',
                targetAudience: '',
            })
        }
    }

    if (!currentProject) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-gray-500">Please select a project first</p>
            </div>
        )
    }

    if (isLoading) {
        return (
            <React.Fragment>
                <BreadCrumb
                    title="Company Information"
                    subTitle="Manage your company lead information"
                />
                <div className="card">
                    <div className="card-body">
                        <div className="flex items-center justify-center py-12">
                            <p className="text-gray-500">Loading company information...</p>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        )
    }

    return (
        <React.Fragment>
            <BreadCrumb
                title="Company Information"
                subTitle="Manage your company lead information"
            />

            <div className="card">
                <div className="card-body">
                    <div className="mb-5">
                        <h6 className="text-15 font-semibold">
                            {existingCompany ? 'Edit Company Information' : 'Add Company Information'}
                        </h6>
                        <p className="text-gray-500 text-sm mt-1">
                            {existingCompany
                                ? 'Update your company lead information below.'
                                : 'Fill in your company information to help AI agents understand your business.'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid grid-cols-1 gap-4">
                            {/* Company Name */}
                            <div className="mb-4">
                                <label htmlFor="companyName" className="block mb-2 text-sm font-medium">
                                    Company Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="companyName"
                                    {...register('companyName')}
                                    className={`form-input ${errors.companyName ? 'border-red-500' : ''}`}
                                    placeholder="Enter company name"
                                />
                                {errors.companyName && (
                                    <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>
                                )}
                            </div>

                            {/* Short Description */}
                            <div className="mb-4">
                                <label htmlFor="shortDescription" className="block mb-2 text-sm font-medium">
                                    Short Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="shortDescription"
                                    {...register('shortDescription')}
                                    rows={3}
                                    className={`form-input ${errors.shortDescription ? 'border-red-500' : ''}`}
                                    placeholder="Brief description of your company"
                                />
                                {errors.shortDescription && (
                                    <p className="mt-1 text-sm text-red-600">{errors.shortDescription.message}</p>
                                )}
                            </div>

                            {/* Main Services */}
                            <div className="mb-4">
                                <label htmlFor="mainServices" className="block mb-2 text-sm font-medium">
                                    Main Services <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="mainServices"
                                    {...register('mainServices')}
                                    rows={3}
                                    className={`form-input ${errors.mainServices ? 'border-red-500' : ''}`}
                                    placeholder="Describe your main services or products"
                                />
                                {errors.mainServices && (
                                    <p className="mt-1 text-sm text-red-600">{errors.mainServices.message}</p>
                                )}
                            </div>

                            {/* Target Audience */}
                            <div className="mb-4">
                                <label htmlFor="targetAudience" className="block mb-2 text-sm font-medium">
                                    Target Audience <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="targetAudience"
                                    {...register('targetAudience')}
                                    rows={3}
                                    className={`form-input ${errors.targetAudience ? 'border-red-500' : ''}`}
                                    placeholder="Describe your target audience"
                                />
                                {errors.targetAudience && (
                                    <p className="mt-1 text-sm text-red-600">{errors.targetAudience.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isSubmitting || upsertMutation.isPending}>
                                <Save className="inline-block size-4 mr-1" />
                                {isSubmitting || upsertMutation.isPending
                                    ? 'Saving...'
                                    : existingCompany
                                        ? 'Update Company'
                                        : 'Save Company'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </React.Fragment>
    )
}

export default CompanyFormPage
