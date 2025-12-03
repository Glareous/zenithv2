import { env } from '@/env'

/**
 * Backend Async Service
 * Triggers async processing endpoints for PQR, Leads, and Forecasting
 */

const BACKEND_URL = env.BACKEND_URL

/**
 * Helper function to delay execution
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Triggers the async PQR processing endpoint
 * @param id - The PQR ID to process
 */
export async function triggerPQRAsync(id: string): Promise<void> {
  const url = `${BACKEND_URL}/api/pqr/pqr-async/${id}`

  console.log(`[PQR Async] Triggering async processing...`)
  console.log(`[PQR Async] ID: ${id}`)
  console.log(`[PQR Async] Method: GET`)
  console.log(`[PQR Async] URL: ${url}`)

  try {
    const startTime = Date.now()
    const response = await fetch(url, {
      method: 'GET',
    })
    const duration = Date.now() - startTime

    if (!response.ok) {
      console.error(`[PQR Async] FAILED - ID: ${id} | Status: ${response.status} ${response.statusText} | Duration: ${duration}ms`)
    } else {
      console.log(`[PQR Async] SUCCESS - ID: ${id} | Status: ${response.status} | Duration: ${duration}ms`)
    }
  } catch (error) {
    console.error(`[PQR Async] ERROR - ID: ${id} | Error:`, error)
  }
}

/**
 * Triggers the async Leads processing endpoint
 * @param id - The Lead ID to process
 */
export async function triggerLeadsAsync(id: string): Promise<void> {
  const url = `${BACKEND_URL}/api/leads/leads-async/${id}`

  console.log(`[Leads Async] Triggering async processing...`)
  console.log(`[Leads Async] ID: ${id}`)
  console.log(`[Leads Async] Method: GET`)
  console.log(`[Leads Async] URL: ${url}`)
  console.log(`[Leads Async] Waiting 2 seconds before request...`)

  // Wait 2 seconds before making the request
  await delay(2000)

  try {
    const startTime = Date.now()
    const response = await fetch(url, {
      method: 'GET',
    })
    const duration = Date.now() - startTime

    if (!response.ok) {
      console.error(`[Leads Async] FAILED - ID: ${id} | Status: ${response.status} ${response.statusText} | Duration: ${duration}ms`)
    } else {
      console.log(`[Leads Async] SUCCESS - ID: ${id} | Status: ${response.status} | Duration: ${duration}ms`)
    }
  } catch (error) {
    console.error(`[Leads Async] ERROR - ID: ${id} | Error:`, error)
  }
}

/**
 * Triggers the async Forecast processing endpoint
 * @param id - The Forecast ID to process
 */
export async function triggerForecastAsync(id: string): Promise<void> {
  const url = `${BACKEND_URL}/api/forecast/forecast-async/${id}`

  console.log(`[Forecast Async] Triggering async processing...`)
  console.log(`[Forecast Async] ID: ${id}`)
  console.log(`[Forecast Async] Method: GET`)
  console.log(`[Forecast Async] URL: ${url}`)
  console.log(`[Forecast Async] Waiting 5 seconds before request...`)

  // Wait 5 seconds before making the request
  await delay(5000)

  try {
    const startTime = Date.now()
    const response = await fetch(url, {
      method: 'GET',
    })
    const duration = Date.now() - startTime

    // Read response body
    let responseBody: any = null
    try {
      const text = await response.text()
      try {
        responseBody = JSON.parse(text)
      } catch {
        responseBody = text
      }
    } catch (e) {
      responseBody = 'Unable to read response body'
    }

    if (!response.ok) {
      console.error(`[Forecast Async] FAILED - ID: ${id} | Status: ${response.status} ${response.statusText} | Duration: ${duration}ms`)
      console.error(`[Forecast Async] Response:`, responseBody)
    } else {
      console.log(`[Forecast Async] SUCCESS - ID: ${id} | Status: ${response.status} | Duration: ${duration}ms`)
      console.log(`[Forecast Async] Response:`, responseBody)
    }
  } catch (error) {
    console.error(`[Forecast Async] ERROR - ID: ${id} | Error:`, error)
  }
}
