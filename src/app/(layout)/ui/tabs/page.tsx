import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import AnimationTabs from '@src/views/UiElements/Ui-Tabs/AnimationTabs'
import BasicJustifiyTab from '@src/views/UiElements/Ui-Tabs/BasicJustifyTab'
import BasicTab from '@src/views/UiElements/Ui-Tabs/BasicTab'
import IconTabs from '@src/views/UiElements/Ui-Tabs/IconTabs'
import IconwithTextTabs from '@src/views/UiElements/Ui-Tabs/IconwithTextTabs'
import PillJustifyTabs from '@src/views/UiElements/Ui-Tabs/PillJustifyTabs'
import PillTabs from '@src/views/UiElements/Ui-Tabs/PillTabs'

const Tabs: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Tabs" subTitle="UI" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 md:col-span-6">
          <div className="card">
            <div className="card-header">
              <h6 className="card-title">Basic</h6>
            </div>
            <div className="card-body">
              <BasicTab />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6">
          <div className="card">
            <div className="card-header">
              <h6 className="card-title">Basic Justify</h6>
            </div>
            <div className="card-body">
              <BasicJustifiyTab />
            </div>
          </div>
        </div>

        <div className="col-span-12 md:col-span-6">
          <div className="card">
            <div className="card-header">
              <h6 className="card-title">Pill Tabs</h6>
            </div>
            <div className="card-body">
              <PillTabs />
            </div>
          </div>
        </div>

        <div className="col-span-12 md:col-span-6">
          <div className="card">
            <div className="card-header">
              <h6 className="card-title">Pill Justify Tabs</h6>
            </div>
            <div className="card-body">
              <PillJustifyTabs />
            </div>
          </div>
        </div>

        <div className="col-span-12 md:col-span-6">
          <div className="card">
            <div className="card-header">
              <h6 className="card-title">Icon with Animation Tabs</h6>
            </div>
            <div className="card-body">
              <IconTabs />
            </div>
          </div>
        </div>

        <div className="col-span-12 md:col-span-6">
          <div className="card">
            <div className="card-header">
              <h6 className="card-title">Icon with Text Tabs</h6>
            </div>
            <div className="card-body">
              <IconwithTextTabs />
            </div>
          </div>
        </div>

        <div className="col-span-12 md:col-span-6">
          <div className="card">
            <div className="card-header">
              <h6 className="card-title">Animation Tabs</h6>
            </div>
            <div className="card-body">
              <AnimationTabs />
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default Tabs
