'use client'

import React, { useState } from 'react'

import { useRouter } from 'next/navigation'

import BreadCrumb from '@src/components/common/BreadCrumb'
import DeleteModal from '@src/components/common/DeleteModal'
import { api } from '@src/trpc/react'
import { ArrowLeft, RefreshCw, Trash2 } from 'lucide-react'
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
    refetch,
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
                onClick={() => refetch()}
                className="btn btn-outline-primary">
                <RefreshCw className="inline-block size-4 mr-1" />
                Refresh
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="btn btn-red">
                <Trash2 className="inline-block size-4 mr-1" />
                Delete
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Transaction Details */}
            <div>
              <h6 className="text-15 font-semibold mb-4">
                Transaction Details
              </h6>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">ID</p>
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
                  <p className="text-sm text-gray-500">Transaction Amount</p>
                  <p className="text-sm font-medium">
                    ${transaction.amount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Timestamp</p>
                  <p className="text-sm font-medium">
                    {new Date(transaction.timestamp).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Is Fraud</p>
                  <p className="text-sm font-medium">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        transaction.isFraud
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                      {transaction.isFraud ? 'Yes' : 'No'}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fraud Probability</p>
                  <p className="text-sm font-medium">
                    {transaction.fraudProbability !== null
                      ? `${(transaction.fraudProbability * 100).toFixed(2)}%`
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Risk Score</p>
                  <p className="text-sm font-medium">
                    {transaction.riskScore ?? 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Cardholder Information */}
            <div>
              <h6 className="text-15 font-semibold mb-4">
                Cardholder Information
              </h6>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Card Type</p>
                  <p className="text-sm font-medium">{transaction.cardType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Card Level</p>
                  <p className="text-sm font-medium">{transaction.cardLevel}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Customer Age</p>
                  <p className="text-sm font-medium">{transaction.customerAge}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Customer Country</p>
                  <p className="text-sm font-medium">
                    {transaction.customerCountry}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Account Age (Days)</p>
                  <p className="text-sm font-medium">
                    {transaction.accountAgeDays}
                  </p>
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
                  <p className="text-sm text-gray-500">Merchant Category</p>
                  <p className="text-sm font-medium">
                    {transaction.merchantCategory}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Merchant Country</p>
                  <p className="text-sm font-medium">
                    {transaction.merchantCountry}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Merchant Risk Level</p>
                  <p className="text-sm font-medium">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        transaction.merchantRiskLevel === 'HIGH'
                          ? 'bg-red-100 text-red-800'
                          : transaction.merchantRiskLevel === 'MEDIUM'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                      }`}>
                      {transaction.merchantRiskLevel}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Historical Behavior */}
            <div>
              <h6 className="text-15 font-semibold mb-4">
                Historical Behavior
              </h6>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Days Since Last Transaction</p>
                  <p className="text-sm font-medium">
                    {transaction.daysSinceLastTransaction.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Transactions Today</p>
                  <p className="text-sm font-medium">
                    {transaction.numTransactionsToday}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Transactions This Hour</p>
                  <p className="text-sm font-medium">
                    {transaction.numTransactionsThisHour}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Avg Transaction Amount (30d)</p>
                  <p className="text-sm font-medium">
                    ${transaction.avgTransactionAmount30d.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Std Transaction Amount (30d)</p>
                  <p className="text-sm font-medium">
                    ${transaction.stdTransactionAmount30d.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Transactions (30d)</p>
                  <p className="text-sm font-medium">
                    {transaction.numTransactions30d}
                  </p>
                </div>
              </div>
            </div>

            {/* Transaction Velocity */}
            <div>
              <h6 className="text-15 font-semibold mb-4">
                Transaction Velocity
              </h6>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Amount Spent (24h)</p>
                  <p className="text-sm font-medium">
                    ${transaction.amountSpentLast24h.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Unique Merchants (24h)</p>
                  <p className="text-sm font-medium">
                    {transaction.numUniqueMerchants24h}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Countries (24h)</p>
                  <p className="text-sm font-medium">
                    {transaction.numCountries24h}
                  </p>
                </div>
              </div>
            </div>

            {/* Risk Indicators */}
            <div>
              <h6 className="text-15 font-semibold mb-4">Risk Indicators</h6>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">International Transaction</p>
                  <p className="text-sm font-medium">
                    {transaction.internationalTransaction ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Online Transaction</p>
                  <p className="text-sm font-medium">
                    {transaction.onlineTransaction ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Weekend Transaction</p>
                  <p className="text-sm font-medium">
                    {transaction.weekendTransaction ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Night Transaction</p>
                  <p className="text-sm font-medium">
                    {transaction.nightTransaction ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">High Risk Country</p>
                  <p className="text-sm font-medium">
                    {transaction.highRiskCountry ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">First Time Merchant</p>
                  <p className="text-sm font-medium">
                    {transaction.firstTimeMerchant ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </div>

            {/* Anomalous Patterns */}
            <div>
              <h6 className="text-15 font-semibold mb-4">
                Anomalous Patterns
              </h6>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Amount Deviation From Avg</p>
                  <p className="text-sm font-medium">
                    {transaction.amountDeviationFromAvg.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Unusual Hour For User</p>
                  <p className="text-sm font-medium">
                    {transaction.unusualHourForUser ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Unusual Merchant Category</p>
                  <p className="text-sm font-medium">
                    {transaction.unusualMerchantCategory ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Sudden Location Change</p>
                  <p className="text-sm font-medium">
                    {transaction.suddenLocationChange ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </div>

            {/* Authentication */}
            <div>
              <h6 className="text-15 font-semibold mb-4">Authentication</h6>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Authentication Method</p>
                  <p className="text-sm font-medium">
                    {transaction.authenticationMethod}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Failed Attempts Today</p>
                  <p className="text-sm font-medium">
                    {transaction.failedAttemptsToday}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Card Present</p>
                  <p className="text-sm font-medium">
                    {transaction.cardPresent ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">CVV Match</p>
                  <p className="text-sm font-medium">
                    {transaction.cvvMatch ? 'Yes' : 'No'}
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

      {transaction.status === 'COMPLETED' && (
        <div className="card card-body">
          <div className="space-y-4">
            <h6 className="text-15 font-semibold">Summary</h6>
            {transaction.summary ? (
              <p className="text-sm text-gray-700">{transaction.summary}</p>
            ) : (
              <p className="text-sm text-gray-500 italic">
                No summary available yet.
              </p>
            )}
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
