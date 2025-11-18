'use client'

import React, { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import BreadCrumb from '@src/components/common/BreadCrumb'
import { LAYOUT_DIRECTION } from '@src/components/constants/layout'
import { NextPageWithLayout } from '@src/dtos'
import { RootState } from '@src/slices/reducer'
import { api } from '@src/trpc/react'
import Flatpickr from 'react-flatpickr'
import { FormProvider, useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import Select from 'react-select'
import { ToastContainer, toast } from 'react-toastify'
import { z } from 'zod'

const fraudTransactionSchema = z.object({
  // DATOS BÁSICOS
  amount: z.coerce.number().positive('Amount must be positive'),
  timestamp: z.string().min(1, 'Timestamp is required'),

  // DATOS DEL TARJETAHABIENTE
  cardType: z.string().min(1, 'Card type is required'),
  cardLevel: z.string().min(1, 'Card level is required'),
  customerAge: z.coerce.number().int().min(18, 'Must be at least 18'),
  accountAgeDays: z.coerce.number().int().min(0),
  customerCountry: z.string().min(1, 'Customer country is required'),

  // DATOS DEL COMERCIO
  merchantCategory: z.string().min(1, 'Merchant category is required'),
  merchantCountry: z.string().min(1, 'Merchant country is required'),
  merchantRiskLevel: z.enum(['low', 'medium', 'high']),

  // COMPORTAMIENTO HISTÓRICO
  daysSinceLastTransaction: z.coerce.number().min(0),
  numTransactionsToday: z.coerce.number().int().min(0),
  numTransactionsThisHour: z.coerce.number().int().min(0),
  avgTransactionAmount30d: z.coerce.number().min(0),
  stdTransactionAmount30d: z.coerce.number().min(0),
  numTransactions30d: z.coerce.number().int().min(0),

  // VELOCIDAD DE TRANSACCIONES
  amountSpentLast24h: z.coerce.number().min(0),
  numUniqueMerchants24h: z.coerce.number().int().min(0),
  numCountries24h: z.coerce.number().int().min(0),

  // INDICADORES DE RIESGO
  internationalTransaction: z.boolean(),
  onlineTransaction: z.boolean(),
  weekendTransaction: z.boolean(),
  nightTransaction: z.boolean(),
  highRiskCountry: z.boolean(),
  firstTimeMerchant: z.boolean(),

  // PATRONES ANÓMALOS
  amountDeviationFromAvg: z.coerce.number(),
  unusualHourForUser: z.boolean(),
  unusualMerchantCategory: z.boolean(),
  suddenLocationChange: z.boolean(),

  // AUTENTICACIÓN
  authenticationMethod: z.string().min(1, 'Authentication method is required'),
  failedAttemptsToday: z.coerce.number().int().min(0),
  cardPresent: z.boolean(),
  cvvMatch: z.boolean(),
})

export type FraudTransactionFormData = z.infer<typeof fraudTransactionSchema>

const NimFraudCreate: NextPageWithLayout = () => {
  const router = useRouter()
  const { currentProject } = useSelector((state: RootState) => state.Project)
  const { layoutMode, layoutDirection } = useSelector(
    (state: RootState) => state.Layout
  )
  const [editTransactionId, setEditTransactionId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const methods = useForm<FraudTransactionFormData>({
    resolver: zodResolver(fraudTransactionSchema) as any,
    mode: 'onChange',
    defaultValues: {
      amount: 0,
      timestamp: new Date().toISOString().slice(0, 16),
      cardType: 'VISA',
      cardLevel: 'CLASSIC',
      customerAge: 35,
      accountAgeDays: 730,
      customerCountry: 'US',
      merchantCategory: 'grocery_store',
      merchantCountry: 'US',
      merchantRiskLevel: 'low',
      daysSinceLastTransaction: 0.5,
      numTransactionsToday: 3,
      numTransactionsThisHour: 2,
      avgTransactionAmount30d: 125.50,
      stdTransactionAmount30d: 45.20,
      numTransactions30d: 45,
      amountSpentLast24h: 450.00,
      numUniqueMerchants24h: 3,
      numCountries24h: 1,
      internationalTransaction: false,
      onlineTransaction: true,
      weekendTransaction: false,
      nightTransaction: false,
      highRiskCountry: false,
      firstTimeMerchant: true,
      amountDeviationFromAvg: 10.5,
      unusualHourForUser: false,
      unusualMerchantCategory: true,
      suddenLocationChange: false,
      authenticationMethod: '3DS',
      failedAttemptsToday: 0,
      cardPresent: false,
      cvvMatch: true,
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
      setSelectedDate(new Date(transaction.timestamp))
      methods.reset({
        amount: transaction.amount,
        timestamp: new Date(transaction.timestamp).toISOString().slice(0, 16),
        cardType: transaction.cardType,
        cardLevel: transaction.cardLevel,
        customerAge: transaction.customerAge,
        accountAgeDays: transaction.accountAgeDays,
        customerCountry: transaction.customerCountry,
        merchantCategory: transaction.merchantCategory,
        merchantCountry: transaction.merchantCountry,
        merchantRiskLevel: transaction.merchantRiskLevel as 'low' | 'medium' | 'high',
        daysSinceLastTransaction: transaction.daysSinceLastTransaction,
        numTransactionsToday: transaction.numTransactionsToday,
        numTransactionsThisHour: transaction.numTransactionsThisHour,
        avgTransactionAmount30d: transaction.avgTransactionAmount30d,
        stdTransactionAmount30d: transaction.stdTransactionAmount30d,
        numTransactions30d: transaction.numTransactions30d,
        amountSpentLast24h: transaction.amountSpentLast24h,
        numUniqueMerchants24h: transaction.numUniqueMerchants24h,
        numCountries24h: transaction.numCountries24h,
        internationalTransaction: transaction.internationalTransaction,
        onlineTransaction: transaction.onlineTransaction,
        weekendTransaction: transaction.weekendTransaction,
        nightTransaction: transaction.nightTransaction,
        highRiskCountry: transaction.highRiskCountry,
        firstTimeMerchant: transaction.firstTimeMerchant,
        amountDeviationFromAvg: transaction.amountDeviationFromAvg,
        unusualHourForUser: transaction.unusualHourForUser,
        unusualMerchantCategory: transaction.unusualMerchantCategory,
        suddenLocationChange: transaction.suddenLocationChange,
        authenticationMethod: transaction.authenticationMethod,
        failedAttemptsToday: transaction.failedAttemptsToday,
        cardPresent: transaction.cardPresent,
        cvvMatch: transaction.cvvMatch,
      })
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
      timestamp: new Date(data.timestamp),
    }

    if (editTransactionId) {
      updateMutation.mutate({
        id: editTransactionId,
        ...data,
        timestamp: new Date(data.timestamp),
      })
    } else {
      createMutation.mutate(transactionData)
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
                <h4 className="card-title">Transaction Details</h4>
              </div>
              <div className="card-body">
                {/* DATOS BÁSICOS */}
                <h5 className="mb-4 text-lg font-semibold">Basic Information</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block mb-2 text-sm font-medium">Amount (USD/EUR)</label>
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
                    <label className="block mb-2 text-sm font-medium">Timestamp</label>
                    <Flatpickr
                      className="form-input"
                      placeholder="Select transaction date and time"
                      value={selectedDate}
                      options={{
                        enableTime: true,
                        dateFormat: 'Y-m-d H:i',
                        time_24hr: true,
                        minuteIncrement: 1,
                      }}
                      onChange={(date) => {
                        if (date.length > 0) {
                          setSelectedDate(date[0])
                          methods.setValue('timestamp', date[0].toISOString().slice(0, 16))
                        }
                      }}
                    />
                    {methods.formState.errors.timestamp && (
                      <p className="text-red-500 text-xs mt-1">
                        {methods.formState.errors.timestamp.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* DATOS DEL TARJETAHABIENTE */}
                <h5 className="mb-4 text-lg font-semibold">Cardholder Information</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block mb-2 text-sm font-medium">Card Type</label>
                    <Select
                      value={{
                        value: methods.watch('cardType'),
                        label: methods.watch('cardType'),
                      }}
                      onChange={(option) => option && methods.setValue('cardType', option.value)}
                      options={[
                        { value: 'VISA', label: 'VISA' },
                        { value: 'MASTERCARD', label: 'MASTERCARD' },
                        { value: 'AMEX', label: 'AMEX' },
                      ]}
                      classNamePrefix="select"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">Card Level</label>
                    <Select
                      value={{
                        value: methods.watch('cardLevel'),
                        label: methods.watch('cardLevel'),
                      }}
                      onChange={(option) => option && methods.setValue('cardLevel', option.value)}
                      options={[
                        { value: 'CLASSIC', label: 'CLASSIC' },
                        { value: 'GOLD', label: 'GOLD' },
                        { value: 'PLATINUM', label: 'PLATINUM' },
                      ]}
                      classNamePrefix="select"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">Customer Age</label>
                    <input
                      type="number"
                      className="form-input"
                      onWheel={(e) => e.currentTarget.blur()}
                      {...methods.register('customerAge')}
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">Account Age (Days)</label>
                    <input
                      type="number"
                      className="form-input"
                      onWheel={(e) => e.currentTarget.blur()}
                      {...methods.register('accountAgeDays')}
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">Customer Country</label>
                    <input
                      type="text"
                      className="form-input"
                      {...methods.register('customerCountry')}
                    />
                  </div>
                </div>

                {/* DATOS DEL COMERCIO */}
                <h5 className="mb-4 text-lg font-semibold">Merchant Information</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block mb-2 text-sm font-medium">Merchant Category</label>
                    <Select
                      value={{
                        value: methods.watch('merchantCategory'),
                        label: methods.watch('merchantCategory') === 'grocery_store' ? 'Grocery Store' :
                               methods.watch('merchantCategory') === 'gas_station' ? 'Gas Station' :
                               methods.watch('merchantCategory') === 'online' ? 'Online' : 'Restaurant',
                      }}
                      onChange={(option) => option && methods.setValue('merchantCategory', option.value)}
                      options={[
                        { value: 'grocery_store', label: 'Grocery Store' },
                        { value: 'gas_station', label: 'Gas Station' },
                        { value: 'online', label: 'Online' },
                        { value: 'restaurant', label: 'Restaurant' },
                      ]}
                      classNamePrefix="select"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">Merchant Country</label>
                    <input
                      type="text"
                      className="form-input"
                      {...methods.register('merchantCountry')}
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">Merchant Risk Level</label>
                    <Select
                      value={{
                        value: methods.watch('merchantRiskLevel'),
                        label: methods.watch('merchantRiskLevel').charAt(0).toUpperCase() + methods.watch('merchantRiskLevel').slice(1),
                      }}
                      onChange={(option) => option && methods.setValue('merchantRiskLevel', option.value as 'low' | 'medium' | 'high')}
                      options={[
                        { value: 'low', label: 'Low' },
                        { value: 'medium', label: 'Medium' },
                        { value: 'high', label: 'High' },
                      ]}
                      classNamePrefix="select"
                    />
                  </div>
                </div>

                {/* COMPORTAMIENTO HISTÓRICO */}
                <h5 className="mb-4 text-lg font-semibold">Historical Behavior</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block mb-2 text-sm font-medium">Days Since Last Transaction</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      onWheel={(e) => e.currentTarget.blur()}
                      {...methods.register('daysSinceLastTransaction')}
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">Transactions Today</label>
                    <input
                      type="number"
                      className="form-input"
                      onWheel={(e) => e.currentTarget.blur()}
                      {...methods.register('numTransactionsToday')}
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">Transactions This Hour</label>
                    <input
                      type="number"
                      className="form-input"
                      onWheel={(e) => e.currentTarget.blur()}
                      {...methods.register('numTransactionsThisHour')}
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">Avg Transaction Amount (30d)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      onWheel={(e) => e.currentTarget.blur()}
                      {...methods.register('avgTransactionAmount30d')}
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">Std Transaction Amount (30d)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      onWheel={(e) => e.currentTarget.blur()}
                      {...methods.register('stdTransactionAmount30d')}
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">Transactions (30d)</label>
                    <input
                      type="number"
                      className="form-input"
                      onWheel={(e) => e.currentTarget.blur()}
                      {...methods.register('numTransactions30d')}
                    />
                  </div>
                </div>

                {/* VELOCIDAD DE TRANSACCIONES */}
                <h5 className="mb-4 text-lg font-semibold">Transaction Velocity</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block mb-2 text-sm font-medium">Amount Spent Last 24h</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      onWheel={(e) => e.currentTarget.blur()}
                      {...methods.register('amountSpentLast24h')}
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">Unique Merchants (24h)</label>
                    <input
                      type="number"
                      className="form-input"
                      onWheel={(e) => e.currentTarget.blur()}
                      {...methods.register('numUniqueMerchants24h')}
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">Countries (24h)</label>
                    <input
                      type="number"
                      className="form-input"
                      onWheel={(e) => e.currentTarget.blur()}
                      {...methods.register('numCountries24h')}
                    />
                  </div>
                </div>

                {/* INDICADORES DE RIESGO */}
                <h5 className="mb-4 text-lg font-semibold">Risk Indicators</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      {...methods.register('internationalTransaction')}
                    />
                    <label className="ml-2 text-sm">International Transaction</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      {...methods.register('onlineTransaction')}
                    />
                    <label className="ml-2 text-sm">Online Transaction</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      {...methods.register('weekendTransaction')}
                    />
                    <label className="ml-2 text-sm">Weekend Transaction</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      {...methods.register('nightTransaction')}
                    />
                    <label className="ml-2 text-sm">Night Transaction (00:00-06:00)</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      {...methods.register('highRiskCountry')}
                    />
                    <label className="ml-2 text-sm">High Risk Country</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      {...methods.register('firstTimeMerchant')}
                    />
                    <label className="ml-2 text-sm">First Time Merchant</label>
                  </div>
                </div>

                {/* PATRONES ANÓMALOS */}
                <h5 className="mb-4 text-lg font-semibold">Anomalous Patterns</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block mb-2 text-sm font-medium">Amount Deviation from Avg</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      onWheel={(e) => e.currentTarget.blur()}
                      {...methods.register('amountDeviationFromAvg')}
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      {...methods.register('unusualHourForUser')}
                    />
                    <label className="ml-2 text-sm">Unusual Hour for User</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      {...methods.register('unusualMerchantCategory')}
                    />
                    <label className="ml-2 text-sm">Unusual Merchant Category</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      {...methods.register('suddenLocationChange')}
                    />
                    <label className="ml-2 text-sm">Sudden Location Change</label>
                  </div>
                </div>

                {/* AUTENTICACIÓN */}
                <h5 className="mb-4 text-lg font-semibold">Authentication</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block mb-2 text-sm font-medium">Authentication Method</label>
                    <Select
                      value={{
                        value: methods.watch('authenticationMethod'),
                        label: methods.watch('authenticationMethod'),
                      }}
                      onChange={(option) => option && methods.setValue('authenticationMethod', option.value)}
                      options={[
                        { value: 'NONE', label: 'NONE' },
                        { value: '3DS', label: '3DS' },
                        { value: 'PIN', label: 'PIN' },
                        { value: 'BIOMETRIC', label: 'BIOMETRIC' },
                      ]}
                      classNamePrefix="select"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">Failed Attempts Today</label>
                    <input
                      type="number"
                      className="form-input"
                      onWheel={(e) => e.currentTarget.blur()}
                      {...methods.register('failedAttemptsToday')}
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      {...methods.register('cardPresent')}
                    />
                    <label className="ml-2 text-sm">Card Present</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      {...methods.register('cvvMatch')}
                    />
                    <label className="ml-2 text-sm">CVV Match</label>
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
