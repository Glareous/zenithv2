'use client'

import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import ProjectsTabs from '../ProjectsTabs'

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <React.Fragment>
      <BreadCrumb title="Projects" subTitle="Apps" />
      <ProjectsTabs />
      {children}
      <ToastContainer position="top-right" autoClose={3000} />
    </React.Fragment>
  )
}

export default Layout
