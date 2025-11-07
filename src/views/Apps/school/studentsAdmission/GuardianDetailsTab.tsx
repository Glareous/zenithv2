'use client'

import React from 'react'

import { MoveLeft, MoveRight } from 'lucide-react'

const GuardianDetailsTab = () => {
  return (
    <React.Fragment>
      <form action="#!" id="guardianDetailsForm" x-ref="guardianDetailsForm">
        <div className="grid grid-cols-12 gap-space">
          <div className="col-span-12 sm:col-span-4">
            <label htmlFor="fatherNameInput" className="form-label">
              Father Name
            </label>
            <input
              type="text"
              id="fatherNameInput"
              className="form-input"
              placeholder="Enter your father name"
              required
            />
          </div>
          <div className="col-span-12 sm:col-span-4">
            <label htmlFor="montherNameInput" className="form-label">
              Mother Name
            </label>
            <input
              type="text"
              id="montherNameInput"
              className="form-input"
              placeholder="Enter your mother name"
              required
            />
          </div>
          <div className="col-span-12 sm:col-span-4">
            <label htmlFor="otherRelativeNameInput" className="form-label">
              Others Relative Name
            </label>
            <input
              type="text"
              id="otherRelativeNameInput"
              className="form-input"
              placeholder="Enter your relative name"
              required
            />
          </div>
          <div className="col-span-12 sm:col-span-6">
            <label htmlFor="gdmobileNumberInput" className="form-label">
              Mobile Number
            </label>
            <input
              type="number"
              id="gdmobileNumberInput"
              className="form-input"
              placeholder="Enter your mobile number"
              required
            />
          </div>
          <div className="col-span-12 sm:col-span-6">
            <label
              htmlFor="alternativegdMobileNumberInput"
              className="form-label">
              Alternative Mobile Number
            </label>
            <input
              type="number"
              id="alternativegdMobileNumberInput"
              className="form-input"
              placeholder="Enter your mobile number"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-5 ltr:justify-end rtl:justify-start">
          <button type="button" className="btn btn-sub-gray">
            <MoveLeft className="inline-block ltr:mr-1 rtl:ml-1 size-4" />
            Previous
          </button>
          <button type="button" className="btn btn-primary">
            Save to Next{' '}
            <MoveRight className="inline-block ltr:ml-1 rtl:mr-1 size-4" />
          </button>
        </div>
      </form>
    </React.Fragment>
  )
}

export default GuardianDetailsTab
