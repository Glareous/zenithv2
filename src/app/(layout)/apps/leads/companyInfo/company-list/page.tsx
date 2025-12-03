'use client'

import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import BreadCrumb from '@src/components/common/BreadCrumb'
import DeleteModal from '@src/components/common/DeleteModal'
import { Modal } from '@src/components/custom/modal/modal'
import TableContainer from '@src/components/custom/table/table'
import { NextPageWithLayout } from '@src/dtos'
import { RootState } from '@src/slices/reducer'
import { api } from '@src/trpc/react'
import { CirclePlus, Eye, Pencil, Trash2 } from 'lucide-react'
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

const CompanyListPage: NextPageWithLayout = () => {
    const [showModal, setShowModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedCompany, setSelectedCompany] = useState<any>(null)
    const [isEditMode, setIsEditMode] = useState(false)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<CompanyFormData>({
        resolver: zodResolver(companySchema),
        defaultValues: {
            companyName: '',
            shortDescription: '',
            mainServices: '',
            targetAudience: '',
        },
    })

    const router = useRouter()
    const { currentProject } = useSelector((state: RootState) => state.Project)

    const {
        data: companies = [],
        isLoading,
        refetch,
    } = api.projectLeadsCompany.getByProject.useQuery(
        { projectId: currentProject?.id || '' },
        { enabled: !!currentProject?.id }
    )

    const createMutation = api.projectLeadsCompany.create.useMutation({
        onSuccess: () => {
            toast.success('Company created successfully')
            refetch()
            closeModal()
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to create company')
        },
    })

    const updateMutation = api.projectLeadsCompany.update.useMutation({
        onSuccess: () => {
            toast.success('Company updated successfully')
            refetch()
            closeModal()
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to update company')
        },
    })

    const deleteMutation = api.projectLeadsCompany.delete.useMutation({
        onSuccess: () => {
            toast.success('Company deleted successfully')
            refetch()
            setShowDeleteModal(false)
            setSelectedCompany(null)
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to delete company')
        },
    })

    const openCreateModal = () => {
        setIsEditMode(false)
        reset({
            companyName: '',
            shortDescription: '',
            mainServices: '',
            targetAudience: '',
        })
        setShowModal(true)
    }

    const openEditModal = (company: any) => {
        setIsEditMode(true)
        setSelectedCompany(company)
        reset({
            companyName: company.companyName,
            shortDescription: company.shortDescription,
            mainServices: company.mainServices,
            targetAudience: company.targetAudience,
        })
        setShowModal(true)
    }

    const closeModal = () => {
        setShowModal(false)
        setIsEditMode(false)
        setSelectedCompany(null)
        reset()
    }

    const onSubmit = async (data: CompanyFormData) => {
        if (!currentProject?.id) {
            toast.error('No project selected')
            return
        }

        try {
            if (isEditMode && selectedCompany) {
                await updateMutation.mutateAsync({
                    id: selectedCompany.id,
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

    const handleDelete = (company: any) => {
        setSelectedCompany(company)
        setShowDeleteModal(true)
    }

    const confirmDelete = () => {
        if (selectedCompany) {
            deleteMutation.mutate({ id: selectedCompany.id })
        }
    }

    const columns = useMemo(
        () => [
            {
                header: 'Company Name',
                accessorKey: 'companyName',
            },
            {
                header: 'Short Description',
                accessorKey: 'shortDescription',
            },
            {
                header: 'Main Services',
                accessorKey: 'mainServices',
            },
            {
                header: 'Target Audience',
                accessorKey: 'targetAudience',
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
                                    router.push(`/apps/leads/companyInfo/overview/${row.original.id}`)
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
                title="Company Management"
                subTitle="Manage your lead companies information"
            />

            <div className="card">
                <div className="card-body">
                    <div className="flex items-center justify-between mb-5">
                        <h6 className="text-15">Companies</h6>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={openCreateModal}>
                                <CirclePlus className="inline-block size-4 mr-1" />
                                <span className="align-middle">Add Company</span>
                            </button>
                        </div>
                    </div>

                    <TableContainer
                        isPagination={false}
                        columns={columns || []}
                        data={companies || []}
                        customPageSize={companies?.length || 0}
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
                id="companyModal"
                position="modal-center"
                size="modal-md"
                title={isEditMode ? 'Edit Company' : 'Add New Company'}
                content={
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid grid-cols-1 gap-4">
                            {/* Company Name */}
                            <div className="mb-4">
                                <label
                                    htmlFor="companyName"
                                    className="block mb-2 text-sm font-medium">
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
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.companyName.message}
                                    </p>
                                )}
                            </div>

                            {/* Short Description */}
                            <div className="mb-4">
                                <label
                                    htmlFor="shortDescription"
                                    className="block mb-2 text-sm font-medium">
                                    Short Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="shortDescription"
                                    {...register('shortDescription')}
                                    rows={3}
                                    className={`form-input ${errors.shortDescription ? 'border-red-500' : ''}`}
                                    placeholder="Enter short description"
                                />
                                {errors.shortDescription && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.shortDescription.message}
                                    </p>
                                )}
                            </div>

                            {/* Main Services */}
                            <div className="mb-4">
                                <label
                                    htmlFor="mainServices"
                                    className="block mb-2 text-sm font-medium">
                                    Main Services <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="mainServices"
                                    {...register('mainServices')}
                                    rows={3}
                                    className={`form-input ${errors.mainServices ? 'border-red-500' : ''}`}
                                    placeholder="Enter main services"
                                />
                                {errors.mainServices && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.mainServices.message}
                                    </p>
                                )}
                            </div>

                            {/* Target Audience */}
                            <div className="mb-4">
                                <label
                                    htmlFor="targetAudience"
                                    className="block mb-2 text-sm font-medium">
                                    Target Audience <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="targetAudience"
                                    {...register('targetAudience')}
                                    rows={3}
                                    className={`form-input ${errors.targetAudience ? 'border-red-500' : ''}`}
                                    placeholder="Enter target audience"
                                />
                                {errors.targetAudience && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.targetAudience.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                type="button"
                                className="btn btn-outline-red"
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
                                        ? 'Update Company'
                                        : 'Save Company'}
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
                title="Delete Company"
                message={
                    selectedCompany
                        ? `Are you sure you want to delete "${selectedCompany.companyName}"? This action cannot be undone.`
                        : 'Are you sure you want to delete this company?'
                }
                confirmText="Delete"
                cancelText="Cancel"
                type="delete"
            />
        </React.Fragment>
    )
}

export default CompanyListPage
