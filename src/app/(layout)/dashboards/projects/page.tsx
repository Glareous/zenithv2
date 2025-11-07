'use client'

import BreadCrumb from '@src/components/common/BreadCrumb'
import ActiveProjects from '@src/views/Dashboards/ProjectsDashboard/ActiveProjects'
import Activity from '@src/views/Dashboards/ProjectsDashboard/Activity'
import AssignProject from '@src/views/Dashboards/ProjectsDashboard/AssignProject'
import ClientList from '@src/views/Dashboards/ProjectsDashboard/ClientList'
import DailyWorkingReports from '@src/views/Dashboards/ProjectsDashboard/DailyWorkingReports'
import MyTasks from '@src/views/Dashboards/ProjectsDashboard/MyTasks'
import ProjectStatus from '@src/views/Dashboards/ProjectsDashboard/ProjectStatus'
import TaskActivity from '@src/views/Dashboards/ProjectsDashboard/TaskActivity'
import TaskLists from '@src/views/Dashboards/ProjectsDashboard/TaskLists'
import TeamMembers from '@src/views/Dashboards/ProjectsDashboard/TeamMembers'
import Widgets from '@src/views/Dashboards/ProjectsDashboard/Widgets'

const Projects = () => {
  return (
    <>
      <BreadCrumb title="Projects" subTitle="Dashboards" />
      <div className="grid grid-cols-12 gap-x-space">
        <ProjectStatus />
        <Widgets />
        <DailyWorkingReports />
        <ClientList />
        <AssignProject />
        <ActiveProjects />
        <TeamMembers />
        <TaskActivity />
        <MyTasks />
        <TaskLists />
        <Activity />
      </div>
    </>
  )
}

export default Projects
