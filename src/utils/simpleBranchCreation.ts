import type {
  WorkflowEdge,
  WorkflowNode,
} from '@src/server/api/routers/projectAgentWorkflow'

export interface SimpleBranchResult {
  success: boolean
  error?: string
  updatedNodes: WorkflowNode[]
  updatedEdges: WorkflowEdge[]
  transferredStepsCount: number
  transferredStepIds: string[]
  branch1NodeId?: string
  branch2NodeId?: string
}

/**
 * Simple branch creation with improved logic
 * - If sourceNode is 'default': convert to branch + create 2 branches (branch1 inherits children)
 * - If sourceNode is 'branch': create only 1 additional branch positioned to the right
 */

/**
 * Simple helper: Get the entire chain of descendants from a node (LINEAR ONLY)
 */
function getDescendantChain(
  startNodeId: string,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): WorkflowNode[] {
  const chain: WorkflowNode[] = []
  let currentNodeId = startNodeId

  while (true) {
    const nextEdge = edges.find((edge) => edge.source === currentNodeId)
    if (!nextEdge) break

    const nextNode = nodes.find((n) => n.id === nextEdge.target)
    if (!nextNode) break

    chain.push(nextNode)
    currentNodeId = nextNode.id
  }

  return chain
}

/**
 * Advanced helper: Get ALL descendants from a node (INCLUDING BRANCHES)
 * This function recursively traverses the entire subgraph to collect all connected nodes
 */
