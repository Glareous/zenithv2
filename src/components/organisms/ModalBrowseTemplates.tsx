'use client'

import React, { useState } from 'react'

import { CornerDownRight } from 'lucide-react'

import { Modal } from '@/components/custom/modal/modal'

interface Template {
  id: string
  name: string
  type: 'YES_NO_QUESTION' | 'SINGLE_CHOICE' | 'OPEN_QUESTION'
  prompt: string
  examples: string[]
  description?: string
}

interface ModalBrowseTemplatesProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (template: Template) => void
}

const ModalBrowseTemplates: React.FC<ModalBrowseTemplatesProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  )

  const templates: Template[] = [
    {
      id: 'user_name',
      name: 'user_name',
      type: 'OPEN_QUESTION',
      prompt: "What is the user's name?",
      examples: ['John Doe'],
    },
    {
      id: 'user_email',
      name: 'user_email',
      type: 'OPEN_QUESTION',
      prompt: "What is the user's email?",
      examples: ['john.doe@example.com'],
    },
    {
      id: 'user_company',
      name: 'user_company',
      type: 'OPEN_QUESTION',
      prompt: "What is the user's company?",
      examples: ['acme'],
    },
    {
      id: 'user_address',
      name: 'user_address',
      type: 'OPEN_QUESTION',
      prompt: "What is the user's address?",
      examples: [
        '123 Main Street, Springfield, IL 62701, USA',
        '456 Maple Avenue, Los Angeles, CA 90038, USA',
        '789 Oak Road, Chicago, IL 60601, USA',
      ],
    },
    {
      id: 'dnd',
      name: 'dnd',
      type: 'YES_NO_QUESTION',
      prompt:
        'Did the user request to not be called or contacted any more or says do not call, or put me on the do not call list?',
      examples: [],
    },
    {
      id: 'call_outcome',
      name: 'call_outcome',
      type: 'SINGLE_CHOICE',
      prompt: 'Identify what is the outcome of the call',
      examples: [
        'Booked appointment - if the user booked an appointment',
        'Live Transfer - if the user says he wants to be transferred',
        'Not Qualified - if the user does not qualify and the call ends with no other outcome',
        'Follow-up - if there is not enough information in the conversation to make a decision or any other outcome',
        'Not Interested - if the prospect say they are not interested',
      ],
    },
    {
      id: 'call_transformed_to',
      name: 'call_transformed_to',
      type: 'OPEN_QUESTION',
      prompt: 'To whom the user requested the call to be transferred to?',
      examples: ['John Doe'],
    },
    {
      id: 'reason_for_call',
      name: 'reason_for_call',
      type: 'OPEN_QUESTION',
      prompt: "What is the reason for the user's call?",
      examples: ['Reason 1', 'Reason 2'],
    },
    {
      id: 'issue_description',
      name: 'issue_description',
      type: 'OPEN_QUESTION',
      prompt: 'Describe briefly the issue the user is facing',
      examples: ['Description 1'],
    },
    {
      id: 'user_interest_level',
      name: 'user_interest_level',
      type: 'SINGLE_CHOICE',
      prompt: "What is the user's interest level?",
      examples: [
        'Very interested',

        'Interested',

        'Neutral',

        'Not interested at all',
      ],
    },
    {
      id: 'callback_requested',
      name: 'callback_requested',
      type: 'YES_NO_QUESTION',
      prompt: 'Did the user request a callback?',
      examples: [],
    },
    {
      id: 'objection_handling',
      name: 'objection_handling',
      type: 'OPEN_QUESTION',
      prompt: 'What was the main objection handled?',
      examples: ['Objection 1'],
    },
    {
      id: 'budget_range',
      name: 'budget_range',
      type: 'OPEN_QUESTION',
      prompt: "What is the user's budget range?",
      examples: ['More than 1000$'],
    },
    {
      id: 'lead_qualification',
      name: 'lead_qualification',
      type: 'SINGLE_CHOICE',
      prompt:
        'Based on their interest and responses during the call, is the lead qualified?',
      examples: ['Yes', 'No', 'Maybe'],
    },
    {
      id: 'reason_not_booked',
      name: 'reason_not_booked',
      type: 'OPEN_QUESTION',
      prompt:
        'If the user did not book an appointment, give clear reasons as to why the user did not book an appointment. Citing any objections the user had.',
      examples: [
        'The user did not book an appointment because they were not interested and stated they were not interested 3 times before ending the call. "Yeah man, I told you we just aren\'t interested. Have a good day." because they were busy and could not talk on the phone right now. "I\'m sorry, but I am busy. You\'ll have to call me back some other time."',
      ],
    },
  ]

  React.useEffect(() => {
    if (isOpen && templates.length > 0) {
      setSelectedTemplate(templates[0])
    }
  }, [isOpen])

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template)
  }

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate)
      onClose()
    }
  }

  const content = (
    <div className="flex h-[400px]">
      {/* Left Column - Templates List */}
      <div className="w-1/3 border-r border-gray-200">
        <h3 className="text-gray-700 text-sm font-medium mb-4">Templates</h3>
        <div className="space-y-2 overflow-y-auto max-h-[385px] pb-2 pr-2">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleTemplateSelect(template)}
              className={`w-full p-3 text-left rounded-lg border transition-colors duration-200 ${
                selectedTemplate?.id === template.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}>
              <div className="text-sm font-mono text-gray-700">
                {template.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Column - Template Preview */}
      <div className="flex-1 pl-6">
        {selectedTemplate ? (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {selectedTemplate.name}
            </h3>

            {selectedTemplate.prompt && (
              <div className="mb-6">
                <h4 className="text-sm text-gray-600 mb-2">Prompt</h4>
                <p className="text-gray-800">{selectedTemplate.prompt}</p>
              </div>
            )}

            {selectedTemplate.examples &&
              selectedTemplate.examples.length > 0 && (
                <div>
                  <h4 className="text-sm text-gray-600 mb-2">
                    {selectedTemplate.type === 'SINGLE_CHOICE'
                      ? 'Choices'
                      : 'Output Examples'}
                  </h4>
                  <div className="space-y-4">
                    {selectedTemplate.examples.map((example, index) => (
                      <div
                        key={index}
                        className="flex gap-3 items-center text-gray-700">
                        <div>
                          <CornerDownRight className="w-4 h-4 text-gray-400" />
                        </div>
                        <span>{example}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {!selectedTemplate.prompt &&
              selectedTemplate.examples.length === 0 && (
                <p className="text-gray-500 italic">
                  This template will be configured soon.
                </p>
              )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Select a template to preview</p>
          </div>
        )}
      </div>
    </div>
  )

  const footer = (onClose: () => void) => (
    <div className=" space-x-3">
      <button
        onClick={onClose}
        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
        Cancel
      </button>
      <button
        onClick={handleUseTemplate}
        disabled={!selectedTemplate}
        className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
        Use this Template
      </button>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Extractor Templates"
      size="modal-xl"
      position="modal-center"
      content={content}
      footerClass="flex justify-end"
      footer={footer}
    />
  )
}

export default ModalBrowseTemplates
