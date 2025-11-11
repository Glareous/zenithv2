'use client'

import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

import dagre from '@dagrejs/dagre'
import { toast } from 'react-toastify'

import { api } from '@/trpc/react'
import {
  calculateNewNodePosition,
  createSpacingConfig,
  scheduleSpacingUpdate,
} from '@/utils/simpleNodeSpacing'

export type NodeVariant = 'default' | 'end' | 'jump' | 'branch'

export interface WorkflowAction {
  id: string
  name: string
  description: string
}

export interface WorkflowFaq {
  id: string
  question: string
  answer: string
}

export interface WorkflowObjection {
  id: string
  case: string
  instructions: string
}

export interface WorkflowProduct {
  id: string
  name: string
  description?: string
  price?: number
  categories?: Array<{
    name: string
  }>
}

export interface WorkflowService {
  id: string
  name: string
  description?: string
  price?: number
  categories?: Array<{
    name: string
  }>
}

export interface Position {
  x: number
  y: number
}

export interface NodeData {
  variant: NodeVariant
  label: string
  requireUserResponse?: boolean
  instructions?: string
  instructionsDetailed?: string
  hasInstructions?: boolean
  actions: WorkflowAction[]
  faqs: WorkflowFaq[]
  objections: WorkflowObjection[]
  products: WorkflowProduct[]
  services: WorkflowService[]

  branches?: Array<{
    id: string
    label: string
    condition?: string
  }>

  targetNodeId?: string
}

export interface WorkflowEdge {
  id?: string
  source: string
  target: string
  points?: Array<{ x: number; y: number }>
}

export interface WorkflowNode {
  id: string
  label: string
  width: number
  height: number
  x?: number
  y?: number
  data?: NodeData
}

export interface WorkflowEdge {
  source: string
  target: string
  points?: Array<{ x: number; y: number }>
  data?: any
}

export interface Layout {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  width: number
  height: number
}

export interface WorkflowContextValue {
  layout: Layout
  actions: WorkflowAction[]
  isDrawerOpen: boolean
  selectedNodeId: string | null
  drawerVariant: NodeVariant | null
  hasUnsavedChanges: boolean
  isSaving: boolean
  createNode: (
    label?: string,
    parentId?: string | null,
    variant?: NodeVariant
  ) => WorkflowNode
  deleteNode: (nodeId: string) => void
  updateNode: (nodeId: string, updates: Partial<WorkflowNode>) => void
  createBranch: (
    parentId: string,
    leftLabel?: string,
    rightLabel?: string
  ) => { leftChild: WorkflowNode; rightChild: WorkflowNode }
  insertNode: (
    sourceId: string,
    targetId: string,
    label?: string,
    variant?: NodeVariant
  ) => WorkflowNode | null
  insertBranch: (
    sourceId: string,
    targetId: string,
    leftLabel?: string,
    rightLabel?: string
  ) => {
    leftBranch: WorkflowNode
    rightBranch: WorkflowNode
    targetId: string
  } | null
  addFaqToNode: (nodeId: string, faq: WorkflowFaq) => void
  addObjectionToNode: (nodeId: string, objection: WorkflowObjection) => void
  addActionsToNode: (nodeId: string, actions: WorkflowAction[]) => void
  addProductToNode: (
    nodeId: string,
    product: WorkflowProduct | WorkflowProduct[]
  ) => void
  addServiceToNode: (
    nodeId: string,
    service: WorkflowService | WorkflowService[]
  ) => void
  removeFaqFromNode: (nodeId: string, faqId: string) => void
  removeObjectionFromNode: (nodeId: string, objectionId: string) => void
  removeActionFromNode: (nodeId: string, actionId: string) => void
  removeProductFromNode: (nodeId: string, productId: string) => void
  removeServiceFromNode: (nodeId: string, serviceId: string) => void
  openDrawer: (nodeId: string, variant?: NodeVariant) => void
  closeDrawer: () => void
  handleSave: () => Promise<void>
  connectTo: (sourceId: string, targetId: string) => void
  setJumpTarget: (jumpNodeId: string, targetNodeId: string) => void
}

export interface WorkflowProviderProps {
  children: ReactNode
  workflowId: string
  agentId: string
  canManageAgents?: boolean
}

const WorkflowContext = createContext<WorkflowContextValue | undefined>(
  undefined
)

