/**
 * Step Transfer Validation System
 * 
 * This module provides comprehensive validation for step transfer operations,
 * ensuring workflow integrity and preventing invalid states.
 */

import type { WorkflowNode, WorkflowEdge } from '@src/server/api/routers/projectAgentWorkflow'
import type { StepAnalysisResult, StepTransferPlan } from './stepAnalysisEngine'
import type { TransferExecutionResult } from './stepTransferEngine'
import { detectCircularDependencies, validateEdgeConnections } from './workflowEdgeUtils'

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  suggestions: ValidationSuggestion[]
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical'
}

export interface ValidationError {
  code: string
  message: string
  nodeId?: string
  edgeId?: string
  severity: 'error' | 'warning'
}

export interface ValidationWarning {
  code: string
  message: string
  impact: 'low' | 'medium' | 'high'
  suggestion?: string
}

export interface ValidationSuggestion {
  code: string
  message: string
  action: string
  priority: 'low' | 'medium' | 'high'
}

/**
 * Comprehensive validation of a step transfer operation before execution
 */
export function validateStepTransferOperation(
  analysis: StepAnalysisResult,
  currentNodes: WorkflowNode[],
  currentEdges: WorkflowEdge[]
): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []
  const suggestions: ValidationSuggestion[] = []

  // Basic structural validation
  const structuralValidation = validateStructuralIntegrity(analysis, currentNodes, currentEdges)
  errors.push(...structuralValidation.errors)
  warnings.push(...structuralValidation.warnings)

  // Circular dependency validation
  const circularValidation = validateCircularDependencies(analysis, currentNodes, currentEdges)
  errors.push(...circularValidation.errors)
  warnings.push(...circularValidation.warnings)

  // Node-specific validation
  const nodeValidation = validateNodeSpecificRules(analysis, currentNodes)
  errors.push(...nodeValidation.errors)
  warnings.push(...nodeValidation.warnings)
  suggestions.push(...nodeValidation.suggestions)

  // Edge connectivity validation
  const edgeValidation = validateEdgeConnectivity(analysis, currentEdges)
  errors.push(...edgeValidation.errors)
  warnings.push(...edgeValidation.warnings)

  // Workflow flow validation
  const flowValidation = validateWorkflowFlow(analysis, currentNodes, currentEdges)
  warnings.push(...flowValidation.warnings)
  suggestions.push(...flowValidation.suggestions)

  // Determine overall severity
  const severity = determineSeverity(errors, warnings)

  return {
    isValid: errors.filter(e => e.severity === 'error').length === 0,
    errors,
    warnings,
    suggestions,
    severity
  }
}

/**
 * Validates basic structural integrity of the transfer operation
 */
function validateStructuralIntegrity(
  analysis: StepAnalysisResult,
  currentNodes: WorkflowNode[],
  currentEdges: WorkflowEdge[]
): {
  errors: ValidationError[]
  warnings: ValidationWarning[]
} {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  // Check if target node exists
  const targetNode = currentNodes.find(n => n.id === analysis.branchInsertionPoint.id)
  if (!targetNode) {
    errors.push({
      code: 'TARGET_NODE_NOT_FOUND',
      message: 'Target node for branch insertion no longer exists',
      nodeId: analysis.branchInsertionPoint.id,
      severity: 'error'
    })
    return { errors, warnings }
  }

  // Check if all subsequent steps exist
  for (const step of analysis.subsequentSteps) {
    const stepExists = currentNodes.find(n => n.id === step.id)
    if (!stepExists) {
      errors.push({
        code: 'SUBSEQUENT_STEP_NOT_FOUND',
        message: `Subsequent step "${step.data.label}" no longer exists`,
        nodeId: step.id,
        severity: 'error'
      })
    }
  }

  // Check if target is already a branch
  if (targetNode.data.variant === 'branch') {
    warnings.push({
      code: 'TARGET_ALREADY_BRANCH',
      message: 'Target node is already a branch node. Existing branches will be replaced.',
      impact: 'medium',
      suggestion: 'Consider adding steps to existing branches instead'
    })
  }

  // Check for empty transfer
  if (analysis.subsequentSteps.length === 0) {
    warnings.push({
      code: 'NO_STEPS_TO_TRANSFER',
      message: 'No subsequent steps found to transfer to the branch',
      impact: 'low',
      suggestion: 'Branch will be created but no steps will be moved'
    })
  }

  return { errors, warnings }
}

