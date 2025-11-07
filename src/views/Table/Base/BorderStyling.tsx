'use client'

import React, { useState } from 'react'

import Link from 'next/link'

import { BorderData } from '@src/data/table'

interface DataItem {
  name: string
  age: number
  date: string
  address: string
  salary: string
}

const BorderStyling: React.FC = () => {
  const [data, setData] = useState<DataItem[]>(BorderData)

  const handleDelete = (index: number) => {
    setData(data.filter((_, i) => i !== index))
  }

  return (
    <div className="col-span-12 card">
      <div className="card-header">
        <h6 className="card-title">Border Styling</h6>
      </div>
      <div className="card-body">
        <div className="overflow-x-auto">
          <table className="table">
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
                      className="btn btn-sm btn-sub-red "
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

export default BorderStyling
