import React, { ReactNode, useEffect, useRef, useState } from 'react'

import { ChevronDown, ChevronUp } from 'lucide-react'

// Define the interface for props
interface AccordionProps {
  title: string
  isOpen: boolean
  onToggle: () => void
  children: ReactNode
  headerColor?: string
  isButtonAccordion?: boolean
  accordionClass?: string
  arrowColor?: string
  titleClass?: string
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
}

const Accordion: React.FC<AccordionProps> = ({
  title,
  isOpen,
  onToggle,
  children,
  headerColor,
  isButtonAccordion,
  accordionClass,
  arrowColor,
  titleClass,
  icon,
  iconPosition = 'left',
}) => {
  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<string>('0px')

  useEffect(() => {
    setHeight(isOpen ? `${contentRef.current?.scrollHeight}px` : '0px')
  }, [isOpen])

  // Recalculate height when content changes
  useEffect(() => {
    if (isOpen && contentRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        setHeight(`${contentRef.current?.scrollHeight}px`)
      })

      resizeObserver.observe(contentRef.current)

      return () => {
        resizeObserver.disconnect()
      }
    }
  }, [isOpen, children])

  return (
    <>
      {isButtonAccordion ? (
        <button
          type="button"
          className={`w-full text-left gap-1 flex items-center font-semibold justify-between transition-colors duration-200 ${headerColor} ${isOpen ? 'active' : ''}`}
          onClick={onToggle}
          style={{ background: 'none', border: 'none', boxShadow: 'none' }}>
          <div className="flex items-center gap-2">
            {' '}
            {icon && iconPosition === 'left' && icon}
            {titleClass ? (
              <div className={titleClass}>{title}</div>
            ) : (
              <span className="ltr:ml-1 rtl:mr-1">{title}</span>
            )}
            {icon && iconPosition === 'right' && icon}
          </div>
          {isOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      ) : (
        <div className={`${accordionClass}`}>
          <button
            className={`w-full text-left gap-1 p-3 flex items-center font-semibold justify-between transition-colors duration-200 ${headerColor} ${isOpen ? 'active' : ''}`}
            onClick={onToggle}
            style={{ background: 'none', border: 'none', boxShadow: 'none' }}>
            <div className="flex items-center gap-2">
              {' '}
              {icon && iconPosition === 'left' && icon}{' '}
              {titleClass ? (
                <div className={titleClass}>{title}</div>
              ) : (
                <span className="ltr:ml-1 rtl:mr-1">{title}</span>
              )}
              {icon && iconPosition === 'right' && icon}{' '}
            </div>
            {isOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      )}
      <div
        className="relative overflow-hidden transition-all duration-500 accordion-main-content"
        ref={contentRef}
        style={{ maxHeight: height }}>
        {children}
      </div>
    </>
  )
}

export default Accordion
