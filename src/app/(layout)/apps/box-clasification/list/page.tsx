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
import { CirclePlus, Eye, Pencil, Trash2, Upload } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { z } from 'zod'

const boxSchema = z.object({
    name: z.string().min(1, 'Name is required').max(200),
    description: z.string().min(1, 'Description is required'),
    video: z.string().optional(),
})

type BoxFormData = z.infer<typeof boxSchema>

const BoxClasificationListPage: NextPageWithLayout = () => {
    const [showModal, setShowModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedBox, setSelectedBox] = useState<any>(null)
    const [isEditMode, setIsEditMode] = useState(false)
    const [videoFile, setVideoFile] = useState<File | null>(null)
    const [videoPreview, setVideoPreview] = useState<string | null>(null)
    const [isUploadingVideo, setIsUploadingVideo] = useState(false)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<BoxFormData>({
        resolver: zodResolver(boxSchema),
        defaultValues: {
            name: '',
            description: '',
            video: '',
        },
    })

    const router = useRouter()
    const { currentProject } = useSelector((state: RootState) => state.Project)

    const {
        data: boxes = [],
        isLoading,
        refetch,
    } = api.projectBoxClasification.getByProject.useQuery(
        { projectId: currentProject?.id || '' },
        { enabled: !!currentProject?.id }
    )

    const createMutation = api.projectBoxClasification.create.useMutation({
        onSuccess: () => {
            toast.success('Box clasification created successfully')
            refetch()
            closeModal()
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to create box clasification')
        },
    })

    const updateMutation = api.projectBoxClasification.update.useMutation({
        onSuccess: () => {
            toast.success('Box clasification updated successfully')
            refetch()
            closeModal()
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to update box clasification')
        },
    })

    const deleteMutation = api.projectBoxClasification.delete.useMutation({
        onSuccess: () => {
            toast.success('Box clasification deleted successfully')
            refetch()
            setShowDeleteModal(false)
            setSelectedBox(null)
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to delete box clasification')
        },
    })

    const openCreateModal = () => {
        setIsEditMode(false)
        reset({
            name: '',
            description: '',
            video: '',
        })
        setVideoFile(null)
        setVideoPreview(null)
        setShowModal(true)
    }

    const openEditModal = (box: any) => {
        setIsEditMode(true)
        setSelectedBox(box)
        reset({
            name: box.name,
            description: box.description,
            video: box.video || '',
        })
        setVideoPreview(box.video)
        setShowModal(true)
    }

    const closeModal = () => {
        setShowModal(false)
        setIsEditMode(false)
        setSelectedBox(null)
        setVideoFile(null)
        setVideoPreview(null)
        reset()
    }

    const openDeleteModal = (box: any) => {
        setSelectedBox(box)
        setShowDeleteModal(true)
    }

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (!file.type.startsWith('video/')) {
                toast.error('Please select a valid video file')
                return
            }
            setVideoFile(file)
            const url = URL.createObjectURL(file)
            setVideoPreview(url)
        }
    }

    const uploadVideoToS3 = async (): Promise<string | null> => {
        if (!videoFile) return null

        setIsUploadingVideo(true)
        try {
            // TODO: Implement S3 upload logic here
            // For now, return a mock URL
            const mockS3Url = `https://example.com/videos/${videoFile.name}`
            return mockS3Url
        } catch (error) {
            toast.error('Failed to upload video')
            return null
        } finally {
            setIsUploadingVideo(false)
        }
    }

    const onSubmit = async (data: BoxFormData) => {
        if (!currentProject?.id) {
            toast.error('No project selected')
            return
        }

        let videoUrl = data.video

        // Upload video if a new file was selected
        if (videoFile) {
            const uploadedUrl = await uploadVideoToS3()
            if (uploadedUrl) {
                videoUrl = uploadedUrl
            }
        }

        if (isEditMode && selectedBox) {
            await updateMutation.mutateAsync({
                id: selectedBox.id,
                ...data,
                video: videoUrl,
            })
        } else {
            await createMutation.mutateAsync({
                ...data,
                video: videoUrl,
                projectId: currentProject.id,
            })
        }
    }

    const handleDelete = async () => {
        if (selectedBox) {
            await deleteMutation.mutateAsync({ id: selectedBox.id })
        }
    }

    const columns = useMemo(
        () => [
            {
                header: 'Name',
                accessorKey: 'name',
                enableColumnFilter: false,
            },
            {
                header: 'Description',
                accessorKey: 'description',
                enableColumnFilter: false,
                cell: (cell: any) => {
                    const desc = cell.getValue()
                    return desc?.length > 100 ? desc.substring(0, 100) + '...' : desc
                },
            },
            {
                header: 'Status',
                accessorKey: 'status',
                enableColumnFilter: false,
                cell: (cell: any) => {
                    const status = cell.getValue()
                    const statusColors: Record<string, string> = {
                        PROCESSING: 'bg-yellow-100 text-yellow-800',
                        COMPLETED: 'bg-green-100 text-green-800',
                        FAILED: 'bg-red-100 text-red-800',
                    }
                    return (
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
                            {status}
                        </span>
                    )
                },
            },
            {
                header: 'Created At',
                accessorKey: 'createdAt',
                enableColumnFilter: false,
                cell: (cell: any) => new Date(cell.getValue()).toLocaleDateString(),
            },
            {
                header: 'Actions',
                enableColumnFilter: false,
                enableSorting: false,
                cell: (cell: any) => {
                    const box = cell.row.original
                    return (
                        <div className="flex gap-2">
                            <button
                                onClick={() => router.push(`/apps/box-clasification/overview/${box.id}`)}
                                className="rounded p-1 text-blue-600 hover:bg-blue-50"
                                title="View"
                            >
                                <Eye className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => openEditModal(box)}
                                className="rounded p-1 text-yellow-600 hover:bg-yellow-50"
                                title="Edit"
                            >
                                <Pencil className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => openDeleteModal(box)}
                                className="rounded p-1 text-red-600 hover:bg-red-50"
                                title="Delete"
                            >
                                <Trash2 className="h-4 w-4" />
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
                title="Box Clasification Management"
                subTitle="Manage your box clasification videos"
            />

            <div className="card">
                <div className="card-body">
                    <div className="flex items-center justify-between mb-5">
                        <h6 className="text-15">Box Clasifications</h6>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={openCreateModal}>
                                <CirclePlus className="inline-block size-4 mr-1" />
                                <span className="align-middle">Add Box Clasification</span>
                            </button>
                        </div>
                    </div>

                    <TableContainer
                        isPagination={false}
                        columns={columns || []}
                        data={boxes || []}
                        customPageSize={boxes?.length || 0}
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
                id="boxModal"
                position="modal-center"
                size="modal-md"
                title={isEditMode ? 'Edit Box Clasification' : 'Add New Box Clasification'}
                content={
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid grid-cols-1 gap-4">
                            {/* Name */}
                            <div className="mb-4">
                                <label
                                    htmlFor="name"
                                    className="block mb-2 text-sm font-medium">
                                    Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    {...register('name')}
                                    className={`form-input ${errors.name ? 'border-red-500' : ''}`}
                                    placeholder="Enter name"
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>

                            {/* Description */}
                            <div className="mb-4">
                                <label
                                    htmlFor="description"
                                    className="block mb-2 text-sm font-medium">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="description"
                                    {...register('description')}
                                    rows={4}
                                    className={`form-input ${errors.description ? 'border-red-500' : ''}`}
                                    placeholder="Enter description"
                                />
                                {errors.description && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.description.message}
                                    </p>
                                )}
                            </div>

                            {/* Video Upload */}
                            <div className="mb-4">
                                <label className="block mb-2 text-sm font-medium">
                                    Video
                                </label>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <label className="btn btn-secondary cursor-pointer">
                                            <Upload className="inline-block size-4 mr-1" />
                                            <span className="align-middle">Choose Video</span>
                                            <input
                                                type="file"
                                                accept="video/*"
                                                onChange={handleVideoChange}
                                                className="hidden"
                                            />
                                        </label>
                                        {videoFile && (
                                            <span className="text-sm text-gray-600">{videoFile.name}</span>
                                        )}
                                    </div>

                                    {videoPreview && (
                                        <div className="rounded border border-gray-200 p-2">
                                            <video
                                                src={videoPreview}
                                                controls
                                                className="w-full rounded"
                                                style={{ maxHeight: '300px' }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || isUploadingVideo}
                                className="btn btn-primary"
                            >
                                {isSubmitting || isUploadingVideo
                                    ? 'Saving...'
                                    : isEditMode
                                        ? 'Update'
                                        : 'Create'}
                            </button>
                        </div>
                    </form>
                }
            />

            {/* Delete Modal */}
            <DeleteModal
                show={showDeleteModal}
                handleHide={() => setShowDeleteModal(false)}
                deleteModalFunction={handleDelete}
                title="Delete Box Clasification"
                message={
                    selectedBox
                        ? `Are you sure you want to delete "${selectedBox.name}"? This action cannot be undone.`
                        : 'Are you sure you want to delete this box clasification?'
                }
            />
        </React.Fragment>
    )
}

BoxClasificationListPage.getLayout = (page: React.ReactElement) => {
    return page
}

export default BoxClasificationListPage
