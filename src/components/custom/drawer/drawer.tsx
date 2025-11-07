'use client'

import React, { useLayoutEffect, useRef, useState } from 'react'

import { X } from 'lucide-react'
import SimpleBar from 'simplebar-react'

interface DrawerHeaderProps {
  title?: string
  onClose: () => void
  titleClass?: string
}

const DrawerHeader: React.FC<DrawerHeaderProps> = ({
  title,
  onClose,
  titleClass,
}) => {
  return (
    <div className="drawer-header">
      {titleClass ? (
        <div className={titleClass}>{title}</div>
      ) : (
        <h6>{title}</h6>
      )}
      <button onClick={onClose} className="text-red-500">
        <X className="link link-red" />
      </button>
    </div>
  )
}

const DrawerContent: React.FC<{
  children?: React.ReactNode
  isSimpleBar?: boolean
  customContentClass?: string
}> = ({ children, isSimpleBar, customContentClass }) => {
  return isSimpleBar ? (
    <SimpleBar
      className={customContentClass ? customContentClass : 'drawer-content'}>
      {children}
    </SimpleBar>
  ) : (
    <div className={customContentClass ? customContentClass : 'drawer-content'}>
      {children}
    </div>
  )
}

const DrawerFooter: React.FC<{
  children?: React.ReactNode
  footerClass?: string
}> = ({ children, footerClass }) => {
  return (
    <div className={`drawer-footer mt-auto ${footerClass}`}>{children}</div>
  )
}

interface CustomDrawerProps {
  isOpen: boolean
  onClose: () => void
  position?: 'left' | 'right' | 'top' | 'bottom'
  size?: 'small' | 'medium' | 'large' | 'half-screen'
  title?: string
  titleClass?: string
  content?: React.ReactNode
  isSimpleBar?: boolean
  footer?: React.ReactNode
  id?: string
  footerClass?: string
  customContentClass?: string
}

const Drawer: React.FC<CustomDrawerProps> = ({
  isOpen,
  onClose,
  position = 'right',
  size = '',
  title,
  titleClass,
  content,
  isSimpleBar,
  footer,
  id,
  footerClass,
  customContentClass,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useLayoutEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      requestAnimationFrame(() => setIsAnimating(true))
      document.body.classList.add('overflow-hidden')
    } else {
      setIsAnimating(false)
      const timeoutId = setTimeout(() => setIsVisible(false), 300)
      document.body.classList.remove('overflow-hidden')
      return () => clearTimeout(timeoutId)
    }
  }, [isOpen])

  if (!isVisible) return null

  const positionClass =
    position === 'left'
      ? 'drawer-start start-0 translate-x-0'
      : position === 'right'
        ? 'drawer-end end-0'
        : position === 'top'
          ? 'h-[20rem] left-0 right-0 w-full'
          : 'h-[20rem] left-0 right-0 bottom-0 top-auto w-full'
  const sizeClass =
    size === 'small'
      ? 'drawer-sm'
      : size === 'medium'
        ? 'w-80'
        : size === 'large'
          ? 'w-96'
          : size === 'half-screen'
            ? 'w-1/2'
            : 'w-80'

  return (
    <>
      {/* Backdrop with fade effect */}
      <div
        className={`backdrop-overlay backdrop-blur-xs transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Drawer with slide animation */}
      <div
        className={`drawer fixed ${positionClass} light:bg-white ${sizeClass} transition-transform duration-300 ease-in-out ${
          isAnimating
            ? 'translate-x-0 translate-y-0'
            : position === 'left'
              ? '-translate-x-full'
              : position === 'right'
                ? 'translate-x-full'
                : position === 'top'
                  ? '-translate-y-full'
                  : 'translate-y-full'
        }`}
        id={id}
        ref={drawerRef}>
        <div className="flex flex-col h-full">
          {title && (
            <DrawerHeader
              title={title}
              onClose={onClose}
              titleClass={titleClass}
            />
          )}
          <DrawerContent
            isSimpleBar={isSimpleBar}
            customContentClass={customContentClass}>
            {content}
          </DrawerContent>
          {footer && (
            <DrawerFooter footerClass={footerClass}>{footer}</DrawerFooter>
          )}
        </div>
      </div>
    </>
  )
}

export { DrawerHeader, DrawerContent, DrawerFooter, Drawer }
