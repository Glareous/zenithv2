'use client'

import React, { useState } from 'react'

import Link from 'next/link'

import { SeparateTableData } from '@src/data/table'
import { BorderDataItem } from '@src/dtos/table'

const SeparateTable: React.FC = () => {
  const [data, setData] = useState<BorderDataItem[]>(SeparateTableData)
  const handleDelete = (index: number) => {
    setData(data.filter((_, i) => i !== index))
  }
  return (
    <div className="col-span-12 card">
      <div className="card-header">
        <h6 className="card-title">Separate Table</h6>
      </div>
      <div className="card-body">
        <p className="mb-2 text-gray-500">
          Use border-separate to force each cell to display its own separate
          borders.
        </p>
        <div className="overflow-x-auto">
          <table className="table border-separate border-spacing-2 whitespace-nowrap bordered">
            <thead>
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>Date</th>
                <th>Address</th>
                <th>Salary</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.age}</td>
                  <td>{item.date}</td>
                  <td>{item.address}</td>
                  <td>{item.salary}</td>
                  <td>
                    <Link
                      href="#!"
                      className="text-red-500"
                      onClick={() => handleDelete(index)}>
                      Delete
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default SeparateTable
