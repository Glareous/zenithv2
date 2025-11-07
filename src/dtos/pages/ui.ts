export interface TiltCardProps {
  options?: {
    max: number
    speed: number
    startX?: number
    startY?: number
    reset?: boolean
    axis?: 'x' | 'y' | null | undefined
    scale?: number
    fullPageListening?: boolean
    glare?: boolean
    reverse?: boolean
    'max-glare'?: number
  }
  className?: string
  children?: React.ReactNode
}
export interface Comment {
  text: string
}

export interface Note {
  id: number
  x: number
  y: number
  visible: boolean
  comments: Comment[]
}

export interface DropdownItems {
  id: number
  text: string
  textColor: string
  spantextColor?: string
}
export interface BaseDropdownProps {
  data: DropdownItems[]
}

export interface ColoredDropdownProps {
  data: DropdownItems[]
}
export interface PositionDropdownProps {
  data: DropdownItems[]
}
