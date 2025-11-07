'use client'

import React, { useState } from 'react'

import { useRouter } from 'next/navigation'

import BreadCrumb from '@src/components/common/BreadCrumb'
import AgentEditModal from '@src/components/molecules/AgentEditModal'
import { RootState } from '@src/slices/reducer'
import { api } from '@src/trpc/react'
import {
  Archive,
  Blend,
  Container,
  Cross,
  Loader2,
  Plus,
  Settings,
  Users,
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'

const getAgentIcon = (type: string, className: string) => {
  const icons: { [key: string]: React.ReactElement } = {
    INBOUND: <Archive className={className} />,
    OUTBOUND: <Blend className={className} />,
    PROCESS: <Container className={className} />,
    RPA: <Cross className={className} />,
  }
  return icons[type] || <Users className={className} />
}

const getAgentColor = (type: string) => {
  const colors: { [key: string]: string } = {
    INBOUND:
      'text-yellow-500 fill-yellow-500/20 border-yellow-500/20 bg-yellow-500/10',
    OUTBOUND: 'text-sky-500 fill-sky-500/20 border-sky-500/20 bg-sky-500/10',
    PROCESS:
      'text-green-500 fill-green-500/20 border-green-500/20 bg-green-500/10',
    RPA: 'text-red-500 fill-red-500/20 border-red-500/20 bg-red-500/10',
  }
  return (
    colors[type] ||
    'text-gray-500 fill-gray-500/20 border-gray-500/20 bg-gray-500/10'
  )
}

const getAgentTypeName = (type: string) => {
  const names: { [key: string]: string } = {
    INBOUND: 'Inbound Agent',
    OUTBOUND: 'Outbound Agent',
    PROCESS: 'Process Agent',
    RPA: 'RPA Agent',
  }
  return names[type] || 'Unknown Agent'
}

const Agents: React.FC = () => {
  const router = useRouter()

  const { currentProject } = useSelector((state: RootState) => state.Project)

  const {
    data: agents = [],
    isLoading,
    error,
    refetch,
  } = api.projectAgent.getByProject.useQuery(
    { projectId: currentProject?.id || '' },
    { enabled: !!currentProject?.id }
  )

  const createAgentMutation = api.projectAgent.create.useMutation({
    onSuccess: () => {
      toast.success('Agent created successfully')
      refetch()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create agent')
    },
  })

  const handleAgentClick = (agent: any) => {
    router.push(`/apps/agents/default/${agent.id}`)
  }

  const handleCreateAgent = () => {
    if (!currentProject?.id) return

    createAgentMutation.mutate({
      name: 'Inbound Agent',
      projectId: currentProject.id,
      type: 'INBOUND',
      systemInstructions: '',
      isActive: false,
    })
  }

  if (!currentProject) {
    return (
      <React.Fragment>
        <BreadCrumb title="List View" subTitle="Agents" />
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
      </React.Fragment>
    )
  }

  if (isLoading) {
    return (
      <React.Fragment>
        <BreadCrumb title="List View" subTitle="Agents" />
        <div className="grid grid-cols-12 gap-x-space">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="col-span-12 md:col-span-3 card">
              <div className="card-body">
                <div className="animate-pulse">
                  <div className="flex items-center border justify-center rounded-full size-12 bg-gray-200"></div>
                  <div className="mt-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </React.Fragment>
    )
  }

  if (error) {
    return (
      <React.Fragment>
        <BreadCrumb title="List View" subTitle="Agents" />
        <div className="card">
          <div className="card-body">
            <div className="text-red-500">
              Error loading agents: {error.message}
            </div>
          </div>
        </div>
      </React.Fragment>
    )
  }

  return (
    <React.Fragment>
      <BreadCrumb title="List View" subTitle="Agents" />
      <div className="grid grid-cols-12 gap-x-space">
        {/* Add New Agent Card */}
        <div
          className={`col-span-12 md:col-span-3 card transition-shadow duration-200 border-2 border-dashed border-gray-300 dark:border-gray-700 ${
            !createAgentMutation.isPending
              ? 'cursor-pointer hover:shadow-lg'
              : 'opacity-75 cursor-not-allowed'
          }`}
          onClick={
            createAgentMutation.isPending ? undefined : handleCreateAgent
          }>
          <div className="card-body flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              <div className="flex items-center border justify-center rounded-full size-12 mx-auto text-purple-500 fill-purple-500/20 border-purple-500/20 bg-purple-500/10">
                {createAgentMutation.isPending ? (
                  <Loader2 className="size-5 text-purple-500 animate-spin" />
                ) : (
                  <Plus className="size-5 text-purple-500" />
                )}
              </div>
              <div className="mt-4">
                <h6 className="mb-2 text-gray-700 dark:text-gray-300">
                  {createAgentMutation.isPending
                    ? 'Creating...'
                    : 'Add New Agent'}
                </h6>
                <p className="text-gray-500 dark:text-dark-500 text-sm">
                  Create a new agent default INBOUND
                </p>
              </div>
            </div>
          </div>
        </div>
        {agents.map((agent, index) => {
          const agentColor = getAgentColor(agent.type)
          const [iconColor, divColor] = agentColor.split(' ')

          return (
            <div
              key={agent.id}
              className="col-span-12 md:col-span-3 card cursor-pointer hover:shadow-lg transition-shadow duration-200"
              onClick={() => handleAgentClick(agent)}>
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div
                    className={`flex items-center border justify-center rounded-full size-12 ${divColor}`}>
                    {getAgentIcon(agent.type, `size-5 ${iconColor}`)}
                  </div>
                  <Settings className="h-6 w-6 text-blue-500/80" />
                </div>
                <div className="mt-4">
                  <h6 className="mb-2">
                    {agent.name || getAgentTypeName(agent.type)}
                  </h6>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          agent.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}>
                        {agent.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-500 dark:text-dark-500 mt-2">
                    {getAgentTypeName(agent.type)}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </React.Fragment>
  )
}

export default Agents
