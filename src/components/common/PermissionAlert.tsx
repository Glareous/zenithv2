import React from 'react'

import { Info, Lock } from 'lucide-react'

interface PermissionAlertProps {
  show: boolean
  type?: 'info' | 'warning'
  message?: string
}

export const PermissionAlert: React.FC<PermissionAlertProps> = ({
  show,
  type = 'info',
  message,
}) => {
  if (!show) return null

  const defaultMessage = 'You have read-only access to this configuration.'

  const colorClasses = {
    info: 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-100',
    warning:
      'bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-100',
  }

  const iconColorClasses = {
    info: 'text-blue-600 dark:text-blue-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
  }

  return (
    <div
      className={`mb-4 p-4 border rounded-lg flex items-start gap-3 ${colorClasses[type]}`}>
      <Lock
        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColorClasses[type]}`}
      />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-semibold">Read-Only Access</p>
        </div>
        <p className="text-xs opacity-90">{message || defaultMessage}</p>
      </div>
    </div>
  )
}

export default PermissionAlert
