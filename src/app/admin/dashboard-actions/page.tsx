'use client'

import React, { Suspense, useEffect, useMemo, useState } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import BreadCrumb from '@src/components/common/BreadCrumb'
import DeleteModal from '@src/components/common/DeleteModal'
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownMenu,
} from '@src/components/custom/dropdown/dropdown'
import TableContainer from '@src/components/custom/table/table'
import ModalMcpProtocol from '@src/components/organisms/ModalMcpProtocol'
import ModalSelectAgent from '@src/components/organisms/ModalSelectAgent'
import { NextPageWithLayout } from '@src/dtos'
import { RootState } from '@src/slices/reducer'
import { api } from '@src/trpc/react'
import {
  ArrowLeft,
  Bot,
  ChevronLeft,
  ChevronRight,
  Copy,
  Edit,
  HelpCircle,
  MoreVertical,
  Plus,
  Trash,
  User,
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { ToastContainer } from 'react-toastify'

const DashboardActionsContent: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check if we're on admin route
  const isAdminRoute =
    typeof window !== 'undefined' &&
    window.location.pathname.startsWith('/admin/dashboard-actions')

  const [currentPage, setCurrentPage] = useState(() => {
    const pageParam = searchParams.get('page')
    return pageParam ? parseInt(pageParam, 10) : 1
  })
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const limitParam = searchParams.get('limit')
    return limitParam ? parseInt(limitParam, 10) : 10
  })

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [actionToDelete, setActionToDelete] = useState<{
    id: string
    name: string
  } | null>(null)
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false)
  const [isMcpProtocolModalOpen, setIsMcpProtocolModalOpen] = useState(false)

  const currentProject = useSelector(
    (state: RootState) => state.Project.currentProject
  )

  useEffect(() => {
    const pageParam = searchParams.get('page')
    const limitParam = searchParams.get('limit')

    if (pageParam) {
      const newPage = parseInt(pageParam, 10)
      if (newPage !== currentPage && newPage > 0) {
        setCurrentPage(newPage)
      }
    }

    if (limitParam) {
      const newLimit = parseInt(limitParam, 10)
      if (newLimit !== itemsPerPage && newLimit > 0) {
        setItemsPerPage(newLimit)
      }
    }
  }, [searchParams])

  const {
    data: actions,
    isLoading,
    refetch: refetchActions,
  } = api.projectAction.getAll.useQuery(
    {
      projectId: currentProject?.id || '',
      page: currentPage,
      limit: itemsPerPage,
    },
    {
      enabled: Boolean(currentProject?.id),
      retry: false,
    }
  )

  const { data: agents = [] } = api.projectAgent.getByProject.useQuery(
    { projectId: currentProject?.id || '' },
    { enabled: Boolean(currentProject?.id) }
  )

  const createAction = api.projectAction.create.useMutation({
    onSuccess: () => {
      toast.success('New action created successfully!')
      refetchActions()
      setIsAgentModalOpen(false)
    },
    onError: (error) => {
      toast.error(`Error creating action: ${error.message}`)
    },
  })

  const handleCreateCustomAction = () => {
    if (!currentProject?.id) {
      toast.error('Please select a project first before creating an action')
      return
    }

    createAction.mutate({
      name: 'new_custom_action_' + Date.now(),
      description: 'New custom action - please configure',
      apiUrl: 'POST',
      projectId: currentProject.id,
      actionType: 'CUSTOM',
    })
  }

  const handleCreateMCPAction = () => {
    if (!currentProject?.id) {
      toast.error('Please select a project first before creating an action')
      return
    }

    setIsMcpProtocolModalOpen(true)
  }

  const handleSaveMcpProtocol = (config: any) => {
    console.log('MCP Protocol config:', config)
    toast.info('MCP Protocol save')
    setIsMcpProtocolModalOpen(false)
  }

  const handleExecuteMcp = () => {
    toast.info('MCP Protocol execute')
  }

  const handleSelectAgent = (agentId: string) => {
    if (!currentProject?.id) {
      toast.error('Please select a project first before creating an action')
      return
    }

    createAction.mutate({
      name: 'new_agent_action_' + Date.now(),
      description: 'New agent action - please configure',
      apiUrl: 'POST',
      projectId: currentProject.id,
      actionType: 'AGENT',
      agentId: agentId,
    })
  }

  const updateURL = (page: number, limit: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    params.set('limit', limit.toString())
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    updateURL(newPage, itemsPerPage)
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    const pagination = actions?.pagination
    if (pagination && currentPage < pagination.totalPages) {
      handlePageChange(currentPage + 1)
    }
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
    updateURL(1, newItemsPerPage)
  }

  const filteredActions = useMemo(() => {
    if (!actions?.actions) return []
    return actions.actions.filter(
      (action: any) => action.actionType !== 'DATABASE' && action.actionType !== 'WEBHOOK'
    )
  }, [actions?.actions])

  const pagination = actions?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  }

  const deleteAction = api.projectAction.delete.useMutation({
    onSuccess: () => {
      toast.success('Action deleted successfully!')
      setShowDeleteModal(false)
      setActionToDelete(null)
      refetchActions()
    },
    onError: (error) => {
      toast.error(`Error deleting action: ${error.message}`)
      setShowDeleteModal(false)
    },
  })

  const handleDeleteAction = (actionId: string, actionName: string) => {
    setActionToDelete({ id: actionId, name: actionName })
    setShowDeleteModal(true)
  }

  const executeDelete = () => {
    if (actionToDelete) {
      deleteAction.mutate({ id: actionToDelete.id })
    }
  }

  const cancelDelete = () => {
    setShowDeleteModal(false)
    setActionToDelete(null)
  }

  const handleEditAction = (action: any) => {
    router.push(`/page/dashboard-actions/${action.id}`)
  }

  const columns = useMemo(
    () => [
      {
        header: '',
        id: 'actions',
        accessorKey: 'id',
        cell: ({ row }: any) => {
          const action = row.original
          return (
            <Dropdown trigger="click">
              <DropdownButton colorClass="p-2 hover:bg-gray-100 rounded">
                <MoreVertical className="size-4" />
              </DropdownButton>
              <DropdownMenu menuClass="card z-10">
                <div className="p-0">
                  <button
                    onClick={() => handleEditAction(action)}
                    className="flex items-center gap-1 w-full p-2 hover:bg-blue-100 rounded text-left">
                    <div className="btn btn-xs text-blue-500">
                      <Edit className="size-4" />
                    </div>
                    <div>
                      <div className="font-medium">Edit</div>
                      <div className="text-sm text-gray-500">
                        Modify action settings
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      toast.info('Duplicate feature')
                    }}
                    className="flex items-center gap-1 w-full p-2 hover:bg-green-100 rounded text-left">
                    <div className="btn btn-xs text-green-500">
                      <Copy className="size-4" />
                    </div>
                    <div>
                      <div className="font-medium">Duplicate</div>
                      <div className="text-sm text-gray-500">
                        Create a copy of this action
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleDeleteAction(action.id, action.name)}
                    disabled={deleteAction.isPending}
                    className="flex items-center gap-1 w-full p-2 pr-4 hover:bg-red-100 rounded text-left disabled:opacity-50">
                    <div className="btn btn-xs text-red-500">
                      <Trash className="size-4" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {deleteAction.isPending ? 'Deleting...' : 'Delete'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Remove this action permanently
                      </div>
                    </div>
                  </button>
                </div>
              </DropdownMenu>
            </Dropdown>
          )
        },
      },
      {
        header: 'Name',
        accessorKey: 'name',
        cell: ({ row }: any) => {
          const action = row.original
          return (
            <div className="flex items-center justify-between gap-2">
              <span>{action.name}</span>
              {action.actionType === 'AGENT' && action.agent ? (
                <span className="inline-flex text-center items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {action.agent.name || 'Agent'}
                </span>
              ) : action.actionType === 'MCP' ? (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  MCP
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Custom
                </span>
              )}
            </div>
          )
        },
      },
      {
        header: 'API URL',
        accessorKey: 'apiUrl',
      },
      {
        header: 'Created At',
        accessorKey: 'createdAt',
      },
    ],
    [deleteAction.isPending]
  )

  return (
    <>
      <BreadCrumb title="Custom Action" subTitle="Pages" />

      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h6 className="card-title">Custom Action</h6>
              <HelpCircle className="size-4 text-gray-400" />
            </div>

            {!currentProject?.id || createAction.isPending ? (
              <button
                className="btn btn-primary flex items-center gap-2"
                disabled>
                <Plus className="size-4" />
                {createAction.isPending
                  ? 'Creating...'
                  : 'Select Project First'}
              </button>
            ) : (
              <Dropdown trigger="click" dropdownClassName="dropdown">
                <DropdownButton colorClass="btn btn-primary flex items-center gap-2">
                  <Plus className="size-4" />
                  New Action
                </DropdownButton>
                <DropdownMenu menuClass="min-w-80">
                  <button
                    onClick={handleCreateCustomAction}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer w-full text-left">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                      <User className="size-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Custom Action</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Action for custom interactions
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => setIsAgentModalOpen(true)}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer w-full text-left">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Bot className="size-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Call Agent</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Action assigned to a specific agent
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={handleCreateMCPAction}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer w-full text-left">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                      <HelpCircle className="size-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">MCP Action</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Model Context Protocol action
                      </div>
                    </div>
                  </button>
                </DropdownMenu>
              </Dropdown>
            )}
          </div>
        </div>

        <div className="card-body">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : (
            <div>
              <TableContainer
                columns={columns}
                data={filteredActions}
                thClass="!font-medium"
                isSearch={false}
                divClass="overflow-x-auto"
                tableClass="table hovered"
                thtrClass="text-gray-500 bg-gray-100 dark:bg-dark-850 dark:text-dark-500"
                isTableFooter={false}
                isPagination={false}
              />

              <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                <div className="flex items-center gap-4">
                  <div>
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handlePreviousPage}
                      disabled={!pagination.hasPrevPage}
                      className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                      <ChevronLeft className="size-4" />
                    </button>
                    <button
                      onClick={handleNextPage}
                      disabled={!pagination.hasNextPage}
                      className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span>Rows per page:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) =>
                      handleItemsPerPageChange(Number(e.target.value))
                    }
                    className="border rounded px-2 py-1">
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                <div>
                  {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}-
                  {Math.min(
                    pagination.currentPage * pagination.itemsPerPage,
                    pagination.totalItems
                  )}{' '}
                  of {pagination.totalItems} results
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="fixed bottom-4 right-4">
        <button className="btn btn-circle btn-primary">
          <HelpCircle className="size-6" />
        </button>
      </div>

      <DeleteModal
        show={showDeleteModal}
        handleHide={cancelDelete}
        deleteModalFunction={executeDelete}
        title="Delete Action"
        message={
          actionToDelete
            ? `Are you sure you want to delete "${actionToDelete.name}"? This action cannot be undone.`
            : 'Are you sure you want to delete this action?'
        }
        confirmText={deleteAction.isPending ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        type="delete"
      />

      <ModalSelectAgent
        isOpen={isAgentModalOpen}
        onClose={() => setIsAgentModalOpen(false)}
        agents={agents}
        onSelect={handleSelectAgent}
        isLoading={createAction.isPending}
      />

      <ModalMcpProtocol
        isOpen={isMcpProtocolModalOpen}
        onClose={() => setIsMcpProtocolModalOpen(false)}
        onSave={handleSaveMcpProtocol}
        onExecute={handleExecuteMcp}
      />

      <ToastContainer />
    </>
  )
}

const DashboardActions: NextPageWithLayout = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardActionsContent />
    </Suspense>
  )
}

export default DashboardActions
