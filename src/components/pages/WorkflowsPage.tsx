'use client'

import React, { useCallback, useEffect, useState } from 'react'

import CardStep from '@src/components/molecules/CardStep'
import DrawerBranch from '@src/components/organisms/DrawerBranch'
import DrawerEndStep from '@src/components/organisms/DrawerEndStep'
import DrawerJumpStep from '@src/components/organisms/DrawerJumpStep'
import DrawerStep from '@src/components/organisms/DrawerStep'
import {
  Background,
  Connection,
  Controls,
  Edge,
  Handle,
  MiniMap,
  Node,
  NodeTypes,
  Position,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Loader2, Plus, Save, Trash2 } from 'lucide-react'

import DeleteModal from '@/components/common/DeleteModal'
import { useWorkflow } from '@/contexts/WorkflowContext'

const CustomCardStep = ({
  id,
  data,
  selected,
  dragging,
  onDeleteRequest,
  canManageAgents,
}: any) => {
  const { openDrawer } = useWorkflow()

  const handleDoubleClick = (nodeId: string) => {
    if (canManageAgents) {
      openDrawer(nodeId, data.variant)
    }
  }

  return (
    <CardStep
      id={id}
      data={data}
      selected={selected}
      dragging={dragging}
      onDoubleClick={handleDoubleClick}
      onDeleteRequest={onDeleteRequest}
      canManageAgents={canManageAgents}
    />
  )
}

const nodeTypes: NodeTypes = {
  cardStep: CustomCardStep,
}

interface WorkflowsPageProps {
  canManageAgents?: boolean
}

