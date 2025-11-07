'use client'

import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { Tab, Tabs } from '@src/components/custom/tabs/tab'
import { NextPageWithLayout } from '@src/dtos'
import ApplicationOverviewTab from '@src/views/Apps/school/studentsAdmission/ApplicationOverviewTab'
import DocumentsTab from '@src/views/Apps/school/studentsAdmission/DocumentsTab'
import EducationalBackground from '@src/views/Apps/school/studentsAdmission/EducationalBackground'
import FeesStructure from '@src/views/Apps/school/studentsAdmission/FeesStructure'
import GuardianDetailsTab from '@src/views/Apps/school/studentsAdmission/GuardianDetailsTab'
import PersonalDetailsTab from '@src/views/Apps/school/studentsAdmission/PersonalDetailsTab'
import { FormProvider, useForm } from 'react-hook-form'

const StudentsAdmission: NextPageWithLayout = () => {
  const methods = useForm()
  const handleNextTab = () => {}
  const handlePreviousTab = () => {}
  const handleSubmit = () => {}

  return (
    <FormProvider {...methods}>
      <React.Fragment>
        <BreadCrumb title="Admission Form" subTitle="Students" />
        <div className="grid grid-cols-12 gap-x-space">
          <div className="col-span-12 xl:col-span-8 2xl:col-span-9">
            <div className="card">
              <div className="card-header">
                <Tabs
                ulProps="overflow-x-auto tabs-pills"
                otherClass="nav-item [&.active]:bg-primary-500 [&.active]:text-primary-50"
                activeTabClass="bg-primary-500 text-primary-50"
                inactiveTabClass="text-gray-500 hover:text-primary-500"
                contentProps="mt-4">
                <Tab label="Personal Details">
                  <PersonalDetailsTab onNextTab={handleNextTab} />
                </Tab>
                <Tab label="Guardian Details">
                  <GuardianDetailsTab />
                </Tab>
                <Tab label="Educational Background">
                  <EducationalBackground
                    onPreviousTab={handlePreviousTab}
                    onNextTab={handleNextTab}
                  />
                </Tab>
                <Tab label="Documents">
                  <DocumentsTab
                    onPreviousTab={handlePreviousTab}
                    onNextTab={handleNextTab}
                    employeeId={null}
                  />
                </Tab>
                <Tab label="Application Overview">
                  <ApplicationOverviewTab
                    onPreviousTab={handlePreviousTab}
                    onSubmit={handleSubmit}
                  />
                </Tab>
              </Tabs>
            </div>
          </div>
        </div>
        <FeesStructure />
      </div>
    </React.Fragment>
    </FormProvider>
  )
}

export default StudentsAdmission
