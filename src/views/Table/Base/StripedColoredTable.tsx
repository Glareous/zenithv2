'use client'

import React, { useState } from 'react'

import Link from 'next/link'

import { BorderSpacing } from '@src/data/table'
import { BorderDataItem } from '@src/dtos/table'

const StripedColoredTable: React.FC = () => {
  const [data, setData] = useState<BorderDataItem[]>(BorderSpacing)

  const handleDelete = (index: number) => {
    setData(data.filter((_, i) => i !== index))
  }

  return (
    <div className="col-span-12 card">
      <div className="card-header">
        <h6 className="card-title">Striped Colored Table</h6>
      </div>
      <div className="card-body">
        <div className="overflow-x-auto">
          <table className="table odd-striped">
            <tbody>
              <tr className="!bg-white dark:!bg-dark-900">
                <th>Name</th>
                <th>Age</th>
                <th>Date</th>
                <th>Address</th>
                <th>Salary</th>
                <th>Action</th>
              </tr>
              {data.map((item, index) => (
                <tr
                  key={index}
                  className={'odd:!bg-purple-50 dark:odd:!bg-purple-500/10'}>
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

export default StripedColoredTable
