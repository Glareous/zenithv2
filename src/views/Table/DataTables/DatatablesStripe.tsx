'use client'

import React, { useMemo } from 'react'

import TableContainer from '@src/components/custom/table/table'
import { EmployData } from '@src/data/dataTables/employe-data'

const BasicTable: React.FC = () => {
  const columns = useMemo(
    () => [
      { accessorKey: 'Name', header: 'Name' },
      { accessorKey: 'Position', header: 'Position' },
      { accessorKey: 'Office', header: 'Office' },
      { accessorKey: 'Age', header: 'Age' },
      { accessorKey: 'StartDate', header: 'Start date' },
      { accessorKey: 'Salary', header: 'Salary' },
    ],
    []
  )

  return (
    <>
      <div className="table-container">
        <TableContainer
          columns={columns}
          data={EmployData}
          divClass="overflow-x-auto"
          tableClass="display group even-striped dataTable table whitespace-nowrap dtr-inline"
          PaginationClassName="pagination-container"
          isPagination={true}
          thtrClass="bg-gray-100 dark:bg-dark-850 dt-orderable-asc dt-orderable-desc dt-ordering-desc"
          isTableFooter={true}
          classStyle="100%"
          isSearch={true}
        />
      </div>
    </>
  )
}

export default BasicTable
