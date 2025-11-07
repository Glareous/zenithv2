'use client'

import React from 'react'

import Image from 'next/image'
import Link from 'next/link'

import assigin from '@assets/images/dashboards/projects/asssign.png'
import { NextPageWithLayout } from '@src/dtos'

import AnimatedCounter from '../AnalyticsDashboards/Counter'

const AssignProject: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <div className="relative order-5 col-span-12 overflow-hidden md:col-span-6 lg:col-span-12 2xl:col-span-3 card">
        <div className="absolute top-0 ltr:right-0 rtl:left-0 bg-primary-500/20 blur-2xl size-32"></div>
        <Image
          src={assigin}
          alt="assiginImg"
          className="absolute bottom-0 ltr:right-3 rtl:left-3"
        />
        <div className="relative card-body">
          <h6 className="mb-3 card-title">Assign a Project</h6>
          <div className="mb-3">
            <h6>
              <AnimatedCounter start={500} end={311} duration={3000} />+
            </h6>
            <p className="text-gray-500 dark:text-dark-500">Completed Task</p>
          </div>
          <div className="mb-3">
            <h6>
              <AnimatedCounter start={500} end={594} duration={3000} />
            </h6>
            <p className="text-gray-500 dark:text-dark-500">Assigned</p>
          </div>
          <Link href="#!" className="btn btn-primary">
            Start Now
          </Link>
        </div>
      </div>
    </React.Fragment>
  )
}
export default AssignProject
