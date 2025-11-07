import React from 'react'

const Button = ({
  text,
  color,
  className = '',
  custome = '',
  size = '',
  icon: Icon = null,
  disabled = false,
  ...rest
}: {
  text: string
  color: string
  className?: string
  custome?: string
  size?: string
  icon?: React.ElementType | null
  disabled?: boolean
}) => {
  return (
    <button
      className={` ${color} ${custome} ${className} ${size} ${
        disabled ? 'cursor-not-allowed' : ''
      }`}
      disabled={disabled}
      {...rest}>
      {Icon && <Icon className="size-4" />}
      {text}
    </button>
  )
}

export default Button
