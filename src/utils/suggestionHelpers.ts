// Removed Action import - now using any[] for flexibility
import {
  DropdownGroup,
  SuggestionItem,
  TriggerType,
} from '@src/components/molecules/SuggestionDropdown'

import { getClosingChar, getTriggerChar } from './triggerMappings'

export const generateDeterministicId = (
  type: TriggerType,
  label: string,
  actionId?: string,
  actionType?: string | null
): string => {
  const parts = [type, label]
  if (actionId) parts.push(actionId)
  if (actionType) parts.push(actionType)
  return parts.join('-')
}

export const createSuggestionItem = (
  type: TriggerType,
  label: string,
  variableId: string, // variable_id - will be used directly as id
  actionName?: string,
  actionId?: string,
  actionType?: string,
  replaceResultChar: boolean = false,
  displayLabel?: string // Optional display label with visual indicators (like asterisk)
): SuggestionItem => {
  const triggerChar = getTriggerChar(type)
  const closingChar = getClosingChar(type, replaceResultChar)

  // Use variable_id as primary id if available, otherwise generate deterministic ID
  const primaryId = variableId

  // For dropdown: keep it simple (just label with asterisk if required)
  const dropdownDisplayLabel = displayLabel || label

  return {
    id: primaryId, // This IS the variable_id for persistence!
    label, // Clean label WITHOUT asterisk for data persistence
    displayLabel: dropdownDisplayLabel, // Visual label for DROPDOWN (WITHOUT action prefix, WITH asterisk if required)
    type,
    actionName, // Will be used by TiptapChip to show action prefix
    actionId,
    actionType,
    value: `${triggerChar}${dropdownDisplayLabel}${closingChar}`, // Dropdown display (without prefix)
    insertText: `${triggerChar}${label}${closingChar}`, // Insert clean label WITHOUT prefix for DB persistence
  }
}

export const filterItemsByQuery = (
  items: SuggestionItem[],
  query: string
): SuggestionItem[] => {
  if (!query.trim()) {
    return items
  }

  const searchTerm = query.toLowerCase()
  return items.filter(
    (item) =>
      item.label.toLowerCase().includes(searchTerm) ||
      item.actionName?.toLowerCase().includes(searchTerm)
  )
}

export const groupItemsByAction = (
  items: SuggestionItem[]
): DropdownGroup[] => {
  const grouped = items.reduce(
    (acc, item) => {
      const actionName = item.actionName || 'Other'
      if (!acc[actionName]) {
        acc[actionName] = []
      }
      acc[actionName].push(item)
      return acc
    },
    {} as Record<string, SuggestionItem[]>
  )

  return Object.entries(grouped).map(([actionName, items]) => ({
    actionName,
    items,
  }))
}

export const extractVariables = (
  actions: any[],
  replaceResultChar: boolean = false
): SuggestionItem[] => {
  const variables: SuggestionItem[] = []

  actions.forEach((action) => {
    if (action.variables) {
      action.variables.forEach((variable: any) => {
        // Clean label for data persistence
        const label = variable.key
        // Display label with asterisk for visual indication
        const displayLabel = variable.required ? `${variable.key}*` : variable.key

        variables.push(
          createSuggestionItem(
            'variable',
            label, // Clean label WITHOUT asterisk
            variable.variable_id, // variable_id - now goes directly to id
            action.name,
            action.id, // actionId
            variable.actionType, // actionType from variable
            replaceResultChar,
            displayLabel // Display label WITH asterisk if required
          )
        )
      })
    }
  })

  return variables
}

export const extractResults = (
  actions: any[],
  replaceResultChar: boolean = false
): SuggestionItem[] => {
  console.log('🔍 extractResults called with actions:', actions)
  const results: SuggestionItem[] = []

  actions.forEach((action) => {
    console.log('🔍 Processing action:', action)
    if (action.results) {
      console.log('🔍 Action has results:', action.results)
      action.results.forEach((result: any) => {
        console.log('🔍 Processing result:', result)
        const suggestion = createSuggestionItem(
          'result',
          result.key,
          result.variable_id || `${action.id}-${result.key}`, // Use variable_id if available, otherwise generate from action.id + result.key
          action.name,
          action.id, // actionId
          result.actionType, // actionType from result
          replaceResultChar
        )
        console.log('🔍 Created suggestion:', suggestion)
        results.push(suggestion)
      })
    } else {
      console.log('🔍 Action has no results property')
    }
  })

  console.log('🔍 Final results array:', results)
  return results
}

export const extractCustomActions = (
  availableActions: any[],
  replaceResultChar: boolean = false
): SuggestionItem[] => {
  return availableActions.map((action) =>
    createSuggestionItem(
      'action',
      action.name,
      action.variable_id || action.id, // Use variable_id if available, otherwise fallback to id
      action.name,
      action.id,
      undefined,
      replaceResultChar
    )
  )
}

export const getAllSuggestionItems = (
  availableActions: any[],
  type: TriggerType,
  replaceResultChar: boolean = false
): SuggestionItem[] => {
  console.log('🚀 getAllSuggestionItems called with:', { availableActions, type, replaceResultChar })

  switch (type) {
    case 'variable':
      const variables = extractVariables(availableActions, replaceResultChar)
      console.log('🚀 Variables extracted:', variables)
      return variables
    case 'action':
      const actions = extractCustomActions(availableActions, replaceResultChar)
      console.log('🚀 Actions extracted:', actions)
      return actions
    case 'result':
      const results = extractResults(availableActions, replaceResultChar)
      console.log('🚀 Results extracted:', results)
      return results
    default:
      console.log('🚀 Unknown type, returning empty array')
      return []
  }
}
