import axios, { AxiosInstance, AxiosResponse } from 'axios'

const api: AxiosInstance & {
  post<T>(
    url: string,
    newRecord: T,
    field?: string
  ): Promise<{ data: T; message: string }>
  put<T>(
    url: string,
    updatedRecord: T,
    field?: string
  ): Promise<{ data: T; message: string }>
  delete(
    url: string,
    id: number,
    field?: string
  ): Promise<{ data: number; message: string }>
} = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
})

api.get = async <T>(url: string): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await axios.get(url)
    return response.data
  } catch (error) {
    console.log('error', error)
    throw new Error('Failed to fetch data')
  }
}

export const customPost = async <T>(
  url: string,
  newRecord: T,
  field?: string
): Promise<{ data: T; message: string }> => {
  const isApiActive = process.env.NEXT_PUBLIC_IS_API_ACTIVE === 'true'

  if (isApiActive) {
    try {
      const response: AxiosResponse<T> = await api.post(url, newRecord, {
        headers: { 'Content-Type': 'application/json' },
      })
      return {
        data: response.data,
        message: `${field} record added successfully`,
      }
    } catch (error) {
      console.error('Error adding record:', error)
      throw new Error('Internal Server Error')
    }
  } else {
    return { data: newRecord, message: `${field} record added successfully` }
  }
}

export const customPut = async <T>(
  url: string,
  updatedRecord: T,
  field?: string
): Promise<{ data: T; message: string }> => {
  const isApiActive = process.env.NEXT_PUBLIC_IS_API_ACTIVE === 'true'

  if (isApiActive) {
    try {
      const response: AxiosResponse<T> = await api.put(url, updatedRecord, {
        headers: { 'Content-Type': 'application/json' },
      })
      return { data: response.data, message: `${field} update successful` }
    } catch (error) {
      console.error('Error updating record:', error)
      throw new Error('Internal Server Error')
    }
  } else {
    return { data: updatedRecord, message: `${field} update successful` }
  }
}

export const customDelete = async (
  url: string,
  id: number,
  field?: string
): Promise<{ data: number; message: string }> => {
  const isApiActive = process.env.NEXT_PUBLIC_IS_API_ACTIVE === 'true'

  if (isApiActive) {
    try {
      const response: AxiosResponse<number> = await api.delete(url, {
        headers: { 'Content-Type': 'application/json' },
        data: { id },
      })

      if (response.status === 200) {
        return { data: id, message: `${field} delete successful` }
      } else {
        throw new Error('Failed to delete record')
      }
    } catch (error) {
      console.error('Error deleting record:', error)
      throw new Error('Internal Server Error')
    }
  } else {
    return { data: id, message: `${field} delete successful` }
  }
}

export default api
