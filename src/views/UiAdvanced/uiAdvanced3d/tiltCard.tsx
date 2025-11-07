'use client'

import React, { useEffect, useRef } from 'react'

import { TiltCardProps } from '@src/dtos/pages/ui'
import VanillaTilt from 'vanilla-tilt'

const TiltCard: React.FC<TiltCardProps> = ({
  options,
  className = '',
  children,
}) => {
  const tiltRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const currentTiltRef = tiltRef.current

    if (currentTiltRef) {
      VanillaTilt.init(currentTiltRef, options)
    }

    return () => {
      if (
        currentTiltRef &&
        (
          currentTiltRef as unknown as HTMLElement & {
            vanillaTilt: { destroy: () => void }
          }
        ).vanillaTilt
      ) {
        ;(
          currentTiltRef as unknown as HTMLElement & {
            vanillaTilt: { destroy: () => void }
          }
        ).vanillaTilt.destroy()
      }
    }
  }, [options])

  return (
    <div
      className={`mx-auto shadow-lg size-56 sm:size-64 md:size-80 ${className}`}
      ref={tiltRef}>
      {children}
    </div>
  )
}

export default TiltCard
