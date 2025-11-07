'use client'

import React from 'react'

import Button from '@src/components/custom/buttons/button'

const ButtonRounded = () => {
  return (
    <React.Fragment>
      <div className="col-span-12 xl:col-span-6 card">
        <div className="card-header">
          <h6 className="card-title">Rounded Buttons</h6>
        </div>
        <div className="card-body">
          <div className="flex flex-wrap gap-4">
            <Button
              text="Primary"
              custome="btn rounded-full"
              color={'btn-primary'}
            />
            <Button
              text="Primary"
              custome="btn rounded-full"
              color={'btn-sub-primary'}
            />
            <Button
              text="Primary"
              custome="btn rounded-full"
              color={'btn-outline-primary'}
            />
            <Button
              text="Primary"
              custome="btn rounded-full"
              color={'border-dashed btn-dashed-primary'}
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}
export default ButtonRounded
