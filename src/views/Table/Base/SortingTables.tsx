'use client'

import React, { useCallback, useState } from 'react'

import { BorderSpacing } from '@src/data/table'
import { BorderDataItem } from '@src/dtos/table'

const SortingTables: React.FC = () => {
  const [data, setData] = useState<BorderDataItem[]>(BorderSpacing)

  const [sortColumn, setSortColumn] = useState<keyof BorderDataItem>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [editableIndex, setEditableIndex] = useState<number | null>(null)

  // Function to handle sorting
  const sortData = useCallback(() => {
    const sortedData = [...data].sort((a, b) => {
      const aValue = a[sortColumn]
      const bValue = b[sortColumn]

      // Ensure aValue and bValue are strings for comparison
      const aVal = aValue !== undefined ? String(aValue) : ''
      const bVal = bValue !== undefined ? String(bValue) : ''

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
    return sortedData
  }, [data, sortColumn, sortDirection])

  const sortedData = sortData()

  // Handle sorting by column
  const handleSort = (column: keyof BorderDataItem) => {
    setSortColumn(column)
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
  }

  // Handle editing and saving data
  const handleEditToggle = (index: number) => {
    setEditableIndex(editableIndex === index ? null : index)
  }

  const handleUpdateValue = (
    index: number,
    field: keyof BorderDataItem,
    value: string
  ) => {
    const updatedData = [...data]
    updatedData[index] = { ...updatedData[index], [field]: value }
    setData(updatedData)
  }

  // Remove item
  const handleRemove = (index: number) => {
    const updatedData = data.filter((_, i) => i !== index)
    setData(updatedData)
  }

  return (
    <div className="col-span-12 card">
      <div className="card-header">
        <h6 className="card-title">Sorting Tables</h6>
      </div>
      <div className="card-body">
        <div className="overflow-x-auto">
          <table className="table">
            <tbody>
              <tr className="cursor-pointer">
                <th onClick={() => handleSort('name')}>
                  <span className="align-middle">Name</span>
                  <i
                    className={`inline-block text-gray-500 dark:text-dark-500 size-4 ${sortColumn === 'name' ? (sortDirection === 'asc' ? 'icon-sort-asc' : 'icon-sort-desc') : ''}`}></i>
                </th>
                <th onClick={() => handleSort('age')}>
                  <span className="align-middle">Age</span>
                  <i
                    className={`inline-block text-gray-500 dark:text-dark-500 size-4 ${sortColumn === 'age' ? (sortDirection === 'asc' ? 'icon-sort-asc' : 'icon-sort-desc') : ''}`}></i>
                </th>
                <th onClick={() => handleSort('date')}>
                  <span className="align-middle">Date</span>
                  <i
                    className={`inline-block text-gray-500 dark:text-dark-500 size-4 ${sortColumn === 'date' ? (sortDirection === 'asc' ? 'icon-sort-asc' : 'icon-sort-desc') : ''}`}></i>
                </th>
                <th onClick={() => handleSort('address')}>
                  <span className="align-middle">Address</span>
                  <i
                    className={`inline-block text-gray-500 dark:text-dark-500 size-4 ${sortColumn === 'address' ? (sortDirection === 'asc' ? 'icon-sort-asc' : 'icon-sort-desc') : ''}`}></i>
                </th>
                <th onClick={() => handleSort('salary')}>
                  <span className="align-middle">Salary</span>
                  <i
                    className={`inline-block text-gray-500 dark:text-dark-500 size-4 ${sortColumn === 'salary' ? (sortDirection === 'asc' ? 'icon-sort-asc' : 'icon-sort-desc') : ''}`}></i>
                </th>
                <th>Action</th>
              </tr>
              {sortedData.length > 0 ? (
                sortedData.map((item, index) => (
                  <tr key={index}>
                    <td
                      contentEditable={
                        editableIndex === index ? 'true' : 'false'
                      }
                      suppressContentEditableWarning
                      onInput={(e) =>
                        handleUpdateValue(
                          index,
                          'name',
                          e.currentTarget.textContent || ''
                        )
                      }>
                      {item.name}
                    </td>
                    <td
                      contentEditable={
                        editableIndex === index ? 'true' : 'false'
                      }
                      suppressContentEditableWarning
                      onInput={(e) =>
                        handleUpdateValue(
                          index,
                          'age',
                          e.currentTarget.textContent || ''
                        )
                      }>
                      {item.age}
                    </td>
                    <td
                      contentEditable={
                        editableIndex === index ? 'true' : 'false'
                      }
                      suppressContentEditableWarning
                      onInput={(e) =>
                        handleUpdateValue(
                          index,
                          'date',
                          e.currentTarget.textContent || ''
                        )
                      }>
                      {item.date}
                    </td>
                    <td
                      contentEditable={
                        editableIndex === index ? 'true' : 'false'
                      }
                      suppressContentEditableWarning
                      onInput={(e) =>
                        handleUpdateValue(
                          index,
                          'address',
                          e.currentTarget.textContent || ''
                        )
                      }>
                      {item.address}
                    </td>
                    <td
                      contentEditable={
                        editableIndex === index ? 'true' : 'false'
                      }
                      suppressContentEditableWarning
                      onInput={(e) =>
                        handleUpdateValue(
                          index,
                          'salary',
                          e.currentTarget.textContent || ''
                        )
                      }>
                      {item.salary}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditToggle(index)}
                          className="text-primary-500">
                          {editableIndex === index ? 'Save' : 'Edit'}
                        </button>
                        <button
                          onClick={() => handleRemove(index)}
                          className="text-red-500">
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="p-5 text-center text-gray-500 dark:text-dark-500">
                    No data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default SortingTables
