'use client'

import React, { useState } from 'react'

import Link from 'next/link'

import { BorderSpacing } from '@src/data/table'
import { BorderDataItem } from '@src/dtos/table'

const HeadingLightTable: React.FC = () => {
  const [data, setData] = useState<BorderDataItem[]>(BorderSpacing)

  const handleDelete = (index: number) => {
    setData(data.filter((_, i) => i !== index))
  }

  return (
    <div className="col-span-12 card">
      <div className="card-header">
        <h6 className="card-title">Heading Light</h6>
      </div>
      <div className="card-body">
        <div className="overflow-x-auto">
          <table className="table flush">
            <thead>
              <tr className="bg-gray-100 dark:bg-dark-850">
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

export default HeadingLightTable
