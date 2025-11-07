'use client'

import React, { useState } from 'react'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import { NextPageWithLayout } from '@src/dtos'
import { api } from '@src/trpc/react'
import { Download, Trash2, Upload } from 'lucide-react'
import { toast } from 'react-toastify'

const ProjectsFiles: NextPageWithLayout = () => {
  const params = useParams()
  const id = params.id as string
  const [fileFilter, setFileFilter] = useState<string>('')

  // Get all files for the project
  const {
    data: files = [],
    isLoading,
    refetch: refetchFiles,
  } = api.projectFile.getAll.useQuery({
    projectId: id,
    ...(fileFilter && { fileType: fileFilter as any }),
  })

  // Get file stats
  const { data: stats, refetch: refetchStats } = api.projectFile.getStats.useQuery({ projectId: id })

  // Mutations
  const uploadAndCreate = api.projectFile.uploadAndCreate.useMutation()
  const uploadFile = api.projectFile.uploadFile.useMutation()
  const getDownloadUrl = api.projectFile.getDownloadUrl.useMutation()
  const deleteFile = api.projectFile.delete.useMutation()

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFiles = event.target.files
    if (selectedFiles && selectedFiles[0]) {
      const file = selectedFiles[0]

      try {
        console.log('📤 Starting file upload:', {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          projectId: id,
        })

        // Use combined upload and create endpoint
        const uploadData = await uploadAndCreate.mutateAsync({
          projectId: id,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        })

        console.log('✅ Upload data received:', {
          uploadUrlLength: uploadData.uploadUrl.length,
          fileId: uploadData.fileId,
          s3Key: uploadData.s3Key,
        })

        try {
          // Try direct S3 upload first
          const uploadResponse = await fetch(uploadData.uploadUrl, {
            method: 'PUT',
            body: file,
            headers: {
              'Content-Type': file.type,
            },
          })

          console.log('📡 S3 upload response:', {
            status: uploadResponse.status,
            ok: uploadResponse.ok,
          })

          if (!uploadResponse.ok) {
            throw new Error(`S3 upload failed with status: ${uploadResponse.status}`)
          }

          console.log('✅ Direct S3 upload successful')
        } catch (s3Error) {
          console.warn('❌ Direct S3 upload failed, trying server-side upload:', s3Error)
          
          // Fallback to server-side upload
          const fileReader = new FileReader()
          const fileData = await new Promise<string>((resolve, reject) => {
            fileReader.onload = () => {
              const result = fileReader.result as string
              // Remove data:mime/type;base64, prefix
              const base64Data = result.split(',')[1]
              resolve(base64Data)
            }
            fileReader.onerror = reject
            fileReader.readAsDataURL(file)
          })

          console.log('🔄 Attempting server-side upload...')
          if (uploadData.fileId) {
            await uploadFile.mutateAsync({
              fileId: uploadData.fileId,
              fileData: fileData,
            })
            console.log('✅ Server-side upload successful')
          } else {
            throw new Error('No file ID available for server-side upload')
          }
        }

        // Refresh file list and stats
        await Promise.all([refetchFiles(), refetchStats()])
        event.target.value = ''
        toast.success('File uploaded successfully!')
        console.log('🎉 Upload completed successfully')
      } catch (error) {
        console.error('Upload failed:', error)
        toast.error('Upload failed. Please try again.')
      }
    }
  }

  const handleDownload = async (fileId: string) => {
    try {
      const downloadData = await getDownloadUrl.mutateAsync({ id: fileId })
      // Open download URL in new tab
      window.open(downloadData.downloadUrl, '_blank')
      toast.success('Download started!')
    } catch (error) {
      console.error('Download failed:', error)
      toast.error('Download failed. Please try again.')
    }
  }

  const handleDelete = async (fileId: string) => {
    if (confirm('Are you sure you want to delete this file?')) {
      try {
        await deleteFile.mutateAsync({ id: fileId })
        await Promise.all([refetchFiles(), refetchStats()])
        toast.success('File deleted successfully!')
      } catch (error) {
        console.error('Delete failed:', error)
        toast.error('Delete failed. Please try again.')
      }
    }
  }

  const getIconClass = (fileType: string, mimeType?: string) => {
    // Use enum first, then fallback to mimeType
    switch (fileType) {
      case 'IMAGE':
        return 'ri-file-image-line'
      case 'VIDEO':
        return 'ri-file-2-line'
      case 'AUDIO':
        return 'ri-file-music-line'
      case 'DOCUMENT':
        // Check specific document types based on mimeType
        if (mimeType === 'application/pdf') return 'ri-file-pdf-2-line'
        if (
          mimeType === 'application/msword' ||
          mimeType ===
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
          return 'ri-file-word-line'
        if (
          mimeType === 'application/vnd.ms-excel' ||
          mimeType ===
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
          return 'ri-file-excel-line'
        if (
          mimeType === 'application/vnd.ms-powerpoint' ||
          mimeType ===
            'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        )
          return 'ri-file-ppt-line'
        if (
          mimeType === 'application/zip' ||
          mimeType === 'application/x-rar-compressed'
        )
          return 'ri-file-zip-line'
        return 'ri-file-text-line'
      case 'OTHER':
      default:
        return 'ri-file-line'
    }
  }

  const formatSize = (sizeInBytes: number) => {
    if (sizeInBytes >= 1024 * 1024) {
      return (sizeInBytes / (1024 * 1024)).toFixed(2) + ' MB'
    } else {
      return (sizeInBytes / 1024).toFixed(2) + ' KB'
    }
  }

  if (isLoading) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* File stats and filters */}
      <div className="mb-6 card">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-16">Files ({stats?.totalFiles || 0})</h5>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                Total size:{' '}
                {stats?.totalSize ? formatSize(stats.totalSize) : '0 KB'}
              </span>
            </div>
          </div>

          {/* Filter buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFileFilter('')}
              className={`px-3 py-1 text-sm rounded-full ${
                fileFilter === ''
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              All
            </button>
            {['IMAGE', 'DOCUMENT', 'VIDEO', 'AUDIO', 'OTHER'].map((type) => (
              <button
                key={type}
                onClick={() => setFileFilter(type)}
                className={`px-3 py-1 text-sm rounded-full ${
                  fileFilter === type
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {type.toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Files grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {files.map((file) => (
          <div key={file.id} className="relative text-center card group">
            <div className="card-body">
              <i
                className={`text-2xl fill-sky-500/10 ${getIconClass(file.fileType, file.mimeType)}`}></i>
              <h6
                className="mt-4 mb-1 text-sm font-medium truncate"
                title={file.name}>
                {file.name}
              </h6>
              <p className="text-xs text-gray-500 dark:text-dark-500">
                {formatSize(file.fileSize)}
              </p>
              <p className="text-xs text-gray-400">
                {file.uploadedBy.firstName} {file.uploadedBy.lastName}
              </p>
              <p className="text-xs text-gray-400">
                {new Date(file.createdAt).toLocaleDateString()}
              </p>

              {/* Action buttons - shown on hover */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                <button
                  onClick={() => handleDownload(file.id)}
                  className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  title="Download">
                  <Download className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDelete(file.id)}
                  className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                  title="Delete">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Upload card */}
        <label className="relative flex flex-col items-center justify-center p-5 cursor-pointer border-primary-500/20 bg-primary-50 dark:bg-primary-500/10 dark:border-primary-500/20 card hover:bg-primary-100 transition-colors">
          <Upload className="inline-block mb-3 text-primary-500 size-7 fill-primary-500/20"></Upload>
          <span className="font-medium text-primary-500 text-sm">
            Upload file
          </span>
          <input
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploadAndCreate.isPending || uploadFile.isPending}
          />
          {(uploadAndCreate.isPending || uploadFile.isPending) && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
            </div>
          )}
        </label>
      </div>

      {files.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No files</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by uploading your first file.
          </p>
        </div>
      )}
    </div>
  )
}

export default ProjectsFiles
