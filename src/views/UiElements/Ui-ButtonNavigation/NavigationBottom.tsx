'use client'

import React from 'react'

import Link from 'next/link'

import { ChartColumnBig, House, Settings, Zap } from 'lucide-react'

const NavigationBottom = () => {
  return (
    <React.Fragment>
      <div className="grid grid-cols-1 gap-space lg:grid-cols-2">
        <div className="btn-navigation">
          <Link href="#!" className="navigation-primary">
            <House className="mx-auto" />
          </Link>
          <Link href="#!" className="navigation-primary active">
            <Zap className="mx-auto" />
          </Link>
          <Link href="#!" className="navigation-primary">
            <ChartColumnBig className="mx-auto" />
          </Link>
          <Link href="#!" className="navigation-primary">
            <Settings className="mx-auto" />
          </Link>
        </div>
      </div>
    </React.Fragment>
  )
}
export default NavigationBottom
