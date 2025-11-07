'use client'

import React from 'react'

import {
  TRIGGER_CHARACTERS,
  getClosingChar,
  getTriggerType,
} from '@src/utils/triggerMappings'
import { NodeViewWrapper } from '@tiptap/react'

import { TriggerType } from './SuggestionDropdown'

export interface ReactNodeComponentProps {
  node: {
    attrs: {
      id: string
      label: string
      class: string
      replaceResultChar?: boolean
      actionName?: string
    }
  }
  selected: boolean
}

export const ReactNodeComponent: React.FC<ReactNodeComponentProps> = ({
  node,
  selected,
}) => {
  const {
    id,
    label,
    class: mentionClass,
    replaceResultChar = false,
    actionName,
  } = node.attrs

  // Determine trigger and closing characters based on class
  let triggerChar: string = TRIGGER_CHARACTERS.variable
  let closingChar: string = getClosingChar('variable', replaceResultChar)
  let chipClass = 'mention-variable'
  let type: TriggerType = 'variable'

  if (mentionClass.includes('mention--result')) {
    // For results with replaceResultChar=true, use variable trigger char but result closing char
    triggerChar = replaceResultChar
      ? TRIGGER_CHARACTERS.variable
      : TRIGGER_CHARACTERS.result
    closingChar = getClosingChar('result', replaceResultChar)
    chipClass = 'mention-result'
    type = 'result'
  } else if (mentionClass.includes('mention--action')) {
    triggerChar = TRIGGER_CHARACTERS.action
    closingChar = getClosingChar('action', replaceResultChar)
    chipClass = 'mention-action'
    type = 'action'
  }

  // Build display label with action name prefix for variables and results
  let displayLabel = label
  if ((type === 'variable' || type === 'result') && actionName) {
    const formattedActionName = actionName.replace(/\s+/g, '_')
    displayLabel = `${formattedActionName}.${label}`
  }

  const handleClick = () => {
    // Optional: Add click handling logic here
  }

  const baseClasses =
    'inline-flex items-center gap-0.5 px-2 py-0.5 text-xs font-medium rounded-md border transition-all duration-200 cursor-pointer hover:shadow-sm'

  // Different styles for different mention types
  const typeClasses = {
    variable: 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100',
    action: 'bg-green-50 text-green-800 border-green-200 hover:bg-green-100',
    result:
      'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100',
  }

  const selectedClasses = selected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''

  return (
    <NodeViewWrapper
      as="span"
      className="chip-component"
      data-type="mention"
      data-id={id}
      data-label={label}
      onClick={handleClick}>
      <span
        className={`${baseClasses} ${typeClasses[type]} ${selectedClasses}`}
        contentEditable={false}>
        {type === 'action' ? (
          <>
            <span className="text-green-600">{triggerChar}</span>
            <span>{label}</span>
          </>
        ) : (
          <>
            <span
              className={`${type === 'variable' ? 'text-blue-600' : 'text-purple-600'}`}>
              {triggerChar}
            </span>
            <span>{displayLabel}</span>
            <span
              className={`${type === 'variable' ? 'text-blue-600' : 'text-purple-600'}`}>
              {closingChar}
            </span>
          </>
        )}
      </span>
    </NodeViewWrapper>
  )
}

export default ReactNodeComponent