const WorkflowsPage: React.FC<WorkflowsPageProps> = ({
  canManageAgents = true,
}) => {
  const {
    layout,
    createNode,
    createBranch,
    deleteNode,
    isDrawerOpen,
    selectedNodeId,
    drawerVariant,
    closeDrawer,
    openDrawer,
    hasUnsavedChanges,
    isSaving,
    handleSave,
  } = useWorkflow()

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [nodeToDelete, setNodeToDelete] = useState<{
    id: string
    label: string
  } | null>(null)

  const handleDeleteRequest = (nodeId: string, nodeLabel: string) => {
    setNodeToDelete({ id: nodeId, label: nodeLabel })
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteNode = () => {
    if (nodeToDelete) {
      deleteNode(nodeToDelete.id)
      setIsDeleteModalOpen(false)
      setNodeToDelete(null)
    }
  }

  const cancelDelete = () => {
    setIsDeleteModalOpen(false)
    setNodeToDelete(null)
  }

  const reactFlowNodes: Node[] = layout.nodes.map((node) => {
    const dagrePos = { x: node.x || 0, y: node.y || 0 }
    const reactFlowPos = { x: dagrePos.x - 60, y: dagrePos.y }

    return {
      id: node.id,
      type: 'cardStep',
      position: reactFlowPos,
      data: {
        variant: (node.data?.variant || 'default') as
          | 'default'
          | 'end'
          | 'jump'
          | 'branch',
        label: node.label,
        instructions: node.data?.instructions,
        hasInstructions: Boolean(node.data?.instructions),
        targetNodeId: node.data?.targetNodeId,
        branches: node.data?.branches || [],
        actions: node.data?.actions || [],
        faqs: node.data?.faqs || [],
        objections: node.data?.objections || [],
        onDeleteRequest: handleDeleteRequest,
        canManageAgents,
      },
    }
  })

  const reactFlowEdges: Edge[] = layout.edges.map((edge) => ({
    id: `${edge.source}-${edge.target}`,
    source: edge.source,
    target: edge.target,
    type: 'step',
    animated: true,
    style: {
      stroke: '#6366f1',
      strokeWidth: 2,
      strokeDasharray: '5,5',
    },

    pathOptions: {
      borderRadius: 20,
      offset: 20,
    },
  }))

  const [nodes, setNodes, onNodesChange] = useNodesState(reactFlowNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(reactFlowEdges)

  useEffect(() => {
    setNodes(reactFlowNodes)
    setEdges(reactFlowEdges)
  }, [layout, setNodes, setEdges])

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const handleAddNode = () => {
    const stepCount =
      layout.nodes.filter((node) => node.label.startsWith('Step')).length + 1
    createNode(`Step ${stepCount}`)
  }

  const handleAddBranch = () => {
    if (layout.nodes.length > 0) {
      const lastNode = layout.nodes[layout.nodes.length - 1]
      const branchCount =
        layout.nodes.filter((node) => node.label.startsWith('Branch')).length +
        1
      createBranch(
        lastNode.id,
        `Branch ${branchCount}`,
        `Branch ${branchCount + 1}`
      )
    }
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 's') {
        event.preventDefault()
        if (hasUnsavedChanges && !isSaving) {
          handleSave()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [hasUnsavedChanges, isSaving, handleSave])

  return (
    <div className="h-screen bg-gray-50 m-5 card">
      {/* Workflow Canvas */}
      <div className="h-screen relative m-2">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDoubleClick={(event, node) => {
            if (canManageAgents) {
              openDrawer(node.id, node.data?.variant as any)
            }
          }}
          nodeTypes={nodeTypes}
          nodesDraggable={false}
          edgesUpdatable={canManageAgents}
          nodesConnectable={canManageAgents}
          zoomOnDoubleClick={false}
          fitView={false}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          className="bg-gray-100">
          <Background gap={16} />
          <Controls
            className="bg-white shadow-lg rounded-lg border-2 border-gray-200"
            showZoom={true}
            showFitView={true}
            showInteractive={true}
          />
          <MiniMap
            nodeColor={(node) => {
              switch (node.data?.variant) {
                case 'end':
                  return '#fca5a5'
                case 'jump':
                  return '#93c5fd'
                case 'branch':
                  return '#c4b5fd'
                default:
                  return '#c4b5fd'
              }
            }}
            maskColor="rgb(240, 240, 240, 0.6)"
            className="bg-white border-2 border-gray-200 shadow-lg rounded-lg"
            pannable
            zoomable
          />
        </ReactFlow>

        {/* Floating Save Button & Status - Inside Canvas */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
          {hasUnsavedChanges && (
            <div className="flex items-center space-x-2 text-amber-600 bg-white px-3 py-2 rounded-lg shadow-lg border">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Unsaved changes</span>
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={!canManageAgents || !hasUnsavedChanges || isSaving}
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="bg-white  px-6 py-3">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex gap-6">
            <span>Nodes: {layout.nodes.length}</span>
            <span>Connections: {layout.edges.length}</span>
          </div>
          <div className="text-gray-500">
            Use the toolbar to add nodes and create workflow branches
          </div>
        </div>
      </div>

      {/* Centralized Drawer Management */}
      {drawerVariant === 'default' && (
        <DrawerStep
          isOpen={isDrawerOpen}
          onClose={closeDrawer}
          nodeId={selectedNodeId || undefined}
        />
      )}

      {drawerVariant === 'jump' && (
        <DrawerJumpStep
          isOpen={isDrawerOpen}
          onClose={closeDrawer}
          nodeId={selectedNodeId || undefined}
        />
      )}

      {drawerVariant === 'branch' && (
        <DrawerBranch
          isOpen={isDrawerOpen}
          onClose={closeDrawer}
          nodeId={selectedNodeId || undefined}
        />
      )}

      {drawerVariant === 'end' && (
        <DrawerEndStep
          isOpen={isDrawerOpen}
          onClose={closeDrawer}
          nodeId={selectedNodeId || undefined}
        />
      )}

      {/* Delete Modal */}
      <DeleteModal
        show={isDeleteModalOpen}
        handleHide={cancelDelete}
        deleteModalFunction={confirmDeleteNode}
        title={
          nodeToDelete ? `Delete "${nodeToDelete.label}"?` : 'Delete Node?'
        }
        message={
          nodeToDelete
            ? `Are you sure you want to delete "${nodeToDelete.label}"? This action cannot be undone.`
            : 'Are you sure you want to delete this node? This action cannot be undone.'
        }
        confirmText="Delete"
        cancelText="Cancel"
        type="delete"
      />
    </div>
  )
}

export default WorkflowsPage
