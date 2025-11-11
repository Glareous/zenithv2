'use client'

import React, { useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

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
    { enabled: !!id && !!currentProject }
  )

  useEffect(() => {
    // Skip project validation for admin pages - agents don't need to belong to a project
    const isAdminPage = window.location.pathname.startsWith('/admin/agents')
    if (isAdminPage) return

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
        router.push(`/admin/agents/${targetAgent.id}/workflow`)
      } else {
        if (currentProjectAgents.length > 0) {
          router.push(`/admin/agents/${currentProjectAgents[0].id}/workflow`)
        } else {
          router.push('/admin/agents')
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
        <div className="text-center hidden">
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
          <Link href="/admin/agents" className="btn btn-primary">
            Back to Agents
          </Link>
        </div>
      </div>
    )
  }

  return (
    <WorkflowProvider agentId={id} workflowId={id}>
      <WorkflowsPage />
    </WorkflowProvider>
  )
}

export default WorkflowPage
