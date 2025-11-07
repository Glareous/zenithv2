interface OptionType {
  label: string
  value: string
}

const doctorsOptions: OptionType[] = [
  { label: 'Dr. Michael', value: 'Dr. Michael' },
  { label: 'Dr. Sarah', value: 'Dr. Sarah' },
  { label: 'Dr. Robert', value: 'Dr. Robert' },
  { label: 'Dr. Emily', value: 'Dr. Emily' },
  { label: 'Dr. James', value: 'Dr. James' },
  { label: 'Dr. Olivia', value: 'Dr. Olivia' },
  { label: 'Dr. David', value: 'Dr. David' },
  { label: 'Dr. Sophia', value: 'Dr. Sophia' },
  { label: 'Dr. William', value: 'Dr. William' },
  { label: 'Dr. Charlotte', value: 'Dr. Charlotte' },
]

const statusOptions: OptionType[] = [
  { label: 'New', value: 'New' },
  { label: 'Follow Up', value: 'Follow Up' },
  { label: 'Old', value: 'Old' },
]

const insuranceOptions: OptionType[] = [
  { label: 'Yes', value: 'Yes' },
  { label: 'No', value: 'No' },
]

const cityOptions: OptionType[] = [
  { label: 'Algeria', value: 'Algeria' },
  { label: 'Argentina', value: 'Argentina' },
  { label: 'Belgium', value: 'Belgium' },
  { label: 'Mexico', value: 'Mexico' },
  { label: 'Russia', value: 'Russia' },
  { label: 'Denmark', value: 'Denmark' },
  { label: 'Sudan', value: 'Sudan' },
  { label: 'Spain', value: 'Spain' },
  { label: 'Germany', value: 'Germany' },
  { label: 'Israel', value: 'Israel' },
  { label: 'Namibia', value: 'Namibia' },
  { label: 'Brazil', value: 'Brazil' },
  { label: 'Poland', value: 'Poland' },
  { label: 'Serbia', value: 'Serbia' },
  { label: 'Malaysia', value: 'Malaysia' },
  { label: 'Norway', value: 'Norway' },
  { label: 'Romania', value: 'Romania' },
  { label: 'USA', value: 'USA' },
  { label: 'Canada', value: 'Canada' },
]

const genderOptions: OptionType[] = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
  { label: 'Others', value: 'Others' },
]

export interface FilterDrawerProps {
  isDrawerOpen: boolean
  closeDrawer: () => void
  onFilterChange: (filters: {
    doctor?: string
    status?: string
    insurance?: string
    city?: string
    gender?: string
  }) => void
}
export {
  genderOptions,
  cityOptions,
  statusOptions,
  doctorsOptions,
  insuranceOptions,
}
