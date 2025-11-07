'use client'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { LAYOUT_DIRECTION } from '@src/components/constants/layout'
import { RootState } from '@src/slices/reducer'
import AnalyticsChart from '@src/views/Dashboards/FileManagerDashboard/AnalyticsChart'
import Favorites from '@src/views/Dashboards/FileManagerDashboard/Favorites'
import QuickAccess from '@src/views/Dashboards/FileManagerDashboard/QuickAccess'
import RecentFiles from '@src/views/Dashboards/FileManagerDashboard/RecentFiles'
import Storage from '@src/views/Dashboards/FileManagerDashboard/Storage'
import Widgets from '@src/views/Dashboards/FileManagerDashboard/Widgets'
import { useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify'

const FileManager = () => {
  const { layoutMode, layoutDirection } = useSelector(
    (state: RootState) => state.Layout
  )

  return (
    <>
      <BreadCrumb title="File Manager" subTitle="Dashboards" />
      <div className="grid grid-cols-12 gap-x-space">
        <Widgets />
        <AnalyticsChart />
        <RecentFiles />
        <Storage />
        <QuickAccess />
        <Favorites />
      </div>
      <ToastContainer
        theme={layoutMode}
        rtl={layoutDirection === LAYOUT_DIRECTION.RTL}
        position={
          layoutDirection === LAYOUT_DIRECTION.RTL ? 'top-left' : 'top-right'
        }
      />
    </>
  )
}

export default FileManager
