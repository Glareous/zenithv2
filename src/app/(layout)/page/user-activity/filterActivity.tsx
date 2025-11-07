'use client'

import { useEffect, useState } from 'react'

import { TypeOptionsDataRecord } from '@src/dtos'

interface FilterActivityProps {
  title?: string
  options: TypeOptionsDataRecord[]
}

const FilterActivity: React.FC<FilterActivityProps> = ({
  title,
  options = [],
}) => {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())
  // Extract the ID for "Select All" option
  const selectAllId = options.find(
    (option) => option.label === 'All Select'
  )?.id

  useEffect(() => {
    if (selectAllId) {
      const allOptionsSelected = options
        .filter((option) => option.id !== selectAllId)
        .every((option) => checkedItems.has(option.id))

      if (allOptionsSelected && !checkedItems.has(selectAllId)) {
        setCheckedItems((prev) => new Set([...Array.from(prev), selectAllId]))
      } else if (!allOptionsSelected && checkedItems.has(selectAllId)) {
        setCheckedItems((prev) => {
          const newCheckedItems = new Set(prev)
          newCheckedItems.delete(selectAllId)
          return newCheckedItems
        })
      }
    }
  }, [checkedItems, options, selectAllId])

  const handleCheckboxChange = (id: string) => {
    setCheckedItems((prev) => {
      const newCheckedItems = new Set(prev)

      if (id === selectAllId) {
        if (newCheckedItems.has(selectAllId as string)) {
          newCheckedItems.clear()
        } else {
          options.forEach((option) => newCheckedItems.add(option.id))
        }
      } else {
        if (newCheckedItems.has(id)) {
          newCheckedItems.delete(id)
        } else {
          newCheckedItems.add(id)
        }

        const allOptionsSelected = options
          .filter((option) => option.id !== selectAllId)
          .every((option) => newCheckedItems.has(option.id))

        if (allOptionsSelected) {
          newCheckedItems.add(selectAllId as string)
        } else {
          newCheckedItems.delete(selectAllId as string)
        }
      }

      return newCheckedItems
    })
  }

  return (
    <div>
      {title && (
        <p className="mb-3 text-sm font-medium text-gray-500 uppercase dark:text-dark-500">
          {title}
        </p>
      )}
      <div className="flex flex-col gap-3">
        {options.map((option) => (
          <div key={option.id} className="input-check-group">
            <input
              id={option.id}
              className="input-check input-check-primary"
              type="checkbox"
              checked={checkedItems.has(option.id)}
              onChange={() => handleCheckboxChange(option.id)}
            />
            <label htmlFor={option.id} className="input-check-label">
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FilterActivity
