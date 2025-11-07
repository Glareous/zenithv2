'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import Pagination from '@src/components/common/Pagination'
import TableContainer from '@src/components/custom/table/table'
import { emailListData } from '@src/data/index'
import { NextPageWithLayout } from '@src/dtos'
// Adjust path as needed
import { Download, Search, Trash } from 'lucide-react'

interface MailPerformances {
  id: number
  emailName: string
  publishDate: string
  sent: string
  clickRate: string
  deliveredRate: string
  spamReport: string
}

const EmailPerformanceTable: NextPageWithLayout = () => {
  const [mailPerformances, setMailPerformances] = useState<MailPerformances[]>(
    []
  )
  const [filterMailPerformances, setFilterMailPerformances] = useState<
    MailPerformances[]
  >([])
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectAll, setSelectAll] = useState<boolean>(false)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [itemsPerPage] = useState<number>(8)
  const [deletedListData, setDeletedListData] = useState<number[]>([])

  useEffect(() => {
    setMailPerformances(emailListData)
  }, [])

  const filteredMailPerformances = useCallback(() => {
    let filtered = [...mailPerformances]
    const searchTermLower = searchTerm.trim().toLowerCase()
    if (searchTermLower) {
      filtered = filtered.filter((MailPerformances) =>
        Object.values(MailPerformances).some((value) =>
          value.toString().toLowerCase().includes(searchTermLower)
        )
      )
    }
    setFilterMailPerformances(filtered)
  }, [searchTerm, mailPerformances])

  useEffect(() => {
    filteredMailPerformances()
  }, [filteredMailPerformances])

  const exportTable = () => {
    let csvContent = 'data:text/csv;charset=utf-8,'
    const headers = Object.keys(mailPerformances[0]).join(',')
    csvContent += headers + '\n'
    mailPerformances.forEach((MailPerformances) => {
      const values = Object.values(MailPerformances).join(',')
      csvContent += values + '\n'
    })
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'mailPerformances.csv')
    document.body.appendChild(link)
    link.click()
  }

  // select all or unselect all
  const handleSelectAll = useCallback(() => {
    if (selectAll) {
      setDeletedListData([])
    } else {
      setDeletedListData(filterMailPerformances.map((customer) => customer.id))
    }
    setSelectAll((prev) => !prev)
  }, [selectAll, filterMailPerformances])
  const handleSelectRecord = (id: number) => {
    setDeletedListData((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }
  const handleRemoveSelectedRecords = () => {
    const filteredMailPerformances = filterMailPerformances.filter(
      (MailPerformances) => !deletedListData.includes(MailPerformances.id)
    )
    setMailPerformances(filteredMailPerformances)
    setDeletedListData([])
    setSelectAll(false)
  }
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
        cell: ({ row }: { row: { original: MailPerformances } }) => (
          <input
            className="input-check input-check-primary"
            type="checkbox"
            checked={deletedListData.includes(row.original.id)}
            onChange={() => handleSelectRecord(row.original.id)}
          />
        ),
      },
      {
        header: 'Title',
        accessorKey: 'emailName',
      },
      {
        header: 'Publish Date',
        accessorKey: 'publishDate',
      },
      {
        header: 'Sent',
        accessorKey: 'sent',
      },
      {
        header: 'Click Rate (%)',
        accessorKey: 'clickRate',
      },
      {
        header: 'Delivered Rate',
        accessorKey: 'deliveredRate',
      },
      {
        header: 'Span Report Rate',
        accessorKey: 'spamReport',
      },
    ],
    [selectAll, deletedListData, handleSelectAll]
  )

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedEvents = filterMailPerformances.slice(
    startIndex,
    startIndex + itemsPerPage
  )

  return (
    <div className="col-span-12 card">
      <div className="grid items-center grid-cols-12 card-header gap-space">
        <div className="col-span-12 lg:col-span-3">
          <h6 className="card-title grow">All Email Performance</h6>
        </div>
        <div className="col-span-12 lg:col-span-4 xl:col-start-9">
          <div className="flex items-center gap-space">
            {deletedListData.length > 0 && (
              <button
                className="btn btn-red btn-icon"
                onClick={handleRemoveSelectedRecords}>
                <Trash className="inline-block size-4" />
              </button>
            )}
            <div className="relative group/form grow">
              <input
                type="text"
                className="ltr:pl-9 rtl:pr-9 form-input ltr:group-[&.right]/form:pr-9 rtl:group-[&.right]/form:pl-9 ltr:group-[&.right]/form:pl-4 rtl:group-[&.right]/form:pr-4"
                placeholder="Search ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="absolute inset-y-0 flex items-center text-gray-500 dark:text-dark-500 ltr:left-3 rtl:right-3 ltr:group-[&.right]/form:right-3 rtl:group-[&.right]/form:left-3 ltr:group-[&.right]/form:left-auto rtl:group-[&.right]/form:right-auto focus:outline-hidden">
                <Search className="size-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={exportTable}
              className="btn btn-primary shrink-0">
              <Download className="inline-block ltr:mr-1 rtl:ml-1 size-4" />{' '}
              Export
            </button>
          </div>
        </div>
      </div>
      <div className="pt-0 card-body">
        <TableContainer
          isSearch={false}
          isPagination={false}
          columns={columns}
          data={paginatedEvents}
          thClass="cursor-pointer !font-medium text-gray-500 bg-gray-100 dark:bg-dark-850 dark:text-dark-500"
          divClass="overflow-x-auto table-box"
          tableClass="table whitespace-nowrap"
          tbodyClass="pt-0"
          thtrClass="*:px-3 *:py-2.5"
          isTableFooter={false}
        />
        {filterMailPerformances.length > 0 && (
          <Pagination
            totalItems={filterMailPerformances.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  )
}

export default EmailPerformanceTable
