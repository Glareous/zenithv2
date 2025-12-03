'use client'

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import { api } from '@src/trpc/react'
import { ArrowLeft, Calendar, FileText } from 'lucide-react'

const BoxClasificationOverviewPage: NextPageWithLayout = () => {
    const params = useParams()
    const router = useRouter()
    const id = params?.id as string

    const { data: box, isLoading } = api.projectBoxClasification.getById.useQuery(
        { id },
        { enabled: !!id }
    )

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    if (!box) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <p className="text-xl text-gray-600">Box clasification not found</p>
                    <button
                        onClick={() => router.push('/apps/box-clasification/list')}
                        className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    >
                        Back to List
                    </button>
                </div>
            </div>
        )
    }

    const statusColors: Record<string, string> = {
        PROCESSING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        COMPLETED: 'bg-green-100 text-green-800 border-green-200',
        FAILED: 'bg-red-100 text-red-800 border-red-200',
    }

    return (
        <>
            <BreadCrumb title="Overview" subTitle="Box Clasification Details" />

            <div className="space-y-6">
                {/* Header */}
                <div className="card">
                    <div className="card-body">
                        <div className="mb-4 flex items-center justify-between">
                            <button
                                onClick={() => router.push('/apps/box-clasification/list')}
                                className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                            >
                                <ArrowLeft className="h-5 w-5" />
                                Back to List
                            </button>
                            <span
                                className={`rounded-full border px-4 py-2 text-sm font-semibold ${statusColors[box.status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}
                            >
                                {box.status}
                            </span>
                        </div>

                        <h1 className="mb-2 text-3xl font-bold text-gray-900">{box.name}</h1>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>Created: {new Date(box.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                <span>Last updated: {new Date(box.updatedAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="card">
                    <div className="card-body">
                        <h2 className="mb-4 text-xl font-semibold text-gray-900">Description</h2>
                        <p className="whitespace-pre-wrap text-gray-700">{box.description}</p>
                    </div>
                </div>

                {/* Processed Video - Only shown when status is COMPLETED */}
                {box.status === 'COMPLETED' && box.processedVideo && (
                    <div className="card">
                        <div className="card-body">
                            <h2 className="mb-4 text-xl font-semibold text-gray-900">Processed Video</h2>
                            <div className="overflow-hidden rounded-lg bg-black">
                                <video
                                    src={box.processedVideo}
                                    controls
                                    className="w-full"
                                    style={{ maxHeight: '600px' }}
                                >
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                            <p className="mt-3 text-sm text-gray-600">
                                This video has been processed and analyzed by the system.
                            </p>
                        </div>
                    </div>
                )}

                {/* Processing Status Messages */}
                {box.status === 'PROCESSING' && (
                    <div className="card border-l-4 border-yellow-500 bg-yellow-50">
                        <div className="card-body">
                            <div className="flex items-start gap-3">
                                <div className="mt-1 h-6 w-6 animate-spin rounded-full border-4 border-yellow-600 border-t-transparent"></div>
                                <div>
                                    <h3 className="font-semibold text-yellow-900">Processing in Progress</h3>
                                    <p className="mt-1 text-sm text-yellow-800">
                                        Your video is currently being processed. The processed video will be available here once the analysis is complete.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {box.status === 'FAILED' && (
                    <div className="card border-l-4 border-red-500 bg-red-50">
                        <div className="card-body">
                            <div className="flex items-start gap-3">
                                <div className="mt-1 text-2xl text-red-600">⚠</div>
                                <div>
                                    <h3 className="font-semibold text-red-900">Processing Failed</h3>
                                    <p className="mt-1 text-sm text-red-800">
                                        There was an error processing this video. Please contact support or try uploading a different video.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Original Video - Always visible */}
                {box.video && (
                    <div className="card">
                        <div className="card-body">
                            <h2 className="mb-4 text-xl font-semibold text-gray-900">Original Video</h2>
                            <div className="overflow-hidden rounded-lg bg-black">
                                <video
                                    src={box.video}
                                    controls
                                    className="w-full"
                                    style={{ maxHeight: '600px' }}
                                >
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

BoxClasificationOverviewPage.getLayout = (page: React.ReactElement) => {
    return page
}

export default BoxClasificationOverviewPage
