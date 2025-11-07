import { StylesConfig } from 'react-select'

export interface CategoryItems {
  id: number
  categoryID?: string
  category: string
  products: number
  image: string
  status: string
  description: string
}
type OptionType = {
  label: string
  value: string
}

export const darkSelectStyles: StylesConfig<OptionType, false> = {
  control: (base, state) => ({
    ...base,
    backgroundColor: '#0f172a',
    borderColor: state.isFocused ? '#3b82f6' : '#334155',
    color: '#f1f5f9',
    borderRadius: '0.5rem',
    boxShadow: 'none',
    '&:hover': {
      borderColor: '#3b82f6',
    },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: '#0f172a',
    borderRadius: '0.5rem',
    marginTop: '0.25rem',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? '#1e293b' : '#0f172a',
    color: '#f1f5f9',
    cursor: 'pointer',
  }),
  singleValue: (base) => ({
    ...base,
    color: '#f1f5f9',
  }),
  placeholder: (base) => ({
    ...base,
    color: '#64748b',
  }),
}
