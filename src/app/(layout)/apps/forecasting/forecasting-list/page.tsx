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
import { Controller, useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import Select from 'react-select'
import { toast } from 'react-toastify'
import { z } from 'zod'

const createForecastingSchema = (maxPeriod?: number) => z.object({
  timeInterval: z.number().int().positive('Must be a positive number'),
  timeUnit: z.enum(['SECONDS', 'MINUTES', 'HOURS', 'DAYS', 'MONTHS', 'YEARS']),
  description: z.string().optional(),
  periodToPredict: z.number()
    .int('Period must be an integer')
    .min(2, 'Period to predict must be at least 2')
    .refine((val) => {
      if (maxPeriod === undefined) return true
      return val <= maxPeriod
    }, {
      message: maxPeriod !== undefined ? `Period cannot exceed ${maxPeriod} (15% of CSV rows)` : 'Invalid period'
    }),
  confidenceLevel: z.number().min(80, 'Confidence level must be at least 80%').max(100, 'Confidence level cannot exceed 100%').optional(),
})

const forecastingSchema = createForecastingSchema()

type ForecastingFormData = z.infer<typeof forecastingSchema>

const timeUnitOptions = [
  { value: 'SECONDS', label: 'Seconds' },
  { value: 'MINUTES', label: 'Minutes' },
  { value: 'HOURS', label: 'Hours' },
  { value: 'DAYS', label: 'Days' },
  { value: 'MONTHS', label: 'Months' },
  { value: 'YEARS', label: 'Years' },
]

const ForecastingListPage: NextPageWithLayout = () => {
  const { currentProject } = useSelector((state: RootState) => state.Project)
  const router = useRouter()

  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showFormatModal, setShowFormatModal] = useState(false)
  const [showExamplesModal, setShowExamplesModal] = useState(false)
  const [selectedForecasting, setSelectedForecasting] = useState<any>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [csvRowCount, setCsvRowCount] = useState<number | null>(null)
  const [maxPeriodToPredict, setMaxPeriodToPredict] = useState<number | undefined>(undefined)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ForecastingFormData>({
    resolver: zodResolver(forecastingSchema),
    defaultValues: {
      timeInterval: 1,
      timeUnit: 'HOURS',
      periodToPredict: 2,
      confidenceLevel: undefined,
    },
  })

  const {
    data: forecastings = [],
    isLoading,
    refetch,
  } = api.projectForecasting.getByProject.useQuery(
    { projectId: currentProject?.id || '' },
    { enabled: !!currentProject?.id }
  )

  const createMutation = api.projectForecasting.create.useMutation()

  const updateMutation = api.projectForecasting.update.useMutation({
    onSuccess: () => {
      toast.success('Forecasting updated successfully')
      refetch()
      closeModal()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update forecasting')
    },
  })

  const deleteMutation = api.projectForecasting.delete.useMutation({
    onSuccess: () => {
      toast.success('Forecasting deleted successfully')
      refetch()
      setShowDeleteModal(false)
      setSelectedForecasting(null)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete forecasting')
    },
  })

  const getUploadUrlMutation =
    api.projectForecastingFile.getUploadUrl.useMutation()
  const createFileMutation = api.projectForecastingFile.create.useMutation()
  const deleteFileMutation = api.projectForecastingFile.delete.useMutation()

  const countCsvRows = async (file: File) => {
    try {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim() !== '')
      // Subtract 1 for header row
      const dataRows = lines.length - 1
      setCsvRowCount(dataRows)

      // Calculate max period (15% of data rows, rounded down to integer)
      const maxPeriod = Math.floor(dataRows * 0.15)
      setMaxPeriodToPredict(maxPeriod)

      return { dataRows, maxPeriod }
    } catch (error) {
      console.error('Error counting CSV rows:', error)
      setCsvRowCount(null)
      setMaxPeriodToPredict(undefined)
      return null
    }
  }

  const openCreateModal = () => {
    setIsEditMode(false)
    setSelectedForecasting(null)
    reset({
      timeInterval: 1,
      timeUnit: 'HOURS',
      periodToPredict: 2,
      confidenceLevel: undefined,
    })
    setShowModal(true)
  }

  const openEditModal = (forecasting: any) => {
    setIsEditMode(true)
    setSelectedForecasting(forecasting)
    reset({
      timeInterval: forecasting.timeInterval,
      timeUnit: forecasting.timeUnit,
      description: forecasting.description || '',
      periodToPredict: forecasting.periodToPredict || 2,
      confidenceLevel: forecasting.confidenceLevel,
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedFile(null)
    setIsEditMode(false)
    setSelectedForecasting(null)
    setCsvRowCount(null)
    setMaxPeriodToPredict(undefined)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    reset()
  }

  // Handle example download
  const handleDownloadExample = (filename: string) => {
    const link = document.createElement('a')
    link.href = `/example-csv/${filename}`
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success(`Downloading ${filename}`)
  }

  // Handle example use
  const handleUseExample = async (filename: string, timeInterval: number, timeUnit: string) => {
    try {
      // Fetch the CSV file
      const response = await fetch(`/example-csv/${filename}`)
      if (!response.ok) throw new Error('Failed to fetch example CSV')

      const blob = await response.blob()
      const file = new File([blob], filename, { type: 'text/csv' })

      // Set the file as selected
      setSelectedFile(file)

      // Count CSV rows
      await countCsvRows(file)

      // Update form values
      reset({
        timeInterval,
        timeUnit: timeUnit as any,
        periodToPredict: 2,
        confidenceLevel: undefined,
      })

      // Close examples modal
      setShowExamplesModal(false)

      toast.success(`Example "${filename}" loaded successfully`)
    } catch (error) {
      console.error('Error loading example:', error)
      toast.error('Failed to load example CSV')
    }
  }

  const deleteMutationForCleanup = api.projectForecasting.delete.useMutation()

  const onSubmit = async (data: ForecastingFormData) => {
    if (!currentProject?.id) {
      toast.error('No project selected')
      return
    }

    // If edit mode
    if (isEditMode && selectedForecasting) {
      try {
        // First, update the forecasting metadata
        await updateMutation.mutateAsync({
          id: selectedForecasting.id,
          timeInterval: data.timeInterval,
          timeUnit: data.timeUnit,
          description: data.description,
          periodToPredict: data.periodToPredict,
          confidenceLevel: data.confidenceLevel,
        })

        // If there's a new CSV file selected, upload it
        if (selectedFile) {
          toast.info('Uploading and validating new CSV...')

          // Delete old file if exists
          if (selectedForecasting.files?.[0]?.id) {
            await deleteFileMutation.mutateAsync({
              id: selectedForecasting.files[0].id,
            })
          }

          // Upload new CSV
          const uploadResult = await getUploadUrlMutation.mutateAsync({
            forecastingId: selectedForecasting.id,
            fileName: selectedFile.name,
            fileType: selectedFile.type || 'text/csv',
            fileSize: selectedFile.size,
          })

          const uploadResponse = await fetch(uploadResult.uploadUrl, {
            method: 'PUT',
            body: selectedFile,
            headers: {
              'Content-Type': selectedFile.type || 'text/csv',
            },
          })

          if (!uploadResponse.ok) {
            throw new Error(`Failed to upload ${selectedFile.name}`)
          }

          // Validate and create file record
          await createFileMutation.mutateAsync({
            forecastingId: selectedForecasting.id,
            name: selectedFile.name,
            fileName: uploadResult.fileName,
            fileType: 'CSV',
            mimeType: selectedFile.type || 'text/csv',
            fileSize: selectedFile.size,
            s3Key: uploadResult.s3Key,
            isPublic: false,
          })

          toast.success('Forecasting updated and CSV uploaded successfully')
        } else {
          toast.success('Forecasting updated successfully')
        }

        refetch()
        closeModal()
      } catch (error: any) {
        console.error('Update error:', error)

        // Check if it's a CSV format or interval error
        if (
          error?.message === 'CSV_INVALID_FORMAT' ||
          error?.data?.message === 'CSV_INVALID_FORMAT' ||
          error?.message === 'CSV_INVALID_INTERVAL' ||
          error?.data?.message === 'CSV_INVALID_INTERVAL'
        ) {
          setShowFormatModal(true)
        } else {
          toast.error(error.message || 'Failed to update forecasting')
        }
      }
      return
    }

    // Create mode: validate CSV file is selected
    if (!selectedFile) {
      toast.error('Please select a CSV file')
      return
    }

    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('Please select a valid CSV file')
      return
    }

    let createdForecastingId: string | null = null

    try {
      toast.info('Creating forecasting and validating CSV...')

      // Step 1: Create the forecasting record (always PROCESSING by default)
      const forecasting = await createMutation.mutateAsync({
        timeInterval: data.timeInterval,
        timeUnit: data.timeUnit,
        description: data.description,
        periodToPredict: data.periodToPredict,
        confidenceLevel: data.confidenceLevel,
        status: 'PROCESSING',
        projectId: currentProject.id,
      })

      createdForecastingId = forecasting.id

      // Step 2: Get presigned URL for S3 upload
      const uploadResult = await getUploadUrlMutation.mutateAsync({
        forecastingId: forecasting.id,
        fileName: selectedFile.name,
        fileType: selectedFile.type || 'text/csv',
        fileSize: selectedFile.size,
      })

      // Step 3: Upload to S3
      const uploadResponse = await fetch(uploadResult.uploadUrl, {
        method: 'PUT',
        body: selectedFile,
        headers: {
          'Content-Type': selectedFile.type || 'text/csv',
        },
      })

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload ${selectedFile.name}`)
      }

      // Step 4: Create file record (this validates the CSV against timeInterval and timeUnit)
      await createFileMutation.mutateAsync({
        forecastingId: forecasting.id,
        name: selectedFile.name,
        fileName: uploadResult.fileName,
        fileType: 'CSV',
        mimeType: selectedFile.type || 'text/csv',
        fileSize: selectedFile.size,
        s3Key: uploadResult.s3Key,
        isPublic: false,
      })

      toast.success('Forecasting created and CSV validated successfully')
      refetch()
      closeModal()
    } catch (error: any) {
      console.error('Creation error:', error)

      // If forecasting was created but CSV validation failed, delete the forecasting
      if (createdForecastingId) {
        try {
          await deleteMutationForCleanup.mutateAsync({
            id: createdForecastingId,
          })
          console.log('Cleaned up forecasting after validation failure')
        } catch (cleanupError) {
          console.error('Failed to cleanup forecasting:', cleanupError)
        }
      }

      // Check if it's a CSV format or interval error
      if (
        error?.message === 'CSV_INVALID_FORMAT' ||
        error?.data?.message === 'CSV_INVALID_FORMAT' ||
        error?.message === 'CSV_INVALID_INTERVAL' ||
        error?.data?.message === 'CSV_INVALID_INTERVAL'
      ) {
        setShowFormatModal(true)
      } else {
        toast.error(error.message || 'Failed to create forecasting')
      }
    }
  }

  const handleDelete = (forecasting: any) => {
    setSelectedForecasting(forecasting)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (selectedForecasting?.id) {
      await deleteMutation.mutateAsync({ id: selectedForecasting.id })
    }
  }

  const handleViewDetails = (forecasting: any) => {
    router.push(`/apps/forecasting/forecasting-overview/${forecasting.id}`)
  }

  const columns = useMemo(
    () => [
      {
        header: 'ID',
        accessorKey: 'id',
        enableColumnFilter: false,
        cell: (cell: any) => {
          return (
            <span className="text-sm">{cell.getValue()?.slice(0, 8)}...</span>
          )
        },
      },
      {
        header: 'Description',
        accessorKey: 'description',
        enableColumnFilter: false,
        cell: (cell: any) => {
          const desc = cell.getValue()
          return (
            <span className="text-sm text-gray-600">
              {desc || (
                <span className="text-gray-400 italic">No description</span>
              )}
            </span>
          )
        },
      },
      {
        header: 'Data File Name (CSV)',
        accessorKey: 'files',
        enableColumnFilter: false,
        cell: (cell: any) => {
          const files = cell.getValue()
          const fileName = files?.[0]?.name
          return (
            <span className="text-sm">
              {fileName || (
                <span className="text-gray-400 italic">No file uploaded</span>
              )}
            </span>
          )
        },
      },
      {
        header: 'Status',
        accessorKey: 'status',
        enableColumnFilter: false,
        cell: (cell: any) => {
          const status = cell.getValue()
          return (
            <span
              className={`badge ${
                status === 'COMPLETED'
                  ? 'badge-sub-green'
                  : status === 'FAILED'
                    ? 'badge-sub-red'
                    : 'badge-sub-yellow'
              }`}>
              {status}
            </span>
          )
        },
      },
      {
        header: 'Actions',
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }: any) => {
          return (
            <div className="flex items-center gap-2">
              <button
                className="btn btn-sub-primary btn-icon !size-8"
                onClick={() => handleViewDetails(row.original)}
                title="View details">
                <Eye className="size-4" />
              </button>
              <button
                className="btn btn-sub-gray btn-icon !size-8"
                onClick={() => openEditModal(row.original)}
                title="Edit">
                <Pencil className="size-4" />
              </button>
              <button
                className="btn btn-sub-red btn-icon !size-8"
                onClick={() => handleDelete(row.original)}
                title="Delete">
                <Trash2 className="size-4" />
              </button>
            </div>
          )
        },
      },
    ],
    []
  )

  return (
    <div className="container-fluid group-data-[content=boxed]:max-w-boxed mx-auto">
      <BreadCrumb title="Forecasting List" subTitle="Forecasting" />

      <div className="card">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <h6 className="text-15">Forecasting Records</h6>
            <button
              type="button"
              className="btn btn-primary"
              onClick={openCreateModal}>
              <CirclePlus className="inline-block size-4 mr-1" />
              <span className="align-middle">Add Forecasting</span>
            </button>
          </div>

          <TableContainer
            isPagination={true}
            columns={columns || []}
            data={forecastings || []}
            customPageSize={10}
            divClass="overflow-x-auto"
            tableClass="table flush"
            theadClass="ltr:text-left rtl:text-right bg-slate-100 dark:bg-zink-600"
            thClass="px-3.5 py-2.5 font-semibold border-b border-slate-200 dark:border-zink-500"
            tdClass="px-3.5 py-2.5 border-y border-slate-200 dark:border-zink-500"
            PaginationClassName="flex flex-col items-center gap-4 px-4 mt-4 md:flex-row"
          />
        </div>
      </div>

      {/* Add/Edit Forecasting Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        id="forecastingModal"
        position="modal-center"
        title={isEditMode ? 'Edit Forecasting' : 'Add Forecasting'}
        content={
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium">
                Time Interval Configuration{' '}
                <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    {...register('timeInterval', { valueAsNumber: true })}
                    className={`form-input ${errors.timeInterval ? 'border-red-500' : ''}`}
                    placeholder="Enter number"
                  />
                  {errors.timeInterval && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.timeInterval.message}
                    </p>
                  )}
                </div>
                <div className="flex-1">
                  <Controller
                    name="timeUnit"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={timeUnitOptions}
                        value={timeUnitOptions.find(
                          (opt) => opt.value === field.value
                        )}
                        onChange={(option) => field.onChange(option?.value)}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        placeholder="Select unit..."
                      />
                    )}
                  />
                  {errors.timeUnit && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.timeUnit.message}
                    </p>
                  )}
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                This defines the expected time interval between data points in
                your CSV file.
              </p>
            </div>

            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className={`form-input ${errors.description ? 'border-red-500' : ''}`}
                placeholder="Enter a description for this forecasting (optional)"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium">
                Prediction Settings{' '}
                <span className="text-red-500">*</span>
                {maxPeriodToPredict !== undefined && (
                  <span className="ml-2 text-xs text-blue-600">
                    (Max period: {maxPeriodToPredict} - based on CSV rows)
                  </span>
                )}
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block mb-1 text-xs font-medium text-gray-600">
                    Period to Predict <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="2"
                    max={maxPeriodToPredict}
                    step="1"
                    {...register('periodToPredict', {
                      valueAsNumber: true,
                      validate: (value) => {
                        if (maxPeriodToPredict !== undefined && value > maxPeriodToPredict) {
                          return `Period cannot exceed ${maxPeriodToPredict} (15% of CSV rows)`
                        }
                        return true
                      }
                    })}
                    className={`form-input ${errors.periodToPredict ? 'border-red-500' : ''}`}
                    placeholder="Min: 2"
                  />
                  {errors.periodToPredict && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.periodToPredict.message}
                    </p>
                  )}
                </div>
                <div className="flex-1">
                  <label className="block mb-1 text-xs font-medium text-gray-600">
                    Confidence Level (%)
                  </label>
                  <input
                    type="number"
                    min="80"
                    max="100"
                    step="1"
                    {...register('confidenceLevel', { valueAsNumber: true })}
                    className={`form-input ${errors.confidenceLevel ? 'border-red-500' : ''}`}
                    placeholder="Optional (80-100)"
                  />
                  {errors.confidenceLevel && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.confidenceLevel.message}
                    </p>
                  )}
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Number of future time intervals to forecast (integer only)
                {csvRowCount !== null && (
                  <span className="block mt-1 text-blue-600">
                    CSV has {csvRowCount} data rows. Max period allowed: {maxPeriodToPredict} (15% of rows)
                  </span>
                )}
              </p>
            </div>

            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium">
                CSV File {!isEditMode && <span className="text-red-500">*</span>}
                {isEditMode && selectedForecasting?.files?.[0] && (
                  <span className="text-xs text-gray-500 ml-2">
                    (Current: {selectedForecasting.files[0].name})
                  </span>
                )}
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={async (e) => {
                  const file = e.target.files?.[0] || null
                  setSelectedFile(file)
                  if (file) {
                    await countCsvRows(file)
                  } else {
                    setCsvRowCount(null)
                    setMaxPeriodToPredict(undefined)
                  }
                }}
                className="hidden"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-primary"
                  disabled={
                    isSubmitting || createMutation.isPending || updateMutation.isPending || !!selectedFile
                  }>
                  <Upload className="inline-block size-4 mr-1" />
                  {isEditMode ? 'Upload New CSV' : 'Upload CSV'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowExamplesModal(true)}
                  className="btn btn-outline-primary"
                  disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}>
                  Use Example
                </button>
                {selectedFile && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null)
                      setCsvRowCount(null)
                      setMaxPeriodToPredict(undefined)
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ''
                      }
                    }}
                    className="btn btn-outline-red btn-icon"
                    disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
                    title="Remove file">
                    <Trash2 className="size-4" />
                  </button>
                )}
                {isEditMode && selectedForecasting?.files?.[0] && !selectedFile && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (selectedForecasting.files?.[0]?.id) {
                        try {
                          await deleteFileMutation.mutateAsync({
                            id: selectedForecasting.files[0].id,
                          })
                          toast.success('CSV file deleted successfully')
                          refetch()
                          closeModal()
                        } catch (error: any) {
                          toast.error(error.message || 'Failed to delete CSV file')
                        }
                      }
                    }}
                    className="btn btn-outline-red"
                    disabled={isSubmitting || createMutation.isPending || updateMutation.isPending || deleteFileMutation.isPending}
                    title="Delete current CSV file">
                    <Trash2 className="inline-block size-4 mr-1" />
                    Delete Current CSV
                  </button>
                )}
              </div>
              {selectedFile && (
                <p className="mt-2 text-sm text-green-600">
                  ✓ New file selected: {selectedFile.name}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {isEditMode
                  ? 'Upload a new CSV file to replace the current one. The new file must match the time interval configuration.'
                  : 'Upload a CSV file with format: mm/dd/yyyy hh:mm:ss, value'}
              </p>
            </div>

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
                  ? isEditMode
                    ? 'Updating...'
                    : 'Creating...'
                  : isEditMode
                    ? 'Update'
                    : 'Create & Continue'}
              </button>
            </div>
          </form>
        }
      />

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
                  must match your configured Time Interval. If intervals don't
                  match, the file will be rejected.
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

      {/* Examples Modal */}
      <Modal
        isOpen={showExamplesModal}
        onClose={() => setShowExamplesModal(false)}
        title="CSV Examples"
        size="modal-md"
        position="modal-center"
        footerClass='flex justify-end'
        content={
          <div className="space-y-6">
            {/* Example 1 */}
            <div className="flex gap-4 items-start">
              <div className="w-24 h-24 bg-gray-200 dark:bg-dark-700 rounded-lg flex-shrink-0 flex items-center justify-center">
                <span className="text-4xl">📊</span>
              </div>
              <div className="flex-1">
                <h6 className="text-lg font-semibold mb-1">Hourly Sales Data</h6>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Frecuencia: 1 Hour
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => handleDownloadExample('1 hour interval.csv')}>
                    DOWNLOAD
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => handleUseExample('1 hour interval.csv', 1, 'HOURS')}>
                    USE
                  </button>
                </div>
              </div>
            </div>

            {/* Example 2 */}
            <div className="flex gap-4 items-start">
              <div className="w-24 h-24 bg-gray-200 dark:bg-dark-700 rounded-lg flex-shrink-0 flex items-center justify-center">
                <span className="text-4xl">📈</span>
              </div>
              <div className="flex-1">
                <h6 className="text-lg font-semibold mb-1">Daily Revenue Data</h6>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Frecuencia: 1 Day
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => handleDownloadExample('1 day interval.csv')}>
                    DOWNLOAD
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => handleUseExample('1 day interval.csv', 1, 'DAYS')}>
                    USE
                  </button>
                </div>
              </div>
            </div>

            {/* Example 3 */}
            <div className="flex gap-4 items-start">
              <div className="w-24 h-24 bg-gray-200 dark:bg-dark-700 rounded-lg flex-shrink-0 flex items-center justify-center">
                <span className="text-4xl">📅</span>
              </div>
              <div className="flex-1">
                <h6 className="text-lg font-semibold mb-1">Monthly Product Sales</h6>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Frecuencia: 1 Month
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => handleDownloadExample('1 month interval.csv')}>
                    DOWNLOAD
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => handleUseExample('1 month interval.csv', 1, 'MONTHS')}>
                    USE
                  </button>
                </div>
              </div>
            </div>

            {/* Example 4 */}
            <div className="flex gap-4 items-start">
              <div className="w-24 h-24 bg-gray-200 dark:bg-dark-700 rounded-lg flex-shrink-0 flex items-center justify-center">
                <span className="text-4xl">🍎</span>
              </div>
              <div className="flex-1">
                <h6 className="text-lg font-semibold mb-1">Apple Stock Price History</h6>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Frecuencia: 7 Days (Weekly)
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => handleDownloadExample('Apple Stock Price History.csv')}>
                    DOWNLOAD
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => handleUseExample('Apple Stock Price History.csv', 7, 'DAYS')}>
                    USE
                  </button>
                </div>
              </div>
            </div>
          </div>
        }
        footer={
          <button
            onClick={() => setShowExamplesModal(false)}
            className="btn btn-outline-red">
            Cancel
          </button>
        }
      />

      {/* Delete Modal */}
      <DeleteModal
        show={showDeleteModal}
        handleHide={() => setShowDeleteModal(false)}
        deleteModalFunction={confirmDelete}
        title="Delete Forecasting"
        message="Are you sure you want to delete this forecasting record? This action cannot be undone."
      />
    </div>
  )
}

ForecastingListPage.getLayout = (page: React.ReactNode) => {
  return <>{page}</>
}

export default ForecastingListPage
