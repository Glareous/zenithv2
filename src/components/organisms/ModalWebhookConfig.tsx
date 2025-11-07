import React, { useRef, useState } from 'react'

import { Plus, X } from 'lucide-react'
import { toast } from 'react-toastify'

import { type RichTextEditorRef } from '@/components/molecules/RichTextEditor'

interface WebhookVariable {
  id: string
  key: string
  type: 'STRING' | 'NUMBER' | 'BOOLEAN'
  value: string
}

interface ModalWebhookConfigProps {
  isOpen: boolean
  onClose: () => void
  agentId: string
  initialConfig?: {
    requestBody: string
    variables: WebhookVariable[]
  } | null
  onSave?: (config: {
    requestBody: string
    variables: WebhookVariable[]
  }) => void
  isLoading?: boolean
}

const ModalWebhookConfig: React.FC<ModalWebhookConfigProps> = ({
  isOpen,
  onClose,
  agentId,
  initialConfig,
  onSave,
  isLoading = false,
}) => {
  const editorRef = useRef<RichTextEditorRef | null>(null)
  const [requestBody, setRequestBody] = useState('')
  const [variables, setVariables] = useState<WebhookVariable[]>([])

  React.useEffect(() => {
    if (isOpen && initialConfig) {
      setRequestBody(initialConfig.requestBody || '')
      setVariables(initialConfig.variables || [])
    } else if (isOpen && !initialConfig) {
      setRequestBody('')
      setVariables([])
    }
  }, [isOpen, initialConfig])

  if (!isOpen) return null

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(`/api/apps/agents/default/${agentId}`)
    toast.success('URL copied to clipboard')
  }

  const generateVariableId = () => {
    return `var-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  const addVariable = () => {
    setVariables([
      ...variables,
      {
        id: generateVariableId(),
        key: '',
        type: 'STRING',
        value: '',
      },
    ])
  }

  const removeVariable = (id: string) => {
    setVariables(variables.filter((v) => v.id !== id))

    editorRef.current?.removeMentionsById(id)
  }

  const updateVariable = (
    id: string,
    field: keyof WebhookVariable,
    value: string
  ) => {
    setVariables(
      variables.map((v) => {
        if (v.id === id) {
          if (field === 'key' && v.key !== value) {
            editorRef.current?.updateMentionById(id, value)
          }
          return { ...v, [field]: value }
        }
        return v
      })
    )
  }

  const handleSave = () => {
    if (!onSave) {
      toast.info('Save functionality not implemented yet')
      return
    }

    const hasEmptyKeys = variables.some((v) => !v.key.trim())
    if (hasEmptyKeys) {
      toast.error('All variables must have a key')
      return
    }

    onSave({
      requestBody,
      variables,
    })
  }

  const handleRequestBodyUpdate = (newValue: string) => {
    setRequestBody(newValue)
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-overlay backdrop-blur-sm"
      onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Webhook Configuration</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Webhook URL Section */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center">
              <p className="text-sm text-gray-500 mr-1">
                Webhook URL endpoint - Test it in our
              </p>
              <a
                href="/docs"
                className="text-sm text-primary-500 hover:text-primary-600 underline">
                API docs
              </a>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-4">
              <div className="flex items-center justify-between">
                <code className="text-sm font-mono text-gray-700 dark:text-gray-300">
                  /api/apps/agents/default/{agentId}
                </code>
                <button
                  onClick={handleCopyUrl}
                  className="btn btn-sm btn-gray ml-2">
                  Copy
                </button>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>

          {/* Variables Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h6 className="font-semibold">Variables</h6>
              <button
                onClick={addVariable}
                className="btn btn-sm btn-outline-primary flex items-center gap-2">
                <Plus className="size-4" />
                Add Variable
              </button>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              Define variables that can be referenced in your webhook body.
            </p>

            <div className="space-y-3">
              {variables.map((variable) => (
                <div key={variable.id} className="flex items-center gap-2">
                  <div className="grid grid-cols-3 gap-3 flex-1">
                    {/* Key */}
                    <div className="flex flex-col gap-1">
                      <input
                        type="text"
                        value={variable.key}
                        onChange={(e) =>
                          updateVariable(variable.id, 'key', e.target.value)
                        }
                        className="form-input"
                        placeholder="Variable key"
                      />
                    </div>

                    {/* Type */}
                    <div className="flex flex-col gap-1">
                      <select
                        value={variable.type}
                        onChange={(e) =>
                          updateVariable(
                            variable.id,
                            'type',
                            e.target.value as 'STRING' | 'NUMBER' | 'BOOLEAN'
                          )
                        }
                        className="form-input">
                        <option value="STRING">STRING</option>
                        <option value="NUMBER">NUMBER</option>
                        <option value="BOOLEAN">BOOLEAN</option>
                      </select>
                    </div>

                    {/* Value */}
                    <div className="flex flex-col gap-1">
                      <input
                        type="text"
                        value={variable.value}
                        onChange={(e) =>
                          updateVariable(variable.id, 'value', e.target.value)
                        }
                        className="form-input"
                        placeholder="Variable value"
                      />
                    </div>
                  </div>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => removeVariable(variable.id)}
                    className="btn btn-sm btn-outline-danger"
                    disabled={isLoading}>
                    <X className="size-4" />
                  </button>
                </div>
              ))}

              {variables.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                  No variables added yet. Click "Add Variable" to create one.
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 pt-6">
            <button
              onClick={onClose}
              className="btn btn-gray"
              disabled={isLoading}>
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn btn-primary"
              disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModalWebhookConfig
