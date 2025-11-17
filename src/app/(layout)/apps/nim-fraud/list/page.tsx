'use client'

import React, { useMemo, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import BreadCrumb from '@src/components/common/BreadCrumb'
import DeleteModal from '@src/components/common/DeleteModal'
import Pagination from '@src/components/common/Pagination'
import { LAYOUT_DIRECTION } from '@src/components/constants/layout'
import TableContainer from '@src/components/custom/table/table'
import { NextPageWithLayout } from '@src/dtos'
import { RootState } from '@src/slices/reducer'
import { api } from '@src/trpc/react'
import { CirclePlus, Eye, Pencil, Search, Trash2 } from 'lucide-react'
import { useSelector } from 'react-redux'
import { ToastContainer, toast } from 'react-toastify'

const NimFraudList: NextPageWithLayout = () => {
  const { layoutMode, layoutDirection } = useSelector(
    (state: RootState) => state.Layout
  )
  const { currentProject } = useSelector((state: RootState) => state.Project)

  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const [show, setShow] = useState<boolean>(false)
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)

  const {
    data: transactions,
    isLoading,
    refetch,
  } = api.projectFraudTransaction.getByProject.useQuery(
    {
      projectId: currentProject?.id || '',
    },
    {
      enabled: !!currentProject?.id,
    }
  )

  const deleteMutation = api.projectFraudTransaction.delete.useMutation({
    onSuccess: () => {
      toast.success('Transaction deleted successfully')
      refetch()
      setShow(false)
      setSelectedTransaction(null)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete transaction')
    },
  })

  const handleDeleteList = () => {
    if (selectedTransaction) {
      deleteMutation.mutate({ id: selectedTransaction.id })
    }
  }

  const onClickEventListDelete = (transaction: any) => {
    setSelectedTransaction(transaction)
    setShow(true)
  }

  const toggleDelete = () => {
    setShow(false)
    setSelectedTransaction(null)
  }

  const handleEdit = (transaction: any) => {
    localStorage.setItem('editTransactionId', transaction.id)
    router.push('/apps/nim-fraud/create')
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Filter transactions based on search query
  const filteredTransactions = useMemo(() => {
    if (!transactions) return []

    const query = searchQuery.toLowerCase()
    return transactions.filter((transaction) => {
      return (
        transaction.cardType.toLowerCase().includes(query) ||
        transaction.customerCountry.toLowerCase().includes(query) ||
        transaction.merchantCategory.toLowerCase().includes(query) ||
        transaction.amount.toString().includes(query)
      )
    })
  }, [transactions, searchQuery])

  // Paginate filtered transactions
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredTransactions.slice(startIndex, endIndex)
  }, [filteredTransactions, currentPage, itemsPerPage])

  const columns = useMemo(
    () => [
      {
        header: 'Date',
        cell: ({ row }: { row: { original: any } }) => {
          return new Date(row.original.timestamp).toLocaleString()
        },
      },
      {
        header: 'Amount',
        cell: ({ row }: { row: { original: any } }) => {
          return `$${row.original.amount.toFixed(2)}`
        },
      },
      {
        header: 'Card Type',
        accessorKey: 'cardType',
      },
      {
        header: 'Merchant',
        accessorKey: 'merchantCategory',
      },
      {
        header: 'Country',
        accessorKey: 'customerCountry',
      },
      {
        header: 'Risk Level',
        accessorKey: 'merchantRiskLevel',
        cell: ({ row }: { row: { original: any } }) => {
          const risk = row.original.merchantRiskLevel
          const colorClass =
            risk === 'high'
              ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
              : risk === 'medium'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                : 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'

          return (
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colorClass}`}>
              {risk.toUpperCase()}
            </span>
          )
        },
      },
      {
        header: 'Fraud Status',
        cell: ({ row }: { row: { original: any } }) => {
          const isFraud = row.original.isFraud

          if (isFraud === null || isFraud === undefined) {
            return (
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100">
                PENDING
              </span>
            )
          }

          return (
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                isFraud
                  ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                  : 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
              }`}>
              {isFraud ? 'FRAUD' : 'LEGITIMATE'}
            </span>
          )
        },
      },
      {
        header: 'Fraud Probability',
        cell: ({ row }: { row: { original: any } }) => {
          const probability = row.original.fraudProbability
          if (!probability) return '-'
          return `${(probability * 100).toFixed(1)}%`
        },
      },
      {
        header: 'Action',
        cell: ({ row }: { row: { original: any } }) => (
          <div className="flex items-center gap-2">
            <button
              className="btn btn-sub-gray btn-icon !size-8"
              onClick={() => handleEdit(row.original)}>
              <Pencil className="size-4" />
            </button>
            <button
              className="btn btn-sub-red btn-icon !size-8"
              onClick={(e) => {
                e.preventDefault()
                onClickEventListDelete(row.original)
              }}>
              <Trash2 className="size-4" />
            </button>
            <button
              className="btn btn-sub-primary btn-icon !size-8"
              onClick={() => {
                router.push(`/apps/nim-fraud/overview/${row.original.id}`)
              }}>
              <Eye className="size-4" />
            </button>
          </div>
        ),
      },
    ],
    [router]
  )

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Please select a project first</p>
      </div>
    )
  }

  return (
    <React.Fragment>
      <BreadCrumb title="List View" subTitle="Fraud Transactions" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 card">
          <div className="card-header">
            <div className="flex flex-wrap justify-between gap-5">
              <div>
                <div className="relative group/form grow">
                  <input
                    type="text"
                    className="ltr:pl-9 rtl:pr-9 form-input ltr:group-[&.right]/form:pr-9 rtl:group-[&.right]/form:pl-9 ltr:group-[&.right]/form:pl-4 rtl:group-[&.right]/form:pr-4"
                    placeholder="Search by card type, country, merchant..."
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                  <button className="absolute inset-y-0 flex items-center ltr:left-3 rtl:right-3 ltr:group-[&.right]/form:right-3 rtl:group-[&.right]/form:left-3 ltr:group-[&.right]/form:left-auto rtl:group-[&.right]/form:right-auto focus:outline-hidden">
                    <Search className="text-gray-500 size-4 fill-gray-100 dark:text-dark-500 dark:fill-dark-850" />
                  </button>
                </div>
              </div>
              <div>
                <Link
                  href="/apps/nim-fraud/create"
                  className="btn btn-primary shrink-0 flex items-center"
                  onClick={() => localStorage.removeItem('editTransactionId')}>
                  <CirclePlus className="size-4 text-center mr-1" /> Add
                  Transaction
                </Link>
              </div>
            </div>
          </div>

          <div className="pt-0 card-body">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-gray-500">Loading transactions...</p>
              </div>
            ) : (
              <div>
                <TableContainer
                  columns={columns || []}
                  data={paginatedTransactions || []}
                  thClass="!font-medium cursor-pointer"
                  divClass="overflow-x-auto table-box whitespace-nowrap"
                  tableClass="table flush"
                  thtrClass="text-gray-500 bg-gray-100 dark:bg-dark-850 dark:text-dark-500"
                />
                {filteredTransactions.length > 0 && (
                  <Pagination
                    totalItems={filteredTransactions.length}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                  />
                )}
                {filteredTransactions.length === 0 && (
                  <div className="py-8 text-center">
                    <p className="text-gray-500">No transactions found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <ToastContainer
        theme={layoutMode}
        rtl={layoutDirection === LAYOUT_DIRECTION.RTL}
        position={
          layoutDirection === LAYOUT_DIRECTION.RTL ? 'top-left' : 'top-right'
        }
      />

      <DeleteModal
        show={show}
        handleHide={toggleDelete}
        deleteModalFunction={handleDeleteList}
      />
    </React.Fragment>
  )
}

export default NimFraudList
