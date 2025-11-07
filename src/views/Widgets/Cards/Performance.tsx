'use client'

import React from 'react'

import Link from 'next/link'

import { performance } from '@src/data/index'
import 'lucide-react'

const Performance = () => {
  return (
    <React.Fragment>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-space">
        {performance.map((item, index: number) => (
          <div className="card" key={index}>
            <div className="flex items-center gap-3 card-header">
              <h6 className="card-title grow">{item.title}</h6>
              <Link href="#!" className={item.badge.className}>
                <item.badge.icon
                  className={`inline-block ${item.badge.iconSize}`}
                />
                {item.badge.text}
              </Link>
            </div>
            <div className="card-body">
              <p className="mb-2 text-sm text-gray-500 dark:text-dark-500">
                {item.content.subtitle}
              </p>
              <div className="flex items-center gap-2">
                <h5>{item.content.value}</h5>
                <item.content.trendIcon
                  className={`size-5 ${item.content.trendIconColor}`}
                />
                {item.content.trendDescription}
              </div>
            </div>
          </div>
        ))}
      </div>
    </React.Fragment>
  )
}

export default Performance
