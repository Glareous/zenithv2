'use client'

import React, { useEffect, useState } from 'react'

import Link from 'next/link'

import BreadCrumb from '@src/components/common/BreadCrumb'
import DeleteModal from '@src/components/common/DeleteModal'
import Pagination from '@src/components/common/Pagination'
import { LAYOUT_DIRECTION } from '@src/components/constants/layout'
import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
} from '@src/components/custom/dropdown/dropdown'
import { Tab, Tabs } from '@src/components/custom/tabs/tab'
import DeleteProjectModal from '@src/components/molecules/DeleteProjectModal'
import { NextPageWithLayout } from '@src/dtos'
import { RootState } from '@src/slices/reducer'
import { api } from '@src/trpc/react'
import { Project } from '@src/types/project'
import {
  getProjectStatusBadgeClass,
  getProjectStatusLabel,
} from '@src/utils/projectStatus'
import {
  CirclePlus,
  Eye,
  MoreVertical,
  Pencil,
  Search,
  Trash2,
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useSelector } from 'react-redux'
import { ToastContainer, toast } from 'react-toastify'

import AddEditProjectGrid from '../../../../../components/molecules/AddEditProjectGrid'

const ProjectCard = ({
  project,
  onClickProjectGridDelete,
  handleOpenModal,
}: {
  project: Project
  onClickProjectGridDelete: (id: string) => void
  handleOpenModal: (editMode: boolean, project: Project | null) => void
}) => {
  return (
    <div className="card">
      <div className="card-body">
        <Dropdown
          position="right"
          trigger="click"
          dropdownClassName="float-end dropdown">
          <DropdownButton colorClass="flex items-center text-gray-500 dark:text-dark-500">
            <MoreVertical className="w-5 h-5" />
          </DropdownButton>
          <DropdownMenu>
            <Link
              href={`/apps/projects/${project.id}/overview`}
              className="dropdown-item">
              <Eye className="align-middle ltr:mr-2 rtl:ml-2 w-4 h-4" />{' '}
              <span>Overview</span>
            </Link>
            <Link
              href="#!"
              className="dropdown-item"
              onClick={(e) => {
                e.preventDefault()
                handleOpenModal(true, project)
              }}>
              <Pencil className="align-middle ltr:mr-2 rtl:ml-2 w-4 h-4" />{' '}
              <span>Edit</span>
            </Link>
            <Link
              href="#!"
              className="dropdown-item"
              onClick={(e) => {
                e.preventDefault()
                onClickProjectGridDelete(project.id)
              }}>
              <Trash2 className="align-middle ltr:mr-2 rtl:ml-2 w-4 h-4" />
              <span>Delete</span>
            </Link>
          </DropdownMenu>
        </Dropdown>
        <div className="p-2 mb-3 border border-gray-200 rounded-md dark:border-dark-800 size-12">
          <div className="w-8 h-8 bg-primary-100 rounded flex items-center justify-center">
            <span className="text-primary-600 font-semibold text-sm">
              {project.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
        <h6 className="mb-1">{project.name}</h6>
        <p className="text-gray-500 dark:text-dark-500">
          {project.createdBy.firstName} {project.createdBy.lastName}
        </p>
        <div className="grid grid-cols-2 mt-3 divide-x divide-gray-200 rtl:divide-x-reverse dark:divide-dark-800">
          <div className="p-2 text-center">
            <h6 className="mb-1">
              {new Date(project.createdAt).toLocaleDateString()}
            </h6>
            <p className="text-gray-500 dark:text-dark-500">Created</p>
          </div>
          <div className="p-2 text-center">
            <h6 className="mb-1">${project.revenue || 0}</h6>
            <p className="text-gray-500 dark:text-dark-500">Revenue</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-5">
          <p className="text-gray-500 dark:text-dark-500">Status:</p>
          <div className="grow" />
          <div className="shrink-0">
            <span className={getProjectStatusBadgeClass(project.status)}>
              {getProjectStatusLabel(project.status)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

const ProjectsGrid: NextPageWithLayout = () => {
  const { data: session } = useSession()
  const { layoutMode, layoutDirection } = useSelector(
    (state: RootState) => state.Layout
  )

  const [projectGrids, setProjectGrids] = useState<string[] | null>(null)
  const [modalState, setModalState] = useState<{
    showAddProjectForm: boolean
    showEditProjectForm: boolean
  }>({
    showAddProjectForm: false,
    showEditProjectForm: false,
  })
  const [editMode, setEditMode] = useState(false)
  const [currentProjectGrid, setCurrentProjectGrid] = useState<Project | null>(
    null
  )
  const [show, setShow] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState('All Projects')
  const [searchTerm, setSearchTerm] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)

  useEffect(() => {
    const savedTab = localStorage.getItem('projectFilterTab')
    if (savedTab) {
      setActiveTab(savedTab)
    }
  }, [])

  const getStatusFromTab = (tab: string) => {
    switch (tab) {
      case 'Created':
        return 'CREATED' as const
      case 'Active':
        return 'ACTIVE' as const
      case 'Completed':
        return 'COMPLETED' as const
      default:
        return undefined
    }
  }

  const {
    data: projects = [],
    isLoading,
    error,
  } = api.project.getAll.useQuery(
    {
      organizationId: session?.user?.defaultOrganization?.id,
      status: getStatusFromTab(activeTab),
    },
    { enabled: !!session?.user?.defaultOrganization?.id }
  )
  const filteredData = projects.filter(
    (project: Project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.createdBy.firstName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      project.createdBy.lastName
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  )
  const itemsPerPage = 12
  const [currentPage, setCurrentPage] = useState(1)
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }
  const paginateProjects = (projects: Project[]) => {
    const start = (currentPage - 1) * itemsPerPage
    return projects.slice(start, start + itemsPerPage)
  }

  const paginatedProjects = paginateProjects(filteredData)

  const toggleDelete = () => {
    setShow(false)
    setProjectGrids(null)
  }

  const onClickProjectGridDelete = (id: string) => {
    const project = projects.find((p) => p.id === id)
    setProjectToDelete(project || null)
    setShowDeleteModal(true)
  }

  const utils = api.useUtils()

  const deleteProjectMutation = api.project.delete.useMutation({
    onSuccess: async () => {
      // Invalidar todas las queries relacionadas
      await utils.project.getAll.invalidate()
      await utils.project.getById.invalidate()
      toast.success('Project deleted successfully!')
      setShowDeleteModal(false)
      setProjectToDelete(null)
      // Justo después de eliminar exitosamente
      localStorage.setItem('project-deleted', projectToDelete?.id || '')
      setTimeout(() => localStorage.removeItem('project-deleted'), 1000)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete project')
    },
  })

  const handleDeleteProject = async () => {
    if (!projectToDelete) return
    setDeleteLoading(true)
    try {
      await deleteProjectMutation.mutateAsync({ id: projectToDelete.id })
      toast.success('Project deleted successfully!')
      setShowDeleteModal(false)
      setProjectToDelete(null)
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete project')
    } finally {
      setDeleteLoading(false)
    }
  }
  const openModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: true }))
  const closeModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: false }))

  const handleOpenModal = (
    editMode: boolean = false,
    projectGrid: Project | null = null
  ) => {
    setEditMode(editMode)
    setCurrentProjectGrid(projectGrid)
    const modalKey = editMode ? 'showEditProjectForm' : 'showAddProjectForm'
    openModal(modalKey)
  }

  const handleCloseModal = () => {
    const modalKey = editMode ? 'showEditProjectForm' : 'showAddProjectForm'
    closeModal(modalKey)
    setEditMode(false)
    setCurrentProjectGrid(null)
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    localStorage.setItem('projectFilterTab', tab)
    setCurrentPage(1)
  }

  const getActiveTabIndex = (tabName: string) => {
    switch (tabName) {
      case 'All Projects':
        return 0
      case 'Created':
        return 1
      case 'Active':
        return 2
      case 'Completed':
        return 3
      default:
        return 0
    }
  }

  return (
    <React.Fragment>
      <BreadCrumb title="Grid View" subTitle="Projects" />
      <div>
        <div className="flex flex-wrap items-center gap-5 mb-5">
          <div className="shrink-0">
            <h6 className="card-title">
              My Projects (<span>{filteredData.length}</span>)
            </h6>
          </div>
          <div className="md:mx-auto">
            <div className="relative w-full md:!w-80 group/form">
              <input
                type="text"
                className="ltr:pl-9 rtl:pr-9 form-input ltr:group-[&.right]/form:pr-9 rtl:group-[&.right]/form:pl-9 ltr:group-[&.right]/form:pl-4 rtl:group-[&.right]/form:pr-4"
                placeholder="Search for projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 flex items-center text-gray-500 dark:text-dark-500 ltr:left-3 rtl:right-3 ltr:group-[&.right]/form:right-3 rtl:group-[&.right]/form:left-3 ltr:group-[&.right]/form:left-auto rtl:group-[&.right]/form:right-auto focus:outline-hidden">
                <Search className="size-4"></Search>
              </div>
            </div>
          </div>
          <div className="shrink-0">
            <button
              type="button"
              className="btn btn-primary"
              onClick={(e) => {
                e.preventDefault()
                openModal('showAddProjectForm')
              }}>
              <CirclePlus className="inline-block ltr:mr-1 rtl:ml-1 size-4"></CirclePlus>
              <span className="align-middle">Add Project</span>
            </button>
          </div>
        </div>
        <Tabs
          ulProps="overflow-x-auto tabs"
          otherClass="nav-item [&.active]:after:opacity-100 [&.active]:after:w-full [&.active]:text-primary-500"
          activeTabClass="active"
          defaultActiveTab={getActiveTabIndex(activeTab)}
          onChange={handleTabChange}>
          <Tab label="All Projects">
            {isLoading ? (
              <div className="grid grid-cols-1 mt-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-x-5">
                {[...Array(6)].map((_, idx) => (
                  <div key={idx} className="card animate-pulse">
                    <div className="card-body">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-4"></div>
                      <div className="h-20 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 mt-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-x-5">
                {paginatedProjects &&
                  paginatedProjects.length > 0 &&
                  paginatedProjects.map((project: Project, idx: number) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onClickProjectGridDelete={onClickProjectGridDelete}
                      handleOpenModal={handleOpenModal}
                    />
                  ))}
              </div>
            )}
            {!isLoading && paginatedProjects.length < 1 && (
              <div className="p-8">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  className="mx-auto size-12"
                  viewBox="0 0 48 48">
                  <linearGradient
                    id="SVGID_1__h35ynqzIJzH4_gr1"
                    x1="34.598"
                    x2="15.982"
                    y1="15.982"
                    y2="34.598"
                    gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#60e8fe"></stop>
                    <stop offset=".033" stopColor="#6ae9fe"></stop>
                    <stop offset=".197" stopColor="#97f0fe"></stop>
                    <stop offset=".362" stopColor="#bdf5ff"></stop>
                    <stop offset=".525" stopColor="#dafaff"></stop>
                    <stop offset=".687" stopColor="#eefdff"></stop>
                    <stop offset=".846" stopColor="#fbfeff"></stop>
                    <stop offset="1" stopColor="#fff"></stop>
                  </linearGradient>
                  <path
                    fill="url(#SVGID_1__h35ynqzIJzH4_gr1)"
                    d="M40.036,33.826L31.68,25.6c0.847-1.739,1.335-3.684,1.335-5.748c0-7.27-5.894-13.164-13.164-13.164	S6.688,12.582,6.688,19.852c0,7.27,5.894,13.164,13.164,13.164c2.056,0,3.995-0.485,5.728-1.326l3.914,4.015l4.331,4.331	c1.715,1.715,4.496,1.715,6.211,0C41.751,38.321,41.751,35.541,40.036,33.826z"></path>
                  <path
                    fill="none"
                    stroke="#10cfe3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeMiterlimit="10"
                    strokeWidth="3"
                    d="M31.95,25.739l8.086,8.086c1.715,1.715,1.715,4.496,0,6.211l0,0c-1.715,1.715-4.496,1.715-6.211,0	l-4.331-4.331"></path>
                  <path
                    fill="none"
                    stroke="#10cfe3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeMiterlimit="10"
                    strokeWidth="3"
                    d="M7.525,24.511c-1.771-4.694-0.767-10.196,3.011-13.975c3.847-3.847,9.48-4.817,14.228-2.912"></path>
                  <path
                    fill="none"
                    stroke="#10cfe3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeMiterlimit="10"
                    strokeWidth="3"
                    d="M30.856,12.603c3.376,5.114,2.814,12.063-1.688,16.565c-4.858,4.858-12.565,5.129-17.741,0.814"></path>
                </svg>
                <p className="mt-2 text-center text-gray-500 dark:text-dark-500">
                  No matching records found
                </p>
              </div>
            )}
          </Tab>
          <Tab label="Created">
            {isLoading ? (
              <div className="grid grid-cols-1 mt-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-x-5">
                {[...Array(6)].map((_, idx) => (
                  <div key={idx} className="card animate-pulse">
                    <div className="card-body">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-4"></div>
                      <div className="h-20 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 mt-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-x-5">
                {paginatedProjects.map((project: Project, idx: number) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onClickProjectGridDelete={onClickProjectGridDelete}
                    handleOpenModal={handleOpenModal}
                  />
                ))}
              </div>
            )}
            {!isLoading && paginatedProjects.length < 1 && (
              <div className="p-8">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  className="mx-auto size-12"
                  viewBox="0 0 48 48">
                  <linearGradient
                    id="SVGID_1__h35ynqzIJzH4_gr1"
                    x1="34.598"
                    x2="15.982"
                    y1="15.982"
                    y2="34.598"
                    gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#60e8fe"></stop>
                    <stop offset=".033" stopColor="#6ae9fe"></stop>
                    <stop offset=".197" stopColor="#97f0fe"></stop>
                    <stop offset=".362" stopColor="#bdf5ff"></stop>
                    <stop offset=".525" stopColor="#dafaff"></stop>
                    <stop offset=".687" stopColor="#eefdff"></stop>
                    <stop offset=".846" stopColor="#fbfeff"></stop>
                    <stop offset="1" stopColor="#fff"></stop>
                  </linearGradient>
                  <path
                    fill="url(#SVGID_1__h35ynqzIJzH4_gr1)"
                    d="M40.036,33.826L31.68,25.6c0.847-1.739,1.335-3.684,1.335-5.748c0-7.27-5.894-13.164-13.164-13.164	S6.688,12.582,6.688,19.852c0,7.27,5.894,13.164,13.164,13.164c2.056,0,3.995-0.485,5.728-1.326l3.914,4.015l4.331,4.331	c1.715,1.715,4.496,1.715,6.211,0C41.751,38.321,41.751,35.541,40.036,33.826z"></path>
                  <path
                    fill="none"
                    stroke="#10cfe3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeMiterlimit="10"
                    strokeWidth="3"
                    d="M31.95,25.739l8.086,8.086c1.715,1.715,1.715,4.496,0,6.211l0,0c-1.715,1.715-4.496,1.715-6.211,0	l-4.331-4.331"></path>
                  <path
                    fill="none"
                    stroke="#10cfe3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeMiterlimit="10"
                    strokeWidth="3"
                    d="M7.525,24.511c-1.771-4.694-0.767-10.196,3.011-13.975c3.847-3.847,9.48-4.817,14.228-2.912"></path>
                  <path
                    fill="none"
                    stroke="#10cfe3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeMiterlimit="10"
                    strokeWidth="3"
                    d="M30.856,12.603c3.376,5.114,2.814,12.063-1.688,16.565c-4.858,4.858-12.565,5.129-17.741,0.814"></path>
                </svg>
                <p className="mt-2 text-center text-gray-500 dark:text-dark-500">
                  No matching records found
                </p>
              </div>
            )}
          </Tab>
          <Tab label="Active">
            {isLoading ? (
              <div className="grid grid-cols-1 mt-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-x-5">
                {[...Array(6)].map((_, idx) => (
                  <div key={idx} className="card animate-pulse">
                    <div className="card-body">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-4"></div>
                      <div className="h-20 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 mt-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-x-5">
                {paginatedProjects.map((project: Project, idx: number) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onClickProjectGridDelete={onClickProjectGridDelete}
                    handleOpenModal={handleOpenModal}
                  />
                ))}
              </div>
            )}
            {!isLoading && paginatedProjects.length < 1 && (
              <div className="p-8">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  className="mx-auto size-12"
                  viewBox="0 0 48 48">
                  <linearGradient
                    id="SVGID_1__h35ynqzIJzH4_gr1"
                    x1="34.598"
                    x2="15.982"
                    y1="15.982"
                    y2="34.598"
                    gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#60e8fe"></stop>
                    <stop offset=".033" stopColor="#6ae9fe"></stop>
                    <stop offset=".197" stopColor="#97f0fe"></stop>
                    <stop offset=".362" stopColor="#bdf5ff"></stop>
                    <stop offset=".525" stopColor="#dafaff"></stop>
                    <stop offset=".687" stopColor="#eefdff"></stop>
                    <stop offset=".846" stopColor="#fbfeff"></stop>
                    <stop offset="1" stopColor="#fff"></stop>
                  </linearGradient>
                  <path
                    fill="url(#SVGID_1__h35ynqzIJzH4_gr1)"
                    d="M40.036,33.826L31.68,25.6c0.847-1.739,1.335-3.684,1.335-5.748c0-7.27-5.894-13.164-13.164-13.164	S6.688,12.582,6.688,19.852c0,7.27,5.894,13.164,13.164,13.164c2.056,0,3.995-0.485,5.728-1.326l3.914,4.015l4.331,4.331	c1.715,1.715,4.496,1.715,6.211,0C41.751,38.321,41.751,35.541,40.036,33.826z"></path>
                  <path
                    fill="none"
                    stroke="#10cfe3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeMiterlimit="10"
                    strokeWidth="3"
                    d="M31.95,25.739l8.086,8.086c1.715,1.715,1.715,4.496,0,6.211l0,0c-1.715,1.715-4.496,1.715-6.211,0	l-4.331-4.331"></path>
                  <path
                    fill="none"
                    stroke="#10cfe3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeMiterlimit="10"
                    strokeWidth="3"
                    d="M7.525,24.511c-1.771-4.694-0.767-10.196,3.011-13.975c3.847-3.847,9.48-4.817,14.228-2.912"></path>
                  <path
                    fill="none"
                    stroke="#10cfe3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeMiterlimit="10"
                    strokeWidth="3"
                    d="M30.856,12.603c3.376,5.114,2.814,12.063-1.688,16.565c-4.858,4.858-12.565,5.129-17.741,0.814"></path>
                </svg>
                <p className="mt-2 text-center text-gray-500 dark:text-dark-500">
                  No matching records found
                </p>
              </div>
            )}
          </Tab>
          <Tab label="Completed">
            {isLoading ? (
              <div className="grid grid-cols-1 mt-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-x-5">
                {[...Array(6)].map((_, idx) => (
                  <div key={idx} className="card animate-pulse">
                    <div className="card-body">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-4"></div>
                      <div className="h-20 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 mt-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-x-5">
                {paginatedProjects.map((project: Project, idx: number) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onClickProjectGridDelete={onClickProjectGridDelete}
                    handleOpenModal={handleOpenModal}
                  />
                ))}
              </div>
            )}
          </Tab>
        </Tabs>

        <Pagination
          totalItems={filteredData.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </div>

      <AddEditProjectGrid
        modalState={modalState}
        closeModal={handleCloseModal}
        projectGrid={projects}
        editMode={editMode}
        currentProjectGrid={currentProjectGrid}
      />

      <DeleteProjectModal
        show={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setProjectToDelete(null)
        }}
        onDelete={handleDeleteProject}
        projectName={projectToDelete?.name || ''}
        loading={deleteLoading}
      />

      <ToastContainer
        theme={layoutMode}
        rtl={layoutDirection === LAYOUT_DIRECTION.RTL}
        position={
          layoutDirection === LAYOUT_DIRECTION.RTL ? 'top-left' : 'top-right'
        }
      />
    </React.Fragment>
  )
}

export default ProjectsGrid
