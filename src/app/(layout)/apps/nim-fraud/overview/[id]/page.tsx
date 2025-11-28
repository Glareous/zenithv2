'use client'

import React, { useState } from 'react'

import { useRouter } from 'next/navigation'

import BreadCrumb from '@src/components/common/BreadCrumb'
import DeleteModal from '@src/components/common/DeleteModal'
import { api } from '@src/trpc/react'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'

interface FraudOverviewPageProps {
  params: Promise<{ id: string }>
}

const FraudOverviewPage = ({ params }: FraudOverviewPageProps) => {
  const { id } = React.use(params)
  const router = useRouter()
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const {
    data: transaction,
    isLoading,
  } = api.projectFraudTransaction.getById.useQuery({ id }, { enabled: !!id })

  const deleteMutation = api.projectFraudTransaction.delete.useMutation()

  const handleDelete = async () => {
    if (!transaction) return

    try {
      await deleteMutation.mutateAsync({ id: transaction.id })
      toast.success('Transaction deleted successfully')
      setShowDeleteModal(false)
      router.push('/apps/nim-fraud/list')
    } catch (error) {
      console.error('Transaction deletion error:', error)
      toast.error('Failed to delete transaction')
    }
  }

  if (isLoading) {
    return (
      <div className="container-fluid group-data-[content=boxed]:max-w-boxed mx-auto">
        <div className="flex items-center justify-center h-96">
          <div className="text-lg text-gray-500">Loading...</div>
        </div>
      </div>
    )
  }

  if (!transaction) {
    return (
      <div className="container-fluid group-data-[content=boxed]:max-w-boxed mx-auto">
        <div className="flex items-center justify-center h-96">
          <div className="text-lg text-red-500">Transaction not found</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid group-data-[content=boxed]:max-w-boxed mx-auto">
      <BreadCrumb title="Fraud Transaction Overview" subTitle="NIM Fraud" />

      <div className="card">
        <div className="card-body">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.push('/apps/nim-fraud/list')}
              className="btn btn-outline-primary">
              <ArrowLeft className="inline-block size-4 mr-1" />
              Back to List
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteModal(true)}
                className="btn btn-red">
                <Trash2 className="inline-block size-4 mr-1" />
                Delete
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Prediction Result */}
            {transaction.fraud_score !== null && transaction.prediccion && (
              <div className="p-6 rounded-lg border-2 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-gray-300 dark:border-gray-700">
                <h6 className="text-lg font-semibold mb-4">
                  Fraud Detection Result
                </h6>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Fraud Score</p>
                    <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                      {(transaction.fraud_score * 100).toFixed(4)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Prediction</p>
                    <span
                      className={`inline-flex px-4 py-2 text-xl font-bold rounded-full ${
                        transaction.prediccion === 'FRAUDE'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                      {transaction.prediccion === 'FRAUDE' ? '🚨 FRAUDE' : '✅ NO FRAUDE'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Transaction Details */}
            <div>
              <h6 className="text-15 font-semibold mb-4">
                Transaction Information
              </h6>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Transaction ID</p>
                  <p className="text-sm font-medium">{transaction.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="text-sm font-medium">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        transaction.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                          : transaction.status === 'FAILED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {transaction.status}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">User ID</p>
                  <p className="text-sm font-medium">{transaction.user}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Card ID</p>
                  <p className="text-sm font-medium">{transaction.card}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="text-sm font-medium">
                    ${transaction.amount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Use Chip</p>
                  <p className="text-sm font-medium">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        transaction.use_chip === 'Online Transaction'
                          ? 'bg-blue-100 text-blue-800'
                          : transaction.use_chip === 'Chip Transaction'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                      {transaction.use_chip}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div>
              <h6 className="text-15 font-semibold mb-4">Date & Time</h6>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Year</p>
                  <p className="text-sm font-medium">{transaction.year}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Month</p>
                  <p className="text-sm font-medium">{transaction.month}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Day</p>
                  <p className="text-sm font-medium">{transaction.day}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="text-sm font-medium">{transaction.time}</p>
                </div>
              </div>
            </div>

            {/* Merchant Information */}
            <div>
              <h6 className="text-15 font-semibold mb-4">
                Merchant Information
              </h6>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Merchant Name</p>
                  <p className="text-sm font-medium">
                    {transaction.merchant_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Merchant City</p>
                  <p className="text-sm font-medium">
                    {transaction.merchant_city}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Merchant State</p>
                  <p className="text-sm font-medium">
                    {transaction.merchant_state}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ZIP Code</p>
                  <p className="text-sm font-medium">{transaction.zip}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">MCC (Merchant Category Code)</p>
                  <p className="text-sm font-medium">{transaction.mcc}</p>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div>
              <h6 className="text-15 font-semibold mb-4">Metadata</h6>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p className="text-sm font-medium">
                    {new Date(transaction.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Updated At</p>
                  <p className="text-sm font-medium">
                    {new Date(transaction.updatedAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created By</p>
                  <p className="text-sm font-medium">
                    {transaction.createdBy.firstName} {transaction.createdBy.lastName}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {transaction.status === 'FAILED' && (
        <div className="card card-body">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex-shrink-0">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h6 className="text-15 font-semibold text-red-800 mb-1">
                  Fraud Detection Failed
                </h6>
                <p className="text-sm text-red-700">
                  The fraud detection process encountered an error and could
                  not be completed. Please verify the transaction data and try
                  again, or contact support if the issue persists.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Transaction Modal */}
      <DeleteModal
        show={showDeleteModal}
        handleHide={() => setShowDeleteModal(false)}
        deleteModalFunction={handleDelete}
        title="Delete Fraud Transaction"
        message="Are you sure you want to delete this fraud transaction? This action cannot be undone."
        confirmText="Delete Transaction"
        cancelText="Cancel"
        type="delete"
      />
    </div>
  )
}

export default FraudOverviewPage
