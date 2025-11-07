'use client'

import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import BreadCrumb from '@src/components/common/BreadCrumb'
import DeleteModal from '@src/components/common/DeleteModal'
import InvoiceStatus from '@src/components/common/InvoiceStatus'
import Pagination from '@src/components/common/Pagination'
import Widgets from '@src/components/common/Widgets'
import { LAYOUT_DIRECTION } from '@src/components/constants/layout'
import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
} from '@src/components/custom/dropdown/dropdown'
import TableContainer from '@src/components/custom/table/table'
import { InvoiceList, NextPageWithLayout } from '@src/dtos'
import { AppDispatch, RootState } from '@src/slices/reducer'
import {
  deleteInvoiceListRecordData,
  getInvoiceListData,
  setCurrentInvoiceListRecord,
} from '@src/slices/thunk'
import { LayoutGrid, Search, Trash } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify'

const ListInvoice: NextPageWithLayout = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { invoiceList } = useSelector((state: RootState) => state.Invoice)
  const { layoutMode, layoutDirection } = useSelector(
    (state: RootState) => state.Layout
  )

  const router = useRouter()
  const [invoiceListData, setInvoiceListData] = useState<InvoiceList[]>([])
  const [searchValue, setSearchValue] = useState('')
  const [selectAll, setSelectAll] = useState(false)
  const [deletedListData, setDeletedListData] = useState<number[]>([])
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletedRecord, setDeletedRecord] = useState<number | null>(null)
  const itemsPerPage = 10
  const [currentPage, setCurrentPage] = useState(1)
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // use effect for get checkout shop cart data
  useEffect(() => {
    if (!invoiceList) {
      dispatch(getInvoiceListData())
    } else {
      setInvoiceListData(invoiceList)
    }
  }, [invoiceList, dispatch])
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedEvents =
    invoiceListData && invoiceListData.length > 0
      ? invoiceListData.slice(startIndex, startIndex + itemsPerPage)
      : []

  useEffect(() => {
    if (invoiceList && invoiceList.length === 0) {
      setInvoiceListData([])
    } else {
      setInvoiceListData(invoiceList)
    }
  }, [invoiceList])

  // handle search client
  const handleSearchClient = (value: string) => {
    setSearchValue(value)

    if (value.trim() !== '') {
      const filteredCustomers = invoiceList.filter((item: InvoiceList) => {
        return (
          item.clientName.toLowerCase().includes(value.toLowerCase()) ||
          item.country.toLowerCase().includes(value.toLowerCase()) ||
          item.invoiceId.toLowerCase().includes(value.toLowerCase()) ||
          item.invoiceDate.toLowerCase().includes(value.toLowerCase()) ||
          item.dueDate.toLowerCase().includes(value.toLowerCase()) ||
          item.status.toLowerCase().includes(value.toLowerCase())
        )
      })
      setInvoiceListData(filteredCustomers)
    } else {
      setInvoiceListData(invoiceList)
    }
  }

  // select all or unselect all
  const handleSelectAll = useCallback(() => {
    if (selectAll) {
      setDeletedListData([])
    } else {
      setDeletedListData(invoiceListData.map((invoice) => invoice.id))
    }
    setSelectAll(!selectAll)
  }, [selectAll, invoiceListData])

  // set multiple delete records
  const handleSelectRecord = (id: number) => {
    setDeletedListData((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // delete multiple records
  const handleRemoveSelectedRecords = () => {
    dispatch(deleteInvoiceListRecordData(deletedListData))
    setDeletedListData([])
    setSelectAll(false)
  }

  // handle delete record
  const handleDeleteRecord = (id: number) => {
    setDeletedRecord(id)
    setIsDeleteModalOpen(true)
  }

  // delete record
  const setDeleteRecord = () => {
    if (deletedRecord && isDeleteModalOpen) {
      dispatch(deleteInvoiceListRecordData([deletedRecord]))
      setIsDeleteModalOpen(false)
      setDeletedRecord(null)
    }
  }

  // set status badge color
  const getStatusClass = (status: string | undefined) => {
    switch (status) {
      case 'Paid':
        return 'badge badge-green'
      case 'Unpaid':
        return 'badge badge-pink'
      case 'Pending':
        return 'badge badge-yellow'
      case 'Overdue':
        return 'badge badge-red'
      default:
        return 'badge'
    }
  }

  const handleInvoiceOverview = useCallback(
    (isOpen: boolean = false, invoice: InvoiceList) => {
      dispatch(setCurrentInvoiceListRecord(isOpen, invoice))
      router.push('/apps/invoice/overview-1')
    },
    [dispatch, router]
  )

  const columns = useMemo(
    () => [
      {
        header: () => (
          <input
            id="checkboxAll"
            className="input-check input-check-primary"
            type="checkbox"
            checked={selectAll}
            onChange={handleSelectAll}
          />
        ),
        accessorKey: 'id',
        enableSorting: false,
        cell: ({ row }: { row: { original: InvoiceList } }) => (
          <input
            className="input-check input-check-primary"
            type="checkbox"
            checked={deletedListData.includes(row.original.id)}
            onChange={() => handleSelectRecord(row.original.id)}
          />
        ),
      },
      {
        header: 'ID',
        accessorKey: 'invoiceId',
      },
      {
        header: 'Client',
        accessorKey: 'clientName',
        cell: ({ row }: { row: { original: InvoiceList } }) => (
          <div className="flex items-center gap-2">
            <Image
              src={row.original.clientImage}
              alt="clientImage"
              className="rounded-full shrink-0 size-7"
              width={32}
              height={32}
            />
            <Link href="#!" className="text-current link link-primary grow">
              {row.original.clientName}
            </Link>
          </div>
        ),
      },
      {
        header: 'Country',
        accessorKey: 'country',
      },
      {
        header: 'Invoice Date',
        accessorKey: 'invoiceDate',
      },
      {
        header: 'Due Date',
        accessorKey: 'dueDate',
      },
      {
        header: 'Amount',
        accessorKey: 'totalAmount',
        cell: ({ row }: { row: { original: InvoiceList } }) => {
          const { totalAmount } = row.original
          return (
            <span>${isNaN(totalAmount) ? '0.00' : totalAmount.toFixed(2)}</span>
          )
        },
      },
      {
        header: 'status',
        accessorKey: 'status',
        cell: ({ row }: { row: { original: InvoiceList } }) => {
          const { status } = row.original
          return <span className={getStatusClass(status)}>{status}</span>
        },
      },
      {
        header: 'Action',
        accessorKey: '',
        cell: ({ row }: { row: { original: InvoiceList } }) => (
          <Dropdown
            position="right"
            trigger="click"
            dropdownClassName="dropdown">
            <DropdownButton colorClass="flex items-center text-gray-500 dark:text-dark-500">
              <i className="ri-more-2-fill"></i>
            </DropdownButton>
            <DropdownMenu>
              <Link
                href="#!"
                className="dropdown-item"
                onClick={(e) => {
                  e.preventDefault()
                  handleInvoiceOverview(false, row.original)
                }}>
                <i className="align-middle ltr:mr-2 rtl:ml-2 ri-eye-line"></i>{' '}
                <span>Overview</span>
              </Link>
              <Link
                href="#!"
                className="dropdown-item"
                onClick={(e) => {
                  e.preventDefault()
                  // handleInvoiceOverview(true, row.original);
                }}>
                <i className="align-middle ltr:mr-2 rtl:ml-2 ri-pencil-line"></i>{' '}
                <span>Edit</span>
              </Link>
              <Link
                href="#!"
                className="dropdown-item hover:!text-red-500"
                onClick={(e) => {
                  e.preventDefault()
                  handleDeleteRecord(row.original.id)
                  // handleDeleteRecord(row.original.id);
                }}>
                <i className="align-middle ltr:mr-2 rtl:ml-2 ri-delete-bin-line"></i>
                <span>Delete</span>
              </Link>
            </DropdownMenu>
          </Dropdown>
        ),
      },
    ],
    [deletedListData, selectAll, handleSelectAll, handleInvoiceOverview]
  )

  return (
    <React.Fragment>
      <BreadCrumb title="List View" subTitle="Invoice" />
      <div>
        {/* widgets & status */}
        <div className="grid grid-cols-12 gap-x-space">
          {/* invoice widgets */}
          <Widgets invoices={invoiceList} />

          {/* invoice status chart */}
          <InvoiceStatus invoices={invoiceList} />
        </div>

        {/* invoice header & search */}
        <div className="justify-between md:flex">
          <div>
            <h6 className="mb-1">All Invoices</h6>
            <p className="text-gray-500 dark:text-dark-500">
              Manage your invoice
            </p>
          </div>
          <div>
            <div className="flex items-center gap-5 mt-3 md:mt-0 flex-wrap">
              <div className="relative group/form grow">
                <input
                  type="email"
                  className="ltr:pl-9 rtl:pr-9 form-input ltr:group-[&.right]/form:pr-9 rtl:group-[&.right]/form:pl-9 ltr:group-[&.right]/form:pl-4 rtl:group-[&.right]/form:pr-4"
                  placeholder="Search invoice ..."
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleSearchClient(e.target.value)
                  }
                  value={searchValue}
                />
                <button className="absolute inset-y-0 flex items-center ltr:left-3 rtl:right-3 ltr:group-[&.right]/form:right-3 rtl:group-[&.right]/form:left-3 ltr:group-[&.right]/form:left-auto rtl:group-[&.right]/form:right-auto focus:outline-hidden">
                  <Search className="text-gray-500 dark:text-dark-500 size-4 fill-gray-100 dark:fill-dark-850" />
                </button>
              </div>
              <Link
                href="/apps/invoice/grid"
                className="btn btn-purple btn-icon">
                <LayoutGrid className="size-5" />
              </Link>
              <Link
                href="/apps/invoice/create"
                className="btn btn-primary shrink-0">
                Create Invoice
              </Link>
              {deletedListData.length > 0 && (
                <button
                  className="btn btn-red btn-icon"
                  onClick={handleRemoveSelectedRecords}>
                  <Trash className="inline-block size-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* invoice table */}
        <div>
          {paginatedEvents && (
            <TableContainer
              columns={columns}
              data={paginatedEvents}
              thClass="!font-medium cursor-pointer"
              isSearch={false}
              divClass="overflow-x-auto"
              tableClass="table border-separate hovered flush border-spacing-y-2 whitespace-nowrap"
              tbodyClass=" *:rounded-md"
              PaginationClassName="pagination-container"
              thtrClass="text-gray-500 bg-gray-100 dark:bg-dark-850 dark:text-dark-500"
              isTableFooter={false}
            />
          )}
          {invoiceListData && invoiceListData.length != 0 && (
            <Pagination
              totalItems={invoiceListData.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>

      {/* delete record Modal */}
      {isDeleteModalOpen && (
        <DeleteModal
          show={isDeleteModalOpen}
          handleHide={() => setIsDeleteModalOpen(false)}
          deleteModalFunction={setDeleteRecord}
        />
      )}

      <ToastContainer
        theme={layoutMode}
        rtl={layoutDirection === LAYOUT_DIRECTION.RTL}
        position={
          layoutDirection === LAYOUT_DIRECTION.RTL ? 'top-left' : 'top-right'
        }
      />
    </React.Fragment>
  )
}

export default ListInvoice
