'use client'

import React, { useRef, useState } from 'react'

import { useRouter } from 'next/navigation'

import BreadCrumb from '@src/components/common/BreadCrumb'
import DeleteModal from '@src/components/common/DeleteModal'
import { Modal } from '@src/components/custom/modal/modal'
import { api } from '@src/trpc/react'
import GradientLineChart from '@src/views/Apexcharts/LineCharts/GradientLineChart'
import { ArrowLeft, Trash2, Upload } from 'lucide-react'
import { toast } from 'react-toastify'

interface ForecastingOverviewPageProps {
  params: Promise<{ id: string }>
}

const ForecastingOverviewPage = ({ params }: ForecastingOverviewPageProps) => {
  const { id } = React.use(params)
  const router = useRouter()
  const gradientLineChart = useRef(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [showFormatModal, setShowFormatModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [fileToDelete, setFileToDelete] = useState<string | null>(null)

  const {
    data: forecasting,
    isLoading,
    refetch,
  } = api.projectForecasting.getById.useQuery({ id }, { enabled: !!id })

  const getUploadUrlMutation =
    api.projectForecastingFile.getUploadUrl.useMutation()
  const createFileMutation = api.projectForecastingFile.create.useMutation()
  const deleteFileMutation = api.projectForecastingFile.delete.useMutation()

  const chartSeries = React.useMemo(() => {
    if (!forecasting?.series || forecasting.series.length === 0) {
      return []
    }

    // Sort by order field to ensure consistent colors
    const sortedSeries = [...forecasting.series].sort((a: any, b: any) => a.order - b.order)

    const processedSeries = sortedSeries.map((series: any) => ({
      name: series.name,
      data: series.values.map((v: any) => ({
        timestamp: v.timestamp,
        value: v.value,
      })),
      order: series.order,
    }))

    return processedSeries
  }, [forecasting?.series])

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleDeleteFile = async () => {
    if (!fileToDelete) return

    try {
      await deleteFileMutation.mutateAsync({ id: fileToDelete })
      toast.success('File deleted successfully')
      setShowDeleteModal(false)
      setFileToDelete(null)
      refetch()
    } catch (error) {
      console.error('File deletion error:', error)
      toast.error('Failed to delete file')
    }
  }

  const openDeleteModal = (fileId: string) => {
    setFileToDelete(fileId)
    setShowDeleteModal(true)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      toast.error('Please select a CSV file')
      return
    }

    try {
      toast.info('Uploading CSV file...')

      const uploadResult = await getUploadUrlMutation.mutateAsync({
        forecastingId: id,
        fileName: file.name,
        fileType: file.type || 'text/csv',
        fileSize: file.size,
      })

      const uploadResponse = await fetch(uploadResult.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type || 'text/csv',
        },
      })

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload ${file.name}`)
      }

      await createFileMutation.mutateAsync({
        forecastingId: id,
        name: file.name,
        fileName: uploadResult.fileName,
        fileType: 'CSV',
        mimeType: file.type || 'text/csv',
        fileSize: file.size,
        s3Key: uploadResult.s3Key,
        isPublic: false,
      })

      toast.success('CSV file uploaded and validated successfully')
      refetch()

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error: any) {
      console.error('File upload error:', error)

      if (
        error?.message === 'CSV_INVALID_FORMAT' ||
        error?.data?.message === 'CSV_INVALID_FORMAT' ||
        error?.message === 'CSV_INVALID_INTERVAL' ||
        error?.data?.message === 'CSV_INVALID_INTERVAL'
      ) {
        setShowFormatModal(true)
      } else {
        toast.error('Failed to upload CSV file')
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
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

  if (!forecasting) {
    return (
      <div className="container-fluid group-data-[content=boxed]:max-w-boxed mx-auto">
        <div className="flex items-center justify-center h-96">
          <div className="text-lg text-red-500">Forecasting not found</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid group-data-[content=boxed]:max-w-boxed mx-auto">
      <BreadCrumb title="Forecasting Overview" subTitle="Forecasting" />

      <div className="card">
        <div className="card-body">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.push('/apps/forecasting/forecasting-list')}
              className="btn btn-outline-primary">
              <ArrowLeft className="inline-block size-4 mr-1" />
              Back to List
            </button>
            {/* Only show upload button if no files are uploaded */}
            {(!forecasting.files || forecasting.files.length === 0) && (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={handleUploadClick}
                  className="btn btn-primary"
                  disabled={
                    getUploadUrlMutation.isPending ||
                    createFileMutation.isPending
                  }>
                  <Upload className="inline-block size-4 mr-1" />
                  {getUploadUrlMutation.isPending ||
                  createFileMutation.isPending
                    ? 'Uploading...'
                    : 'Upload CSV'}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h6 className="text-15 font-semibold mb-2">
                Forecasting Details
              </h6>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">ID</p>
                  <p className="text-sm font-medium">{forecasting.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="text-sm font-medium">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        forecasting.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {forecasting.status}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Time Interval</p>
                  <p className="text-sm font-medium">
                    {forecasting.timeInterval}{' '}
                    {forecasting.timeUnit.toLowerCase()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p className="text-sm font-medium">
                    {new Date(forecasting.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {forecasting.description && (
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="text-sm">{forecasting.description}</p>
              </div>
            )}

            {forecasting.files && forecasting.files.length > 0 && (
              <div>
                <h6 className="text-15 font-semibold mb-2">Uploaded Files</h6>
                <div className="space-y-2">
                  {forecasting.files.map((file: any) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.fileSize / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={file.s3Url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-primary">
                          Download
                        </a>
                        <button
                          onClick={() => openDeleteModal(file.id)}
                          disabled={deleteFileMutation.isPending}
                          className="btn btn-sm btn-red">
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="card card-body">
        <div dir="ltr">
          <GradientLineChart
            chartColors="[bg-orange-500, bg-blue-500, bg-green-500, bg-purple-500]"
            chartDarkColors={''}
            chartId={gradientLineChart}
            series={chartSeries}
          />
        </div>{' '}
      </div>

      {forecasting.status === 'COMPLETED' && (
        <div className="card card-body">
          <div className="space-y-4">
            <h6 className="text-15 font-semibold">Summary</h6>
            {forecasting.summary ? (
              <p className="text-sm text-gray-700">{forecasting.summary}</p>
            ) : (
              <p className="text-sm text-gray-500 italic">No summary available yet.</p>
            )}
          </div>
        </div>
      )}

      {/* CSV Format Error Modal */}
      <Modal
        isOpen={showFormatModal}
        onClose={() => setShowFormatModal(false)}
        title="Invalid CSV Format"
        size="modal-2xl"
        position="modal-center"
        content={
          <div className="space-y-4">
            <div>
              <p className="text-gray-700 mb-4">
                Your CSV file must have exactly 2 columns with the following
                structure:
              </p>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Column 1: Timestamp (mm/dd/yyyy hh:mm:ss)
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Complete timestamp with date and time. Format must be:
                  mm/dd/yyyy hh:mm:ss (American format)
                </p>

                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Column 2: Value (Numeric)
                </p>
                <p className="text-sm text-gray-600">
                  Numeric value for forecasting (sales, temperature, etc.)
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Example CSV Format (Time Interval: 1 HOUR):
                </p>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>
                    {`timestamp,value
01/01/2025 01:00:00,100
01/01/2025 02:00:00,150
01/01/2025 03:00:00,200
01/01/2025 04:00:00,180
01/01/2025 05:00:00,220`}
                  </pre>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Example CSV Format (Time Interval: 1 MONTH):
                </p>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>
                    {`timestamp,value
01/01/2025 00:00:00,5000
02/01/2025 00:00:00,6000
03/01/2025 00:00:00,5500
04/01/2025 00:00:00,7000
05/01/2025 00:00:00,6500`}
                  </pre>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Note: 01/01/2025 = January 1st, 02/01/2025 = February 1st,
                  03/01/2025 = March 1st, etc.
                </p>
              </div>

              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> The time intervals between rows
                  must match your configured Time Interval (timeInterval:{' '}
                  {forecasting?.timeInterval || '?'}, timeUnit:{' '}
                  {forecasting?.timeUnit || '?'}). If intervals don't match, the
                  file will be rejected.
                </p>
              </div>

              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Additional columns beyond the first two
                  will be ignored. Only columns 1 and 2 are used for
                  forecasting.
                </p>
              </div>
            </div>
          </div>
        }
        footer={
          <button
            onClick={() => setShowFormatModal(false)}
            className="btn btn-primary">
            Got it
          </button>
        }
      />

      {/* Delete File Modal */}
      <DeleteModal
        show={showDeleteModal}
        handleHide={() => {
          setShowDeleteModal(false)
          setFileToDelete(null)
        }}
        deleteModalFunction={handleDeleteFile}
        title="Delete CSV File"
        message="Are you sure you want to delete this CSV file? This will also clear all forecasting data and reset the status to PROCESSING."
        confirmText="Delete File"
        cancelText="Cancel"
        type="delete"
      />
    </div>
  )
}

export default ForecastingOverviewPage
