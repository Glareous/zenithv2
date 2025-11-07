import React, { useRef, useState } from 'react'

import Image from 'next/image'

import { api } from '@src/trpc/react'
import { Camera } from 'lucide-react'
import { toast } from 'react-toastify'

interface UserAvatarProps {
  projectId: string
  logoUrl?: string | null
  size?: number
  onLogoUpdated?: (newUrl: string) => void
}

const DEFAULT_AVATAR = '/assets/images/user-avatar.jpg'
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

const UserAvatar: React.FC<UserAvatarProps> = ({
  projectId,
  logoUrl,
  size = 96,
  onLogoUpdated,
}) => {
  const [hovered, setHovered] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [cacheBuster, setCacheBuster] = useState(Date.now())

  const uploadAndCreate = api.projectFile.uploadAndCreate.useMutation()
  const createFile = api.projectFile.create.useMutation()
  const updateProject = api.project.update.useMutation()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('Solo se permiten imágenes JPG, PNG, GIF o WEBP')
      return
    }

    setLoading(true)
    try {
      const uploadResult = await uploadAndCreate.mutateAsync({
        projectId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        description: 'Logo del proyecto',
        isPublic: true,
      })
      console.log({ url: uploadResult.uploadUrl })

      // Upload the file to S3
      const uploadResponse = await fetch(uploadResult.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
        mode: 'cors',
      })

      if (!uploadResponse.ok) {
        throw new Error(
          `Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`
        )
      }

      // Create file record after successful upload
      const createFileResult = await createFile.mutateAsync({
        projectId,
        name: file.name,
        fileName: uploadResult.fileName,
        fileType: 'IMAGE',
        mimeType: file.type,
        fileSize: file.size,
        s3Key: uploadResult.s3Key,
        description: 'Logo del proyecto',
        isPublic: true,
      })

      await updateProject.mutateAsync({
        id: projectId,
        logoUrl: createFileResult.s3Url,
      })
      toast.success('Logo actualizado correctamente')
      onLogoUpdated?.(createFileResult.s3Url)
    } catch (err: any) {
      console.error('Upload error:', err)
      toast.error(`Error al actualizar el logo: ${err.message}`)
    } finally {
      setLoading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div
      className="logo-container relative rounded-full overflow-hidden group"
      style={{ width: size, height: size, cursor: 'pointer' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => !loading && inputRef.current?.click()}
      tabIndex={0}
      aria-label="Cambiar logo del proyecto">
      <Image
        src={logoUrl ? `${logoUrl}?t=${cacheBuster}` : DEFAULT_AVATAR}
        alt="Logo del proyecto"
        width={size}
        height={size}
        className="object-cover w-full h-full"
        draggable={false}
      />
      <div
        className={`overlay absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
          hovered || loading ? 'opacity-50 bg-black' : 'opacity-0'
        }`}
        style={{ pointerEvents: 'none' }}>
        {loading ? (
          <span className="text-white font-semibold">Subiendo...</span>
        ) : (
          hovered && <Camera className="text-white" size={32} />
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.gif,.webp"
        className="hidden"
        onChange={handleFileChange}
        disabled={loading}
      />
    </div>
  )
}

export default UserAvatar
