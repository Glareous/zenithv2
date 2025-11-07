'use client'

import React from 'react'

// Define a TypeScript interface for badge data
interface Badge {
  text: string
  color: string
}

const RoundedBadge: React.FC = () => {
  const roundedBadgeData: Badge[] = [
    { text: 'Primary', color: 'badge-solid-primary' },
    { text: 'Purple', color: 'badge-sub-purple' },
    { text: 'Green', color: 'badge-outline-green' },
    { text: 'Red', color: 'badge-sub-red' },
  ]

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex flex-wrap gap-4">
        {roundedBadgeData.map((badge, index) => (
          <span
            key={index}
            className={`${badge.color} inline-block px-1.5 py-0.5 rounded-full text-11 border font-medium `}>
            {badge.text}
          </span>
        ))}
      </div>
    </div>
  )
}

export default RoundedBadge
