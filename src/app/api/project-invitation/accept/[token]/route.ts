import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

import { api } from '@src/trpc/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const param = await params
    console.log('API Route - Accept invitation:', { 
      token: param.token,
      url: request.url 
    })
    
    const result = await api.projectMember.acceptInvitation({
      token: param.token,
    })
    
    console.log('API Route - Invitation result:', result)

    if (result.requiresAuth) {
      // User needs to sign in/up - redirect to auth with invitation info
      const searchParams = new URLSearchParams({
        invitation: param.token,
        email: result.email,
        project: result.project.name,
      })

      return redirect(`/auth/signin-basic?${searchParams.toString()}`)
    }

    if (result.success && result.redirectTo) {
      // User successfully joined - redirect to project
      console.log('API Route - Redirecting to:', result.redirectTo)
      return redirect(result.redirectTo)
    }

    // Fallback redirect to projects page
    return redirect(`/apps/projects/${result.project?.id}/overview`)
  } catch (error) {
    console.error('Error accepting invitation:', error)
    // Redirect to error page or projects with error message
    const searchParams = new URLSearchParams({
      error: 'invalid_invitation',
      message: 'The invitation link is invalid or has expired.',
    })

    return redirect(`/auth/signin-basic?${searchParams.toString()}`)
  }
}
