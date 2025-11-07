'use client'

import React from 'react'

import type { SmartPositionResult } from '@src/utils/collisionDetection'
import { POSITIONING_CONFIG } from '@src/utils/workflowPositioning'
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

interface PositionPreviewProps {
  positionResult: SmartPositionResult
  isVisible: boolean
  className?: string
}

/**
 * Visual preview component for smart positioning results
 * Shows ghost node preview with collision feedback
 */
const PositionPreview: React.FC<PositionPreviewProps> = ({
  positionResult,
  isVisible,
  className = '',
}) => {
  if (!isVisible) return null

  const { nodeSize } = POSITIONING_CONFIG
  const { collisionResult, score, hasCollision } = positionResult

  const getPreviewStyles = () => {
    if (!hasCollision) {
      return {
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        textColor: '#10b981',
      }
    }

    switch (collisionResult.severity) {
      case 'minor':
        return {
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          textColor: '#f59e0b',
        }
      case 'major':
        return {
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          textColor: '#ef4444',
        }
      case 'critical':
        return {
          borderColor: '#dc2626',
          backgroundColor: 'rgba(220, 38, 38, 0.15)',
          textColor: '#dc2626',
        }
      default:
        return {
          borderColor: '#6b7280',
          backgroundColor: 'rgba(107, 114, 128, 0.1)',
          textColor: '#6b7280',
        }
    }
  }

  const styles = getPreviewStyles()

  const getCollisionIcon = () => {
    if (!hasCollision) {
      return (
        <CheckCircle className="w-4 h-4" style={{ color: styles.textColor }} />
      )
    }

    if (collisionResult.severity === 'critical') {
      return <XCircle className="w-4 h-4" style={{ color: styles.textColor }} />
    }

    return (
      <AlertTriangle className="w-4 h-4" style={{ color: styles.textColor }} />
    )
  }

  return (
    <div
      className={`absolute pointer-events-none z-50 ${className}`}
      style={{
        left: positionResult.x,
        top: positionResult.y,
        width: nodeSize.width,
        height: nodeSize.height,
      }}>
      {/* Ghost node preview */}
      <div
        className="rounded-lg border-2 border-dashed transition-all duration-200"
        style={{
          width: '100%',
          height: '100%',
          borderColor: styles.borderColor,
          backgroundColor: styles.backgroundColor,
        }}>
        {/* Content area */}
        <div className="flex items-center justify-center h-full px-4">
          <div className="flex items-center space-x-2 text-sm font-medium">
            {getCollisionIcon()}
            <span style={{ color: styles.textColor }}>
              {!hasCollision ? 'Available' : collisionResult.severity}
            </span>
          </div>
        </div>

        {/* Position quality score indicator */}
        {score > 0 && (
          <div
            className="absolute -top-6 left-0 text-xs px-2 py-1 rounded"
            style={{
              backgroundColor: styles.textColor,
              color: 'white',
            }}>
            Score: {Math.round(score)}
          </div>
        )}

        {/* Alternative positions indicator */}
        {positionResult.alternatives &&
          positionResult.alternatives.length > 0 && (
            <div
              className="absolute -bottom-6 left-0 text-xs px-2 py-1 rounded"
              style={{
                backgroundColor: styles.textColor,
                color: 'white',
              }}>
              {positionResult.alternatives.length} alternatives
            </div>
          )}
      </div>

      {/* Collision highlight overlay for affected nodes */}
      {hasCollision &&
        collisionResult.collidingNodes.map((node) => (
          <div
            key={`collision-${node.id}`}
            className="absolute border border-red-300 bg-red-100 bg-opacity-30 rounded-lg pointer-events-none"
            style={{
              left: node.position.x - positionResult.x,
              top: node.position.y - positionResult.y,
              width: nodeSize.width,
              height: nodeSize.height,
              animation: 'pulse 2s infinite',
            }}
          />
        ))}
    </div>
  )
}

export default PositionPreview
