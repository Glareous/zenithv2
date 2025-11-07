'use client'

import React, { useState } from 'react'

import Accordion from '@src/components/custom/accordion/accordion'

const CollapseAccordion = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }
  return (
    <React.Fragment>
      <Accordion
        title="Buttons Collapse"
        isOpen={openIndex === 6}
        onToggle={() => handleToggle(6)}
        headerColor="bg-primary-500 text-white"
        isButtonAccordion={true}>
        <div className="pt-3">
          <p>
            Tailwind CSS is an open-source project, available for free usage and
            utility-first CSS framework that provides responsiveness.
          </p>
        </div>
      </Accordion>
    </React.Fragment>
  )
}
export default CollapseAccordion
