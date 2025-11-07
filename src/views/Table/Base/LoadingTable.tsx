'use client'

import React, { useEffect, useState } from 'react'

import Link from 'next/link'

import { BorderSpacing } from '@src/data/table'
import { BorderDataItem } from '@src/dtos/table'

const LoadingTable: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<BorderDataItem[]>([])

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
      setRows(BorderSpacing)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="col-span-12 card">
      <div className="card-header">
        <h6 className="card-title">Loading Table</h6>
      </div>
      <div className="card-body">
        <div
          className="flex items-center justify-center w-full h-64"
          style={{ display: loading ? 'flex' : 'none' }}>
          <div className="relative">
            <div className="border-t-4 border-b-4 border-gray-200 rounded-full dark:border-dark-800 size-8"></div>
            <div className="absolute top-0 left-0 border-t-4 border-b-4 rounded-full border-primary-500 size-8 animate-spin"></div>
          </div>
        </div>

        <div
          className="overflow-x-auto"
          style={{ display: loading ? 'none' : 'block' }}>
          <table className="table even-striped">
            <tbody>
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>Date</th>
                <th>Address</th>
                <th>Salary</th>
                <th>Action</th>
              </tr>
              {rows.map((row) => (
                <tr key={row.name}>
                  <td>{row.name}</td>
                  <td>{row.age}</td>
                  <td>{row.date}</td>
                  <td>{row.address}</td>
                  <td>{row.salary}</td>
                  <td>
                    <Link href="#!" className="text-red-500">
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

export default LoadingTable
