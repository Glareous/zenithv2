import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import BasicModal from '@src/views/UiElements/Ui-Modal/BasicModal'
import ModalPosition from '@src/views/UiElements/Ui-Modal/ModalPosition'
import SizeModal from '@src/views/UiElements/Ui-Modal/SizeModal'

const Modals: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Modal" subTitle="UI" />
      <div className="grid grid-cols-1 gap-x-space">
        <div className="card">
          <div className="card-header">
            <h6 className="card-title">Basic</h6>
          </div>
          <div className="card-body">
            <BasicModal />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h6 className="card-title">Modal Position</h6>
          </div>
          <div className="card-body">
            <ModalPosition />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h6 className="card-title">Size Modal</h6>
          </div>
          <div className="card-body">
            <SizeModal />
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default Modals