/**
 * Validates that the transfer won't create circular dependencies
 */
function validateCircularDependencies(
  analysis: StepAnalysisResult,
  currentNodes: WorkflowNode[],
  currentEdges: WorkflowEdge[]
): {
  errors: ValidationError[]
  warnings: ValidationWarning[]
} {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  // Simulate the transfer and check for cycles
  const simulatedNodes = [...currentNodes]
  const simulatedEdges = [...currentEdges]

  // Apply transfer plan edges
  const edgeIdsToRemove = new Set(analysis.transferPlan.edgesToRemove.map(e => e.id))
  const filteredEdges = simulatedEdges.filter(e => !edgeIdsToRemove.has(e.id))
  const newEdges = [...filteredEdges, ...analysis.transferPlan.edgesToCreate]

  // Check for circular dependencies
  const circularCheck = detectCircularDependencies(simulatedNodes, newEdges)
  if (circularCheck.hasCircularDependency) {
    for (const cycle of circularCheck.cycles) {
      errors.push({
        code: 'CIRCULAR_DEPENDENCY',
        message: `Transfer would create circular dependency: ${cycle.join(' → ')}`,
        severity: 'error'
      })
    }
  }

  // Check for jump steps that might create cycles
  for (const step of analysis.subsequentSteps) {
    if (step.data.variant === 'jump' && step.data.targetNodeId) {
      const jumpTarget = currentNodes.find(n => n.id === step.data.targetNodeId)
      if (jumpTarget && jumpTarget.id === analysis.branchInsertionPoint.id) {
        errors.push({
          code: 'JUMP_CREATES_CYCLE',
          message: `Jump step "${step.data.label}" targets the branch insertion point, creating a cycle`,
          nodeId: step.id,
          severity: 'error'
        })
      }
    }
  }

  return { errors, warnings }
}

/**
 * Validates node-specific rules and constraints
 */
function validateNodeSpecificRules(
  analysis: StepAnalysisResult,
  currentNodes: WorkflowNode[]
): {
  errors: ValidationError[]
  warnings: ValidationWarning[]
  suggestions: ValidationSuggestion[]
} {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []
  const suggestions: ValidationSuggestion[] = []

  // Check for end nodes in the middle of the transfer
  const endNodes = analysis.subsequentSteps.filter(step => step.data.variant === 'end')
  if (endNodes.length > 0) {
    const hasStepsAfterEnd = endNodes.some(endNode => {
      const endNodeIndex = analysis.subsequentSteps.findIndex(s => s.id === endNode.id)
      return endNodeIndex < analysis.subsequentSteps.length - 1
    })

    if (hasStepsAfterEnd) {
      warnings.push({
        code: 'END_NODE_NOT_TERMINAL',
        message: 'End node(s) found in the middle of transferred steps',
        impact: 'high',
        suggestion: 'Consider restructuring the workflow to place end nodes at the end'
      })
    }
  }

  // Check for branch nodes in transfer (nested branching)
  const branchNodes = analysis.subsequentSteps.filter(step => step.data.variant === 'branch')
  if (branchNodes.length > 0) {
    warnings.push({
      code: 'NESTED_BRANCHING',
      message: `Transfer includes ${branchNodes.length} branch node(s), creating nested branching`,
      impact: 'medium',
      suggestion: 'Nested branching can make workflows complex. Consider flattening the structure.'
    })

    suggestions.push({
      code: 'CONSIDER_FLATTENING',
      message: 'Consider flattening nested branches for better readability',
      action: 'Restructure workflow to avoid nested branches',
      priority: 'medium'
    })
  }

  // Check for jump nodes with invalid targets
  const jumpNodes = analysis.subsequentSteps.filter(step => step.data.variant === 'jump')
  for (const jumpNode of jumpNodes) {
    if (jumpNode.data.targetNodeId) {
      const targetExists = currentNodes.find(n => n.id === jumpNode.data.targetNodeId)
      if (!targetExists) {
        errors.push({
          code: 'INVALID_JUMP_TARGET',
          message: `Jump step "${jumpNode.data.label}" targets a non-existent node`,
          nodeId: jumpNode.id,
          severity: 'error'
        })
      }
    } else {
      warnings.push({
        code: 'JUMP_NO_TARGET',
        message: `Jump step "${jumpNode.data.label}" has no target specified`,
        impact: 'medium',
        suggestion: 'Configure the jump target before transferring'
      })
    }
  }

  return { errors, warnings, suggestions }
}

