// Types for branch creation with automatic step dragging functionality

export interface BranchWithDragOptions {
  /** Whether to preserve the original step's label instead of using "Decision Point" */
  preserveStepLabel?: boolean
  /** Whether to automatically transfer connected steps to Branch 1 */
  enableStepDrag?: boolean
  /** Custom branch labels instead of default "Branch" and "Branch" */
  branchLabels?: [string, string]
}

export interface StepDragResult {
  /** Whether the drag operation was successful */
  success: boolean
  /** Number of steps transferred to Branch 1 */
  transferredStepsCount: number
  /** IDs of steps that were moved to Branch 1 */
  transferredStepIds: string[]
  /** ID of the created Branch 1 node */
  branch1NodeId: string
  /** ID of the created Branch 2 node */
  branch2NodeId: string
  /** Error message if operation failed */
  error?: string
}

export interface BranchCreationContext {
  /** ID of the source node (Step A) */
  sourceNodeId: string
  /** ID of the target node that will be dragged (Step B) */
  targetNodeId?: string
  /** Position where the branch node should be created */
  branchPosition: { x: number; y: number }
  /** Options for the branch creation */
  options: BranchWithDragOptions
}

export interface BranchDragOperation {
  /** The main branch node to be created */
  branchNode: {
    id: string
    position: { x: number; y: number }
    label: string
    branches: Array<{
      id: string
      label: string
      condition: string
    }>
  }
  /** Branch 1 node (left branch) that will receive dragged steps */
  branch1Node: {
    id: string
    position: { x: number; y: number }
    label: string
  }
  /** Branch 2 node (right branch) that will be empty */
  branch2Node: {
    id: string
    position: { x: number; y: number }
    label: string
  }
  /** Steps to transfer from target to Branch 1 */
  stepsToTransfer: Array<{
    stepId: string
    newPosition: { x: number; y: number }
  }>
  /** Edges to be removed */
  edgesToRemove: string[]
  /** New edges to be created */
  newEdges: Array<{
    id: string
    source: string
    target: string
    sourceHandle?: string
    targetHandle?: string
    animated?: boolean
    style?: {
      stroke?: string
      strokeWidth?: number
    }
  }>
}