'use client'

import React, { useEffect, useMemo, useState } from 'react'

import TableContainer from '@src/components/custom/table/table'
import { EmployData } from '@src/data/dataTables/employe-data'

interface GroupedRow {
  groupTitle?: string
  Name?: string
  Position?: string
  Office?: string
  Age?: number
  StartDate?: string
  Salary?: string
}

const DatatablesRowGrouping: React.FC = () => {
  const [groupedData, setGroupedData] = useState<GroupedRow[]>([])

  const columns = useMemo(
    () => [
      { accessorKey: 'Name', header: 'Name' },
      { accessorKey: 'Position', header: 'Position' },
      { accessorKey: 'Age', header: 'Age' },
      { accessorKey: 'StartDate', header: 'Start date' },
      { accessorKey: 'Salary', header: 'Salary' },
    ],
    []
  )

  useEffect(() => {
    const groupBy = (array: GroupedRow[], key: keyof GroupedRow) => {
      return array.reduce(
        (result: Record<string, GroupedRow[]>, currentValue) => {
          const groupKey = currentValue[key] as string | undefined
          if (groupKey) {
            if (!result[groupKey]) {
              result[groupKey] = []
            }
            result[groupKey].push(currentValue)
          }
          return result
        },
        {}
      )
    }

    const grouped = groupBy(EmployData, 'Office')

    const groupedRows: GroupedRow[] = []
    Object.keys(grouped).forEach((groupKey) => {
      groupedRows.push({
        Name: groupKey,
      })
      groupedRows.push(
        ...grouped[groupKey].map((item: GroupedRow) => ({
          ...item,
        }))
      )
    })

    setGroupedData(groupedRows)
  }, [])

  return (
    <React.Fragment>
      <div className="table-container">
        <TableContainer
          columns={columns}
          data={groupedData}
          divClass="overflow-x-auto"
          tableClass="display table whitespace-nowrap dtr-inline"
          isPagination={true}
          PaginationClassName="pagination-container"
          thtrClass="bg-gray-100 dark:bg-dark-850 dt-orderable-asc dt-orderable-desc dt-ordering-desc"
          trClass={`${groupedData.map((item) =>
            Object.keys(item).length === 0
              ? 'group bg-gray-50 border-y' // Group header class
              : ''
          )}`}
          isSearch={true}
          classStyle="100%"
        />
      </div>
    </React.Fragment>
  )
}

export default DatatablesRowGrouping