/**
 * Validates edge connectivity and integrity
 */
function validateEdgeConnectivity(
  analysis: StepAnalysisResult,
  currentEdges: WorkflowEdge[]
): {
  errors: ValidationError[]
  warnings: ValidationWarning[]
} {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  // Check if edges to be removed actually exist
  for (const edgeToRemove of analysis.transferPlan.edgesToRemove) {
    const edgeExists = currentEdges.find(e => e.id === edgeToRemove.id)
    if (!edgeExists) {
      warnings.push({
        code: 'EDGE_ALREADY_REMOVED',
        message: `Edge ${edgeToRemove.id} scheduled for removal no longer exists`,
        impact: 'low'
      })
    }
  }

  // Check for duplicate edge creation
  const edgeKeys = new Set()
  for (const newEdge of analysis.transferPlan.edgesToCreate) {
    const key = `${newEdge.source}-${newEdge.target}-${newEdge.sourceHandle || 'default'}`
    if (edgeKeys.has(key)) {
      errors.push({
        code: 'DUPLICATE_EDGE_CREATION',
        message: `Duplicate edge would be created: ${newEdge.source} → ${newEdge.target}`,
        edgeId: newEdge.id,
        severity: 'error'
      })
    }
    edgeKeys.add(key)

    // Check if edge already exists in current workflow
    const existingEdge = currentEdges.find(e => 
      e.source === newEdge.source && 
      e.target === newEdge.target && 
      e.sourceHandle === newEdge.sourceHandle
    )
    if (existingEdge) {
      warnings.push({
        code: 'EDGE_ALREADY_EXISTS',
        message: `Edge from ${newEdge.source} to ${newEdge.target} already exists`,
        impact: 'low'
      })
    }
  }

  return { errors, warnings }
}

/**
 * Validates overall workflow flow and execution logic
 */
function validateWorkflowFlow(
  analysis: StepAnalysisResult,
  currentNodes: WorkflowNode[],
  currentEdges: WorkflowEdge[]
): {
  warnings: ValidationWarning[]
  suggestions: ValidationSuggestion[]
} {
  const warnings: ValidationWarning[] = []
  const suggestions: ValidationSuggestion[] = []

  // Check for orphaned nodes after transfer
  const transferredStepIds = new Set(analysis.subsequentSteps.map(s => s.id))
  const potentialOrphans = currentNodes.filter(node => {
    if (transferredStepIds.has(node.id)) return false
    
    const incomingEdges = currentEdges.filter(e => e.target === node.id)
    const hasIncomingFromTransferred = incomingEdges.some(e => transferredStepIds.has(e.source))
    
    return hasIncomingFromTransferred && incomingEdges.length === 1
  })

  if (potentialOrphans.length > 0) {
    warnings.push({
      code: 'POTENTIAL_ORPHANED_NODES',
      message: `${potentialOrphans.length} node(s) may become orphaned after transfer`,
      impact: 'medium',
      suggestion: 'Review workflow connections after transfer'
    })
  }

  // Check for workflow completion paths
  const hasEndNodes = analysis.subsequentSteps.some(step => step.data.variant === 'end')
  if (analysis.subsequentSteps.length > 0 && !hasEndNodes) {
    suggestions.push({
      code: 'ADD_END_NODE',
      message: 'Consider adding an end node to the transferred branch',
      action: 'Add an end node at the end of the branch flow',
      priority: 'low'
    })
  }

  // Check branch balance
  if (analysis.transferPlan.stepsToTransfer.length > 5) {
    suggestions.push({
      code: 'CONSIDER_BRANCH_BALANCE',
      message: 'Large number of steps being transferred to one branch',
      action: 'Consider distributing steps across multiple branches',
      priority: 'low'
    })
  }

  return { warnings, suggestions }
}

