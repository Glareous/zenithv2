// Generic type for LocalStorage data
export type StorageData<T> = T | null

// Define a structure for handling LocalStorage records
export interface LocalStorageRecord {
  id: number
  [key: string]: unknown // Allows additional dynamic fields
}

// Define the Calendar Event Type
export interface EventItem extends LocalStorageRecord {
  title: string
  date: string
  description?: string
}

export const getLocalStorage = <T>(key: string): StorageData<T> => {
  if (typeof window === 'undefined') return null
  const listData = localStorage.getItem(key)
  return listData ? (JSON.parse(listData) as T) : null
}

// Set list data in storage
export const createLocalStorage = <T>(key: string, data: T): boolean => {
  if (typeof window === 'undefined') return false
  localStorage.setItem(key, JSON.stringify(data))
  return true
}

// Delete list data in storage
export const deleteLocalStorage = (key: string): boolean => {
  if (typeof window === 'undefined') return false
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key)
    return true
  }
  return false
}

// Add a record to storage
export const addLocalStorageRecord = <T extends LocalStorageRecord>(
  key: string,
  listRecord: Omit<T, 'id'> // Ensures `id` is generated dynamically
): boolean => {
  if (typeof window === 'undefined') return false

  const listData = getLocalStorage<T[]>(key) ?? []
  const newRecordId =
    listData.length > 0 ? listData[listData.length - 1].id + 1 : 1
  const newRecord = { ...listRecord, id: newRecordId } as T

  listData.push(newRecord)
  localStorage.setItem(key, JSON.stringify(listData))
  return true
}

// Update a record in storage
export const updateLocalStorageRecord = <T extends LocalStorageRecord>(
  key: string,
  listRecord: T
): boolean => {
  if (typeof window === 'undefined') return false

  const listData = getLocalStorage<T[]>(key)
  if (!listData) return false

  const recordIndex = listData.findIndex(
    (record) => record.id === listRecord.id
  )
  if (recordIndex !== -1) {
    listData[recordIndex] = listRecord
  } else {
    listData.push(listRecord)
  }

  localStorage.setItem(key, JSON.stringify(listData))
  return true
}

// Delete records in storage
export const deleteLocalStorageRecord = (params: {
  key: string
  listRecord: number[]
  multipleRecords?: boolean
}): boolean => {
  if (typeof window === 'undefined') return false

  let listData = getLocalStorage<LocalStorageRecord[]>(params.key) ?? []

  if (params.multipleRecords) {
    listData = listData.filter((item) => !params.listRecord.includes(item.id))
    localStorage.setItem(params.key, JSON.stringify(listData))
    return true
  }

  return false
}
