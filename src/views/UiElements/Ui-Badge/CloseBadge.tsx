'use client'

import React, { useState } from 'react'

import Link from 'next/link'

interface Badge {
  text: string
  color: string
}

const CloseBadge: React.FC = () => {
  const [softBadge, setSoftBadge] = useState<Badge[]>([
    { text: 'Primary', color: 'btn-sub-primary' },
    { text: 'Purple', color: 'btn-sub-purple' },
    { text: 'Green', color: 'btn-sub-green' },
    { text: 'Red', color: 'btn-sub-red' },
    { text: 'Yellow', color: 'btn-sub-yellow' },
    { text: 'Sky', color: 'btn-sub-sky' },
    { text: 'Pink', color: 'btn-sub-pink' },
    {
      text: 'Dark',
      color:
        'bg-gray-200 text-gray-800 border-gray-200 dark:border-dark-800 dark:text-dark-50 dark:bg-dark-850',
    },
    { text: 'Light', color: 'btn-sub-gray' },
  ])

  const removeBadge = (index: number) => {
    setSoftBadge((prevBadges) => prevBadges.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex flex-wrap gap-4">
        {softBadge.map((badge, index) => (
          <span
            key={index}
            className={`${badge.color} badge flex items-center`}>
            {badge.text}
            <Link href="#!" onClick={() => removeBadge(index)}>
              <i className="ml-1 align-middle ri-close-fill"></i>
            </Link>
          </span>
        ))}
      </div>
    </div>
  )
}

export default CloseBadge
