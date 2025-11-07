'use client'

import React, { useMemo, useState } from 'react'

import { EmployData } from '@src/data/dataTables/employe-data'

const DataTableEnableDisable: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredData, setFilteredData] = useState(EmployData)

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase()
    setSearchQuery(query)

    const filtered = EmployData.filter((item) =>
      Object.values(item).some((value) =>
        value.toString().toLowerCase().includes(query)
      )
    )
    setFilteredData(filtered)
  }

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
      <div className="overflow-x-auto">
        <div
          id="example_wrapper"
          className="dt-container dt-tailwindcss flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
            <div className="md:col-start-2 justify-self-center md:justify-self-end">
              <div className="dt-search">
                <label htmlFor="dt-search-0">Search:</label>
                <input
                  type="search"
                  value={searchQuery}
                  className="form-input inline-block w-auto ltr:ml-2 rtl:mr-2"
                  id="dt-search-0"
                  placeholder=""
                  aria-controls="example"
                  onChange={handleSearch}
                />
              </div>
            </div>
          </div>

          <table
            id="example"
            className="display group table whitespace-nowrap dtr-inline"
            style={{ width: '100%' }}>
            <thead>
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className="bg-gray-100 dark:bg-dark-850 dt-orderable-none">
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => {
                return (
                  <tr key={index}>
                    <td>{item.Name}</td>
                    <td>{item.Position}</td>
                    <td>{item.Office}</td>
                    <td>{item.Age}</td>
                    <td>{item.StartDate}</td>
                    <td>{item.Salary}</td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr>
                <th>Name</th>
                <th>Position</th>
                <th>Office</th>
                <th>Age</th>
                <th>Start date</th>
                <th>Salary</th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </>
  )
}

export default DataTableEnableDisable