/**
 * Determines the overall severity level based on errors and warnings
 */
function determineSeverity(
  errors: ValidationError[],
  warnings: ValidationWarning[]
): 'none' | 'low' | 'medium' | 'high' | 'critical' {
  const criticalErrors = errors.filter(e => 
    e.severity === 'error' && 
    ['TARGET_NODE_NOT_FOUND', 'CIRCULAR_DEPENDENCY', 'JUMP_CREATES_CYCLE'].includes(e.code)
  )
  
  if (criticalErrors.length > 0) return 'critical'
  
  const hasErrors = errors.filter(e => e.severity === 'error').length > 0
  if (hasErrors) return 'high'
  
  const highImpactWarnings = warnings.filter(w => w.impact === 'high').length
  const mediumImpactWarnings = warnings.filter(w => w.impact === 'medium').length
  
  if (highImpactWarnings > 0) return 'high'
  if (mediumImpactWarnings > 1) return 'medium'
  if (warnings.length > 0) return 'low'
  
  return 'none'
}

/**
 * Validates the result of a transfer execution
 */
export function validateTransferExecutionResult(
  result: TransferExecutionResult
): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []
  const suggestions: ValidationSuggestion[] = []

  if (!result.success) {
    errors.push({
      code: 'EXECUTION_FAILED',
      message: result.error || 'Transfer execution failed for unknown reason',
      severity: 'error'
    })
  }

  // Validate the resulting workflow state
  if (result.success && result.updatedNodes && result.updatedEdges) {
    const edgeValidation = validateEdgeConnections(result.updatedNodes, result.updatedEdges)
    
    for (const error of edgeValidation.errors) {
      errors.push({
        code: 'POST_EXECUTION_EDGE_ERROR',
        message: error,
        severity: 'error'
      })
    }
    
    for (const warning of edgeValidation.warnings) {
      warnings.push({
        code: 'POST_EXECUTION_EDGE_WARNING',
        message: warning,
        impact: 'medium'
      })
    }
  }

  // Add execution-specific warnings
  warnings.push(...result.warnings.map(w => ({
    code: 'EXECUTION_WARNING',
    message: w,
    impact: 'low' as const
  })))

  const severity = determineSeverity(errors, warnings)

  return {
    isValid: errors.filter(e => e.severity === 'error').length === 0,
    errors,
    warnings,
    suggestions,
    severity
  }
}

/**
 * Provides user-friendly validation messages for display
 */
export function formatValidationForUser(validation: ValidationResult): {
  title: string
  message: string
  canProceed: boolean
  actionRequired: boolean
} {
  const errorCount = validation.errors.filter(e => e.severity === 'error').length
  const warningCount = validation.warnings.length

  if (validation.severity === 'critical') {
    return {
      title: 'Critical Issues Found',
      message: `Found ${errorCount} critical error(s) that must be resolved before proceeding.`,
      canProceed: false,
      actionRequired: true
    }
  }

  if (validation.severity === 'high') {
    return {
      title: errorCount > 0 ? 'Errors Found' : 'High Impact Issues',
      message: errorCount > 0 
        ? `Found ${errorCount} error(s) that must be resolved before proceeding.`
        : `Found ${warningCount} high-impact issue(s) that should be reviewed.`,
      canProceed: errorCount === 0,
      actionRequired: errorCount > 0
    }
  }

  if (validation.severity === 'medium') {
    return {
      title: 'Issues Detected',
      message: `Found ${warningCount} issue(s) that may affect the workflow. You can proceed but should review them.`,
      canProceed: true,
      actionRequired: false
    }
  }

  if (validation.severity === 'low') {
    return {
      title: 'Minor Issues',
      message: `Found ${warningCount} minor issue(s). Safe to proceed.`,
      canProceed: true,
      actionRequired: false
    }
  }

  return {
    title: 'Validation Passed',
    message: 'No issues found. Safe to proceed with the transfer.',
    canProceed: true,
    actionRequired: false
  }
}