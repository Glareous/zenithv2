'use client'

import React, { useState } from 'react'

import { api } from '@src/trpc/react'
import { MoveLeft, MoveRight, Trash2, Upload, X } from 'lucide-react'
import { toast } from 'react-toastify'

interface DocumentsTabProps {
  onPreviousTab: () => void
  onNextTab: () => void
  isLoading?: boolean
  employeeId: string | null
}

const DocumentsTab: React.FC<DocumentsTabProps> = ({
  onPreviousTab,
  onNextTab,
  isLoading,
  employeeId,
}) => {
  const [passportPhoto, setPassportPhoto] = useState<File | null>(null)
  const [transcript, setTranscript] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [existingPassportPhoto, setExistingPassportPhoto] = useState<any>(null)
  const [existingTranscript, setExistingTranscript] = useState<any>(null)

  const getUploadUrlMutation =
    api.projectEmployeeFile.getUploadUrl.useMutation()
  const createFileMutation = api.projectEmployeeFile.create.useMutation()
  const deleteFileMutation = api.projectEmployeeFile.delete.useMutation()

  const { data: existingFiles } =
    api.projectEmployeeFile.getByEmployeeId.useQuery(
      { employeeId: employeeId || '' },
      { enabled: !!employeeId }
    )

  React.useEffect(() => {
    if (existingFiles) {
      const passportFile = existingFiles.find(
        (f) => f.category === 'PASSPORT_PHOTO'
      )
      const transcriptFile = existingFiles.find(
        (f) => f.category === 'HIGH_SCHOOL_TRANSCRIPT'
      )
      setExistingPassportPhoto(passportFile || null)
      setExistingTranscript(transcriptFile || null)
    }
  }, [existingFiles])

  const handlePassportPhotoChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      setPassportPhoto(e.target.files[0])
    }
  }

  const handleTranscriptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTranscript(e.target.files[0])
    }
  }

  const removePassportPhoto = () => {
    setPassportPhoto(null)
  }

  const removeTranscript = () => {
    setTranscript(null)
  }

  const deleteExistingPassportPhoto = async () => {
    if (!existingPassportPhoto) return

    try {
      await deleteFileMutation.mutateAsync({ id: existingPassportPhoto.id })
      setExistingPassportPhoto(null)
      toast.success('Passport photo deleted successfully')
    } catch (error) {
      toast.error('Failed to delete passport photo')
    }
  }

  const deleteExistingTranscript = async () => {
    if (!existingTranscript) return

    try {
      await deleteFileMutation.mutateAsync({ id: existingTranscript.id })
      setExistingTranscript(null)
      toast.success('Transcript deleted successfully')
    } catch (error) {
      toast.error('Failed to delete transcript')
    }
  }

  const updateEmployeeMutation = api.projectEmployee.update.useMutation()

  const uploadFile = async (
    file: File,
    category: 'PASSPORT_PHOTO' | 'HIGH_SCHOOL_TRANSCRIPT'
  ) => {
    if (!employeeId) {
      throw new Error('Employee ID is required')
    }

    const { uploadUrl, s3Key, s3Bucket, s3Url, fileName } =
      await getUploadUrlMutation.mutateAsync({
        employeeId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      })

    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    })

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload file to S3')
    }

    const fileType = file.type.startsWith('image/')
      ? 'IMAGE'
      : file.type === 'application/pdf'
        ? 'DOCUMENT'
        : 'OTHER'

    await createFileMutation.mutateAsync({
      employeeId,
      name: file.name,
      fileName,
      fileType,
      category,
      mimeType: file.type,
      fileSize: file.size,
      s3Key,
      s3Bucket,
      s3Url,
      isPublic: false,
    })

    if (category === 'PASSPORT_PHOTO') {
      await updateEmployeeMutation.mutateAsync({
        id: employeeId,
        image: s3Url,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!employeeId) {
      toast.error('Employee not created. Please go back to step 1.')
      return
    }

    setIsUploading(true)

    try {
      if (passportPhoto) {
        await uploadFile(passportPhoto, 'PASSPORT_PHOTO')
      }

      if (transcript) {
        await uploadFile(transcript, 'HIGH_SCHOOL_TRANSCRIPT')
      }

      if (passportPhoto || transcript) {
        toast.success('Files uploaded successfully')
      }

      onNextTab()
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload files')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <React.Fragment>
      <form onSubmit={handleSubmit}>
        <h6 className="mb-3">Passport-sized Photograph</h6>
        <div className="mb-5">
          {!passportPhoto && !existingPassportPhoto ? (
            <div>
              <label
                htmlFor="passportPhotoInput"
                className="inline-block cursor-pointer">
                <div className="flex items-center justify-center overflow-hidden bg-gray-100 border border-gray-200 rounded-sm dark:bg-dark-850 dark:border-dark-800 size-36 hover:bg-gray-50 dark:hover:bg-dark-800">
                  <div className="flex flex-col items-center text-gray-500 dark:text-dark-500">
                    <Upload />
                    <div className="mt-2 mb-1">Passport Size</div>
                    <p className="text-xs">144 x 144</p>
                  </div>
                </div>
              </label>
              <input
                type="file"
                name="passportPhoto"
                id="passportPhotoInput"
                className="hidden"
                accept="image/*"
                onChange={handlePassportPhotoChange}
              />
            </div>
          ) : passportPhoto ? (
            <div className="relative size-36">
              <img
                src={URL.createObjectURL(passportPhoto)}
                alt="Passport"
                className="object-cover w-full h-full border border-gray-200 rounded-sm dark:border-dark-800"
              />
              <button
                type="button"
                onClick={removePassportPhoto}
                className="absolute top-1 right-1 ssbtn-sm btn-red p-1 rounded">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : existingPassportPhoto ? (
            <div className="relative size-36">
              <img
                src={existingPassportPhoto.s3Url}
                alt="Passport"
                className="object-cover w-full h-full border border-gray-200 rounded-sm dark:border-dark-800"
              />
              <button
                type="button"
                onClick={deleteExistingPassportPhoto}
                className="absolute top-1 right-1 btn-xs p-1 rounded-sm btn-red"
                disabled={deleteFileMutation.isPending}>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : null}
          <p className="mt-1 text-xs text-gray-500">
            Optional - Upload passport size photo
          </p>
        </div>

        <h6 className="mb-3">High School Transcript</h6>
        <div>
          {!transcript && !existingTranscript ? (
            <div>
              <label
                htmlFor="transcriptInput"
                className="block cursor-pointer w-full">
                <div className="flex items-center justify-center p-4 overflow-hidden bg-gray-100 border border-gray-200 rounded-sm dark:bg-dark-850 dark:border-dark-800 h-28 hover:bg-gray-50 dark:hover:bg-dark-800">
                  <div className="flex flex-col items-center text-gray-500 dark:text-dark-500">
                    <Upload />
                    <div className="mt-2 mb-1">
                      Drag and drop your certificate
                    </div>
                    <p className="text-xs">Only allowed pdf, png files</p>
                  </div>
                </div>
              </label>
              <input
                type="file"
                name="transcript"
                id="transcriptInput"
                className="hidden"
                accept=".pdf,.png,image/png,application/pdf"
                onChange={handleTranscriptChange}
              />
            </div>
          ) : transcript ? (
            <div className="flex items-center justify-between p-4 bg-gray-100 border border-gray-200 rounded-sm dark:bg-dark-850 dark:border-dark-800">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center size-10 bg-primary-500 rounded-sm text-primary-50">
                  <Upload className="size-5" />
                </div>
                <div>
                  <p className="font-medium">{transcript.name}</p>
                  <p className="text-xs text-gray-500">
                    {(transcript.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={removeTranscript}
                className="btn btn-sm btn-red btn-icon">
                <Trash2 className="size-4" />
              </button>
            </div>
          ) : existingTranscript ? (
            <div className="flex items-center justify-between p-4 bg-gray-100 border border-gray-200 rounded-sm dark:bg-dark-850 dark:border-dark-800">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center size-10 bg-primary-500 rounded-sm text-primary-50">
                  <Upload className="size-5" />
                </div>
                <div>
                  <p className="font-medium">{existingTranscript.name}</p>
                  <p className="text-xs text-gray-500">
                    {(existingTranscript.fileSize / 1024).toFixed(2)} KB
                  </p>
                  <a
                    href={existingTranscript.s3Url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary-500 hover:underline">
                    View file
                  </a>
                </div>
              </div>
              <button
                type="button"
                onClick={deleteExistingTranscript}
                className="btn btn-red btn-icon"
                disabled={deleteFileMutation.isPending}>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : null}
          <p className="mt-1 text-xs text-gray-500">
            Optional - Upload high school transcript (PDF or PNG)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-5 ltr:justify-end rtl:justify-start">
          <button
            type="button"
            className="btn btn-sub-gray"
            onClick={onPreviousTab}
            disabled={isUploading}>
            <MoveLeft className="mr-1 ltr:inline-block rtl:hidden size-4" />
            <MoveRight className="ml-1 ltr:hidden rtl:inline-block size-4" />
            Previous
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading || isUploading}>
            {isUploading
              ? 'Uploading...'
              : isLoading
                ? 'Saving...'
                : 'Save to Next'}
            <MoveRight className="ml-1 ltr:inline-block rtl:hidden size-4" />
            <MoveLeft className="mr-1 ltr:hidden rtl:inline-block size-4" />
          </button>
        </div>
      </form>
    </React.Fragment>
  )
}

export default DocumentsTab
