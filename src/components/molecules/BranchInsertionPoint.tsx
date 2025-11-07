'use client'

import React, { useState } from 'react'

import { GitBranch, Plus } from 'lucide-react'

export interface BranchInsertionPointProps {
  id: string
  sourceNodeId: string
  targetNodeId: string
  position: { x: number; y: number }
  onInsertBranch: () => void
}

const BranchInsertionPoint: React.FC<BranchInsertionPointProps> = ({
  id,
  sourceNodeId,
  targetNodeId,
  position,
  onInsertBranch,
}) => {
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onInsertBranch()
  }

  return (
    <div
      className="absolute z-30 pointer-events-auto hidden"
      style={{
        left: position.x - 16, // Center the 32px button
        top: position.y - 16,
        transform: 'translate(0, 0)', // Prevent React Flow from interfering
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      {/* Branch Insertion Point Button */}
      <button
        onClick={handleClick}
        className={`
          flex items-center justify-center w-8 h-8 
          bg-white border-2 border-dashed border-purple-400 
          rounded-full shadow-lg hover:border-purple-600 hover:bg-purple-50
          hover:shadow-xl transition-all duration-200 
          cursor-pointer group z-20
          ${isHovered ? 'scale-110' : 'scale-100'}
        `}
        title={`Insert branch between steps`}>
        <div className="relative">
          {/* Plus icon with branch indicator */}
          <Plus
            className={`w-3 h-3 transition-colors duration-200 ${
              isHovered ? 'text-purple-700' : 'text-purple-500'
            }`}
          />
          <GitBranch
            className={`absolute -bottom-1 -right-1 w-2 h-2 transition-colors duration-200 ${
              isHovered ? 'text-purple-700' : 'text-purple-500'
            }`}
          />
        </div>
      </button>

      {/* Connection indicator lines */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-200 ${
          isHovered ? 'opacity-40' : 'opacity-0'
        }`}>
        {/* Line to source */}
        <div
          className="absolute w-px bg-purple-400"
          style={{
            left: '50%',
            top: '50%',
            height: '30px',
            transform: 'translate(-50%, -100%)',
          }}
        />
        {/* Line to target */}
        <div
          className="absolute w-px bg-purple-400"
          style={{
            left: '50%',
            top: '50%',
            height: '30px',
            transform: 'translate(-50%, 0%)',
          }}
        />
        {/* Branch indicator arrows */}
        <div
          className="absolute flex space-x-1"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(30%, 20%)',
          }}>
          <div className="w-3 h-px bg-purple-400 transform rotate-45"></div>
          <div className="w-3 h-px bg-purple-400 transform -rotate-45"></div>
        </div>
      </div>
    </div>
  )
}

export default BranchInsertionPoint
