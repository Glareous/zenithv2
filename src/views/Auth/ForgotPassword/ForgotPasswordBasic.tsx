'use client'

import React, { useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import whiteLogo from '@assets/images/logo-white.png'
import mainlogo from '@assets/images/main-logo.png'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from '@src/trpc/react'
import { MoveRight } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { z } from 'zod'

// Zod schema for form validation
const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

const ForgotPasswordBasic = () => {
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const forgotPasswordMutation = api.auth.forgotPassword.useMutation({
    onSuccess: () => {
      setIsSuccess(true)
      setError(null)
      toast.success('Password reset link sent to your email!')
    },
    onError: (error: any) => {
      setError(error.message)
      setIsSuccess(false)
      toast.error(error.message)
    },
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setError(null)
    forgotPasswordMutation.mutate({
      email: data.email,
    })
  }

  // Success state - show email sent confirmation
  if (isSuccess) {
    return (
      <React.Fragment>
        <div className="relative flex items-center justify-center min-h-screen py-12 from-sky-100 dark:from-sky-500/15 ltr:bg-gradient-to-l rtl:bg-gradient-to-r via-green-50 dark:via-green-500/10 to-pink-50 dark:to-pink-500/10">
          <div className="container">
            <div className="grid grid-cols-12">
              <div className="col-span-12 md:col-span-10 lg:col-span-6 xl:col-span-4 md:col-start-2 lg:col-start-4 xl:col-start-5 mb-0 card">
                <div className="md:p-10 card-body">
                  <div className="mb-5 text-center">
                    <Link href="#!">
                      <Image
                        src={mainlogo}
                        alt="mainlogo"
                        className="h-8 mx-auto dark:hidden"
                        width={176}
                        height={32}
                      />
                      <Image
                        src={whiteLogo}
                        alt="whiteLogo"
                        className="hidden h-8 mx-auto dark:inline-block"
                        width={176}
                        height={32}
                      />
                    </Link>
                  </div>
                  <h4 className="mb-2 font-bold leading-relaxed text-center text-transparent drop-shadow-lg ltr:bg-gradient-to-r rtl:bg-gradient-to-l from-primary-500 vie-purple-500 to-pink-500 bg-clip-text">
                    Check your email
                  </h4>
                  <p className="mb-5 text-center text-gray-500 dark:text-dark-500">
                    We&apos;ve sent a password reset link to {getValues('email')}
                  </p>

                  <div className="grid grid-cols-12 gap-4 mt-5">
                    <div className="col-span-12">
                      <button
                        type="button"
                        onClick={() => setIsSuccess(false)}
                        className="w-full px-4 py-2 text-white rounded-md bg-primary-500 hover:bg-primary-600">
                        Send another reset link
                      </button>
                      <p className="mt-3 text-center text-gray-500">
                        Return to the
                        <Link
                          href="/auth/signin-basic"
                          className="font-medium underline link link-primary">
                          <span className="align-middle"> Sign In </span>
                          <MoveRight className="inline-block rtl:mr-1 ltr:ml-1 size-4" />
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    )
  }

  return (
    <React.Fragment>
      <div className="relative flex items-center justify-center min-h-screen py-12 from-sky-100 dark:from-sky-500/15 ltr:bg-gradient-to-l rtl:bg-gradient-to-r via-green-50 dark:via-green-500/10 to-pink-50 dark:to-pink-500/10">
        <div className="container">
          <div className="grid grid-cols-12">
            <div className="col-span-12 md:col-span-10 lg:col-span-6 xl:col-span-4 md:col-start-2 lg:col-start-4 xl:col-start-5 mb-0 card">
              <div className="md:p-10 card-body">
                <div className="mb-5 text-center">
                  <Link href="#!">
                    <Image
                      src={mainlogo}
                      alt="mainlogo"
                      className="h-8 mx-auto dark:hidden"
                      width={176}
                      height={32}
                    />
                    <Image
                      src={whiteLogo}
                      alt="whiteLogo"
                      className="hidden h-8 mx-auto dark:inline-block"
                      width={176}
                      height={32}
                    />
                  </Link>
                </div>
                <h4 className="mb-2 font-bold leading-relaxed text-center text-transparent drop-shadow-lg ltr:bg-gradient-to-r rtl:bg-gradient-to-l from-primary-500 vie-purple-500 to-pink-500 bg-clip-text">
                  Forgot your Password?
                </h4>
                <p className="mb-5 text-center text-gray-500">
                  Enter your email address and we&apos;ll send you a link to reset
                  your password.
                </p>

                {/* Error Message */}
                {error && (
                  <div className="mb-6">
                    <div className="rounded-md bg-red-50 p-4">
                      <div className="text-sm text-red-700">{error}</div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="grid grid-cols-12 gap-4 mt-5">
                    <div className="col-span-12">
                      <label htmlFor="email" className="form-label">
                        Email address
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
                      <button
                        type="submit"
                        disabled={
                          forgotPasswordMutation.isPending || isSubmitting
                        }
                        className="w-full px-4 py-2 text-white rounded-md bg-primary-500 hover:bg-primary-600 disabled:opacity-50">
                        {forgotPasswordMutation.isPending || isSubmitting
                          ? 'Sending...'
                          : 'Send reset link'}
                      </button>
                      <p className="mt-3 text-center text-gray-500">
                        Return to the
                        <Link
                          href="/auth/signin-basic"
                          className="font-medium underline link link-primary">
                          <span className="align-middle">Sign In </span>
                          <MoveRight className="inline-block rtl:mr-1 ltr:ml-1 size-4" />
                        </Link>
                      </p>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}
export default ForgotPasswordBasic
