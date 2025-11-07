'use client'

import React from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { LAYOUT_DIRECTION } from '@src/components/constants/layout'
import { NextPageWithLayout } from '@src/dtos'
import { RootState } from '@src/slices/reducer'
import FileManagerMainSection from '@src/views/Apps/filemanager/FileManagerMainSection'
import FileStorageSection from '@src/views/Apps/filemanager/FileStorageSection'
import { useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify'

const FileManager: NextPageWithLayout = () => {
  const { layoutMode, layoutDirection } = useSelector(
    (state: RootState) => state.Layout
  )
  return (
    <React.Fragment>
      <BreadCrumb title="File Manager" subTitle="Apps" />
      <div className="grid grid-cols-12 gap-x-space">
        <FileManagerMainSection />
        <FileStorageSection />
      </div>
      <ToastContainer
        theme={layoutMode}
        rtl={layoutDirection === LAYOUT_DIRECTION.RTL}
      />
    </React.Fragment>
  )
}

export default FileManager
