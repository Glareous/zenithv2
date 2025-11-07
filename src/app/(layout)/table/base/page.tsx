'use client'

import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import BasicStyling from '@src/views/Table/Base/BasicStyling'
import BorderSpacingTable from '@src/views/Table/Base/BorderSpacingTable'
import BorderStyling from '@src/views/Table/Base/BorderStyling'
import BorderedTable from '@src/views/Table/Base/BorderedTable'
import CaptionSide from '@src/views/Table/Base/CaptionSide'
import ColoredBorderTable from '@src/views/Table/Base/ColoredBorderTable'
import HeadingLightTable from '@src/views/Table/Base/HeadingLight'
import HoveredTable from '@src/views/Table/Base/HoveredTable'
import LoadingTable from '@src/views/Table/Base/LoadingTable'
import SeparateTable from '@src/views/Table/Base/SeparateTable'
import SortingTables from '@src/views/Table/Base/SortingTables'
import StripedColoredTable from '@src/views/Table/Base/StripedColoredTable'
import StripedEvenTable from '@src/views/Table/Base/StripedEvenTable'
import StripedOddTable from '@src/views/Table/Base/StripedOddTable'

const BaseTables: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Base Table" subTitle="Tables" />
      <div className="grid grid-cols-12 gap-x-space">
        <BasicStyling />
        <BorderStyling />
        <BorderedTable />
        <SeparateTable />
        <BorderSpacingTable />
        <CaptionSide />
        <HeadingLightTable />
        <HoveredTable />
        <StripedEvenTable />
        <StripedOddTable />
        <ColoredBorderTable />
        <StripedColoredTable />
        <LoadingTable />
        <SortingTables />
      </div>
    </React.Fragment>
  )
}

export default BaseTables
