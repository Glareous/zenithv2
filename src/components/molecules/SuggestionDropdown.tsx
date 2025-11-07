import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react'

import { groupItemsByAction } from '../../utils/suggestionHelpers'

export type TriggerType = 'variable' | 'action' | 'result'

export interface SuggestionItem {
  id: string
  label: string
  displayLabel?: string // Visual label with indicators like asterisk (*)
  type: TriggerType
  actionName?: string
  actionId?: string
  actionType?: string
  value: string
  insertText: string
}
export interface DropdownGroup {
  actionName: string
  items: SuggestionItem[]
}

export interface SuggestionDropdownProps {
  items: SuggestionItem[]
  command: (item: SuggestionItem) => void
  onKeyDown?: (event: KeyboardEvent) => boolean
}

export interface SuggestionDropdownRef {
  onKeyDown: (event: KeyboardEvent) => boolean
}

export const SuggestionDropdown = forwardRef<
  SuggestionDropdownRef,
  SuggestionDropdownProps
>(function SuggestionDropdown({ items, command }, ref) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const groups = groupItemsByAction(items)

  const flatItems = items

  useEffect(() => {
    setSelectedIndex(0)
  }, [items])

  const selectItem = (index: number) => {
    const item = flatItems[index]
    if (item) {
      command(item)
    }
  }

  const upHandler = () => {
    setSelectedIndex((selectedIndex + flatItems.length - 1) % flatItems.length)
    return true
  }

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % flatItems.length)
    return true
  }

  const enterHandler = () => {
    selectItem(selectedIndex)
    return true
  }

  const onKeyDown = (event: KeyboardEvent): boolean => {
    if (event.key === 'ArrowUp') {
      upHandler()
      return true
    }

    if (event.key === 'ArrowDown') {
      downHandler()
      return true
    }

    if (event.key === 'Enter') {
      enterHandler()
      return true
    }

    return false
  }

  useImperativeHandle(ref, () => ({
    onKeyDown,
  }))

  if (flatItems.length === 0) {
    return (
      <div className="suggestion-dropdown bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm text-gray-500">
        No items found
      </div>
    )
  }

  const shouldGroup =
    groups.length > 1 && groups.some((group) => group.actionName !== 'Other')

  if (shouldGroup) {
    let currentIndex = 0

    return (
      <div className="suggestion-dropdown bg-white border border-gray-200 rounded-lg shadow-lg py-2 max-h-60 overflow-y-auto">
        {groups.map((group, groupIndex) => (
          <div key={group.actionName}>
            {group.actionName !== 'Other' && (
              <div className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                {group.actionName}
              </div>
            )}
            {group.items.map((item: any, idx) => {
              const itemIndex = currentIndex++
              const isSelected = itemIndex === selectedIndex

              return (
                <button
                  key={idx}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${
                    isSelected ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                  }`}
                  onClick={() => selectItem(itemIndex)}>
                  <span>
                    {(item.displayLabel || item.label).replace('*', '')}
                    {(item.displayLabel || item.label).endsWith('*') && (
                      <span className="text-red-500">*</span>
                    )}
                  </span>
                </button>
              )
            })}
            {groupIndex < groups.length - 1 && group.actionName !== 'Other' && (
              <div className="border-t border-gray-100 my-1" />
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="suggestion-dropdown bg-white border border-gray-200 rounded-lg shadow-lg py-2 max-h-60 overflow-y-auto">
      {flatItems.map((item, index) => {
        const isSelected = index === selectedIndex

        return (
          <button
            key={item.id}
            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${
              isSelected ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
            }`}
            onClick={() => selectItem(index)}>
            <span>
              {(item.displayLabel || item.label).replace('*', '')}
              {(item.displayLabel || item.label).endsWith('*') && (
                <span className="text-red-500">*</span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
})
