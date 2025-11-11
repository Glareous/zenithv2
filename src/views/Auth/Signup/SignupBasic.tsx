'use client'

import { useState, useEffect } from 'react'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

import whiteLogo from '@assets/images/logo-white.png'
import mainLogo from '@assets/images/main-logo.png'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from '@src/trpc/react'
import { Eye, EyeOff } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { z } from 'zod'

const signupSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    username: z.string().min(1, 'Username is required'),
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    confirmPassword: z.string(),
    agreeToTerms: z.literal(true, 'You must agree to the terms and conditions'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type SignupFormData = z.infer<typeof signupSchema>

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [, setLoading] = useState(false)
  
  // Invitation context from URL params
  const invitationToken = searchParams.get('invitation')
  const invitationEmail = searchParams.get('email')
  const invitationProject = searchParams.get('project')
  
  // Accept invitation mutation
  const acceptInvitation = api.projectMember.acceptInvitation.useMutation()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: invitationEmail || '',
      password: '',
      confirmPassword: '',
      agreeToTerms: true, // <-- must be true to match z.literal(true)
    },
  })
  
  // Handle invitation context on component mount
  useEffect(() => {
    if (invitationEmail && invitationProject) {
      setValue('email', invitationEmail)
      toast.info(`You've been invited to join the "${invitationProject}" project. Create an account to accept the invitation.`)
    }
  }, [invitationEmail, invitationProject, setValue])

  const signUpMutation = api.auth.signUp.useMutation()

  const onSubmit = async (data: SignupFormData) => {
    setLoading(true)
    console.log('Form data:', data)

    try {
      await signUpMutation.mutateAsync({
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        email: data.email,
        password: data.password,
      })
      
      // If there's an invitation, automatically sign in and accept it
      if (invitationToken) {
        try {
          // Sign in the newly created user
          const signInResult = await signIn('credentials', {
            email: data.email,
            password: data.password,
            redirect: false,
          })
          
          if (signInResult?.error) {
            throw new Error('Failed to sign in after registration')
          }
          
          // Accept the invitation
          const invitationResult = await acceptInvitation.mutateAsync({
            token: invitationToken,
          })
          
          if (invitationResult.success && invitationResult.redirectTo) {
            toast.success('Account created and invitation accepted successfully!')
            router.push(invitationResult.redirectTo)
            return
          }
        } catch (invitationError) {
          console.error('Failed to accept invitation:', invitationError)
          toast.success('Account created successfully! Please verify your email and sign in to accept the invitation.')
          router.push(`/auth/signin-basic?invitation=${invitationToken}&email=${invitationEmail}&project=${invitationProject}`)
          return
        }
      }
      
      toast.success('Account created successfully! Please verify your email.')
      router.push('/auth/signin-basic')
    } catch (err: any) {
      toast.error(err?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen py-12 from-sky-100 dark:from-sky-500/15 ltr:bg-gradient-to-l rtl:bg-gradient-to-r via-green-50 dark:via-green-500/10 to-pink-50 dark:to-pink-500/10">
      <div className="container">
        <div className="grid grid-cols-12">
          <div className="col-span-12 mb-0 md:col-span-10 lg:col-span-6 xl:col-span-4 md:col-start-2 lg:col-start-4 xl:col-start-5 card">
            <div className="md:p-10 card-body">
              <div className="mb-5 text-center">
                <Link href="/">
                  <Image
                    src={mainLogo}
                    alt="mainLogo"
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
                </Link>
              </div>
              <h4 className="mb-2 font-bold leading-relaxed text-center text-transparent drop-shadow-lg ltr:bg-gradient-to-r rtl:bg-gradient-to-l from-primary-500 vie-purple-500 to-pink-500 bg-clip-text">
                {invitationProject ? `Join "${invitationProject}"` : 'Create a New Account'}
              </h4>
              {invitationProject && (
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-200 text-center">
                    You&apos;ve been invited to join the <strong>{invitationProject}</strong> project.
                    Create your account to accept the invitation.
                  </p>
                </div>
              )}
              <p className="mb-5 text-center text-gray-500 dark:text-dark-500">
                Already have an account?
                <Link
                  href={invitationToken ? `/auth/signin-basic?invitation=${invitationToken}&email=${invitationEmail}&project=${invitationProject}` : "/auth/signin-basic"}
                  className="font-medium link link-primary">
                  Sign In
                </Link>
              </p>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-12 gap-4 mt-5">
                  <div className="col-span-12 md:col-span-6">
                    <label htmlFor="firstNameInput" className="form-label">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstNameInput"
                      className="w-full form-input"
                      placeholder="Enter your first name"
                      {...register('firstName')}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div className="col-span-12 md:col-span-6">
                    <label htmlFor="lastNameInput" className="form-label">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastNameInput"
                      className="w-full form-input"
                      placeholder="Enter your last name"
                      {...register('lastName')}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                  <div className="col-span-12 md:col-span-6">
                    <label htmlFor="userNameInput" className="form-label">
                      Username
                    </label>
                    <input
                      type="text"
                      id="userNameInput"
                      className="w-full form-input"
                      placeholder="Enter your username"
                      {...register('username')}
                    />
                    {errors.username && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.username.message}
                      </p>
                    )}
                  </div>
                  <div className="col-span-12 md:col-span-6">
                    <label htmlFor="emailInput" className="form-label">
                      Email
                    </label>
                    <input
                      type="email"
                      id="emailInput"
                      className={`w-full form-input ${invitationEmail ? 'bg-gray-50 dark:bg-gray-800' : ''}`}
                      placeholder="Enter your email"
                      readOnly={!!invitationEmail}
                      {...register('email')}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="col-span-12">
                    <label htmlFor="passwordInput" className="form-label">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="passwordInput"
                        className="ltr:pr-8 rtl:pl-8 form-input"
                        placeholder="Enter your password"
                        {...register('password')}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 flex items-center text-gray-500 dark:text-dark-500 ltr:right-3 rtl:left-3 focus:outline-hidden"
                        onClick={() => setShowPassword((prev) => !prev)}>
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
                    <label
                      htmlFor="confirmPasswordInput"
                      className="form-label">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="confirmPasswordInput"
                        className="ltr:pr-8 rtl:pl-8 form-input"
                        placeholder="Enter your confirm password"
                        {...register('confirmPassword')}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 flex items-center text-gray-500 dark:text-dark-500 ltr:right-3 rtl:left-3 focus:outline-hidden"
                        onClick={() => setShowPassword((prev) => !prev)}>
                        {showPassword ? (
                          <Eye className="size-5" />
                        ) : (
                          <EyeOff className="size-5" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                  <div className="col-span-12">
                    <div className="items-start input-check-group grow">
                      <input
                        id="checkboxBasic1"
                        className="input-check shrink-0"
                        type="checkbox"
                        {...register('agreeToTerms')}
                      />
                      <label
                        htmlFor="checkboxBasic1"
                        className="leading-normal input-check-label">
                        By creating an account, you agree to all of our terms
                        condition & policies.
                      </label>
                    </div>
                    {errors.agreeToTerms && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.agreeToTerms.message}
                      </p>
                    )}
                  </div>
                  <div className="col-span-12">
                    <button
                      type="submit"
                      className="w-full btn btn-primary"
                      disabled={isSubmitting}>
                      {isSubmitting ? 'Signing Up...' : 'Sign Up'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  )
}