export function WorkflowProvider({
  children,
  workflowId,
  agentId,
  canManageAgents = false,
}: WorkflowProviderProps) {
  const [layout, setLayout] = useState<Layout>({
    nodes: [],
    edges: [],
    width: 0,
    height: 0,
  })
  const [nodeCounter, setNodeCounter] = useState<number>(1)
  const [actions, setActions] = useState<WorkflowAction[]>([])
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [drawerVariant, setDrawerVariant] = useState<NodeVariant | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const justSavedRef = useRef<boolean>(false)
  const isInitialLoadRef = useRef<boolean>(true)

  const spacingConfig = createSpacingConfig({
    minimumGap: 50,
    useActualHeight: false,
  })

  const calculateNodeHeight = useCallback((node: WorkflowNode): number => {
    const variant = node.data?.variant || 'default'

    switch (variant) {
      case 'branch':
        const branchHeight = 40
        return branchHeight

      case 'end':
        const endBaseHeight = 80
        const endMaxHeight = 120
        let endContentHeight = 50

        if (
          node.data?.hasInstructions &&
          (node.data?.instructions || node.data?.instructionsDetailed)
        ) {
          endContentHeight += 30
        } else {
          endContentHeight += 15
        }

        const finalEndHeight = Math.min(
          Math.max(endContentHeight, endBaseHeight),
          endMaxHeight
        )
        return finalEndHeight

      case 'jump':
        const jumpBaseHeight = 100
        const jumpMaxHeight = 140
        let jumpContentHeight = 60

        if (
          node.data?.hasInstructions &&
          (node.data?.instructions || node.data?.instructionsDetailed)
        ) {
          jumpContentHeight += 40
        } else {
          jumpContentHeight += 20
        }

        if (node.data?.targetNodeId) {
          jumpContentHeight += 20
        }

        const finalJumpHeight = Math.min(
          Math.max(jumpContentHeight, jumpBaseHeight),
          jumpMaxHeight
        )

        return finalJumpHeight

      case 'default':
      default:
        const baseHeight = 100
        const maxHeight = 170
        let contentHeight = 60

        if (
          node.data?.hasInstructions &&
          (node.data?.instructions || node.data?.instructionsDetailed)
        ) {
          contentHeight += 40
        } else {
          contentHeight += 20
        }

        const hasContent =
          (node.data?.actions?.length || 0) > 0 ||
          (node.data?.faqs?.length || 0) > 0 ||
          (node.data?.objections?.length || 0) > 0

        if (hasContent) {
          contentHeight += 15

          if (node.data?.actions?.length) {
            const actionsPerRow = Math.floor(280 / 80)
            const actionRows = Math.ceil(
              node.data.actions.length / actionsPerRow
            )
            contentHeight += actionRows * 28
          }

          if (
            (node.data?.faqs?.length || 0) > 0 ||
            (node.data?.objections?.length || 0) > 0
          ) {
            contentHeight += 20
          }
        }

        const finalDefaultHeight = Math.min(
          Math.max(contentHeight, baseHeight),
          maxHeight
        )

        return finalDefaultHeight
    }
  }, [])

  const generateLayout = useCallback(
    (nodes: WorkflowNode[], edges: WorkflowEdge[]) => {
      if (nodes.length === 0) {
        setLayout({ nodes: [], edges: [], width: 0, height: 0 })
        return
      }

      const dagreGraph = new dagre.graphlib.Graph()
      dagreGraph.setDefaultEdgeLabel(() => ({}))
      dagreGraph.setGraph({
        rankdir: 'TB',
        nodesep: 400,
        ranksep: 160,
        marginx: 40,
        marginy: 40,
      })

      nodes.forEach((node) => {
        const dynamicHeight = calculateNodeHeight(node)
        const variant = node.data?.variant || 'default'

        const nodeWidth = variant === 'branch' ? 80 : 280

        dagreGraph.setNode(node.id, {
          width: nodeWidth,
          height: dynamicHeight,
        })
      })

      edges.forEach((edge) => {
        const sourceNode = nodes.find((n) => n.id === edge.source)

        if (sourceNode?.data?.variant === 'jump') {
          return
        }

        dagreGraph.setEdge(edge.source, edge.target)
      })

      dagre.layout(dagreGraph)

      const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id)

        return {
          ...node,
          x: nodeWithPosition.x,
          y: nodeWithPosition.y,
          height: calculateNodeHeight(node),
        }
      })

      const layoutedEdges = edges.map((edge) => {
        const sourceNode = nodes.find((n) => n.id === edge.source)

        if (sourceNode?.data?.variant === 'jump') {
          return {
            ...edge,
            points: [],
          }
        }

        const edgeWithPoints = dagreGraph.edge(edge.source, edge.target)
        return {
          ...edge,
          points: edgeWithPoints?.points || [],
        }
      })

      const graph = dagreGraph.graph()

      const newLayout = {
        nodes: layoutedNodes,
        edges: layoutedEdges,
        width: graph.width || 0,
        height: graph.height || 0,
      }

      setLayout(newLayout)
    },
    [calculateNodeHeight]
  )

  const { data: workflowData } = api.projectAgentWorkflow.getByAgentId.useQuery(
    { agentId },
    { enabled: !!agentId }
  )

  const { data: projectActionsData } = api.projectAction.getAllActive.useQuery(
    { projectId: workflowData?.projectId || undefined },
    { enabled: workflowData !== undefined }
  )

  const saveWorkflowMutation = api.projectAgentWorkflow.upsert.useMutation({
    onSuccess: () => {
      setHasUnsavedChanges(false)
      toast.success('Workflow saved successfully')

      justSavedRef.current = true
      setTimeout(() => {
        justSavedRef.current = false
      }, 1000)
    },
    onError: (error) => {
      toast.error('Failed to save workflow')
    },
  })

  useEffect(() => {
    if (workflowData) {
      const workflowNodes = Array.isArray(workflowData.nodes)
        ? workflowData.nodes
        : []
      const workflowEdges = Array.isArray(workflowData.edges)
        ? workflowData.edges
        : []

      if (workflowNodes.length === 0) {
        const defaultNode: WorkflowNode = {
          id: 'node_1',
          label: 'Start',
          width: 100,
          height: 50,
          data: {
            variant: 'default',
            label: 'Start',
            requireUserResponse: true,
            instructions: '',
            instructionsDetailed: '',
            hasInstructions: false,
            actions: [],
            faqs: [],
            objections: [],
            products: [],
            services: [],
          },
        }

        setNodeCounter(2)
        generateLayout([defaultNode], [])
      } else {
        const transformedNodes: WorkflowNode[] = workflowNodes.map(
          (node: any) => ({
            id: node.id,
            label: node.data?.label || node.label || '',
            width: 100,
            height: 50,
            x: node.position?.x || node.x || 0,
            y: node.position?.y || node.y || 0,
            data: {
              variant: node.data?.variant || 'default',
              label: node.data?.label || node.label || '',
              requireUserResponse: node.data?.requireUserResponse ?? (node.data?.variant === 'default' || node.data?.variant === 'end' || node.data?.variant === undefined ? true : false),
              instructions: node.data?.instructions || '',
              instructionsDetailed: node.data?.instructionsDetailed || '',
              hasInstructions: Boolean(node.data?.instructions),
              targetNodeId: node.data?.targetNodeId,
              branches: node.data?.branches || [],
              actions: node.data?.actions || [],
              faqs: node.data?.faqs || [],
              objections: node.data?.objections || [],
              products: node.data?.products || [],
              services: node.data?.services || [],
            },
          })
        )

        const transformedEdges: WorkflowEdge[] = workflowEdges.map(
          (edge: any) => ({
            source: edge.source,
            target: edge.target,
          })
        )

        generateLayout(transformedNodes, transformedEdges)

        const maxNodeNum = Math.max(
          ...transformedNodes.map((node) => {
            const match = node.id.match(/node_(\d+)/)
            return match ? parseInt(match[1], 10) : 0
          })
        )
        setNodeCounter(maxNodeNum + 1)
      }
    }
  }, [workflowData, generateLayout])

  useEffect(() => {
    if (projectActionsData) {
      const mappedActions: WorkflowAction[] = projectActionsData.map(
        (action) => ({
          id: action.id,
          name: action.name,
          description: action.description || '',

          ...(action as any),
        })
      )

      setActions(mappedActions)
    }
  }, [projectActionsData])

  useEffect(() => {
    if (!layout.nodes.length && !layout.edges.length) return

    if (isSaving) return

    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false
      return
    }

    if (justSavedRef.current) {
      return
    }

    setHasUnsavedChanges(true)
  }, [layout, isSaving])

  const createNode = useCallback(
    (
      label = `Node ${nodeCounter}`,
      parentId: string | null = null,
      variant: NodeVariant = 'default'
    ): WorkflowNode => {
      const newNode: WorkflowNode = {
        id: `node_${nodeCounter}`,
        label,
        width: 100,
        height: 50,
        data: {
          variant,
          label,
          requireUserResponse: variant === 'default' || variant === 'end' ? true : false,
          instructions: '',
          instructionsDetailed: '',
          hasInstructions: false,
          actions: [],
          faqs: [],
          objections: [],
          products: [],
          services: [],
        },
      }

      const newNodes = [...layout.nodes, newNode]
      let newEdges = [...layout.edges]

      if (parentId) {
        const newEdge: WorkflowEdge = {
          source: parentId,
          target: newNode.id,
        }
        newEdges = [...layout.edges, newEdge]
      }

      setNodeCounter((prev) => prev + 1)

      generateLayout(newNodes, newEdges)

      return newNode
    },
    [nodeCounter, layout]
  )

  const deleteNode = useCallback(
    (nodeId: string): void => {
      const nodesToDelete = new Set<string>()

      const findDownstreamNodes = (currentNodeId: string) => {
        if (nodesToDelete.has(currentNodeId)) return

        nodesToDelete.add(currentNodeId)

        const outgoingEdges = layout.edges.filter(
          (edge) => edge.source === currentNodeId
        )

        outgoingEdges.forEach((edge) => {
          findDownstreamNodes(edge.target)
        })
      }

      findDownstreamNodes(nodeId)

      const newNodes = layout.nodes.filter(
        (node) => !nodesToDelete.has(node.id)
      )

      const newEdges = layout.edges.filter(
        (edge) =>
          !nodesToDelete.has(edge.source) && !nodesToDelete.has(edge.target)
      )

      generateLayout(newNodes, newEdges)
    },
    [layout, generateLayout]
  )

  const updateNode = useCallback(
    (nodeId: string, updates: Partial<WorkflowNode>): void => {
      const newNodes = layout.nodes.map((node) => {
        if (node.id === nodeId) {
          const updatedNode = { ...node, ...updates }

          if (updates.data?.label) {
            updatedNode.label = updates.data.label
          }

          return updatedNode
        }
        return node
      })

      generateLayout(newNodes, layout.edges)
    },
    [layout, generateLayout]
  )

  const createBranch = useCallback(
    (parentId: string, leftLabel = 'Yes', rightLabel = 'No') => {
      const parentNode = layout.nodes.find((node) => node.id === parentId)

      if (parentNode?.data?.variant === 'branch') {
        const grandParentEdge = layout.edges.find(
          (edge) => edge.target === parentId
        )

        if (grandParentEdge) {
          const grandParentId = grandParentEdge.source

          const newBranch: WorkflowNode = {
            id: `node_${nodeCounter}`,
            label: leftLabel,
            width: 80,
            height: 40,
            data: {
              variant: 'branch',
              label: leftLabel,
              instructions: '',
              instructionsDetailed: '',
              hasInstructions: false,
              actions: [],
              faqs: [],
              objections: [],
              products: [],
              services: [],
            },
          }

          const newNodes = [...layout.nodes, newBranch]
          const newEdges: WorkflowEdge[] = [
            ...layout.edges,
            { source: grandParentId, target: newBranch.id },
          ]

          setNodeCounter((prev) => prev + 1)

          generateLayout(newNodes, newEdges)

          return { leftChild: newBranch, rightChild: newBranch }
        }
      }

      const leftChild: WorkflowNode = {
        id: `node_${nodeCounter}`,
        label: leftLabel,
        width: 80,
        height: 40,
        data: {
          variant: 'branch',
          label: leftLabel,
          instructions: '',
          instructionsDetailed: '',
          hasInstructions: false,
          actions: [],
          faqs: [],
          objections: [],
          products: [],
          services: [],
        },
      }

      const rightChild: WorkflowNode = {
        id: `node_${nodeCounter + 1}`,
        label: rightLabel,
        width: 80,
        height: 40,
        data: {
          variant: 'branch',
          label: rightLabel,
          instructions: '',
          instructionsDetailed: '',
          hasInstructions: false,
          actions: [],
          faqs: [],
          objections: [],
          products: [],
          services: [],
        },
      }

      const newNodes = [...layout.nodes, leftChild, rightChild]
      const newEdges: WorkflowEdge[] = [
        ...layout.edges,
        { source: parentId, target: leftChild.id },
        { source: parentId, target: rightChild.id },
      ]

      setNodeCounter((prev) => prev + 2)

      generateLayout(newNodes, newEdges)

      return { leftChild, rightChild }
    },
    [nodeCounter, layout, generateLayout]
  )

  const insertNode = useCallback(
    (
      sourceId: string,
      targetId: string,
      label = `Inserted ${nodeCounter}`,
      variant: NodeVariant = 'default'
    ): WorkflowNode | null => {
      const edgeExists = layout.edges.find(
        (edge) => edge.source === sourceId && edge.target === targetId
      )

      if (!edgeExists) return null

      const targetNode = layout.nodes.find((node) => node.id === targetId)

      if (targetNode?.data?.variant === 'branch') {
        const allBranchEdges = layout.edges.filter(
          (edge) =>
            edge.source === sourceId &&
            layout.nodes.find((node) => node.id === edge.target)?.data
              ?.variant === 'branch'
        )

        if (allBranchEdges.length > 0) {
          const newNode: WorkflowNode = {
            id: `node_${nodeCounter}`,
            label,
            width: 100,
            height: 50,
            data: {
              variant,
              label,
              instructions: '',
              instructionsDetailed: '',
              hasInstructions: false,
              actions: [],
              faqs: [],
              objections: [],
              products: [],
              services: [],
            },
          }

          const newNodes = [...layout.nodes, newNode]

          const filteredEdges = layout.edges.filter(
            (edge) =>
              !(
                edge.source === sourceId &&
                layout.nodes.find((node) => node.id === edge.target)?.data
                  ?.variant === 'branch'
              )
          )

          const newEdges: WorkflowEdge[] = [
            ...filteredEdges,
            { source: sourceId, target: newNode.id },
            ...allBranchEdges.map((edge) => ({
              source: newNode.id,
              target: edge.target,
            })),
          ]

          setNodeCounter((prev) => prev + 1)

          generateLayout(newNodes, newEdges)

          return newNode
        }
      }

      const newNode: WorkflowNode = {
        id: `node_${nodeCounter}`,
        label,
        width: 100,
        height: 50,
        data: {
          variant,
          label,
          instructions: '',
          instructionsDetailed: '',
          hasInstructions: false,
          actions: [],
          faqs: [],
          objections: [],
          products: [],
          services: [],
        },
      }

      const newNodes = [...layout.nodes, newNode]
      const newEdges: WorkflowEdge[] = layout.edges
        .filter(
          (edge) => !(edge.source === sourceId && edge.target === targetId)
        )
        .concat([
          { source: sourceId, target: newNode.id },
          { source: newNode.id, target: targetId },
        ])

      setNodeCounter((prev) => prev + 1)

      generateLayout(newNodes, newEdges)

      return newNode
    },
    [nodeCounter, layout, generateLayout]
  )

  const insertBranch = useCallback(
    (
      sourceId: string,
      targetId: string,
      leftLabel = 'Yes',
      rightLabel = 'No'
    ) => {
      const edgeExists = layout.edges.find(
        (edge) => edge.source === sourceId && edge.target === targetId
      )

      if (!edgeExists) return null

      const targetNode = layout.nodes.find((node) => node.id === targetId)
      const sourceNode = layout.nodes.find((node) => node.id === sourceId)

      if (sourceNode?.data?.variant === 'branch') {
        const parentEdge = layout.edges.find((edge) => edge.target === sourceId)

        if (parentEdge) {
          const parentNodeId = parentEdge.source

          const newBranch: WorkflowNode = {
            id: `node_${nodeCounter}`,
            label: leftLabel,
            width: 80,
            height: 40,
            data: {
              variant: 'branch',
              label: leftLabel,
              instructions: '',
              instructionsDetailed: '',
              hasInstructions: false,
              actions: [],
              faqs: [],
              objections: [],
              products: [],
              services: [],
            },
          }

          const newNodes = [...layout.nodes, newBranch]

          const newEdges: WorkflowEdge[] = [
            ...layout.edges,
            { source: parentNodeId, target: newBranch.id },
          ]

          setNodeCounter((prev) => prev + 1)

          generateLayout(newNodes, newEdges)

          return { leftBranch: newBranch, rightBranch: newBranch, targetId }
        }
      }

      if (targetNode?.data?.variant === 'branch') {
        const allBranchEdges = layout.edges.filter(
          (edge) =>
            edge.source === sourceId &&
            layout.nodes.find((node) => node.id === edge.target)?.data
              ?.variant === 'branch'
        )

        if (allBranchEdges.length > 0) {
          const newBranch: WorkflowNode = {
            id: `node_${nodeCounter}`,
            label: leftLabel,
            width: 80,
            height: 40,
            data: {
              variant: 'branch',
              label: leftLabel,
              instructions: '',
              instructionsDetailed: '',
              hasInstructions: false,
              actions: [],
              faqs: [],
              objections: [],
              products: [],
              services: [],
            },
          }

          const newNodes = [...layout.nodes, newBranch]

          const newEdges: WorkflowEdge[] = [
            ...layout.edges,
            { source: sourceId, target: newBranch.id },
          ]

          setNodeCounter((prev) => prev + 1)

          generateLayout(newNodes, newEdges)

          return { leftBranch: newBranch, rightBranch: newBranch, targetId }
        }
      }

      const leftBranch: WorkflowNode = {
        id: `node_${nodeCounter}`,
        label: leftLabel,
        width: 80,
        height: 40,
        data: {
          variant: 'branch',
          label: leftLabel,
          instructions: '',
          instructionsDetailed: '',
          hasInstructions: false,
          actions: [],
          faqs: [],
          objections: [],
          products: [],
          services: [],
        },
      }

      const rightBranch: WorkflowNode = {
        id: `node_${nodeCounter + 1}`,
        label: rightLabel,
        width: 80,
        height: 40,
        data: {
          variant: 'branch',
          label: rightLabel,
          instructions: '',
          instructionsDetailed: '',
          hasInstructions: false,
          actions: [],
          faqs: [],
          objections: [],
          products: [],
          services: [],
        },
      }

      const newNodes = [...layout.nodes, leftBranch, rightBranch]

      const filteredEdges = layout.edges.filter(
        (edge) => !(edge.source === sourceId && edge.target === targetId)
      )

      const newEdges: WorkflowEdge[] = [
        ...filteredEdges,

        { source: sourceId, target: leftBranch.id },
        { source: sourceId, target: rightBranch.id },

        { source: leftBranch.id, target: targetId },
      ]

      setNodeCounter((prev) => prev + 2)

      generateLayout(newNodes, newEdges)

      return { leftBranch, rightBranch, targetId }
    },
    [nodeCounter, layout, generateLayout]
  )

  const addFaqToNode = useCallback(
    (nodeId: string, faq: WorkflowFaq): void => {
      const newNodes = layout.nodes.map((node) => {
        if (node.id === nodeId && node.data) {
          const updatedFaqs = [...(node.data.faqs || []), faq]
          return {
            ...node,
            data: {
              ...node.data,
              faqs: updatedFaqs,
            },
          }
        }
        return node
      })

      generateLayout(newNodes, layout.edges)
    },
    [layout, generateLayout]
  )

  const addObjectionToNode = useCallback(
    (nodeId: string, objection: WorkflowObjection): void => {
      const newNodes = layout.nodes.map((node) => {
        if (node.id === nodeId && node.data) {
          const updatedObjections = [...(node.data.objections || []), objection]
          return {
            ...node,
            data: {
              ...node.data,
              objections: updatedObjections,
            },
          }
        }
        return node
      })

      generateLayout(newNodes, layout.edges)
    },
    [layout, generateLayout]
  )

  const addActionsToNode = useCallback(
    (nodeId: string, actions: WorkflowAction[]): void => {
      const newNodes = layout.nodes.map((node) => {
        if (node.id === nodeId && node.data) {
          const updatedActions = [...(node.data.actions || []), ...actions]
          return {
            ...node,
            data: {
              ...node.data,
              actions: updatedActions,
            },
          }
        }
        return node
      })

      generateLayout(newNodes, layout.edges)
    },
    [layout, generateLayout]
  )

  const addProductToNode = useCallback(
    (nodeId: string, product: WorkflowProduct | WorkflowProduct[]): void => {
      const productsToAdd = Array.isArray(product) ? product : [product]

      const newNodes = layout.nodes.map((node) => {
        if (node.id === nodeId && node.data) {
          const updatedProducts = [
            ...(node.data.products || []),
            ...productsToAdd,
          ]
          return {
            ...node,
            data: {
              ...node.data,
              products: updatedProducts,
            },
          }
        }
        return node
      })

      generateLayout(newNodes, layout.edges)
    },
    [layout, generateLayout]
  )

  const addServiceToNode = useCallback(
    (nodeId: string, service: WorkflowService | WorkflowService[]): void => {
      const servicesToAdd = Array.isArray(service) ? service : [service]

      const newNodes = layout.nodes.map((node) => {
        if (node.id === nodeId && node.data) {
          const updatedServices = [
            ...(node.data.services || []),
            ...servicesToAdd,
          ]
          return {
            ...node,
            data: {
              ...node.data,
              services: updatedServices,
            },
          }
        }
        return node
      })

      generateLayout(newNodes, layout.edges)
    },
    [layout, generateLayout]
  )

  const removeFaqFromNode = useCallback(
    (nodeId: string, faqId: string): void => {
      const newNodes = layout.nodes.map((node) => {
        if (node.id === nodeId && node.data) {
          const updatedFaqs = (node.data.faqs || []).filter(
            (faq) => faq.id !== faqId
          )
          return {
            ...node,
            data: {
              ...node.data,
              faqs: updatedFaqs,
            },
          }
        }
        return node
      })

      generateLayout(newNodes, layout.edges)
    },
    [layout, generateLayout]
  )

  const removeObjectionFromNode = useCallback(
    (nodeId: string, objectionId: string): void => {
      const newNodes = layout.nodes.map((node) => {
        if (node.id === nodeId && node.data) {
          const updatedObjections = (node.data.objections || []).filter(
            (objection) => objection.id !== objectionId
          )
          return {
            ...node,
            data: {
              ...node.data,
              objections: updatedObjections,
            },
          }
        }
        return node
      })

      generateLayout(newNodes, layout.edges)
    },
    [layout, generateLayout]
  )

  const removeActionFromNode = useCallback(
    (nodeId: string, actionId: string): void => {
      const newNodes = layout.nodes.map((node) => {
        if (node.id === nodeId && node.data) {
          const updatedActions = (node.data.actions || []).filter(
            (action) => action.id !== actionId
          )
          return {
            ...node,
            data: {
              ...node.data,
              actions: updatedActions,
            },
          }
        }
        return node
      })

      generateLayout(newNodes, layout.edges)
    },
    [layout, generateLayout]
  )

  const removeProductFromNode = useCallback(
    (nodeId: string, productId: string): void => {
      const newNodes = layout.nodes.map((node) => {
        if (node.id === nodeId && node.data) {
          const updatedProducts = (node.data.products || []).filter(
            (product) => product.id !== productId
          )
          return {
            ...node,
            data: {
              ...node.data,
              products: updatedProducts,
            },
          }
        }
        return node
      })

      generateLayout(newNodes, layout.edges)
    },
    [layout, generateLayout]
  )

  const removeServiceFromNode = useCallback(
    (nodeId: string, serviceId: string): void => {
      const newNodes = layout.nodes.map((node) => {
        if (node.id === nodeId && node.data) {
          const updatedServices = (node.data.services || []).filter(
            (service) => service.id !== serviceId
          )
          return {
            ...node,
            data: {
              ...node.data,
              services: updatedServices,
            },
          }
        }
        return node
      })

      generateLayout(newNodes, layout.edges)
    },
    [layout, generateLayout]
  )

  const openDrawer = useCallback(
    (nodeId: string, variant?: NodeVariant): void => {
      const node = layout.nodes.find((n) => n.id === nodeId)
      const nodeVariant = variant || node?.data?.variant || 'default'

      setSelectedNodeId(nodeId)
      setDrawerVariant(nodeVariant)
      setIsDrawerOpen(true)
    },
    [layout.nodes]
  )

  const closeDrawer = useCallback((): void => {
    setIsDrawerOpen(false)
    setSelectedNodeId(null)
    setDrawerVariant(null)
  }, [])

  const handleSave = useCallback(async (): Promise<void> => {
    // Don't save if user doesn't have permission
    if (!canManageAgents) {
      console.log('⚠️ Save blocked: User does not have permission to save workflow')
      return
    }

    if (!hasUnsavedChanges || isSaving) return

    setIsSaving(true)
    try {
      const workflowNodes = layout.nodes.map((node) => ({
        id: node.id,
        type: 'cardStep',
        position: {
          x: node.x || 0,
          y: node.y || 0,
        },
        data: {
          variant: node.data?.variant || 'default',
          label: node.data?.label || node.label || '',
          requireUserResponse: node.data?.requireUserResponse,
          instructions: node.data?.instructions || '',
          instructionsDetailed: node.data?.instructionsDetailed || '',
          hasInstructions: Boolean(node.data?.instructions),
          targetNodeId: node.data?.targetNodeId,
          branches: node.data?.branches || [],
          actions: node.data?.actions || [],
          faqs: node.data?.faqs || [],
          objections: node.data?.objections || [],
          products: node.data?.products || [],
          services: node.data?.services || [],
        },
      }))

      const workflowEdges = layout.edges.map((edge) => ({
        id: `${edge.source}-${edge.target}`,
        source: edge.source,
        target: edge.target,
        type: 'step',
        animated: true,
        style: {
          stroke: '#6366f1',
          strokeWidth: 2,
        },
      }))

      await saveWorkflowMutation.mutateAsync({
        agentId,
        workflow: {
          name: workflowData?.name || '',
          description: workflowData?.description || '',
          instructions: workflowData?.instructions || '',
          globalActions: (Array.isArray(workflowData?.globalActions)
            ? workflowData?.globalActions
            : []) as unknown as WorkflowAction[],
          globalFaqs: (Array.isArray(workflowData?.globalFaqs)
            ? workflowData?.globalFaqs
            : []) as unknown as WorkflowFaq[],
          globalObjections: (Array.isArray(workflowData?.globalObjections)
            ? workflowData?.globalObjections
            : []) as unknown as WorkflowObjection[],
          nodes: workflowNodes,
          edges: workflowEdges,
          positionX: workflowData?.positionX || 250,
          positionY: workflowData?.positionY || 25,
        },
      })
    } catch (error) {
    } finally {
      setIsSaving(false)
    }
  }, [
    canManageAgents,
    hasUnsavedChanges,
    isSaving,
    saveWorkflowMutation,
    agentId,
    workflowData,
    layout,
  ])

  const connectTo = useCallback(
    (sourceId: string, targetId: string): void => {
      const existingEdge = layout.edges.find(
        (edge) => edge.source === sourceId && edge.target === targetId
      )

      if (existingEdge) {
        return
      }

      const newEdge: WorkflowEdge = {
        source: sourceId,
        target: targetId,
      }

      const newEdges = [...layout.edges, newEdge]

      setLayout((prevLayout) => ({
        ...prevLayout,
        edges: newEdges,
      }))

      setHasUnsavedChanges(true)
    },
    [layout]
  )

  const setJumpTarget = useCallback(
    (jumpNodeId: string, targetNodeId: string): void => {
      const filteredEdges = layout.edges.filter(
        (edge) => edge.source !== jumpNodeId
      )

      const newEdges = targetNodeId
        ? [
            ...filteredEdges,
            {
              source: jumpNodeId,
              target: targetNodeId,
            },
          ]
        : filteredEdges

      setLayout((prevLayout) => ({
        ...prevLayout,
        edges: newEdges,
      }))

      setHasUnsavedChanges(true)
    },
    [layout]
  )

  useEffect(() => {
    if (!hasUnsavedChanges || isSaving) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
        autoSaveTimeoutRef.current = null
      }
      return
    }

    if (!layout.nodes.length && !layout.edges.length) return

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      if (!isSaving && hasUnsavedChanges) {
        handleSave()
      }
    }, 2000)

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [hasUnsavedChanges, isSaving, handleSave])

  const value: WorkflowContextValue = {
    layout,
    actions,

    isDrawerOpen,
    selectedNodeId,
    drawerVariant,

    hasUnsavedChanges,
    isSaving,

    createNode,
    deleteNode,
    updateNode,
    createBranch,
    insertNode,
    insertBranch,
    addFaqToNode,
    addObjectionToNode,
    addActionsToNode,
    addProductToNode,
    addServiceToNode,
    removeFaqFromNode,
    removeObjectionFromNode,
    removeActionFromNode,
    removeProductFromNode,
    removeServiceFromNode,
    openDrawer,
    closeDrawer,
    handleSave,
    connectTo,
    setJumpTarget,
  }

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  )
}

export function useWorkflow(): WorkflowContextValue {
  const context = useContext(WorkflowContext)
  if (!context) {
    throw new Error('useWorkflow must be used within WorkflowProvider')
  }
  return context
}
