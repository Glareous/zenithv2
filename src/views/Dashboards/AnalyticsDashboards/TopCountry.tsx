'use client'

import React, { useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'

import de from '@assets/images/flag/de.svg'
import it from '@assets/images/flag/it.svg'
import us from '@assets/images/flag/us.svg'
import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
} from '@src/components/custom/dropdown/dropdown'
import { NextPageWithLayout } from '@src/dtos'
import { Ellipsis } from 'lucide-react'

import AnimatedCounter from './Counter'

type Period = 'Weekly' | 'Monthly' | 'Yearly'

const dataByPeriod: Record<
  Period,
  {
    visits: number
    percentageChange: number
    countries: { US: number; Germany: number; Italy: number }
  }
> = {
  Weekly: {
    visits: 3145,
    percentageChange: 3.87,
    countries: {
      US: 24,
      Germany: 17,
      Italy: 16,
    },
  },
  Monthly: {
    visits: 10500,
    percentageChange: 5.12,
    countries: {
      US: 28,
      Germany: 20,
      Italy: 18,
    },
  },
  Yearly: {
    visits: 120000,
    percentageChange: 8.45,
    countries: {
      US: 30,
      Germany: 22,
      Italy: 20,
    },
  },
}

const TopCountry: NextPageWithLayout = () => {
  const [currentPeriod, setCurrentPeriod] = useState<Period>('Weekly')
  const currentData = dataByPeriod[currentPeriod]

  return (
    <React.Fragment>
      <div className="col-span-12 md:col-span-6 2xl:col-span-3 card">
        <div className="flex items-center gap-3 card-header">
          <h6 className="card-title grow">Top Countries</h6>
          <Dropdown
            position="right"
            trigger="click"
            dropdownClassName="dropdown">
            <DropdownButton colorClass="flex items-center text-gray-500 dark:text-dark-500">
              <Ellipsis className="size-5" />
            </DropdownButton>
            <DropdownMenu>
              {(['Weekly', 'Monthly', 'Yearly'] as Period[]).map((period) => (
                <Link
                  href="#!"
                  key={period}
                  className="dropdown-item"
                  onClick={() => setCurrentPeriod(period)}>
                  <span>{period}</span>
                </Link>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>

        <div className="card-body">
          <p className="text-gray-500 dark:text-dark-500">
            Visits ({currentPeriod})
          </p>
          <h5 className="mb-2">
            <AnimatedCounter
              start={500}
              end={currentData.visits}
              duration={3000}
            />
            +
            <span className="text-xs text-green-500">
              <i className="align-baseline ri-arrow-up-line"></i>{' '}
              {currentData.percentageChange}%
            </span>
          </h5>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Image
                src={us}
                alt="US Flag"
                className="object-cover rounded-full size-5 shrink-0"
              />
              <h6 className="grow">United States</h6>
              <p className="shrink-0">{currentData.countries.US}%</p>
            </div>
            <div className="flex items-center gap-2">
              <Image
                src={de}
                alt="Germany Flag"
                className="object-cover rounded-full size-5 shrink-0"
              />
              <h6 className="grow">Germany</h6>
              <p className="shrink-0">{currentData.countries.Germany}%</p>
            </div>
            <div className="flex items-center gap-2">
              <Image
                src={it}
                alt="Italy Flag"
                className="object-cover rounded-full size-5 shrink-0"
              />
              <h6 className="grow">Italy</h6>
              <p className="shrink-0">{currentData.countries.Italy}%</p>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default TopCountry
