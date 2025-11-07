'use client'

import React, { useEffect, useState } from 'react'

import { VectorMap } from '@south-paw/react-vector-maps'
import World from '@src/data/world-Map.json'

// Adjust the import to your actual map file
const MarkersVectorMap = () => {
  const [hovered, setHovered] = React.useState<string>('None')
  const [tooltipPosition, setTooltipPosition] = React.useState<{
    top: number
    left: number
  }>({
    top: 0,
    left: 0,
  })
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false) // Dark mode state

  const checkDarkMode = () => {
    const mode = document.documentElement.getAttribute('data-mode')
    setIsDarkMode(mode === 'dark')
  }

  useEffect(() => {
    checkDarkMode()
    const observer = new MutationObserver(() => {
      checkDarkMode()
    })
    observer.observe(document.documentElement, { attributes: true })
    return () => {
      observer.disconnect()
    }
  }, [])

  // Define layerProps with correct event types for SVG elements
  const layerProps = {
    onMouseEnter: (event: React.MouseEvent<SVGPathElement>) => {
      const target = event.currentTarget as SVGPathElement
      setHovered(target.getAttribute('name') || 'None')
    },
    onMouseLeave: () => {
      setHovered('None')
    },
    onMouseMove: (event: React.MouseEvent<SVGPathElement>) => {
      setTooltipPosition({
        top: event.clientY - 40,
        left: event.clientX - 480,
      })
    },
    onFocus: (event: React.FocusEvent<SVGPathElement>) => {
      const target = event.currentTarget as SVGPathElement
      setHovered(target.getAttribute('name') || 'None')
    },
    onBlur: () => setHovered('None'),
    onClick: (event: React.MouseEvent<SVGPathElement>) => {
      const target = event.currentTarget as SVGPathElement
      setHovered(target.getAttribute('name') || 'None')
    },
  }
  return (
    <div style={{ position: 'relative', display: 'flex', gap: '10px' }}>
      <svg
        style={{ width: '100%', height: '384px', transformOrigin: 'center' }}>
        <VectorMap
          {...World}
          layerProps={layerProps}
          style={{
            fill: isDarkMode ? '#1e293b' : '#f3f4f6',
            stroke: isDarkMode ? '#0f172a' : '#fff',
            height: '384px',
            width: '100%',
          }}
        />
        <circle
          cx="498.643"
          cy="205.864"
          r="7"
          fill="#374151"
          stroke="#FFF"
          strokeWidth="5"
          strokeOpacity="0.5"
          cursor="pointer"
        />
        <circle
          cx="235.877"
          cy="300.250"
          r="7"
          fill="blue"
          stroke="#FFF"
          strokeWidth="5"
          strokeOpacity="0.5"
          cursor="pointer"
        />
      </svg>

      {hovered !== 'None' && (
        <div
          style={{
            position: 'absolute',
            background: '#007aff',
            color: 'white',
            padding: '0.5rem',
            borderRadius: '4px',
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            whiteSpace: 'nowrap',
            zIndex: 1000,
            pointerEvents: 'none',
          }}>
          {hovered}
        </div>
      )}
    </div>
  )
}

export default MarkersVectorMap
