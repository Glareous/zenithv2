'use client'

import React, { useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { usePermissions } from '@src/hooks/usePermissions'
import { RootState } from '@src/slices/reducer'
import { api } from '@src/trpc/react'
import { useSelector } from 'react-redux'

import WorkflowsPage from '@/components/pages/WorkflowsPage'
import { WorkflowProvider } from '@/contexts/WorkflowContext'

interface PageProps {
  params: Promise<{ id: string }>
}

const WorkflowPage: React.FC<PageProps> = ({ params }) => {
  const { id } = React.use(params)
  const router = useRouter()
  const {
    canManageAgents,
    isLoadingPermissions,
    isSuperAdmin,
    isOwner,
    orgRole,
  } = usePermissions()

  const { currentProject } = useSelector((state: RootState) => state.Project)
  const [isNavigating, setIsNavigating] = useState(false)

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
    { enabled: !!id } // Allow loading without currentProject for global agents
  )

  useEffect(() => {
    // Skip redirect logic for global agents
    if (agent?.isGlobal && !agent.projectId) {
      return
    }

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
        router.push(`/apps/agents/default/${targetAgent.id}/workflow`)
      } else {
        if (currentProjectAgents.length > 0) {
          router.push(
            `/apps/agents/default/${currentProjectAgents[0].id}/workflow`
          )
        } else {
          router.push('/apps/agents/default')
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

  // Allow access without currentProject if it's a global agent
  if (!currentProject && agent && !agent.isGlobal) {
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

  if (isNavigating || isCurrentProjectAgentsLoading || isLoadingPermissions) {
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

  if (agentError || !agent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Agent Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {agentError
              ? `Error loading agent: ${agentError.message}`
              : "The agent you're looking for doesn't exist or you don't have access to it."}
          </p>
          <Link href="/apps/agents/default" className="btn btn-primary">
            Back to Agents
          </Link>
        </div>
      </div>
    )
  }

  // For non-global agents, validate they belong to current project
  if (!agent.isGlobal && currentProject && agent.project?.id !== currentProject.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Agent Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Agent not found or does not belong to the current project.
          </p>
          <Link href="/apps/agents/default" className="btn btn-primary">
            Back to Agents
          </Link>
        </div>
      </div>
    )
  }

  return (
    <WorkflowProvider agentId={id} workflowId={id} canManageAgents={canManageAgents}>
      <WorkflowsPage canManageAgents={canManageAgents} />
    </WorkflowProvider>
  )
}

export default WorkflowPage
