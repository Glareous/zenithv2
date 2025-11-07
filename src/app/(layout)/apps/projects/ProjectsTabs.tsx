'use client'

import React, { useEffect, useState } from 'react'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
} from '@src/components/custom/dropdown/dropdown'
import UserAvatar from '@src/components/layout/UserAvatar'
import DeleteProjectModal from '@src/components/molecules/DeleteProjectModal'
import ModalInviteMember from '@src/components/organisms/ModalInviteMember'
import { users } from '@src/dtos/apps/user'
import { RootState } from '@src/slices/reducer'
import { api } from '@src/trpc/react'
import { Project } from '@src/types/project'
import {
  getProjectStatusBadgeClass,
  getProjectStatusLabel,
} from '@src/utils/projectStatus'
import {
  AlignLeft,
  Ellipsis,
  Eye,
  FileText,
  Sparkle,
  UserRound,
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { Tooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'

import AddEditProjectGrid from '../../../../components/molecules/AddEditProjectGrid'

const ProjectsTabs = () => {
  const pathname = usePathname()
  const router = useRouter()
  const { currentProject } = useSelector((state: RootState) => state.Project)
  const id = currentProject?.id

  const [currentUser, setCurrentUser] = useState(users[0])
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [showEditProjectModal, setShowEditProjectModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const selectUser = (user: { name: string; image: string; role: string }) => {
    setCurrentUser(user)
  }
  const isActive = (user: { name: string; image: string; role: string }) =>
    currentUser.name === user.name

  const handleInviteSuccess = () => {}

  const handleOpenEditProject = () => {
    setShowEditProjectModal(true)
  }

  const deleteProjectMutation = api.project.delete.useMutation()
  const handleDeleteProject = async () => {
    if (!projectData) return
    setDeleteLoading(true)
    try {
      await deleteProjectMutation.mutateAsync({ id: projectData.id })
      toast.success('Project deleted successfully')
      window.location.href = '/apps/projects/grid'
    } catch (err: any) {
      const errorMessage =
        err?.data?.message || err?.message || 'Error deleting project'
      toast.error(errorMessage)
    } finally {
      setDeleteLoading(false)
      setShowDeleteModal(false)
    }
  }

  const {
    data: projectData,
    refetch,
    isLoading,
    error,
  } = api.project.getById.useQuery({ id: id || '' }, { enabled: !!id })

  useEffect(() => {
    if (!id) {
      console.log('No project selected, redirecting to grid...')
      router.push('/apps/projects/grid')
      return
    }
    if (!isLoading && !projectData && !error) {
      console.log('Project not found, redirecting to grid...')
      router.push('/apps/projects/grid')
    }
  }, [id, projectData, isLoading, error, router])

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'project-deleted' && e.newValue === id) {
        localStorage.removeItem('project-deleted')
        window.location.href = '/apps/projects/grid'
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [id])

  if (!currentProject) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="text-center text-gray-500 dark:text-dark-500">
            <p>No project selected. Please select a project first.</p>
            <p className="mt-2 text-sm">
              Go to{' '}
              <a
                href="/apps/projects/grid"
                className="text-primary-500 hover:underline">
                Projects
              </a>{' '}
              to select a project.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <React.Fragment>
      <div className="card">
        <div className="relative overflow-hidden rounded-md-t h-44 bg-primary-500/10">
          <div className="border-[60px] border-t-primary-500 border-l-primary-500 absolute opacity-10 -top-2 ltr:right-0 rtl:left-0 rotate-45 size-96"></div>
          <div className="border-[60px] border-green-500 absolute opacity-10 top-20 ltr:right-8 rtl:left-8 rotate-45 size-80"></div>
          <div className="border-[60px] border-pink-500 absolute opacity-10 top-36 ltr:right-28 rtl:left-28 rotate-45 size-40"></div>
        </div>
        <div className="card-body">
          <div className="relative mb-6">
            <div className="flex flex-wrap gap-5">
              <div>
                {projectData && (
                  <UserAvatar
                    projectId={projectData.id}
                    logoUrl={projectData.logoUrl}
                    onLogoUpdated={() => refetch()}
                  />
                )}
              </div>
              <div className="grow flex flex-col justify-center">
                <h5 className="mb-1 gap-2 flex items-center">
                  {projectData?.name || 'Loading...'}
                  <span
                    className={getProjectStatusBadgeClass(
                      projectData?.status || ''
                    )}>
                    {getProjectStatusLabel(projectData?.status || '')}
                  </span>
                </h5>
                <p className="text-gray-500 dark:text-dark-500">
                  Created:{' '}
                  {projectData?.createdAt
                    ? new Date(projectData.createdAt).toLocaleDateString()
                    : 'Unknown'}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setIsInviteModalOpen(true)}>
                  Invite Member
                </button>
                <Dropdown trigger="click" dropdownClassName="dropdown">
                  <DropdownButton colorClass="btn-icon-text btn-icon btn-sub-gray btn">
                    <Ellipsis className="size-5" />
                  </DropdownButton>
                  <DropdownMenu>
                    <Link
                      href="#!"
                      className="dropdown-item"
                      onClick={(e) => {
                        e.preventDefault()
                        setShowDeleteModal(true)
                      }}>
                      Delete Project
                    </Link>
                    <Link
                      href="#!"
                      className="dropdown-item"
                      onClick={(e) => {
                        e.preventDefault()
                        handleOpenEditProject()
                      }}>
                      Settings
                    </Link>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-5 mb-5">
            <div className="col-span-12 p-3 text-center border border-gray-200 border-dashed rounded-md dark:border-dark-800 sm:col-span-6 md:col-span-3 xl:col-span-2">
              <h6 className="mb-1">
                {projectData?.createdAt
                  ? new Date(projectData.createdAt).toLocaleDateString()
                  : 'Unknown'}
              </h6>
              <p className="text-gray-500 dark:text-dark-500">Created at</p>
            </div>
            <div className="col-span-12 p-3 text-center border border-gray-200 border-dashed rounded-md dark:border-dark-800 sm:col-span-6 md:col-span-3 xl:col-span-2">
              <h6 className="mb-1">{projectData?.products?.length || 0}</h6>
              <p className="text-gray-500 dark:text-dark-500">Products</p>
            </div>
            <div className="col-span-12 p-3 text-center border border-gray-200 border-dashed rounded-md dark:border-dark-800 sm:col-span-6 md:col-span-3 xl:col-span-2">
              <h6 className="mb-1">{projectData?.agents?.length || 0}</h6>
              <p className="text-gray-500 dark:text-dark-500">Agents</p>
            </div>
          </div>

          <div className="grid grid-cols-12 mb-space">
            <div className="col-span-6">
              <h6 className="mb-1">
                Members ({projectData?.members?.length || 0}):
              </h6>
              <div className="flex -space-x-3 rtl:space-x-reverse">
                {projectData?.members?.slice(0, 6).map((member, index) => (
                  <div
                    key={member.user.id}
                    title={`${member.user.firstName || ''} ${member.user.lastName || ''} (${member.role})`.trim()}
                    className="transition duration-300 ease-linear hover:z-10">
                    <div
                      className="border-2 border-white rounded-full dark:border-dark-900 size-10 bg-primary-500 flex items-center justify-center text-white font-medium text-sm"
                      data-tooltip-content={`${member.user.firstName || ''} ${member.user.lastName || ''} (${member.role})`.trim()}
                      data-tooltip-id={`member-${index}`}>
                      {(
                        member.user.firstName?.[0] ||
                        member.user.email?.[0] ||
                        '?'
                      ).toUpperCase()}
                    </div>
                    <Tooltip id={`member-${index}`} />
                  </div>
                )) || []}
                {(projectData?.members?.length || 0) > 6 && (
                  <div
                    title={`+${(projectData?.members?.length || 0) - 6} more members`}
                    className="border-2 border-white rounded-full dark:border-dark-900 size-10 bg-gray-400 flex items-center justify-center text-white font-medium text-sm">
                    +{(projectData?.members?.length || 0) - 6}
                  </div>
                )}
              </div>
            </div>
            <div className="col-span-6">
              <h6 className="mb-1">Created By:</h6>
              <div className="flex -space-x-3 rtl:space-x-reverse">
                {projectData?.createdBy && (
                  <div
                    title={`${projectData.createdBy.firstName || ''} ${projectData.createdBy.lastName || ''} (Creator)`.trim()}
                    className="transition duration-300 ease-linear hover:z-10">
                    <div
                      className="border-2 border-white rounded-full dark:border-dark-900 size-10 bg-green-500 flex items-center justify-center text-white font-medium text-sm"
                      data-tooltip-content={`${projectData.createdBy.firstName || ''} ${projectData.createdBy.lastName || ''} (Creator)`.trim()}
                      data-tooltip-id="creator">
                      {(
                        projectData.createdBy.firstName?.[0] ||
                        projectData.createdBy.email?.[0] ||
                        '?'
                      ).toUpperCase()}
                    </div>
                    <Tooltip id="creator" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <ul className="overflow-x-auto whitespace-normal tabs-pills">
            <li>
              <Link
                href={`/apps/projects/${id}/overview`}
                className={`nav-item [&.active]:bg-primary-500 [&.active]:text-primary-50 ${pathname == `/apps/projects/${id}/overview` ? 'active' : ''}`}>
                <Eye className="inline-block ltr:mr-1 rtl:ml-1 size-4" />
                <span className="align-middle">Overview</span>
              </Link>
            </li>

            <li>
              <Link
                href={`/apps/projects/${id}/files`}
                className={`nav-item [&.active]:bg-primary-500 [&.active]:text-primary-50 ${pathname == `/apps/projects/${id}/files` ? 'active' : ''}`}>
                <FileText className="inline-block ltr:mr-1 rtl:ml-1 size-4" />
                <span className="align-middle">Files</span>
              </Link>
            </li>
            <li>
              <Link
                href={`/apps/projects/${id}/users`}
                className={`nav-item [&.active]:bg-primary-500 [&.active]:text-primary-50 ${pathname == `/apps/projects/${id}/users` ? 'active' : ''}`}>
                <UserRound className="inline-block ltr:mr-1 rtl:ml-1 size-4" />
                <span className="align-middle">Users</span>
              </Link>
            </li>
            <li>
              <Link
                href={`/apps/projects/${id}/faqs`}
                className={`nav-item [&.active]:bg-primary-500 [&.active]:text-primary-50 ${pathname == `/apps/projects/${id}/faqs` ? 'active' : ''}`}>
                <AlignLeft className="inline-block ltr:mr-1 rtl:ml-1 size-4" />
                <span className="align-middle">FAQs</span>
              </Link>
            </li>
            <li>
              <Link
                href={`/apps/projects/${id}/integration`}
                className={`nav-item [&.active]:bg-primary-500 [&.active]:text-primary-50 ${pathname == `/apps/projects/${id}/integration` ? 'active' : ''}`}>
                <UserRound className="inline-block ltr:mr-1 rtl:ml-1 size-4" />
                <span className="align-middle">Integration</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Invite Member Modal */}
      <ModalInviteMember
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        projectId={id}
        onSuccess={handleInviteSuccess}
      />

      <AddEditProjectGrid
        modalState={{
          showAddProjectForm: false,
          showEditProjectForm: showEditProjectModal,
        }}
        closeModal={() => setShowEditProjectModal(false)}
        projectGrid={projectData ? [projectData as unknown as Project] : []}
        editMode={true}
        currentProjectGrid={(projectData as unknown as Project) || null}
      />

      <DeleteProjectModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleDeleteProject}
        projectName={projectData?.name || ''}
        loading={deleteLoading}
      />
    </React.Fragment>
  )
}

export default ProjectsTabs
