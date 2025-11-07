import React, { useEffect, useState } from 'react'

import { Clock, Copy, X } from 'lucide-react'
import Select from 'react-select'
import { toast } from 'react-toastify'

interface ModalCronJobProps {
  isOpen: boolean
  onClose: () => void
  currentCronExpression?: string | null
  currentTimezone?: string | null
  onSave: (cronExpression: string, timezone: string) => void
  onDelete?: () => void
  isLoading?: boolean
  isDeleting?: boolean
}

const COMMON_TIMEZONES = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
]

// Helper to generate options for dropdowns
const generateMinuteOptions = () => {
  const options = [{ value: '*', label: '* (Every)' }]
  for (let i = 0; i < 60; i++) {
    options.push({ value: i.toString(), label: i.toString() })
  }
  return options
}

const generateHourOptions = () => {
  const options = [{ value: '*', label: '* (Every)' }]
  for (let i = 0; i < 24; i++) {
    const time = i === 0 ? '00:00' : `${i.toString().padStart(2, '0')}:00`
    options.push({ value: i.toString(), label: `${i} (${time})` })
  }
  return options
}

const generateDayOfMonthOptions = () => {
  const options = [{ value: '*', label: '* (Every)' }]
  for (let i = 1; i <= 31; i++) {
    options.push({ value: i.toString(), label: i.toString() })
  }
  return options
}

const generateMonthOptions = () => {
  const months = [
    { value: '*', label: '* (Every)' },
    { value: '1', label: '1 (January)' },
    { value: '2', label: '2 (February)' },
    { value: '3', label: '3 (March)' },
    { value: '4', label: '4 (April)' },
    { value: '5', label: '5 (May)' },
    { value: '6', label: '6 (June)' },
    { value: '7', label: '7 (July)' },
    { value: '8', label: '8 (August)' },
    { value: '9', label: '9 (September)' },
    { value: '10', label: '10 (October)' },
    { value: '11', label: '11 (November)' },
    { value: '12', label: '12 (December)' },
  ]
  return months
}

const generateDayOfWeekOptions = () => {
  const days = [
    { value: '*', label: '* (Every)' },
    { value: '0', label: '0 (Sunday)' },
    { value: '1', label: '1 (Monday)' },
    { value: '2', label: '2 (Tuesday)' },
    { value: '3', label: '3 (Wednesday)' },
    { value: '4', label: '4 (Thursday)' },
    { value: '5', label: '5 (Friday)' },
    { value: '6', label: '6 (Saturday)' },
  ]
  return days
}

