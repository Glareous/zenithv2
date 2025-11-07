/**
 * Transforms TipTap JSON content to text format with action references
 *
 * Format rules:
 * - Actions: #actionId
 * - Variables: #actionId:variable:variableName
 * - Results: #actionId:result:resultName
 */

interface TipTapNode {
  type: string
  content?: TipTapNode[]
  text?: string
  attrs?: {
    id?: string | null
    label?: string | null
    class?: string
    replaceResultChar?: boolean
    actionId?: string | null
    actionType?: string | null
  }
}

interface TipTapDocument {
  type: string
  content: TipTapNode[]
}

/**
 * Transforms a TipTap JSON document to plain text with action references
 */
export function transformTipTapToText(document: TipTapDocument): string {
  if (!document || !document.content) {
    return ''
  }

  return processNodes(document.content)
}

/**
 * Recursively processes TipTap nodes and converts them to text
 */
function processNodes(nodes: TipTapNode[]): string {
  return nodes.map(processNode).join('')
}

/**
 * Processes a single TipTap node
 */
function processNode(node: TipTapNode): string {
  switch (node.type) {
    case 'text':
      return node.text || ''

    case 'paragraph':
      if (node.content) {
        return processNodes(node.content)
      }
      return ''

    case 'reactMention':
      return processMentionNode(node)

    default:
      // For other node types (like hardBreak, etc.), process their content if available
      if (node.content) {
        return processNodes(node.content)
      }
      return ''
  }
}

/**
 * Processes a reactMention node and converts it to the appropriate text format
 */
function processMentionNode(node: TipTapNode): string {
  const attrs = node.attrs
  if (!attrs) {
    return ''
  }

  const { label, class: className, actionId } = attrs

  // Determine mention type from class
  if (className?.includes('mention--action')) {
    // Action mention: #actionId
    return actionId ? `#${actionId}` : ''
  }

  if (className?.includes('mention--variable')) {
    // Variable mention: #actionId:variable:variableName
    if (actionId && label) {
      return `#${actionId}:variable:${label}`
    }
    return ''
  }

  if (className?.includes('mention--result')) {
    // Result mention: #actionId:result:resultName
    if (actionId && label) {
      return `#${actionId}:result:${label}`
    }
    // If no actionId, it might be a generic result reference
    if (label) {
      return `#:result:${label}`
    }
    return ''
  }

  // Fallback for unknown mention types
  return label || ''
}

/**
 * Helper function to validate TipTap document structure
 */
export function isValidTipTapDocument(document: any): document is TipTapDocument {
  return (
    document &&
    typeof document === 'object' &&
    document.type === 'doc' &&
    Array.isArray(document.content)
  )
}