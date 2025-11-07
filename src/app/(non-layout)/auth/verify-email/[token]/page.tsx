'use client'

import { useEffect, useRef, useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import whiteLogo from '@assets/images/logo-white.png'
import mainLogo from '@assets/images/main-logo.png'
import { api } from '@src/trpc/react'
import { CheckCircle, RefreshCw, XCircle } from 'lucide-react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

type VerificationState = 'verifying' | 'success' | 'error'

export default function VerifyEmailPage() {
  const params = useParams()
  const token = params.token as string
  const [state, setState] = useState<VerificationState>('verifying')
  const [email, setEmail] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const hasVerified = useRef(false)

  const verifyEmailMutation = api.auth.verifyEmail.useMutation()
  const resendEmailMutation = api.auth.resendVerificationEmail.useMutation()
  const getEmailFromTokenQuery = api.auth.getEmailFromToken.useQuery(
    { token },
    { enabled: false }
  )

  useEffect(() => {
    if (hasVerified.current) return

    const verifyToken = async () => {
      hasVerified.current = true

      if (!token) {
        setState('error')
        setErrorMessage('Invalid verification link')
        return
      }

      try {
        const result = await verifyEmailMutation.mutateAsync({ token })
        setState('success')
        setEmail(result.email ? result.email : '')
      } catch (error: any) {
        setState('error')
        setErrorMessage(error?.message || 'Verification failed')

        // Try to get the email from the token for resend functionality
        try {
          const tokenData = await getEmailFromTokenQuery.refetch()
          if (tokenData.data?.email) {
            setEmail(tokenData.data.email)
          }
        } catch {
          // Token might be completely invalid
        }
      }
    }

    verifyToken()
  }, [token]) // Only depend on token

  const handleResendEmail = async () => {
    if (!email) return

    try {
      await resendEmailMutation.mutateAsync({ email })
      toast.success('Verification email sent! Please check your inbox.')
    } catch (error: any) {
      toast.error(error?.message || 'Failed to resend email')
    }
  }

  const renderContent = () => {
    switch (state) {
      case 'verifying':
        return (
          <div className="text-center">
            <div className="mb-5">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-primary-100 dark:bg-primary-900/20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              </div>
            </div>
            <h4 className="mb-2 font-bold text-xl">Verifying Your Email</h4>
            <p className="text-gray-500 dark:text-dark-500">
              Please wait while we verify your email address...
            </p>
          </div>
        )

      case 'success':
        return (
          <div className="text-center">
            <div className="mb-5">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h4 className="mb-2 font-bold text-xl text-green-600 dark:text-green-400">
              Email Verified Successfully!
            </h4>
            <p className="mb-6 text-gray-500 dark:text-dark-500">
              Your email address has been verified. You can now sign in to your
              account.
            </p>
            <Link
              href="/auth/signin-basic"
              className="inline-flex items-center px-4 py-2 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors">
              Continue to Sign In
            </Link>
          </div>
        )

      case 'error':
        return (
          <div className="text-center">
            <div className="mb-5">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-red-100 dark:bg-red-900/20">
                <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <h4 className="mb-2 font-bold text-xl text-red-600 dark:text-red-400">
              Verification Failed
            </h4>
            <p className="mb-6 text-gray-500 dark:text-dark-500">
              {errorMessage}
            </p>
            <div className="space-y-3">
              {email && (
                <button
                  onClick={handleResendEmail}
                  disabled={resendEmailMutation.isPending}
                  className="inline-flex items-center px-4 py-2 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${resendEmailMutation.isPending ? 'animate-spin' : ''}`}
                  />
                  {resendEmailMutation.isPending
                    ? 'Sending...'
                    : 'Resend Verification Email'}
                </button>
              )}
              <div>
                <Link
                  href="/auth/signin-basic"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  Back to Sign In
                </Link>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen py-12 from-sky-100 dark:from-sky-500/15 ltr:bg-gradient-to-l rtl:bg-gradient-to-r via-green-50 dark:via-green-500/10 to-pink-50 dark:to-pink-500/10">
      <div className="container">
        <div className="grid grid-cols-12">
          <div className="col-span-12 mb-0 md:col-span-10 lg:col-span-6 xl:col-span-4 md:col-start-2 lg:col-start-4 xl:col-start-5 card">
            <div className="md:p-10 card-body">
              <div className="mb-8 text-center">
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
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  )
}
