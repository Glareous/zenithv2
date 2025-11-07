// events
export interface EventItem {
  _id?: number
  id?: number
  title: string
  start: string
  end: string
  eventTime: string
  className?: string
  classNames?: string[]
  extendedProps?: {
    guests?: string[]
    location?: string
  } | null
}
export interface DateClickArg {
  date: Date
}

export interface CalendarEvent {
  id: string
  title: string
  start: string
  end?: string | number
  eventTime?: string // Add this property
  extendedProps?: {
    guests?: string[]
    location?: string
  } // Remove null allowance
  classNames?: string[] | undefined
}
