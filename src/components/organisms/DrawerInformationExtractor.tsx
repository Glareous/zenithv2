'use client'

import React, { useState } from 'react'

import { AlignLeft, CheckCircle, LayoutGrid, ToggleLeft } from 'lucide-react'

import { Drawer } from '@/components/custom/drawer/drawer'

import DrawerOpenQuestion from './DrawerOpenQuestion'
import DrawerSingleChoice from './DrawerSingleChoice'
import DrawerYesNoQuestion from './DrawerYesNoQuestion'
import ModalBrowseTemplates from './ModalBrowseTemplates'

interface DrawerInformationExtractorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (
    type:
      | 'YES_NO_QUESTION'
      | 'SINGLE_CHOICE'
      | 'OPEN_QUESTION'
      | 'BROWSE_TEMPLATES'
  ) => void
  onSave?: (actionData: any, actionType: string) => Promise<void>
}

const DrawerInformationExtractor: React.FC<DrawerInformationExtractorProps> = ({
  isOpen,
  onClose,
  onSelect,
  onSave,
}) => {
  const [isYesNoQuestionOpen, setIsYesNoQuestionOpen] = useState(false)
  const [isSingleChoiceOpen, setIsSingleChoiceOpen] = useState(false)
  const [isOpenQuestionOpen, setIsOpenQuestionOpen] = useState(false)
  const [isBrowseTemplatesOpen, setIsBrowseTemplatesOpen] = useState(false)
  const [selectedTemplateData, setSelectedTemplateData] = useState<any>(null)
  const handleOptionSelect = (
    type:
      | 'YES_NO_QUESTION'
      | 'SINGLE_CHOICE'
      | 'OPEN_QUESTION'
      | 'BROWSE_TEMPLATES'
  ) => {
    if (type === 'YES_NO_QUESTION') {
      setIsYesNoQuestionOpen(true)
      onClose()
    } else if (type === 'SINGLE_CHOICE') {
      setIsSingleChoiceOpen(true)
      onClose()
    } else if (type === 'OPEN_QUESTION') {
      setIsOpenQuestionOpen(true)
      onClose()
    } else if (type === 'BROWSE_TEMPLATES') {
      setIsBrowseTemplatesOpen(true)
      onClose()
    } else {
      onSelect(type)
      onClose()
    }
  }

  const handleYesNoQuestionSave = async (data: any) => {
    if (onSave) {
      await onSave(data, 'YES_NO_QUESTION')
    } else {
      console.log('Yes/No Question data:', data)
    }
  }

  const handleSingleChoiceSave = async (data: any) => {
    if (onSave) {
      await onSave(data, 'SINGLE_CHOICE')
    } else {
      console.log('Single Choice data:', data)
    }
  }

  const handleOpenQuestionSave = async (data: any) => {
    if (onSave) {
      await onSave(data, 'OPEN_QUESTION')
    } else {
      console.log('Open Question data:', data)
    }
  }

  const handleTemplateSelect = (template: any) => {
    console.log('Selected template:', template)

    setSelectedTemplateData({
      identifier: template.name,
      prompt: template.prompt,
      examples: template.examples,
      choices: template.examples,
    })

    setIsBrowseTemplatesOpen(false)

    if (template.type === 'YES_NO_QUESTION') {
      setIsYesNoQuestionOpen(true)
    } else if (template.type === 'SINGLE_CHOICE') {
      setIsSingleChoiceOpen(true)
    } else if (template.type === 'OPEN_QUESTION') {
      setIsOpenQuestionOpen(true)
    }
  }

  const options = [
    {
      id: 'YES_NO_QUESTION' as const,
      icon: <ToggleLeft className="w-4 h-4 text-gray-600" />,
      title: 'Yes/No Question',
      description: 'A Boolean question that returns true or false.',
    },
    {
      id: 'SINGLE_CHOICE' as const,
      icon: <CheckCircle className="w-4 h-4 text-gray-600" />,
      title: 'Single Choice',
      description: 'Restrict the AI to choose from predefines options.',
    },
    {
      id: 'OPEN_QUESTION' as const,
      icon: <AlignLeft className="w-4 h-4 text-gray-600" />,
      title: 'Open Question',
      description: 'Let the AI find the answer using examples.',
    },
    {
      id: 'BROWSE_TEMPLATES' as const,
      icon: <LayoutGrid className="w-4 h-4 text-purple-500" />,
      title: 'Browse Templates',
      description: 'Get inspired by our templates to get started.',
    },
  ]

  const content = (
    <div>
      <h3 className="text-gray-700 text-sm font-medium mb-6">Select type</h3>
      <div className="space-y-3">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleOptionSelect(option.id)}
            className="w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-left items-start gap-4 group">
            <div className="flex-shrink-0 mb-2">{option.icon}</div>
            <div className="flex-1">
              <h4 className=" text-sm font-normal">{option.title}</h4>
              <p className="text-gray-500 text-xs ">{option.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <>
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        title="Information Extractor"
        position="right"
        size="large"
        content={content}
      />

      <DrawerYesNoQuestion
        isOpen={isYesNoQuestionOpen}
        onClose={() => {
          setIsYesNoQuestionOpen(false)
          setSelectedTemplateData(null)
        }}
        onSave={handleYesNoQuestionSave}
        initialData={selectedTemplateData}
      />

      <DrawerSingleChoice
        isOpen={isSingleChoiceOpen}
        onClose={() => {
          setIsSingleChoiceOpen(false)
          setSelectedTemplateData(null)
        }}
        onSave={handleSingleChoiceSave}
        initialData={selectedTemplateData}
      />

      <DrawerOpenQuestion
        isOpen={isOpenQuestionOpen}
        onClose={() => {
          setIsOpenQuestionOpen(false)
          setSelectedTemplateData(null)
        }}
        onSave={handleOpenQuestionSave}
        initialData={selectedTemplateData}
      />

      <ModalBrowseTemplates
        isOpen={isBrowseTemplatesOpen}
        onClose={() => setIsBrowseTemplatesOpen(false)}
        onSelectTemplate={handleTemplateSelect}
      />
    </>
  )
}

export default DrawerInformationExtractor
