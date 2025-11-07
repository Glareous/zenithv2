'use client'

import React from 'react'

import Link from 'next/link'

import { coloredCard } from '@src/data/index'
import { SquareArrowOutUpRight } from 'lucide-react'

const ColoredCard = () => {
  return (
    <React.Fragment>
      {coloredCard.map((item, index) => {
        return (
          <div key={index} className={`col-span-12 ${item.bodercolor}`}>
            <div className="card-body">
              <h6 className="mb-2">{item.label}</h6>
              <p className="mb-3 text-gray-500 dark:text-dark-500">
                {item.description}
              </p>
              <Link
                href="#"
                className={`inline-flex items-center gap-2 font-medium ${item.guidelinecolor}`}>
                {item.guideline}
                <SquareArrowOutUpRight className="size-4" />
              </Link>
            </div>
          </div>
        )
      })}
    </React.Fragment>
  )
}
export default ColoredCard