const ModalCronJob: React.FC<ModalCronJobProps> = ({
  isOpen,
  onClose,
  currentCronExpression,
  currentTimezone,
  onSave,
  onDelete,
  isLoading = false,
  isDeleting = false,
}) => {
  const [minute, setMinute] = useState('*')
  const [hour, setHour] = useState('*')
  const [dayOfMonth, setDayOfMonth] = useState('*')
  const [month, setMonth] = useState('*')
  const [dayOfWeek, setDayOfWeek] = useState('*')
  const [timezone, setTimezone] = useState(currentTimezone || 'UTC')

  useEffect(() => {
    if (isOpen) {
      if (currentCronExpression) {
        const parts = currentCronExpression.split(' ')
        if (parts.length === 5) {
          setMinute(parts[0] || '*')
          setHour(parts[1] || '*')
          setDayOfMonth(parts[2] || '*')
          setMonth(parts[3] || '*')
          setDayOfWeek(parts[4] || '*')
        }
      } else {
        // Reset to default values if no cron expression
        setMinute('*')
        setHour('*')
        setDayOfMonth('*')
        setMonth('*')
        setDayOfWeek('*')
      }
      setTimezone(currentTimezone || 'UTC')
    }
  }, [isOpen, currentCronExpression, currentTimezone])

  const cronExpression = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`

  const getExplanation = () => {
    let text = 'at '

    // Minute
    if (minute === '*') {
      text += 'every minute'
    } else {
      text += `minute ${minute}`
    }

    // Hour
    if (hour === '*') {
      text += ' of every hour'
    } else {
      text += ` of hour ${hour}`
    }

    // Day of month
    if (dayOfMonth === '*') {
      text += ' every day'
    } else {
      text += ` on day ${dayOfMonth}`
    }

    // Month
    if (month === '*') {
      text += ' of every month'
    } else {
      const monthNames = [
        '',
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ]
      text += ` of ${monthNames[parseInt(month)]}`
    }

    return text
  }

  const handleSave = () => {
    onSave(cronExpression, timezone)
  }

  const handleClose = () => {
    setMinute('*')
    setHour('*')
    setDayOfMonth('*')
    setMonth('*')
    setDayOfWeek('*')
    setTimezone('UTC')
    onClose()
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(cronExpression)
    toast.success('Cron expression copied to clipboard')
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-overlay backdrop-blur-sm"
      onClick={handleClose}>
      <div
        className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-5xl mx-4"
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-semibold">Configure Cron Job</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Timezone Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Timezone
            </label>
            <Select
              value={COMMON_TIMEZONES.find((tz) => tz.value === timezone)}
              onChange={(option) => option && setTimezone(option.value)}
              options={COMMON_TIMEZONES}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Select timezone..."
            />
          </div>

          {/* Select Values */}
          <div className="mb-6">
            <h3 className="text-base font-semibold text-primary-600 dark:text-primary-400 mb-4">
              Select Values
            </h3>
            <div className="grid grid-cols-5 gap-4">
              {/* Minute */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Minute
                </label>
                <Select
                  value={generateMinuteOptions().find(
                    (opt) => opt.value === minute
                  )}
                  onChange={(option) => option && setMinute(option.value)}
                  options={generateMinuteOptions()}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>

              {/* Hour */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Hour
                </label>
                <Select
                  value={generateHourOptions().find(
                    (opt) => opt.value === hour
                  )}
                  onChange={(option) => option && setHour(option.value)}
                  options={generateHourOptions()}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>

              {/* Day (Month) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Day (Month)
                </label>
                <Select
                  value={generateDayOfMonthOptions().find(
                    (opt) => opt.value === dayOfMonth
                  )}
                  onChange={(option) => option && setDayOfMonth(option.value)}
                  options={generateDayOfMonthOptions()}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>

              {/* Month */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Month
                </label>
                <Select
                  value={generateMonthOptions().find(
                    (opt) => opt.value === month
                  )}
                  onChange={(option) => option && setMonth(option.value)}
                  options={generateMonthOptions()}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>

              {/* Day (Week) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Day (Week)
                </label>
                <Select
                  value={generateDayOfWeekOptions().find(
                    (opt) => opt.value === dayOfWeek
                  )}
                  onChange={(option) => option && setDayOfWeek(option.value)}
                  options={generateDayOfWeekOptions()}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>
            </div>
          </div>

          {/* Unix Cron Expression */}
          <div className="mb-6 hidden">
            <h3 className="text-base font-semibold text-primary-600 dark:text-primary-400 mb-3">
              Unix Cron Expression
            </h3>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={cronExpression}
                readOnly
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono"
              />
              <button
                onClick={handleCopy}
                className="btn btn-primary flex items-center gap-2">
                <Copy className="w-4 h-4" />
                Copy
              </button>
            </div>
          </div>

          {/* Explanation */}
          <div className="mb-6">
            <h3 className="text-base font-semibold text-primary-600 dark:text-primary-400 mb-3">
              Explanation
            </h3>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
              <p className="text-sm text-gray-900 dark:text-gray-100">
                {getExplanation()}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800">
          <div>
            {onDelete && currentCronExpression && (
              <button
                onClick={onDelete}
                disabled={isDeleting}
                className="btn btn-outline-red disabled:opacity-50 disabled:cursor-not-allowed">
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={handleClose} className="btn btn-outline-gray">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModalCronJob
