'use client'

import React, { useEffect, useState } from 'react'

import { VectorMap } from '@south-paw/react-vector-maps'
import World from '@src/data/world-Map.json'

// Adjust the import to your actual map file

const ImageMarkerMap: React.FC = () => {
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
        top: event.clientY - 200,
        left: event.clientX - 900,
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

  // Image markers with their coordinates
  const imageMarkers = [
    {
      name: 'Egypt',
      coords: { cx: '550', cy: '300' }, // Coordinates for Egypt (adjust as necessary)
      image: '/assets/images/others/pin.png', // Marker image for Egypt
    },
    {
      name: 'United States',
      coords: { cx: '200', cy: '200' }, // Coordinates for the US
      image: '/assets/images/others/pin.png', // Marker image for US
    },
    {
      name: 'United Kingdom',
      coords: { cx: '400', cy: '150' }, // Coordinates for the UK
      image: '/assets/images/others/pin.png', // Marker image for UK
    },
  ]

  return (
    <div style={{ position: 'relative', display: 'flex', gap: '10px' }}>
      {/* Apply zoom with transform */}
      <svg
        style={{ width: '100%', height: '384px', transformOrigin: 'center' }}>
        <VectorMap
          {...World}
          layerProps={layerProps}
          style={{
            fill: isDarkMode ? '#1e293b' : '#f3f4f6',
            stroke: isDarkMode ? '#0f172a' : '#fff',
          }}
        />

        {/* Loop through markers and display an image for each */}
        {imageMarkers.map((marker, index) => (
          <image
            key={index}
            xlinkHref={marker.image} // The marker image
            x={marker.coords.cx} // X-coordinate for the marker
            y={marker.coords.cy} // Y-coordinate for the marker
            width="20" // Width of the marker image
            height="20" // Height of the marker image
            style={{ pointerEvents: 'none' }} // Prevent image from intercepting events
          />
        ))}
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

export default ImageMarkerMap
