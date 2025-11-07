'use client'

import { useEffect, useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams, useParams } from 'next/navigation'

import whiteLogo from '@assets/images/logo-white.png'
import LogoMain from '@assets/images/main-logo.png'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from '@src/trpc/react'
import { TRPCClientError } from '@trpc/client'
import { Eye, EyeOff } from 'lucide-react'
import { signIn, signOut, getSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { z } from 'zod'

// Zod schema for form validation
const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})

type SignInFormData = z.infer<typeof signInSchema>

export default function SigninBasicWithSlug() {
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const slug = params.slug as string
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboards/ecommerce'
  const utils = api.useUtils()

  // Invitation context from URL params
  const invitationToken = searchParams.get('invitation')
  const invitationEmail = searchParams.get('email')
  const invitationProject = searchParams.get('project')
  const invitationError = searchParams.get('error')

  // Fetch organization by slug
  const { data: organization, isLoading: isLoadingOrg, error: orgError } = api.organization.getBySlug.useQuery(
    { slug },
    { enabled: !!slug }
  )

  // Accept invitation mutation
  const acceptInvitation = api.projectMember.acceptInvitation.useMutation()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  })

  const emailValue = watch('email')
  const passwordValue = watch('password')

  // Handle organization not found
  useEffect(() => {
    if (orgError) {
      toast.error('Organization not found')
      router.push('/auth/signin-basic')
    }
  }, [orgError, router])

  // Handle invitation context on component mount
  useEffect(() => {
    if (invitationError) {
      toast.error(
        searchParams.get('message') || 'Invalid or expired invitation'
      )
    }

    if (invitationEmail && invitationProject) {
      setValue('email', invitationEmail)
      toast.info(
        `You've been invited to join the "${invitationProject}" project. Please sign in to accept the invitation.`
      )
    }
  }, [
    invitationError,
    invitationEmail,
    invitationProject,
    setValue,
    searchParams,
  ])

  // Handle form submission
  const onSubmit = async (data: SignInFormData) => {
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      // Handle sign in errors (credentials invalid)
      if (result?.error) {
        toast.error('Invalid email or password')
        return
      }

      // Get the fresh session
      const session = await getSession()

      if (!session?.user?.id) {
        toast.error('Failed to get session')
        return
      }

      // Validate login permissions using tRPC
      try {
        await utils.auth.validateLoginPermissions.fetch({
          userId: session.user.id,
          slug: slug,
        })

        // If there's an invitation token, accept it after successful sign-in
        if (invitationToken) {
          try {
            const invitationResult = await acceptInvitation.mutateAsync({
              token: invitationToken,
            })

            if (invitationResult.success && invitationResult.redirectTo) {
              toast.success('Successfully joined the project!')
              router.push(invitationResult.redirectTo)
              return
            }
          } catch (invitationError) {
            console.error('Failed to accept invitation:', invitationError)
            toast.error(
              'Failed to accept invitation, but you have been signed in successfully.'
            )
          }
        }

        // If validation passes, redirect based on user role
        if (session?.user?.role === 'SUPERADMIN') {
          router.push('/admin/organizations')
        } else {
          router.push(callbackUrl)
        }
      } catch (validationError: any) {
        // Sign out the user since they don't have permission
        await signOut({ redirect: false })

        // Show specific error message from validation
        if (validationError instanceof TRPCClientError) {
          toast.error(validationError.message)
        } else {
          toast.error('Access denied')
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred')
    }
  }

  if (isLoadingOrg) {
    return (
      <div className="relative flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block size-8 border-4 border-primary-500 border-r-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading organization...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen py-12 from-sky-100 dark:from-sky-500/15 ltr:bg-gradient-to-l rtl:bg-gradient-to-r via-green-50 dark:via-green-500/10 to-pink-50 dark:to-pink-500/10">
      <div className="container">
        <div className="grid grid-cols-12">
          <div className="col-span-12 mb-0 md:col-span-10 lg:col-span-6 xl:col-span-4 md:col-start-2 lg:col-start-4 xl:col-start-5 card">
            <div className="md:p-10 card-body">
              <div className="mb-5 text-center">
                {organization?.logoUrl ? (
                  <Image
                    src={organization.logoUrl}
                    alt={organization.name}
                    className="h-12 mx-auto object-contain"
                    width={175}
                    height={48}
                  />
                ) : (
                  <>
                    <Image
                      src={LogoMain}
                      alt="LogoMain"
                      className="h-8 mx-auto dark:hidden"
                      width={175}
                      height={32}
                    />
                    <Image
                      src={whiteLogo}
                      alt="whiteLogo"
                      className="hidden h-8 mx-auto dark:inline-block"
                      width={175}
                      height={32}
                    />
                  </>
                )}
              </div>
              <h4 className="mb-2 font-bold leading-relaxed text-center text-transparent drop-shadow-lg ltr:bg-gradient-to-r rtl:bg-gradient-to-l from-primary-500 vie-purple-500 to-pink-500 bg-clip-text">
                {invitationProject
                  ? `Join "${invitationProject}"`
                  : organization
                    ? `Welcome to ${organization.name}`
                    : 'Welcome Back!'}
              </h4>
              {invitationProject && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
                    You&apos;ve been invited to join the{' '}
                    <strong>{invitationProject}</strong> project. Sign in to
                    accept the invitation.
                  </p>
                </div>
              )}
              {organization?.description && (
                <p className="mb-8 text-sm text-center text-gray-600 dark:text-gray-400">
                  {organization.description}
                </p>
              )}
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-12 gap-5 mb-5 items-center">
                  <div className="col-span-12">
                    <label htmlFor="email" className="form-label">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      {...register('email')}
                      className="w-full form-input"
                      placeholder="Enter your email address"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="col-span-12">
                    <label htmlFor="password" className="block mb-2 text-sm">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        {...register('password')}
                        className="w-full ltr:pr-8 rtl:pl-8 form-input"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute inset-y-0 flex items-center text-gray-500 ltr:right-3 rtl:left-3 focus:outline-hidden dark:text-dark-500">
                        {showPassword ? (
                          <Eye className="size-5" />
                        ) : (
                          <EyeOff className="size-5" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                  <div className="col-span-12">
                    <div className="flex items-center">
                      <div className="input-check-group grow">
                        <input
                          id="rememberMe"
                          {...register('rememberMe')}
                          className="input-check input-check-primary"
                          type="checkbox"
                        />
                        <label
                          htmlFor="rememberMe"
                          className="input-check-label">
                          Remember me
                        </label>
                      </div>
                      <Link
                        href="/auth/forgot-password-basic"
                        className="block text-sm font-medium underline transition duration-300 ease-linear ltr:text-right rtl:text-left shrink-0 text-primary-500 hover:text-primary-600">
                        Forgot Password?
                      </Link>
                    </div>
                  </div>
                  <div className="col-span-12">
                    <button
                      type="submit"
                      className="w-full btn btn-primary"
                      disabled={isSubmitting}>
                      {isSubmitting ? 'Signing in...' : 'Sign In'}
                    </button>
                  </div>
                </div>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/auth/signin-basic"
                  className="text-sm text-gray-600 hover:text-primary-500 dark:text-gray-400">
                  ← Back to standard login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
