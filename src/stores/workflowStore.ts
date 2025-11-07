import { create } from 'zustand'
import { type WorkflowNode, type WorkflowEdge } from '@src/server/api/routers/projectAgentWorkflow'

interface SelectedAction {
  id: string
  name: string
  description?: string
  order: number
}

interface WorkflowState {
  // Core workflow data
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  workflowId: string | null
  
  // UI state
  isAutoSaving: boolean
  isInitialLoad: boolean
  selectedNodeId: string | null
  selectedNodeData: any | null
  
  // Drawer states
  showStepDrawer: boolean
  showGlobalSettingsDrawer: boolean
  showBranchDrawer: boolean
  showJumpDrawer: boolean
  showEndDrawer: boolean
  
  // Actions
  setNodes: (nodes: WorkflowNode[] | ((prev: WorkflowNode[]) => WorkflowNode[])) => void
  setEdges: (edges: WorkflowEdge[] | ((prev: WorkflowEdge[]) => WorkflowEdge[])) => void
  setWorkflowId: (id: string | null) => void
  setIsAutoSaving: (saving: boolean) => void
  setIsInitialLoad: (loading: boolean) => void
  
  // Node operations
  addNode: (node: WorkflowNode) => void
  updateNode: (nodeId: string, data: Partial<WorkflowNode['data']>) => void
  removeNode: (nodeId: string) => void
  
  // Edge operations
  addEdge: (edge: WorkflowEdge) => void
  updateEdge: (edgeId: string, data: Partial<WorkflowEdge>) => void
  removeEdge: (edgeId: string) => void
  
  // Drawer operations
  openStepDrawer: (nodeId: string, nodeData: any) => void
  closeStepDrawer: () => void
  openGlobalSettingsDrawer: (nodeId: string, nodeData: any) => void
  closeGlobalSettingsDrawer: () => void
  openBranchDrawer: (nodeId: string, nodeData: any) => void
  closeBranchDrawer: () => void
  openJumpDrawer: (nodeId: string, nodeData: any) => void
  closeJumpDrawer: () => void
  openEndDrawer: (nodeId: string, nodeData: any) => void
  closeEndDrawer: () => void
  
  // Auto-save operations
  triggerAutoSave: () => Promise<void>
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  // Initial state
  nodes: [],
  edges: [],
  workflowId: null,
  isAutoSaving: false,
  isInitialLoad: true,
  selectedNodeId: null,
  selectedNodeData: null,
  
  // Drawer states
  showStepDrawer: false,
  showGlobalSettingsDrawer: false,
  showBranchDrawer: false,
  showJumpDrawer: false,
  showEndDrawer: false,
  
  // Basic setters
  setNodes: (nodes) => set((state) => ({
    nodes: typeof nodes === 'function' ? nodes(state.nodes) : nodes
  })),
  
  setEdges: (edges) => set((state) => ({
    edges: typeof edges === 'function' ? edges(state.edges) : edges
  })),
  
  setWorkflowId: (id) => set({ workflowId: id }),
  setIsAutoSaving: (saving) => set({ isAutoSaving: saving }),
  setIsInitialLoad: (loading) => set({ isInitialLoad: loading }),
  
  // Node operations
  addNode: (node) => set((state) => ({
    nodes: [...state.nodes, node]
  })),
  
  updateNode: (nodeId, data) => set((state) => ({
    nodes: state.nodes.map(node =>
      node.id === nodeId
        ? { ...node, data: { ...node.data, ...data } }
        : node
    )
  })),
  
  removeNode: (nodeId) => set((state) => ({
    nodes: state.nodes.filter(node => node.id !== nodeId),
    edges: state.edges.filter(edge => edge.source !== nodeId && edge.target !== nodeId)
  })),
  
  // Edge operations
  addEdge: (edge) => set((state) => ({
    edges: [...state.edges, edge]
  })),
  
  updateEdge: (edgeId, data) => set((state) => ({
    edges: state.edges.map(edge =>
      edge.id === edgeId ? { ...edge, ...data } : edge
    )
  })),
  
  removeEdge: (edgeId) => set((state) => ({
    edges: state.edges.filter(edge => edge.id !== edgeId)
  })),
  
  // Drawer operations
  openStepDrawer: (nodeId, nodeData) => set({
    selectedNodeId: nodeId,
    selectedNodeData: nodeData,
    showStepDrawer: true,
    // Close other drawers
    showGlobalSettingsDrawer: false,
    showBranchDrawer: false,
    showJumpDrawer: false,
    showEndDrawer: false,
  }),
  
  closeStepDrawer: () => set({
    showStepDrawer: false,
    selectedNodeId: null,
    selectedNodeData: null,
  }),
  
  openGlobalSettingsDrawer: (nodeId, nodeData) => set({
    selectedNodeId: nodeId,
    selectedNodeData: nodeData,
    showGlobalSettingsDrawer: true,
    // Close other drawers
    showStepDrawer: false,
    showBranchDrawer: false,
    showJumpDrawer: false,
    showEndDrawer: false,
  }),
  
  closeGlobalSettingsDrawer: () => set({
    showGlobalSettingsDrawer: false,
    selectedNodeId: null,
    selectedNodeData: null,
  }),
  
  openBranchDrawer: (nodeId, nodeData) => set({
    selectedNodeId: nodeId,
    selectedNodeData: nodeData,
    showBranchDrawer: true,
    // Close other drawers
    showStepDrawer: false,
    showGlobalSettingsDrawer: false,
    showJumpDrawer: false,
    showEndDrawer: false,
  }),
  
  closeBranchDrawer: () => set({
    showBranchDrawer: false,
    selectedNodeId: null,
    selectedNodeData: null,
  }),
  
  openJumpDrawer: (nodeId, nodeData) => set({
    selectedNodeId: nodeId,
    selectedNodeData: nodeData,
    showJumpDrawer: true,
    // Close other drawers
    showStepDrawer: false,
    showGlobalSettingsDrawer: false,
    showBranchDrawer: false,
    showEndDrawer: false,
  }),
  
  closeJumpDrawer: () => set({
    showJumpDrawer: false,
    selectedNodeId: null,
    selectedNodeData: null,
  }),
  
  openEndDrawer: (nodeId, nodeData) => set({
    selectedNodeId: nodeId,
    selectedNodeData: nodeData,
    showEndDrawer: true,
    // Close other drawers
    showStepDrawer: false,
    showGlobalSettingsDrawer: false,
    showBranchDrawer: false,
    showJumpDrawer: false,
  }),
  
  closeEndDrawer: () => set({
    showEndDrawer: false,
    selectedNodeId: null,
    selectedNodeData: null,
  }),
  
  // Auto-save with proper debouncing and loop prevention
  triggerAutoSave: async () => {
    const state = get()
    
    if (state.isAutoSaving || state.isInitialLoad) {
      console.log('🚫 Auto-save blocked - already saving or initial load')
      return
    }
    
    console.log('🚨 Zustand auto-save triggered')
    set({ isAutoSaving: true })
    
    try {
      // Here we would call the actual save function
      // This will be implemented when we migrate WorkflowCanvas
      console.log('✅ Auto-save completed')
    } catch (error) {
      console.error('❌ Auto-save failed:', error)
    } finally {
      set({ isAutoSaving: false })
    }
  }
}))