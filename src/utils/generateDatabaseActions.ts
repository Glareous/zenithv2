/**
 * Helper functions for generating database actions
 */

import { randomBytes, createHash } from 'crypto'
import type { DatabaseActionTemplate } from '@src/config/databaseActionsTemplate'
import { env } from '@src/env'

/**
 * Generate a secure API key
 */
export function generateApiKey(): string {
  return `ak_${randomBytes(32).toString('hex')}`
}

/**
 * Hash an API key using SHA256
 */
export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex')
}

/**
 * Build the full endpoint URL for a database action
 * Replaces project.id with the actual project ID
 */
export function buildEndpointUrl(
  template: DatabaseActionTemplate,
  projectId: string
): string {
  const baseUrl = env.NEXT_PUBLIC_BASE_URL
  const projectPath = `/api/rest/projects/${projectId}`
  return `${baseUrl}${projectPath}${template.endpoint}`
}

/**
 * Build variables array for a database action
 * Creates variable definitions based on required and optional fields
 */
export function buildVariables(template: DatabaseActionTemplate) {
  const variables: Array<{
    key: string
    value: string
    actionCallType: 'BEFORE_CALL'
    type: string
    description: string
    variable_id: string
    required: boolean
  }> = []

  // Add required variables
  template.required.forEach((key) => {
    const type = template.fieldTypes?.[key] || 'string'
    variables.push({
      key,
      value: '',
      actionCallType: 'BEFORE_CALL',
      type,
      description: `${key} (required)`,
      variable_id: `var_${key}`,
      required: true,
    })
  })

  // Add optional variables
  template.optional.forEach((key) => {
    const type = template.fieldTypes?.[key] || 'string'
    variables.push({
      key,
      value: '',
      actionCallType: 'BEFORE_CALL',
      type,
      description: `${key} (optional)`,
      variable_id: `var_${key}`,
      required: false,
    })
  })

  return variables
}

/**
 * Build results array for a database action
 * Creates result definitions based on the template's result fields
 */
export function buildResults(template: DatabaseActionTemplate) {
  return template.results.map((key) => ({ key }))
}

/**
 * Build headers array for a database action
 */
export function buildHeaders() {
  return [
    { key: 'accept', value: 'application/json' },
    { key: 'Content-Type', value: 'application/json' },
  ]
}
