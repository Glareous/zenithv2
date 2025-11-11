'use client'

import React, { useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import PermissionAlert from '@src/components/common/PermissionAlert'
import { usePermissions } from '@src/hooks/usePermissions'
import { RootState } from '@src/slices/reducer'
import { api } from '@src/trpc/react'
import { useSelector } from 'react-redux'

import WorkflowsPage from '@/components/pages/WorkflowsPage'
import { WorkflowProvider } from '@/contexts/WorkflowContext'

interface PageProps {
  params: Promise<{ id: string }>
}

const PQRWorkflowPage: React.FC<PageProps> = ({ params }) => {
  const { id } = React.use(params)
  const router = useRouter()

  const { currentProject } = useSelector((state: RootState) => state.Project)
  const [isNavigating, setIsNavigating] = useState(false)

  // Get permissions
  const { canManageAgents, isLoadingPermissions } = usePermissions()

  const {
    data: currentProjectAgents = [],
    isLoading: isCurrentProjectAgentsLoading,
  } = api.projectAgent.getByProject.useQuery(
    { projectId: currentProject?.id || '' },
    { enabled: !!currentProject?.id }
  )

  const {
    data: agent,
    isLoading: isAgentLoading,
    error: agentError,
  } = api.projectAgent.getById.useQuery(
    { id: id },
    { enabled: !!id && !!currentProject }
  )

  useEffect(() => {
    if (
      !currentProject ||
      !agent ||
      isNavigating ||
      isCurrentProjectAgentsLoading
    )
      return

    if (agent.project?.id !== currentProject.id) {
      if (currentProjectAgents.length === 0) {
        return
      }

      setIsNavigating(true)

      const targetAgent = currentProjectAgents.find(
        (a) => a.type === agent.type
      )

      if (targetAgent) {
        router.push(`/apps/rrhh/rrhh-agent/${targetAgent.id}/workflow`)
      } else {
        if (currentProjectAgents.length > 0) {
          router.push(
            `/apps/rrhh/rrhh-agent/${currentProjectAgents[0].id}/workflow`
          )
        } else {
          router.push('/apps/rrhh/rrhh-agent')
        }
      }
    }
  }, [
    currentProject,
    agent,
    currentProjectAgents,
    id,
    router,
    isNavigating,
    isCurrentProjectAgentsLoading,
  ])

  if (!currentProject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            No Project Selected
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please select a project first.
          </p>
          <Link href="/apps/projects/grid" className="btn btn-primary">
            Go to Projects
          </Link>
        </div>
      </div>
    )
  }

  if (isNavigating || isCurrentProjectAgentsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (isAgentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (agentError || !agent || agent.project?.id !== currentProject.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Agent Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {agentError
              ? `Error loading agent: ${agentError.message}`
              : !agent
                ? "The agent you're looking for doesn't exist or you don't have access to it."
                : 'Agent not found or does not belong to the current project.'}
          </p>
          <Link href="/apps/rrhh/rrhh-agent" className="btn btn-primary">
            Back to RRHH Agents
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Permission Alert */}
      <PermissionAlert show={!canManageAgents && !isLoadingPermissions} />

      <WorkflowProvider agentId={id} workflowId={id}>
        <WorkflowsPage canManageAgents={canManageAgents} />
      </WorkflowProvider>
    </div>
  )
}

export default PQRWorkflowPage
