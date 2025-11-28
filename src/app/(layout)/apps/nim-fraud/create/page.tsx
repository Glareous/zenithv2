'use client'

import React, { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import BreadCrumb from '@src/components/common/BreadCrumb'
import { LAYOUT_DIRECTION } from '@src/components/constants/layout'
import { NextPageWithLayout } from '@src/dtos'
import { RootState } from '@src/slices/reducer'
import { api } from '@src/trpc/react'
import { FormProvider, useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import Select from 'react-select'
import { ToastContainer, toast } from 'react-toastify'
import { z } from 'zod'

const fraudTransactionSchema = z.object({
  user: z.coerce.number().int().min(0, 'User ID must be positive'),
  card: z.coerce.number().int().min(0, 'Card ID must be positive'),
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12),
  day: z.coerce.number().int().min(1).max(31),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  amount: z.coerce.number().positive('Amount must be positive'),
  use_chip: z.enum(['Swipe Transaction', 'Chip Transaction', 'Online Transaction']),
  merchant_name: z.string().min(1, 'Merchant name is required'),
  merchant_city: z.string().min(1, 'Merchant city is required'),
  merchant_state: z.string().length(2, 'State must be 2 letters'),
  zip: z.coerce.number().int().min(0, 'Invalid ZIP code'),
  mcc: z.coerce.number().int().min(0, 'Invalid MCC'),
})

export type FraudTransactionFormData = z.infer<typeof fraudTransactionSchema>

const NimFraudCreate: NextPageWithLayout = () => {
  const router = useRouter()
  const { currentProject } = useSelector((state: RootState) => state.Project)
  const { layoutMode, layoutDirection } = useSelector(
    (state: RootState) => state.Layout
  )
  const [editTransactionId, setEditTransactionId] = useState<string | null>(null)
  const [isLoadingRandom, setIsLoadingRandom] = useState(false)
  const [isPredicting, setIsPredicting] = useState(false)
  const [predictionResult, setPredictionResult] = useState<{
    fraud_score: number
    prediccion: string
  } | null>(null)

  const methods = useForm<FraudTransactionFormData>({
    resolver: zodResolver(fraudTransactionSchema) as any,
    mode: 'onChange',
    defaultValues: {
      user: 0,
      card: 0,
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      day: new Date().getDate(),
      time: '00:00',
      amount: 0,
      use_chip: 'Swipe Transaction',
      merchant_name: '',
      merchant_city: '',
      merchant_state: '',
      zip: 0,
      mcc: 0,
    },
  })

  useEffect(() => {
    const storedEditId = localStorage.getItem('editTransactionId')
    setEditTransactionId(storedEditId)
  }, [])

  const { data: transaction } = api.projectFraudTransaction.getById.useQuery(
    { id: editTransactionId || '' },
    { enabled: !!editTransactionId }
  )

  useEffect(() => {
    if (transaction) {
      methods.reset({
        user: transaction.user,
        card: transaction.card,
        year: transaction.year,
        month: transaction.month,
        day: transaction.day,
        time: transaction.time,
        amount: transaction.amount,
        use_chip: transaction.use_chip as 'Swipe Transaction' | 'Chip Transaction' | 'Online Transaction',
        merchant_name: transaction.merchant_name,
        merchant_city: transaction.merchant_city,
        merchant_state: transaction.merchant_state,
        zip: transaction.zip,
        mcc: transaction.mcc,
      })

      // Show prediction results if available
      if (transaction.fraud_score !== null && transaction.prediccion) {
        setPredictionResult({
          fraud_score: transaction.fraud_score,
          prediccion: transaction.prediccion,
        })
      }
    }
  }, [transaction, methods])

  const createMutation = api.projectFraudTransaction.create.useMutation({
    onSuccess: () => {
      toast.success('Transaction created successfully')
      localStorage.removeItem('editTransactionId')
      router.push('/apps/nim-fraud/list')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create transaction')
    },
  })

  const updateMutation = api.projectFraudTransaction.update.useMutation({
    onSuccess: () => {
      toast.success('Transaction updated successfully')
      localStorage.removeItem('editTransactionId')
      router.push('/apps/nim-fraud/list')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update transaction')
    },
  })

  const onSubmit = async (data: FraudTransactionFormData) => {
    if (!currentProject) {
      toast.error('Please select a project first')
      return
    }

    const transactionData = {
      ...data,
      projectId: currentProject.id,
      ...(predictionResult && {
        fraud_score: predictionResult.fraud_score,
        prediccion: predictionResult.prediccion as 'FRAUDE' | 'NO FRAUDE',
        status: 'COMPLETED' as const,
      }),
    }

    if (editTransactionId) {
      updateMutation.mutate({
        id: editTransactionId,
        ...data,
        ...(predictionResult && {
          fraud_score: predictionResult.fraud_score,
          prediccion: predictionResult.prediccion as 'FRAUDE' | 'NO FRAUDE',
          status: 'COMPLETED' as const,
        }),
      })
    } else {
      createMutation.mutate(transactionData)
    }
  }

  const handleLoadRandomTransaction = async () => {
    setIsLoadingRandom(true)
    try {
      const response = await fetch('/api/fraud/transaccion/random')
      if (!response.ok) {
        throw new Error('Failed to load random transaction')
      }
      const data = await response.json()

      methods.reset({
        user: data.user,
        card: data.card,
        year: data.year,
        month: data.month,
        day: data.day,
        time: data.time,
        amount: data.amount,
        use_chip: data.use_chip,
        merchant_name: data.merchant_name,
        merchant_city: data.merchant_city,
        merchant_state: data.merchant_state,
        zip: data.zip,
        mcc: data.mcc,
      })

      toast.success('Random transaction loaded successfully')
    } catch (error) {
      toast.error('Failed to load random transaction')
      console.error(error)
    } finally {
      setIsLoadingRandom(false)
    }
  }

  const handlePredict = async () => {
    if (!editTransactionId && !currentProject) {
      toast.error('Please save the transaction first')
      return
    }

    setIsPredicting(true)
    setPredictionResult(null)

    try {
      // Use the transaction ID from edit mode or create a temporary one
      const transactionId = editTransactionId || Date.now()

      const response = await fetch('/api/fraud/predecir', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transaction_id: transactionId }),
      })

      if (!response.ok) {
        throw new Error('Failed to predict fraud')
      }

      const data = await response.json()
      setPredictionResult(data)
      toast.success('Prediction completed successfully')
    } catch (error) {
      toast.error('Failed to predict fraud')
      console.error(error)
    } finally {
      setIsPredicting(false)
    }
  }

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Please select a project first</p>
      </div>
    )
  }

  return (
    <FormProvider {...methods}>
      <React.Fragment>
        <BreadCrumb
          title={editTransactionId ? 'Edit Transaction' : 'Create Transaction'}
          subTitle="Nim Fraud"
        />
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-12 gap-x-space">
            <div className="col-span-12 card">
              <div className="card-header">
                <div className="flex justify-between items-center">
                  <h4 className="card-title">Transaction Details</h4>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={handleLoadRandomTransaction}
                      disabled={isLoadingRandom}>
                      {isLoadingRandom ? 'Loading...' : 'Load Random Transaction'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-yellow"
                      onClick={handlePredict}
                      disabled={isPredicting}>
                      {isPredicting ? 'Predicting...' : 'Predict Fraud'}
                    </button>
                  </div>
                </div>
              </div>
              <div className="card-body">
                {/* Prediction Result */}
                {predictionResult && (
                  <div className="mb-6 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <h5 className="text-lg font-semibold mb-3">Prediction Result</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Fraud Score</p>
                        <p className="text-2xl font-bold">
                          {(predictionResult.fraud_score * 100).toFixed(4)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Prediction</p>
                        <span
                          className={`inline-flex px-3 py-1 text-lg font-bold rounded-full ${predictionResult.prediccion === 'FRAUDE'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            }`}>
                          {predictionResult.prediccion === 'FRAUDE' ? '🚨 FRAUDE' : '✅ NO FRAUDE'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* User & Card Information */}
                <h5 className="mb-4 text-lg font-semibold">User & Card Information</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block mb-2 text-sm font-medium">User ID</label>
                    <input
                      type="number"
                      className="form-input"
                      onWheel={(e) => e.currentTarget.blur()}
                      {...methods.register('user')}
                    />
                    {methods.formState.errors.user && (
                      <p className="text-red-500 text-xs mt-1">
                        {methods.formState.errors.user.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">Card ID</label>
                    <input
                      type="number"
                      className="form-input"
                      onWheel={(e) => e.currentTarget.blur()}
                      {...methods.register('card')}
                    />
                    {methods.formState.errors.card && (
                      <p className="text-red-500 text-xs mt-1">
                        {methods.formState.errors.card.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Transaction Date & Time */}
                <h5 className="mb-4 text-lg font-semibold">Transaction Date & Time</h5>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <label className="block mb-2 text-sm font-medium">Year</label>
                    <input
                      type="number"
                      className="form-input"
                      onWheel={(e) => e.currentTarget.blur()}
                      {...methods.register('year')}
                    />
                    {methods.formState.errors.year && (
                      <p className="text-red-500 text-xs mt-1">
                        {methods.formState.errors.year.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">Month (1-12)</label>
                    <input
                      type="number"
                      className="form-input"
                      min="1"
                      max="12"
                      onWheel={(e) => e.currentTarget.blur()}
                      {...methods.register('month')}
                    />
                    {methods.formState.errors.month && (
                      <p className="text-red-500 text-xs mt-1">
                        {methods.formState.errors.month.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">Day (1-31)</label>
                    <input
                      type="number"
                      className="form-input"
                      min="1"
                      max="31"
                      onWheel={(e) => e.currentTarget.blur()}
                      {...methods.register('day')}
                    />
                    {methods.formState.errors.day && (
                      <p className="text-red-500 text-xs mt-1">
                        {methods.formState.errors.day.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">Time (HH:MM)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="14:30"
                      {...methods.register('time')}
                    />
                    {methods.formState.errors.time && (
                      <p className="text-red-500 text-xs mt-1">
                        {methods.formState.errors.time.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Transaction Details */}
                <h5 className="mb-4 text-lg font-semibold">Transaction Details</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block mb-2 text-sm font-medium">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      onWheel={(e) => e.currentTarget.blur()}
                      {...methods.register('amount')}
                    />
                    {methods.formState.errors.amount && (
                      <p className="text-red-500 text-xs mt-1">
                        {methods.formState.errors.amount.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">Use Chip</label>
                    <Select
                      value={{
                        value: methods.watch('use_chip'),
                        label: methods.watch('use_chip'),
                      }}
                      onChange={(option) => option && methods.setValue('use_chip', option.value as any)}
                      options={[
                        { value: 'Swipe Transaction', label: 'Swipe Transaction' },
                        { value: 'Chip Transaction', label: 'Chip Transaction' },
                        { value: 'Online Transaction', label: 'Online Transaction' },
                      ]}
                      classNamePrefix="select"
                    />
                    {methods.formState.errors.use_chip && (
                      <p className="text-red-500 text-xs mt-1">
                        {methods.formState.errors.use_chip.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Merchant Information */}
                <h5 className="mb-4 text-lg font-semibold">Merchant Information</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block mb-2 text-sm font-medium">Merchant Name</label>
                    <input
                      type="text"
                      className="form-input"
                      {...methods.register('merchant_name')}
                    />
                    {methods.formState.errors.merchant_name && (
                      <p className="text-red-500 text-xs mt-1">
                        {methods.formState.errors.merchant_name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">Merchant City</label>
                    <input
                      type="text"
                      className="form-input"
                      {...methods.register('merchant_city')}
                    />
                    {methods.formState.errors.merchant_city && (
                      <p className="text-red-500 text-xs mt-1">
                        {methods.formState.errors.merchant_city.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">Merchant State (2 letters)</label>
                    <input
                      type="text"
                      className="form-input"
                      maxLength={2}
                      {...methods.register('merchant_state')}
                    />
                    {methods.formState.errors.merchant_state && (
                      <p className="text-red-500 text-xs mt-1">
                        {methods.formState.errors.merchant_state.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">ZIP Code</label>
                    <input
                      type="number"
                      className="form-input"
                      onWheel={(e) => e.currentTarget.blur()}
                      {...methods.register('zip')}
                    />
                    {methods.formState.errors.zip && (
                      <p className="text-red-500 text-xs mt-1">
                        {methods.formState.errors.zip.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">MCC (Merchant Category Code)</label>
                    <input
                      type="number"
                      className="form-input"
                      onWheel={(e) => e.currentTarget.blur()}
                      {...methods.register('mcc')}
                    />
                    {methods.formState.errors.mcc && (
                      <p className="text-red-500 text-xs mt-1">
                        {methods.formState.errors.mcc.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    className="btn btn-gray"
                    onClick={() => router.push('/apps/nim-fraud/list')}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={createMutation.isPending || updateMutation.isPending}>
                    {createMutation.isPending || updateMutation.isPending
                      ? 'Saving...'
                      : editTransactionId
                        ? 'Update Transaction'
                        : 'Create Transaction'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>

        <ToastContainer
          theme={layoutMode}
          rtl={layoutDirection === LAYOUT_DIRECTION.RTL}
          position={
            layoutDirection === LAYOUT_DIRECTION.RTL ? 'top-left' : 'top-right'
          }
        />
      </React.Fragment>
    </FormProvider>
  )
}

export default NimFraudCreate
