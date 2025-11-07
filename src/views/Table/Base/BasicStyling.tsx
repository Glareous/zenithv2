'use client'

import React, { useState } from 'react'

import { BasicStylingData } from '@src/data/table'
import { DataItem } from '@src/dtos/table'
import { AlertTriangle, CheckCircle, Eye, Trash2 } from 'lucide-react'

const BasicStyling: React.FC = () => {
  const [data, setData] = useState<DataItem[]>(BasicStylingData)

  const handleDelete = (index: number) => {
    setData(data.filter((_, i) => i !== index))
  }

  return (
    <div className="col-span-12 card">
      <div className="card-header">
        <h6 className="card-title">Basic Styling</h6>
      </div>
      <div className="card-body">
        <div className="overflow-x-auto">
          <table className="table flush">
            <thead>
              <tr>
                <th>Transition ID</th>
                <th>Customer Name</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index} className="*:px-3 *:py-2.5">
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>{item.date}</td>
                  <td>
                    <span
                      className={`badge inline-flex items-center gap-1 ${
                        item.status === 'Completed'
                          ? 'badge-green'
                          : 'badge-yellow'
                      }`}>
                      {item.status === 'Pending' ? (
                        <AlertTriangle size={14} />
                      ) : (
                        <CheckCircle size={14} />
                      )}
                      {item.status}
                    </span>
                  </td>{' '}
                  <td>{item.amount}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <a
                        href="#!"
                        className="btn btn-icon !size-8 btn-sub-primary">
                        {' '}
                        <Eye className="size-3.5" />
                      </a>
                      <a
                        href="#!"
                        className="btn btn-icon !size-8 btn-sub-red"
                        onClick={() => handleDelete(index)}>
                        <Trash2 className="size-3.5" />
                      </a>
                    </div>{' '}
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

export default BasicStyling
