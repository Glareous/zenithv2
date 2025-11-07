import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import BaseDropdown from '@src/views/UiElements/Ui-Dropdown/BaseDropdown'
import ColoredDropdown from '@src/views/UiElements/Ui-Dropdown/ColoredDropdown'
import PositionDropdown from '@src/views/UiElements/Ui-Dropdown/PositionDropdown'
import ProfileDropdown from '@src/views/UiElements/Ui-Dropdown/ProfileDropdown'

const Dropdowns: NextPageWithLayout = () => {
  const data = [
    {
      id: 1,
      text: 'New Task',
      textColor: 'dropdown-primary',
      spantextColor: '',
    },
    {
      id: 2,
      text: 'Edit Task',
      textColor: 'dropdown-primary',
      spantextColor: '',
    },
    {
      id: 3,
      text: 'Delete Task',
      textColor: 'dropdown-primary',
      spantextColor: 'text-red-500',
    },
  ]

  return (
    <React.Fragment>
      <BreadCrumb title="Dropdown" subTitle="UI" />
      {/* ============================BaseDropdown========================= */}

      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Base Dropdown</h6>
          </div>
          <div className="card-body">
            <div className="flex flex-wrap items-center gap-4">
              <BaseDropdown data={data} />
            </div>
          </div>
        </div>
        {/* ================Position Dropdown============== */}

        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Position Dropdown</h6>
          </div>
          <div className="card-body">
            <div className="flex flex-wrap items-center gap-4">
              <PositionDropdown data={data} />
            </div>
          </div>
        </div>

        {/* =======================ColoredDropdown==================== */}

        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Colored Dropdown</h6>
          </div>
          <div className="card-body">
            <div className="flex flex-wrap items-center gap-4">
              <ColoredDropdown data={data} />
            </div>
          </div>
        </div>

        {/* =====================================Profile================================ */}

        <div className="col-span-12 card">
          <div className="card-header">
            <h6 className="card-title">Profile Dropdown</h6>
          </div>
          <div className="card-body">
            <div className="flex flex-wrap items-center gap-4">
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default Dropdowns
