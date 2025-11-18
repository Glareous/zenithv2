'use client'

import React, { useState } from 'react'

import { useRouter } from 'next/navigation'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { Modal } from '@src/components/custom/modal/modal'
import AgentEditModal from '@src/components/molecules/AgentEditModal'
import { RootState } from '@src/slices/reducer'
import { api } from '@src/trpc/react'
import {
  Archive,
  Blend,
  Building2,
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
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<any>(null)
  const [selectedOrgIds, setSelectedOrgIds] = useState<string[]>([])

  // Fetch all agents (SUPERADMIN only)
  const {
    data: agents = [],
    isLoading,
    error,
    refetch,
  } = api.projectAgent.getAll.useQuery({})

  // Fetch all organizations for assignment modal
  const { data: organizations = [] } = api.organization.getAll.useQuery()

  // Fetch assigned organizations for selected agent
  const { data: assignedOrgs = [], refetch: refetchAssignedOrgs } =
    api.projectAgent.getAssignedOrganizations.useQuery(
      { agentId: selectedAgent?.id || '' },
      { enabled: !!selectedAgent }
    )

  const createAgentMutation = api.projectAgent.create.useMutation({
    onSuccess: () => {
      toast.success('Agent created successfully')
      setIsCreateModalOpen(false)
      refetch()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create agent')
    },
  })

  const assignToOrgsMutation =
    api.projectAgent.assignToOrganizations.useMutation({
      onSuccess: () => {
        toast.success('Organizations assigned successfully')
        setIsAssignModalOpen(false)
        refetch()
        refetchAssignedOrgs()
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to assign organizations')
      },
    })

  const handleAgentClick = (agent: any) => {
    router.push(`/admin/agents/${agent.id}`)
  }

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true)
  }

  const handleCreateAgent = (isGlobal: boolean) => {
    createAgentMutation.mutate({
      name: isGlobal ? 'Global Agent' : 'Specific Agent',
      type: 'INBOUND',
      systemInstructions: '',
      isActive: false,
      isGlobal,
    })
  }

  const handleOpenAssignModal = (
    agent: any,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation()
    setSelectedAgent(agent)
    setSelectedOrgIds(assignedOrgs.map((org) => org.id))
    setIsAssignModalOpen(true)
  }

  const handleSaveAssignments = () => {
    if (!selectedAgent) return
    assignToOrgsMutation.mutate({
      agentId: selectedAgent.id,
      organizationIds: selectedOrgIds,
    })
  }

  const toggleOrganization = (orgId: string) => {
    setSelectedOrgIds((prev) =>
      prev.includes(orgId)
        ? prev.filter((id) => id !== orgId)
        : [...prev, orgId]
    )
  }

  // Update selectedOrgIds when assignedOrgs changes
  React.useEffect(() => {
    if (selectedAgent && assignedOrgs) {
      setSelectedOrgIds(assignedOrgs.map((org) => org.id))
    }
  }, [assignedOrgs, selectedAgent])

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
          className={`col-span-12 md:col-span-3 card transition-shadow duration-200 border-2 border-dashed border-gray-300 dark:border-gray-700 ${!createAgentMutation.isPending
            ? 'cursor-pointer hover:shadow-lg'
            : 'opacity-75 cursor-not-allowed'
            }`}
          onClick={
            createAgentMutation.isPending ? undefined : handleOpenCreateModal
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
                  <div className="flex items-center gap-2">
                    {!agent.isGlobal && (
                      <button
                        onClick={(e) => handleOpenAssignModal(agent, e)}
                        className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title="Assign to organizations">
                        <Building2 className="h-5 w-5 text-purple-500/80" />
                      </button>
                    )}
                    <Settings className="h-6 w-6 text-blue-500/80" />
                  </div>
                </div>
                <div className="mt-4">
                  <h6 className="mb-2">
                    {agent.name || getAgentTypeName(agent.type)}
                  </h6>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${agent.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}>
                      {agent.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {agent.isGlobal && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        Global
                      </span>
                    )}
                    {!agent.isGlobal &&
                      agent._count?.organizationAgents > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {agent._count.organizationAgents} Org
                          {agent._count.organizationAgents > 1 ? 's' : ''}
                        </span>
                      )}
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

      {/* Create Agent Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Agent"
        position='modal-center'
        content={
          <>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Choose the type of agent you want to create:
            </p>

            <div className="space-y-3">
              <button
                onClick={() => handleCreateAgent(true)}
                disabled={createAgentMutation.isPending}
                className="w-full p-4 text-left border-2 border-purple-200 dark:border-purple-800 rounded-lg hover:border-purple-400 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed group">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center rounded-full size-10 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                    <Users className="size-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      Global Agent
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Visible to all organizations automatically. Cannot be
                      restricted.
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleCreateAgent(false)}
                disabled={createAgentMutation.isPending}
                className="w-full p-4 text-left border-2 border-blue-200 dark:border-blue-800 rounded-lg hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed group">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center rounded-full size-10 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                    <Building2 className="size-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      Specific Agent
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Assign to specific organizations. You can select which
                      ones after creation.
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {createAgentMutation.isPending && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Loader2 className="size-4 animate-spin" />
                <span>Creating agent...</span>
              </div>
            )}
          </>
        }
        footer={
          <button
            onClick={() => setIsCreateModalOpen(false)}
            disabled={createAgentMutation.isPending}
            className="btn btn-outline-red">
            Cancel
          </button>
        }
      />

      {/* Organization Assignment Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Agent to Organizations"
        size="modal-lg"
        position='modal-center'
        content={
          selectedAgent?.isGlobal ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                This is a global agent. It is automatically visible to all
                organizations.
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Select which organizations can access{' '}
                <strong>{selectedAgent?.name}</strong>
              </p>

              <div className="max-h-96 overflow-y-auto space-y-2">
                {organizations.map((org) => (
                  <label
                    key={org.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedOrgIds.includes(org.id)}
                      onChange={() => toggleOrganization(org.id)}
                      className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {org.name}
                      </p>
                      {org.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {org.description}
                        </p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </>
          )
        }
        footer={
          !selectedAgent?.isGlobal && (
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="btn btn-outline-red">
                Cancel
              </button>
              <button
                onClick={handleSaveAssignments}
                disabled={assignToOrgsMutation.isPending}
                className="btn btn-primary">
                {assignToOrgsMutation.isPending ? (
                  <>
                    <Loader2 className="inline-block w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </button>
            </div>
          )
        }
      />
    </React.Fragment>
  )
}

export default Agents
