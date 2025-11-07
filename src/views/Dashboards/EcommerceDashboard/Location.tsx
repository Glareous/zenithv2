'use client'

import React, { useEffect, useState } from 'react'

import Link from 'next/link'

import { VectorMap } from '@south-paw/react-vector-maps'
import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
} from '@src/components/custom/dropdown/dropdown'
import WorldMap from '@src/data/world-Map.json'
import { NextPageWithLayout } from '@src/dtos'
import { Ellipsis } from 'lucide-react'

const MarkersMap: NextPageWithLayout = () => {
  const [hovered, setHovered] = React.useState<string>('None')
  const [tooltipPosition, setTooltipPosition] = React.useState<{
    top: number
    left: number
  }>({
    top: 0,
    left: 0,
  })
  const [zoom] = React.useState<number>(1)
  const [showMarkers, setShowMarkers] = useState<boolean>(false)
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

  const markers = [
    { name: 'Brazil', coords: [150.235, 155.9253] },
    { name: 'Russia', coords: [281.524, 80.3188] },
    { name: 'China', coords: [281.8617, 110.1954] },
  ]
  // Check screen size
  useEffect(() => {
    if (window != undefined) {
      const handleResize = () => {
        const screenWidth = window.innerWidth
        if (screenWidth >= 1440) {
          setShowMarkers(true)
        } else {
          setShowMarkers(false)
        }
      }
      handleResize() // Initial check
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize) // Cleanup
    }
  }, [])

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
        top: event.clientY - 0.0,
        left: event.clientX - 10,
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
    <div className="order-9 col-span-12 xl:col-span-6 2xl:col-span-4 card">
      <div className="flex items-center gap-3 card-header">
        <h6 className="card-title grow"> Top Location</h6>
        <Dropdown trigger="click" dropdownClassName="dropdown">
          <DropdownButton colorClass="flex items-center text-gray-500 dark:text-dark-500">
            <Ellipsis className="size-5" />
          </DropdownButton>
          <DropdownMenu>
            <Link href="#!" className="dropdown-item ">
              <span>Weekly</span>
            </Link>
            <Link href="#!" className="dropdown-item ">
              <span>Monthly</span>
            </Link>
            <Link href="#!" className="dropdown-item">
              <span>Yearly</span>
            </Link>
          </DropdownMenu>
        </Dropdown>
      </div>
      <div className="card-body">
        <div className="h-52">
          <svg
            style={{
              width: '100%',
              height: '215px',
              transformOrigin: 'center',
            }}>
            <VectorMap
              {...WorldMap}
              layerProps={layerProps}
              style={{
                fill: isDarkMode ? '#1e293b' : '#f3f4f6',
                stroke: isDarkMode ? '#0f172a' : '#fff',
                transform: `scale(${zoom})`,
                transformOrigin: 'center',
                height: '215px',
                width: '100%',
              }}
            />
            {showMarkers &&
              markers.map((marker, index) => (
                <circle
                  key={index}
                  cx={marker.coords[0]}
                  cy={marker.coords[1]}
                  r="7"
                  fill="#374151"
                  stroke="#FFF"
                  strokeWidth="5"
                  strokeOpacity="0.5"
                  cursor="pointer"
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
      </div>
    </div>
  )
}

export default MarkersMap
