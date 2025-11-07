'use client'

import BreadCrumb from '@src/components/common/BreadCrumb'
import AppointmentRequest from '@src/views/Dashboards/HospitalDashboard/AppointmentRequest'
import BirthAndDeathAnalytics from '@src/views/Dashboards/HospitalDashboard/BirthAndDeathAnalytics'
import PatientData from '@src/views/Dashboards/HospitalDashboard/PatientData'
import PatientVisitDepartment from '@src/views/Dashboards/HospitalDashboard/PatientVisitDepartment'
import PatientsData from '@src/views/Dashboards/HospitalDashboard/PatientsData'
import PatientsHistory from '@src/views/Dashboards/HospitalDashboard/PatientsHistory'
import RoomsAnalytics from '@src/views/Dashboards/HospitalDashboard/RoomsAnalytics'
import SummaryTreatment from '@src/views/Dashboards/HospitalDashboard/SummaryTreatment'
import UpcomingConsultation from '@src/views/Dashboards/HospitalDashboard/UpcomingConsultation'

const Hospital = () => {
  return (
    <>
      <BreadCrumb title={'Hospital'} subTitle={'Dashboards'} />
      <div className="grid grid-cols-12 gap-x-space">
        <PatientData />
        <PatientVisitDepartment />
        <AppointmentRequest />
        <PatientsHistory />
        <UpcomingConsultation />
        <BirthAndDeathAnalytics />
        <RoomsAnalytics />
        <SummaryTreatment />
        <PatientsData />
      </div>
    </>
  )
}

export default Hospital
