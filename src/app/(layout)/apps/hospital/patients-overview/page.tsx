'use client'

import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { LAYOUT_DIRECTION } from '@src/components/constants/layout'
import { NextPageWithLayout } from '@src/dtos'
import { RootState } from '@src/slices/reducer'
import AppointmentsHistory from '@src/views/Apps/hospital/patientsOverview/AppointmentsHistory'
import InsuranceOverview from '@src/views/Apps/hospital/patientsOverview/InsuranceOverview'
import MedicineHistory from '@src/views/Apps/hospital/patientsOverview/MedicineHistory'
import Overview from '@src/views/Apps/hospital/patientsOverview/Overview'
import Timeline from '@src/views/Apps/hospital/patientsOverview/Timeline'
import Reports from '@src/views/Apps/hospital/patientsOverview/reports'
import { useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify'

const PatientsOverview: NextPageWithLayout = () => {
  const { layoutMode, layoutDirection } = useSelector(
    (state: RootState) => state.Layout
  )

  return (
    <React.Fragment>
      <BreadCrumb title="Overview" subTitle="Patients" />
      <div className="grid grid-cols-12 gap-x-space">
        <Overview />
        <Timeline />
        <InsuranceOverview />
        <Reports />
        <MedicineHistory />
        <AppointmentsHistory />
        <ToastContainer
          theme={layoutMode}
          rtl={layoutDirection === LAYOUT_DIRECTION.RTL}
          position={
            layoutDirection === LAYOUT_DIRECTION.RTL ? 'top-left' : 'top-right'
          }
        />
      </div>
    </React.Fragment>
  )
}

export default PatientsOverview
