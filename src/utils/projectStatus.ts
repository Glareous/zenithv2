// Tipos para los estados de proyecto
export type ProjectStatus = 'CREATED' | 'ACTIVE' | 'COMPLETED'

// Configuración de cada estado
interface StatusConfig {
  label: string
  badgeClass: string
  color: string
  description: string
}

// Configuración de estados
export const PROJECT_STATUS_CONFIG: Record<ProjectStatus, StatusConfig> = {
  CREATED: {
    label: 'Creado',
    badgeClass: 'badge badge-blue',
    color: 'blue',
    description: 'Proyecto recién creado, aún no iniciado',
  },
  ACTIVE: {
    label: 'Activo',
    badgeClass: 'badge badge-green',
    color: 'green',
    description: 'Proyecto actualmente en progreso',
  },
  COMPLETED: {
    label: 'Completado',
    badgeClass: 'badge badge-purple',
    color: 'purple',
    description: 'Proyecto finalizado',
  },
}

/**
 * Obtiene la clase CSS del badge para un estado
 */
export function getProjectStatusBadgeClass(
  status: ProjectStatus | string
): string {
  const config = PROJECT_STATUS_CONFIG[status as ProjectStatus]
  return config?.badgeClass || 'badge badge-gray'
}

/**
 * Obtiene el texto en español para un estado
 */
export function getProjectStatusLabel(status: ProjectStatus | string): string {
  const config = PROJECT_STATUS_CONFIG[status as ProjectStatus]
  return config?.label || 'Desconocido'
}

/**
 * Obtiene la descripción de un estado
 */
export function getProjectStatusDescription(
  status: ProjectStatus | string
): string {
  const config = PROJECT_STATUS_CONFIG[status as ProjectStatus]
  return config?.description || 'Estado desconocido'
}

/**
 * Obtiene el color de un estado
 */
export function getProjectStatusColor(status: ProjectStatus | string): string {
  const config = PROJECT_STATUS_CONFIG[status as ProjectStatus]
  return config?.color || 'gray'
}

/**
 * Verifica si un estado es válido
 */
export function isValidProjectStatus(status: string): status is ProjectStatus {
  return status in PROJECT_STATUS_CONFIG
}

/**
 * Obtiene todos los estados disponibles
 */
export function getAvailableProjectStatuses(): ProjectStatus[] {
  return Object.keys(PROJECT_STATUS_CONFIG) as ProjectStatus[]
}

/**
 * Obtiene las opciones para filtros/selects
 */
export function getProjectStatusOptions() {
  return Object.entries(PROJECT_STATUS_CONFIG).map(([value, config]) => ({
    value,
    label: config.label,
    description: config.description,
  }))
}