function getAllDescendants(
  startNodeId: string,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  visited: Set<string> = new Set()
): WorkflowNode[] {
  const descendants: WorkflowNode[] = []

  if (visited.has(startNodeId)) {
    return descendants
  }
  visited.add(startNodeId)

  const outgoingEdges = edges.filter((edge) => edge.source === startNodeId)

  console.log(
    `🔄 getAllDescendants: Processing ${startNodeId}, found ${outgoingEdges.length} outgoing edges`
  )

  for (const edge of outgoingEdges) {
    const childNode = nodes.find((n) => n.id === edge.target)
    if (!childNode) continue

    descendants.push(childNode)
    console.log(
      `  📍 Added ${childNode.data.label || childNode.id} to descendants`
    )

    const grandDescendants = getAllDescendants(
      childNode.id,
      nodes,
      edges,
      visited
    )
    descendants.push(...grandDescendants)
  }

  console.log(
    `✅ getAllDescendants: Collected ${descendants.length} total descendants from ${startNodeId}`
  )
  return descendants
}
export function createSimpleBranchWithDrag(
  sourceNodeId: string,
  targetNodeId: string | undefined,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  createNewNode: (
    position: { x: number; y: number },
    variant: 'default' | 'end' | 'jump' | 'branch',
    label?: string
  ) => WorkflowNode,

  getBranchActualWidth?: (node: WorkflowNode) => number,
  calculateHorizontalBranchSpacing?: (
    node: WorkflowNode,
    gap?: number
  ) => number
): SimpleBranchResult {
  console.log('🔧 createSimpleBranchWithDrag:', { sourceNodeId, targetNodeId })

  try {
    const sourceNode = nodes.find((n) => n.id === sourceNodeId)
    if (!sourceNode) {
      throw new Error(`Source node ${sourceNodeId} not found`)
    }

    const updatedNodes = [...nodes]
    const updatedEdges = [...edges]

    const getBranchWidth = (node: WorkflowNode): number => {
      if (getBranchActualWidth) {
        return getBranchActualWidth(node)
      }

      const widthEstimates = {
        default: 280,
        step: 280,
        branch: 300,
        end: 260,
        jump: 270,
      }
      return widthEstimates[node.data.variant] || 280
    }

    const calculateBranchSpacing = (
      node: WorkflowNode,
      gap: number = 70
    ): number => {
      if (calculateHorizontalBranchSpacing) {
        return calculateHorizontalBranchSpacing(node, gap)
      }

      const nodeWidth = getBranchWidth(node)
      return node.position.x + nodeWidth + gap
    }

    const calculateDynamicY = (node: WorkflowNode): number => {
      let nodeHeight = 160

      try {
        const nodeElement = document?.querySelector(
          `[data-id="${node.id}"]`
        ) as HTMLElement
        if (nodeElement && nodeElement.offsetHeight > 0) {
          nodeHeight = nodeElement.offsetHeight
        } else {
          const heightEstimates = {
            default: 160,
            step: 160,
            branch: 160,
            end: 120,
            jump: 130,
          }
          nodeHeight = heightEstimates[node.data.variant] || 160
        }
      } catch (error) {
        console.warn('Error getting node height, using fallback:', error)
      }

      return node.position.y + nodeHeight + 70
    }

    const isSourceAlreadyBranch = sourceNode.data.variant === 'branch'
    const isInsertionBetweenSteps = targetNodeId !== undefined

    const existingBranchNodes = updatedNodes.filter((node) => {
      return updatedEdges.some(
        (edge) =>
          edge.source === sourceNodeId &&
          edge.target === node.id &&
          edge.style?.stroke === '#8b5cf6'
      )
    })
    const hasExistingBranches = existingBranchNodes.length > 0

    // 🔍 EXTRA DIAGNOSTICS: Why is it always Case 1?
    console.log('🔍 CASE DETECTION DIAGNOSTIC:')
    console.log('📊 Source node data.branches:', sourceNode.data.branches)
    console.log(
      '📊 All edges from source:',
      updatedEdges.filter((e) => e.source === sourceNodeId)
    )
    console.log(
      '📊 Branch edges from source:',
      updatedEdges.filter(
        (e) => e.source === sourceNodeId && e.style?.stroke === '#8b5cf6'
      )
    )
    console.log(
      '📊 Existing branch nodes found:',
      existingBranchNodes.map((n) => ({
        id: n.id,
        variant: n.data.variant,
        label: n.data.label,
      }))
    )
    console.log(
      '📊 Source node should be branch variant?',
      sourceNode.data.variant === 'branch'
    )
    console.log(
      '📊 Source node has branches data?',
      !!sourceNode.data.branches && sourceNode.data.branches.length > 0
    )

    console.log(
      `Source node variant: ${sourceNode.data.variant}, isAlreadyBranch: ${isSourceAlreadyBranch}`
    )
    console.log(
      `Target node provided: ${targetNodeId ? 'YES' : 'NO'}, isInsertionBetweenSteps: ${isInsertionBetweenSteps}`
    )
    console.log(
      `Existing branch nodes connected: ${existingBranchNodes.length}, hasExistingBranches: ${hasExistingBranches}`
    )

    console.log('\n🧠 DECISION LOGIC:')
    console.log(
      `!hasExistingBranches && !isInsertionBetweenSteps = ${!hasExistingBranches && !isInsertionBetweenSteps} (CASE 1)`
    )
    console.log(
      `!hasExistingBranches && isInsertionBetweenSteps = ${!hasExistingBranches && isInsertionBetweenSteps} (CASE 2)`
    )
    console.log(
      `hasExistingBranches && !isInsertionBetweenSteps = ${hasExistingBranches && !isInsertionBetweenSteps} (CASE 3)`
    )
    console.log(
      `hasExistingBranches && isInsertionBetweenSteps = ${hasExistingBranches && isInsertionBetweenSteps} (CASE 4)`
    )
    console.log(
      `Will execute: ${
        !hasExistingBranches && !isInsertionBetweenSteps
          ? 'CASE 1'
          : !hasExistingBranches && isInsertionBetweenSteps
            ? 'CASE 2'
            : hasExistingBranches && !isInsertionBetweenSteps
              ? 'CASE 3'
              : hasExistingBranches && isInsertionBetweenSteps
                ? 'CASE 4'
                : 'FALLBACK (ERROR)'
      }`
    )

    let transferredStepIds: string[] = []
    let transferredCount = 0
    let branch1NodeId: string | undefined
    let branch2NodeId: string | undefined

    if (!hasExistingBranches && !isInsertionBetweenSteps) {
      console.log('🔄 CASE 1: Creating 2 direct branch nodes from default step')

      const dynamicY = calculateDynamicY(sourceNode)

      const branchWidth = 280
      const gap = 70
      const numBranches = 2

      // ✅ SIMPLE CENTERING: Center the group of branches around parent position
      const totalWidth = (numBranches * branchWidth) + ((numBranches - 1) * gap)
      const firstBranchX = sourceNode.position.x - (totalWidth / 2) + (branchWidth / 2)

      console.log('🎯 SIMPLE CENTERING: Calculated positions:', {
        parentX: sourceNode.position.x,
        totalWidth: totalWidth,
        firstBranchX: firstBranchX,
        willBeCenteredAround: sourceNode.position.x
      })

      const branch1Position = {
        x: firstBranchX,
        y: dynamicY,
      }

      const branch2Position = {
        x: firstBranchX + (branchWidth + gap),
        y: dynamicY,
      }

      // ✅ CRITICAL FIX: Update source node with branch data (like Case 3 does)
      const timestamp = Date.now()
      const branch1Id = `branch-${timestamp}-1`
      const branch2Id = `branch-${timestamp}-2`

      const sourceIndex = updatedNodes.findIndex((n) => n.id === sourceNodeId)
      updatedNodes[sourceIndex] = {
        ...updatedNodes[sourceIndex],
        data: {
          ...updatedNodes[sourceIndex].data,
          branches: [
            { id: branch1Id, label: 'Branch', condition: '' },
            { id: branch2Id, label: 'Branch', condition: '' },
          ],
        },
      }

      const branch1StepNode = createNewNode(
        branch1Position,
        'branch',
        'Branch'
      )
      const branch2StepNode = createNewNode(
        branch2Position,
        'branch',
        'Branch'
      )

      updatedNodes.push(branch1StepNode, branch2StepNode)
      branch1NodeId = branch1StepNode.id
      branch2NodeId = branch2StepNode.id

      console.log(
        '✅ CASE 1 FIX: Updated source node with branch data (matching Case 3 behavior)'
      )
      console.log('✅ Created direct branch nodes', {
        branch1NodeId,
        branch2NodeId,
      })

      console.log('\n🔗 CREATING EDGES for TYPE 1:')

      const branch1Edge = {
        id: `edge-${sourceNodeId}-${branch1StepNode.id}`,
        source: sourceNodeId,
        target: branch1StepNode.id,
        animated: true,
        style: { stroke: '#8b5cf6', strokeWidth: 2 },
      }
      console.log('🟦 Branch A (LEFT) Edge:', {
        id: branch1Edge.id,
        source: branch1Edge.source,
        target: branch1Edge.target,
        targetNodeId: branch1StepNode.id,
        targetPosition: branch1StepNode.position,
      })
      updatedEdges.push(branch1Edge)

      const branch2Edge = {
        id: `edge-${sourceNodeId}-${branch2StepNode.id}`,
        source: sourceNodeId,
        target: branch2StepNode.id,
        animated: true,
        style: { stroke: '#8b5cf6', strokeWidth: 2 },
      }
      console.log('🟩 Branch B (RIGHT) Edge:', {
        id: branch2Edge.id,
        source: branch2Edge.source,
        target: branch2Edge.target,
        targetNodeId: branch2StepNode.id,
        targetPosition: branch2StepNode.position,
      })
      console.log('🔍 BRANCH B DIAGNOSTIC - Simple Centered Creation:', {
        branchBId: branch2StepNode.id,
        branchBPosition: branch2StepNode.position,
        sourceNodePosition: sourceNode.position,
        calculatedBranch2X: branch2Position.x,
        firstBranchX: firstBranchX,
        totalWidth: totalWidth,
        gap: gap,
      })
      updatedEdges.push(branch2Edge)

      console.log('✅ Both edges added to updatedEdges array')

      // 🔍 DIAGNOSTIC: Log edge details for auto-trigger debugging
      console.log('\n🔍 CASE 1 AUTO-TRIGGER DIAGNOSTIC:')
      console.log('📊 Branch edge details:', {
        branch1Edge: {
          id: branch1Edge.id,
          source: branch1Edge.source,
          target: branch1Edge.target,
          style: branch1Edge.style,
          hasCorrectStroke: branch1Edge.style?.stroke === '#8b5cf6',
        },
        branch2Edge: {
          id: branch2Edge.id,
          source: branch2Edge.source,
          target: branch2Edge.target,
          style: branch2Edge.style,
          hasCorrectStroke: branch2Edge.style?.stroke === '#8b5cf6',
        },
      })
      console.log('📊 Branch node details:', {
        branch1Node: {
          id: branch1StepNode.id,
          variant: branch1StepNode.data.variant,
          position: branch1StepNode.position,
        },
        branch2Node: {
          id: branch2StepNode.id,
          variant: branch2StepNode.data.variant,
          position: branch2StepNode.position,
        },
      })
      console.log('🎯 Expected auto-trigger conditions:')
      console.log('   - 2 edges with stroke=#8b5cf6: ✅')
      console.log('   - 2 target nodes found: ✅')
      console.log(
        '   - Spacing should trigger repositioning once useEffect runs'
      )
      console.log(
        '⏰ Auto-trigger will execute AFTER this function returns and state updates\n'
      )

      console.log(
        'ℹ️  No step transfer needed - direct branch creation from empty step'
      )
      transferredCount = 0
      transferredStepIds = []
    } else if (!hasExistingBranches && isInsertionBetweenSteps) {
      console.log(
        '🔄 TYPE 2: Inserting branch between steps with step transfer'
      )
      console.log(`Source: ${sourceNodeId}, Target: ${targetNodeId}`)

      const dynamicY = calculateDynamicY(sourceNode)

      const branchWidth = 280
      const gap = 70
      const numBranches = 2

      // ✅ SIMPLE CENTERING: Center the group of branches around parent position
      const totalWidth = (numBranches * branchWidth) + ((numBranches - 1) * gap)
      const firstBranchX = sourceNode.position.x - (totalWidth / 2) + (branchWidth / 2)

      console.log('🎯 CASE 2 SIMPLE CENTERING: Calculated positions:', {
        parentX: sourceNode.position.x,
        totalWidth: totalWidth,
        firstBranchX: firstBranchX,
        willBeCenteredAround: sourceNode.position.x
      })

      const branch1Position = {
        x: firstBranchX,
        y: dynamicY,
      }

      const branch2Position = {
        x: firstBranchX + (branchWidth + gap),
        y: dynamicY,
      }
      console.log('🔍 BRANCH B DIAGNOSTIC - Case 2 Position Calculation:', {
        branch2X: branch2Position.x,
        dynamicY: dynamicY,
        sourceNodePosition: sourceNode.position,
        firstBranchX: firstBranchX,
        totalWidth: totalWidth,
      })

      const branch1StepNode = createNewNode(branch1Position, 'branch', 'Branch')
      const branch2StepNode = createNewNode(branch2Position, 'branch', 'Branch')

      updatedNodes.push(branch1StepNode, branch2StepNode)
      branch1NodeId = branch1StepNode.id
      branch2NodeId = branch2StepNode.id

      updatedEdges.push({
        id: `edge-${sourceNodeId}-${branch1StepNode.id}`,
        source: sourceNodeId,
        target: branch1StepNode.id,
        animated: true,
        style: { stroke: '#8b5cf6', strokeWidth: 2 },
      })

      updatedEdges.push({
        id: `edge-${sourceNodeId}-${branch2StepNode.id}`,
        source: sourceNodeId,
        target: branch2StepNode.id,
        animated: true,
        style: { stroke: '#8b5cf6', strokeWidth: 2 },
      })

      const allDescendants = getAllDescendants(
        targetNodeId!,
        updatedNodes,
        updatedEdges
      )
      allDescendants.unshift(updatedNodes.find((n) => n.id === targetNodeId!)!)

      console.log(
        `📊 ENHANCED TRANSFER: Found ${allDescendants.length} nodes to transfer (including nested structures):`,
        allDescendants.map((n) => `${n.data.label || n.id} (${n.data.variant})`)
      )

      if (allDescendants.length > 0) {
        const oldEdgeIndex = updatedEdges.findIndex(
          (edge) => edge.source === sourceNodeId && edge.target === targetNodeId
        )
        if (oldEdgeIndex !== -1) {
          updatedEdges.splice(oldEdgeIndex, 1)
          console.log('🗑️ Removed original source->target edge')
        }

        const firstTransferred = allDescendants[0]
        updatedEdges.push({
          id: `edge-${branch1StepNode.id}-${firstTransferred.id}`,
          source: branch1StepNode.id,
          target: firstTransferred.id,
          animated: true,
          style: { stroke: '#94a3b8', strokeWidth: 2 },
        })

        console.log(
          '🎯 ENHANCED POSITIONING: Starting intelligent positioning of transferred nodes'
        )

        const linearSteps = allDescendants.filter((node) => {
          const outgoingEdges = updatedEdges.filter((e) => e.source === node.id)
          return outgoingEdges.length <= 1
        })

        const branchParents = allDescendants.filter((node) => {
          const outgoingEdges = updatedEdges.filter((e) => e.source === node.id)
          return outgoingEdges.length > 1
        })

        console.log(
          `📊 Positioning strategy: ${linearSteps.length} linear nodes, ${branchParents.length} branch parents`
        )

        const branch1Height = 170
        const currentY = branch1Position.y + branch1Height
        console.log(
          `🎯 CASE 2 CUSTOM SPACING: Branch A to first step = 40px gap (Y: ${branch1Position.y} + ${branch1Height} + 40 = ${currentY})`
        )

        const positionedNodes = new Set<string>()
        let mainLineY = currentY

        const processNode = (
          node: WorkflowNode,
          parentX: number,
          parentY: number,
          isHorizontalBranch: boolean = false
        ): number => {
          if (positionedNodes.has(node.id)) return parentY

          const nodeIndex = updatedNodes.findIndex((n) => n.id === node.id)
          if (nodeIndex < 0) return parentY

          const oldPosition = updatedNodes[nodeIndex].position

          const children = allDescendants.filter((child) =>
            updatedEdges.some(
              (edge) => edge.source === node.id && edge.target === child.id
            )
          )

          const branchChildren = children.filter((child) => {
            const edge = updatedEdges.find(
              (e) => e.source === node.id && e.target === child.id
            )
            return edge?.style?.stroke === '#8b5cf6'
          })

          let newX, newY

          if (isHorizontalBranch) {
            newX = parentX
            newY = parentY
            console.log(
              `🔄 HORIZONTAL BRANCH: ${node.data.label || node.id} stays at same Y level`
            )
          } else {
            newX = parentX
            newY = parentY
            if (!(positionedNodes.size === 0)) {
              mainLineY = newY
            }
          }

          updatedNodes[nodeIndex] = {
            ...updatedNodes[nodeIndex],
            position: { x: newX, y: newY },
          }
          positionedNodes.add(node.id)

          console.log(
            `📍 SMART POSITIONING: ${node.data.label || node.id} (${node.data.variant}) from X:${oldPosition.x},Y:${oldPosition.y} → X:${newX},Y:${newY}`
          )

          if (branchChildren.length > 1) {
            console.log(
              `🌳 BRANCH PARENT: ${node.data.label || node.id} has ${branchChildren.length} branch children`
            )

            const nextY = calculateDynamicY({
              ...node,
              position: { x: newX, y: newY },
            })

            let branchX = newX - 150
            branchChildren.forEach((branchChild, branchIndex) => {
              processNode(branchChild, branchX, nextY, true)
              branchX += 350
            })

            return nextY + 170
          } else if (children.length === 1) {
            const nextY = calculateDynamicY({
              ...node,
              position: { x: newX, y: newY },
            })
            return processNode(children[0], newX, nextY, false)
          } else {
            return calculateDynamicY({
              ...node,
              position: { x: newX, y: newY },
            })
          }
        }

        if (allDescendants.length > 0) {
          processNode(allDescendants[0], branch1Position.x, currentY, false)

          allDescendants.forEach((node) => {
            if (!positionedNodes.has(node.id)) {
              console.log(
                `⚠️ FALLBACK: Positioning unprocessed node ${node.data.label || node.id}`
              )
              const nodeIndex = updatedNodes.findIndex((n) => n.id === node.id)
              if (nodeIndex >= 0) {
                updatedNodes[nodeIndex] = {
                  ...updatedNodes[nodeIndex],
                  position: {
                    x: branch1Position.x,
                    y: mainLineY,
                  },
                }
                mainLineY += 170
              }
            }
          })
        }

        transferredCount = allDescendants.length
        transferredStepIds = allDescendants.map((s) => s.id)
        console.log(
          `✅ ENHANCED TRANSFER: Transferred ${transferredCount} nodes (including nested structures) to Branch A`
        )
      }
    } else if (hasExistingBranches && !isInsertionBetweenSteps) {
      console.log('🔄 CASE 3: Adding additional branch to existing branches')
      console.log(
        `Source node variant: ${sourceNode.data.variant}, has ${existingBranchNodes.length} existing branches`
      )

      const existingBranches = sourceNode.data.branches || []

      console.log(
        `Existing branches: ${existingBranches.length}, Existing branch nodes: ${existingBranchNodes.length}`
      )

      if (existingBranchNodes.length === 0) {
        console.log(
          '🔄 No existing branch nodes found, creating 2 initial branches'
        )

        const timestamp = Date.now()
        const branch1Id = `branch-${timestamp}-1`
        const branch2Id = `branch-${timestamp}-2`

        const sourceIndex = updatedNodes.findIndex((n) => n.id === sourceNodeId)
        updatedNodes[sourceIndex] = {
          ...updatedNodes[sourceIndex],
          data: {
            ...updatedNodes[sourceIndex].data,
            branches: [
              { id: branch1Id, label: 'Branch', condition: '' },
              { id: branch2Id, label: 'Branch', condition: '' },
            ],
          },
        }

        const dynamicY2 = calculateDynamicY(sourceNode)

        const branchWidth = 280
        const gap = 70
        const numBranches = 2

        // ✅ SIMPLE CENTERING: Center the group of branches around parent position
        const totalWidth = (numBranches * branchWidth) + ((numBranches - 1) * gap)
        const firstBranchX = sourceNode.position.x - (totalWidth / 2) + (branchWidth / 2)

        console.log('🎯 CASE 3 SIMPLE CENTERING: Calculated positions:', {
          parentX: sourceNode.position.x,
          totalWidth: totalWidth,
          firstBranchX: firstBranchX,
          willBeCenteredAround: sourceNode.position.x
        })

        const branch1Position = {
          x: firstBranchX,
          y: dynamicY2,
        }

        const branch2Position = {
          x: firstBranchX + (branchWidth + gap),
          y: dynamicY2,
        }
        console.log('🔍 BRANCH B DIAGNOSTIC - Case 3 Position Calculation:', {
          branch2X: branch2Position.x,
          dynamicY2: dynamicY2,
          sourceNodePosition: sourceNode.position,
          firstBranchX: firstBranchX,
          totalWidth: totalWidth,
        })

        const branch1StepNode = createNewNode(
          branch1Position,
          'branch',
          'Branch'
        )
        const branch2StepNode = createNewNode(
          branch2Position,
          'branch',
          'Branch'
        )

        updatedNodes.push(branch1StepNode, branch2StepNode)
        branch1NodeId = branch1StepNode.id
        branch2NodeId = branch2StepNode.id

        updatedEdges.push({
          id: `edge-${sourceNodeId}-${branch1StepNode.id}`,
          source: sourceNodeId,
          target: branch1StepNode.id,
          animated: true,
          style: { stroke: '#8b5cf6', strokeWidth: 2 },
        })

        updatedEdges.push({
          id: `edge-${sourceNodeId}-${branch2StepNode.id}`,
          source: sourceNodeId,
          target: branch2StepNode.id,
          animated: true,
          style: { stroke: '#8b5cf6', strokeWidth: 2 },
        })

        console.log(
          'ℹ️  No step transfer needed - branch creation from branch node'
        )
        transferredCount = 0
        transferredStepIds = []

        console.log('✅ Created 2 initial branches for existing branch node')
      } else {
        const timestamp = Date.now()
        const newBranchId = `branch-${timestamp}-${existingBranches.length + 1}`

        const sourceIndex = updatedNodes.findIndex((n) => n.id === sourceNodeId)
        updatedNodes[sourceIndex] = {
          ...updatedNodes[sourceIndex],
          data: {
            ...updatedNodes[sourceIndex].data,
            branches: [
              ...existingBranches,
              { id: newBranchId, label: 'Branch', condition: '' },
            ],
          },
        }

        // 🎯 IMPROVED CENTERING: Center ALL branches (existing + new) around parent
        const totalBranches = existingBranchNodes.length + 1
        const branchWidth = 280
        const gap = 70

        // Calculate total width and center position
        const totalWidth = (totalBranches * branchWidth) + ((totalBranches - 1) * gap)
        const firstBranchX = sourceNode.position.x - (totalWidth / 2) + (branchWidth / 2)

        console.log('🎯 CASE 3 MULTI-BRANCH CENTERING:', {
          totalBranches,
          existingBranches: existingBranchNodes.length,
          totalWidth,
          parentX: sourceNode.position.x,
          firstBranchX,
          willCenterAround: sourceNode.position.x
        })

        // Reposition existing branches to maintain centering
        existingBranchNodes.forEach((branchNode, index) => {
          const newX = firstBranchX + (index * (branchWidth + gap))
          const existingNodeIndex = updatedNodes.findIndex(n => n.id === branchNode.id)

          if (existingNodeIndex >= 0) {
            updatedNodes[existingNodeIndex] = {
              ...updatedNodes[existingNodeIndex],
              position: {
                ...updatedNodes[existingNodeIndex].position,
                x: newX
              }
            }

            console.log(`🎯 Repositioned existing branch ${index + 1}: ${branchNode.id} to X=${newX}`)
          }
        })

        // Position new branch at the end of the centered group
        const newBranchPosition = {
          x: firstBranchX + (existingBranchNodes.length * (branchWidth + gap)),
          y: existingBranchNodes.length > 0 ? existingBranchNodes[0].position.y : sourceNode.position.y + 150,
        }

        console.log('🎯 New branch centered position:', {
          newPosition: newBranchPosition,
          branchIndex: existingBranchNodes.length + 1,
          totalCentered: totalBranches
        })

        const newBranchStepNode = createNewNode(
          newBranchPosition,
          'branch',
          'Branch'
        )
        updatedNodes.push(newBranchStepNode)
        branch2NodeId = newBranchStepNode.id

        console.log('✅ Created new branch step node', {
          newBranchNodeId: branch2NodeId,
        })

        updatedEdges.push({
          id: `edge-${sourceNodeId}-${newBranchStepNode.id}`,
          source: sourceNodeId,
          target: newBranchStepNode.id,
          animated: true,
          style: { stroke: '#8b5cf6', strokeWidth: 2 },
        })

        transferredCount = 0
      }
    } else if (hasExistingBranches && isInsertionBetweenSteps) {
      console.log(
        '🔄 CASE 4: Adding branch when existing branches + target provided'
      )
      console.log(
        'This might be trying to create more branches, treating as CASE 3'
      )

      const existingBranches = sourceNode.data.branches || []

      const timestamp = Date.now()
      const newBranchId = `branch-${timestamp}-${existingBranchNodes.length + 1}`

      const sourceIndex = updatedNodes.findIndex((n) => n.id === sourceNodeId)
      if (sourceIndex >= 0) {
        updatedNodes[sourceIndex] = {
          ...updatedNodes[sourceIndex],
          data: {
            ...updatedNodes[sourceIndex].data,
            branches: [
              ...existingBranches,
              { id: newBranchId, label: 'Branch', condition: '' },
            ],
          },
        }
      }

      let newBranchPosition = {
        x: sourceNode.position.x + getBranchWidth(sourceNode) + 70,
        y: sourceNode.position.y + 150,
      }

      if (existingBranchNodes.length > 0) {
        const rightmostBranch = existingBranchNodes.reduce(
          (rightmost, current) =>
            current.position.x > rightmost.position.x ? current : rightmost
        )

        const newX = calculateBranchSpacing(rightmostBranch, 70)
        newBranchPosition = {
          x: newX,
          y: rightmostBranch.position.y,
        }

        console.log('🎯 New branch position calculated:', {
          rightmostBranch: {
            id: rightmostBranch.id,
            position: rightmostBranch.position,
          },
          newPosition: newBranchPosition,
        })
      }

      const newBranchStepNode = createNewNode(
        newBranchPosition,
        'branch',
        'Branch'
      )
      updatedNodes.push(newBranchStepNode)
      branch2NodeId = newBranchStepNode.id

      console.log('✅ Created additional branch step node', {
        newBranchNodeId: branch2NodeId,
      })

      updatedEdges.push({
        id: `edge-${sourceNodeId}-${newBranchStepNode.id}`,
        source: sourceNodeId,
        target: newBranchStepNode.id,
        animated: true,
        style: { stroke: '#8b5cf6', strokeWidth: 2 },
      })

      transferredCount = 0
    } else {
      console.error('❌ UNEXPECTED BRANCH CREATION SCENARIO:')
      console.error(
        `hasExistingBranches: ${hasExistingBranches} (${existingBranchNodes.length} nodes)`
      )
      console.error(
        `isInsertionBetweenSteps: ${isInsertionBetweenSteps} (targetNodeId: ${targetNodeId})`
      )
      console.error(`sourceVariant: ${sourceNode.data.variant}`)
      console.error(`sourceNodeId: ${sourceNodeId}`)
      console.error(
        'Existing branch nodes:',
        existingBranchNodes.map((n) => ({ id: n.id, variant: n.data.variant }))
      )
      throw new Error(
        `Unsupported branch creation scenario: hasExisting=${hasExistingBranches}, isInsertion=${isInsertionBetweenSteps}`
      )
    }

    console.log('🎉 Branch creation completed successfully!')

    return {
      success: true,
      updatedNodes,
      updatedEdges,
      transferredStepsCount: transferredCount,
      transferredStepIds,
      branch1NodeId,
      branch2NodeId,
    }
  } catch (error) {
    console.error('❌ Branch creation failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      updatedNodes: nodes,
      updatedEdges: edges,
      transferredStepsCount: 0,
      transferredStepIds: [],
    }
  }
}
