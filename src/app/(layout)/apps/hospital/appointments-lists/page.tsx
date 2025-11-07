'use client'

import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { LAYOUT_DIRECTION } from '@src/components/constants/layout'
import { NextPageWithLayout } from '@src/dtos'
import { RootState } from '@src/slices/reducer'
import AppointmentsInformation from '@src/views/Apps/hospital/appointmentsLists/AppointmentsInformation'
import AppointmentsList from '@src/views/Apps/hospital/appointmentsLists/AppointmentsList'
import TodayAppointments from '@src/views/Apps/hospital/appointmentsLists/TodayAppointments'
import { useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify'

const AppointmentsLists: NextPageWithLayout = () => {
  const { layoutMode, layoutDirection } = useSelector(
    (state: RootState) => state.Layout
  )

  return (
    <React.Fragment>
      <BreadCrumb title="List View" subTitle="Appointments" />
      <AppointmentsInformation />
      <TodayAppointments />
      <AppointmentsList />

      <ToastContainer
        theme={layoutMode}
        rtl={layoutDirection === LAYOUT_DIRECTION.RTL}
        position={
          layoutDirection === LAYOUT_DIRECTION.RTL ? 'top-left' : 'top-right'
        }
      />
    </React.Fragment>
  )
}

export default AppointmentsLists
