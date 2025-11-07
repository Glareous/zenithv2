'use client'

import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import DateMask from '@src/views/UiAdvanced/uiAdvancedMask/dateMask'
import DynamicMasks from '@src/views/UiAdvanced/uiAdvancedMask/dynamicMasks'
import MoneyInputs from '@src/views/UiAdvanced/uiAdvancedMask/moneyInputs'
import PhoneNumberMasks from '@src/views/UiAdvanced/uiAdvancedMask/phoneNumberMasks'
import PinCodeMasks from '@src/views/UiAdvanced/uiAdvancedMask/pinCodeMasks'

const Mask: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Mask Input" subTitle="UI Advanced" />
      <div className="grid grid-cols-12 gap-x-space">
        <DateMask />
        <DynamicMasks />
        <PinCodeMasks />
        <PhoneNumberMasks />
        <MoneyInputs />
      </div>
    </React.Fragment>
  )
}

export default Mask
