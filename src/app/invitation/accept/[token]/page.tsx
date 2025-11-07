'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@src/trpc/react'
import { toast } from 'react-toastify'

interface InvitationAcceptPageProps {
  params: Promise<{ token: string }>
}

export default function InvitationAcceptPage({ params }: InvitationAcceptPageProps) {
  const router = useRouter()
  const [token, setToken] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [hasProcessed, setHasProcessed] = useState(false)

  const acceptInvitation = api.projectMember.acceptInvitation.useMutation()

  useEffect(() => {
    params.then((resolvedParams) => {
      setToken(resolvedParams.token)
    })
  }, [params])

  useEffect(() => {
    if (!token || hasProcessed) return

    const handleInvitation = async () => {
      setHasProcessed(true) // Prevent re-execution
      try {
        console.log('Processing invitation with token:', token)
        
        const result = await acceptInvitation.mutateAsync({ token })
        
        console.log('Invitation result:', result)

        if (result.requiresAuth) {
          // User needs to sign in/up - redirect to auth with invitation info
          const searchParams = new URLSearchParams({
            invitation: token,
            email: result.email,
            project: result.project.name,
          })

          // Check if organization is custom and has a slug
          if (result.organization?.custom && result.organization?.slug) {
            // Redirect to custom organization sign-in page
            router.push(`/auth/signin-basic/${result.organization.slug}?${searchParams.toString()}`)
          } else {
            // Redirect to standard sign-in page
            router.push(`/auth/signin-basic?${searchParams.toString()}`)
          }
          return
        }

        if (result.success && result.redirectTo) {
          // User successfully joined - redirect to project
          toast.success(result.message)
          router.push(result.redirectTo)
          return
        }

        // Fallback redirect
        if (result.project?.id) {
          router.push(`/apps/projects/${result.project.id}/overview`)
        } else {
          router.push('/apps/projects/grid')
        }
      } catch (error) {
        console.error('Error accepting invitation:', error)
        toast.error('Failed to accept invitation. The link may be invalid or expired.')
        
        // Redirect to sign in with error
        const searchParams = new URLSearchParams({
          error: 'invalid_invitation',
          message: 'The invitation link is invalid or has expired.',
        })

        router.push(`/auth/signin-basic?${searchParams.toString()}`)
      } finally {
        setIsLoading(false)
      }
    }

    handleInvitation()
  }, [token, hasProcessed]) // Removed acceptInvitation and router to prevent re-execution

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Processing your invitation...
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Please wait while we add you to the project.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
          Redirecting...
        </h2>
      </div>
    </div>
  )
}