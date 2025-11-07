'use client'

import React from 'react'

import Button from '@src/components/custom/buttons/button'

const DisabledButtons = () => {
  return (
    <React.Fragment>
      <div className="col-span-12 xl:col-span-6 card">
        <div className="card-header">
          <h6 className="card-title">Disabled Buttons</h6>
        </div>
        <div className="card-body">
          <div className="flex flex-wrap gap-4">
            <Button
              text="Disabled"
              custome="btn"
              color={'btn-primary'}
              disabled={true}
            />
            <Button
              text="Disabled"
              custome="btn"
              color={'btn-sub-primary'}
              disabled={true}
            />
            <Button
              text="Disabled"
              custome="btn"
              color={'btn-outline-primary'}
              disabled={true}
            />
            <Button
              text="Disabled"
              custome="border-dashed btn"
              color={'btn-dashed-primary'}
              disabled={true}
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}
export default DisabledButtons
