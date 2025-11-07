import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import ClientInformation from '@src/views/Widgets/Cards/ClientInformation'
import Employee from '@src/views/Widgets/Cards/Employee'
import Facility from '@src/views/Widgets/Cards/Facility'
import InChargeDoctor from '@src/views/Widgets/Cards/InChargeDoctor'
import Information from '@src/views/Widgets/Cards/Information'
import InternsDoctors from '@src/views/Widgets/Cards/InternsDoctors'
import PatientsList from '@src/views/Widgets/Cards/Patients'
import Performance from '@src/views/Widgets/Cards/Performance'
import Schedule from '@src/views/Widgets/Cards/Schedule'
import Widgtes from '@src/views/Widgets/Cards/widgtes'

const WidgetsCard: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Cards" subTitle="Widgets" />
      <Information />
      <Facility />
      <ClientInformation />
      <Widgtes />
      <Performance />
      <Employee />
      <div className="grid grid-cols-12 gap-x-space">
        <Schedule />
        <InChargeDoctor />
        <PatientsList />
        <InternsDoctors />
      </div>
    </React.Fragment>
  )
}

export default WidgetsCard
