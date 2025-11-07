import { TriggerType } from '../components/molecules/SuggestionDropdown'

export const TRIGGER_CHARACTERS = {
  variable: '{',
  action: '#',
  result: '<',
} as const

export const getTriggerChar = (type: TriggerType): string => {
  return TRIGGER_CHARACTERS[type]
}

export const getTriggerType = (char: string): TriggerType | null => {
  const entry = Object.entries(TRIGGER_CHARACTERS).find(
    ([, triggerChar]) => triggerChar === char
  )
  return entry ? (entry[0] as TriggerType) : null
}

export const getClosingChar = (
  type: TriggerType,
  replaceResultChar: boolean = false
): string => {
  switch (type) {
    case 'variable':
      return '}'
    case 'action':
      return ''
    case 'result':
      return replaceResultChar ? '}' : '>'
    default:
      return ''
  }
}
