'use client'

import React, { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { RootState } from '@src/slices/reducer'
import {
  Bot,
  CheckCircle,
  Clock,
  ClockFading,
  FileSearch2,
  Phone,
  Plus,
  X,
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'

import WhatsAppIcon from '@/components/common/icons/WhatsAppIcon'
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownMenu,
} from '@/components/custom/dropdown/dropdown'
import DrawerCustomEvaluation from '@/components/organisms/DrawerCustomEvaluation'
import DrawerInformationExtractor from '@/components/organisms/DrawerInformationExtractor'
import DrawerOpenQuestion from '@/components/organisms/DrawerOpenQuestion'
import DrawerSingleChoice from '@/components/organisms/DrawerSingleChoice'
import DrawerYesNoQuestion from '@/components/organisms/DrawerYesNoQuestion'
import ModalCronJob from '@/components/organisms/ModalCronJob'
import ModalMcpProtocol from '@/components/organisms/ModalMcpProtocol'
import ModalSelectActions from '@/components/organisms/ModalSelectActions'
import ModalSelectPhoneNumber from '@/components/organisms/ModalSelectPhoneNumber'
import ModalWebhookConfig from '@/components/organisms/ModalWebhookConfig'
import type { AfterCallActions } from '@/server/api/routers/projectAgentActions'
import { api } from '@/trpc/react'

interface ActionPageProps {
  params: Promise<{ id: string }>
}

const ActionPage: React.FC<ActionPageProps> = ({ params }) => {
  const { id } = React.use(params)
  const router = useRouter()

  const { currentProject } = useSelector((state: RootState) => state.Project)
  const [isNavigating, setIsNavigating] = useState(false)

  const {
    data: currentProjectAgents = [],
    isLoading: isCurrentProjectAgentsLoading,
  } = api.projectAgent.getByProject.useQuery(
    { projectId: currentProject?.id || '' },
    { enabled: !!currentProject?.id }
  )

  const {
    data: agent,
    isLoading: isAgentLoading,
    error: agentError,
  } = api.projectAgent.getById.useQuery({ id: id }, { enabled: !!id })

  const {
    data: agentActions,
    isLoading,
    refetch,
  } = api.projectAgentActions.getByAgentId.useQuery(
    { agentId: id },
    { enabled: !!id && !!agent && agent.project.id === currentProject?.id }
  )

  const {
    data: allTriggers = [],
    isLoading: isTriggersLoading,
    refetch: refetchTriggers,
  } = api.projectAgentTrigger.getByAgentId.useQuery(
    { agentId: id },
    { enabled: !!id && !!agent && agent.project.id === currentProject?.id }
  )

  const triggers = allTriggers.filter((trigger) => trigger.isActive)

  const { data: availablePhoneNumbers = [], isLoading: isPhoneNumbersLoading } =
    api.projectPhoneNumber.getByProject.useQuery(
      { projectId: currentProject?.id || '' },
      { enabled: !!currentProject?.id }
    )

  useEffect(() => {
    if (
      !currentProject ||
      !agent ||
      isNavigating ||
      isCurrentProjectAgentsLoading
    )
      return

    if (agent.project.id !== currentProject.id) {
      if (currentProjectAgents.length === 0) {
        return
      }

      setIsNavigating(true)

      const targetAgent = currentProjectAgents.find(
        (a) => a.type === agent.type
      )

      if (targetAgent) {
        router.push(`/apps/agents/default/${targetAgent.id}/action`)
      } else {
        if (currentProjectAgents.length > 0) {
          router.push(
            `/apps/agents/default/${currentProjectAgents[0].id}/action`
          )
        } else {
          router.push('/apps/agents/default')
        }
      }
    }
  }, [
    currentProject,
    agent,
    currentProjectAgents,
    id,
    router,
    isNavigating,
    isCurrentProjectAgentsLoading,
  ])

  const updateAfterCallActionsMutation =
    api.projectAgentActions.updateAfterCallActions.useMutation({
      onSuccess: () => {
        refetch()
      },
      onError: (error) => {
        toast.error(`Error saving action: ${error.message}`)
      },
    })

  const upsertTriggerMutation = api.projectAgentTrigger.upsert.useMutation({
    onSuccess: () => {
      refetchTriggers()
      setIsPhoneNumberModalOpen(false)
      setSelectedTriggerType(null)
      toast.success('Trigger saved successfully!')
    },
    onError: (error) => {
      toast.error(`Error saving trigger: ${error.message}`)
    },
  })

  const deleteTriggerMutation = api.projectAgentTrigger.delete.useMutation({
    onSuccess: () => {
      refetchTriggers()
      toast.success('Trigger deleted successfully!')
    },
    onError: (error) => {
      toast.error(`Error deleting trigger: ${error.message}`)
    },
  })

  const [activeTab, setActiveTab] = useState('after-call')
  const [isCustomEvaluationModalOpen, setIsCustomEvaluationModalOpen] =
    useState(false)
  const [isInformationExtractorModalOpen, setIsInformationExtractorModalOpen] =
    useState(false)
  const [
    isInformationExtractorDrawerOpen,
    setIsInformationExtractorDrawerOpen,
  ] = useState(false)
  const [isCustomEvaluationDrawerOpen, setIsCustomEvaluationDrawerOpen] =
    useState(false)
  const [isYesNoQuestionDrawerOpen, setIsYesNoQuestionDrawerOpen] =
    useState(false)
  const [isSingleChoiceDrawerOpen, setIsSingleChoiceDrawerOpen] =
    useState(false)
  const [isOpenQuestionDrawerOpen, setIsOpenQuestionDrawerOpen] =
    useState(false)
  const [editingActionData, setEditingActionData] = useState<any>(null)

  const [isPhoneNumberModalOpen, setIsPhoneNumberModalOpen] = useState(false)
  const [isWebhookConfigModalOpen, setIsWebhookConfigModalOpen] =
    useState(false)
  const [isCronJobModalOpen, setIsCronJobModalOpen] = useState(false)
  const [isMcpProtocolModalOpen, setIsMcpProtocolModalOpen] = useState(false)
  const [selectedTriggerType, setSelectedTriggerType] = useState<
    | 'WHATSAPP_MESSAGE'
    | 'WHATSAPP_CALL'
    | 'PHONE_CALL'
    | 'WEBHOOK'
    | 'CRON_JOB'
    | 'MCP_PROTOCOL'
    | null
  >(null)

  const handleAddAction = (
    actionType: 'information-extractor' | 'custom-evaluation'
  ) => {
    if (actionType === 'custom-evaluation') {
      setIsCustomEvaluationModalOpen(true)
    } else if (actionType === 'information-extractor') {
      setIsInformationExtractorModalOpen(true)
    } else {
    }
  }

  const handleAddTrigger = (
    type:
      | 'WHATSAPP_MESSAGE'
      | 'WHATSAPP_CALL'
      | 'PHONE_CALL'
      | 'WEBHOOK'
      | 'CRON_JOB'
      | 'MCP_PROTOCOL'
  ) => {
    setSelectedTriggerType(type)

    if (
      type === 'WHATSAPP_MESSAGE' ||
      type === 'WHATSAPP_CALL' ||
      type === 'PHONE_CALL'
    ) {
      setIsPhoneNumberModalOpen(true)
    } else if (type === 'WEBHOOK') {
      setIsWebhookConfigModalOpen(true)
    } else if (type === 'CRON_JOB') {
      setIsCronJobModalOpen(true)
    } else if (type === 'MCP_PROTOCOL') {
      setIsMcpProtocolModalOpen(true)
    }
  }

  const handleSaveTrigger = (phoneNumberId: string) => {
    if (!selectedTriggerType) return

    const projectPhoneNumber = availablePhoneNumbers.find(
      (assignment) => assignment.phoneNumber.id === phoneNumberId
    )

    if (!projectPhoneNumber) {
      toast.error('Phone number not found in project')
      return
    }

    upsertTriggerMutation.mutate({
      agentId: id,
      type: selectedTriggerType,
      projectPhoneNumberId: projectPhoneNumber.id,
    })
  }

  const handleSaveCronJob = (cronExpression: string, timezone: string) => {
    upsertTriggerMutation.mutate(
      {
        agentId: id,
        type: 'CRON_JOB',
        cronExpression,
        cronTimezone: timezone,
      },
      {
        onSuccess: () => {
          setIsCronJobModalOpen(false)
          setSelectedTriggerType(null)
        },
      }
    )
  }

  const upsertWebhookActionMutation =
    api.projectAction.upsertWebhookAction.useMutation({
      onError: (error) => {
        toast.error(`Error saving webhook action: ${error.message}`)
      },
    })

  const handleSaveWebhook = (config: {
    requestBody: string
    variables: Array<{
      id: string
      key: string
      type: 'STRING' | 'NUMBER' | 'BOOLEAN'
      value: string
    }>
  }) => {
    upsertTriggerMutation.mutate(
      {
        agentId: id,
        type: 'WEBHOOK',
        webhookConfig: config,
      },
      {
        onSuccess: () => {
          if (currentProject?.id) {
            upsertWebhookActionMutation.mutate(
              {
                agentId: id,
                projectId: currentProject.id,
                variables: config.variables,
              },
              {
                onSuccess: () => {
                  setIsWebhookConfigModalOpen(false)
                  setSelectedTriggerType(null)
                  toast.success(
                    'Webhook saved! Variables are now available in workflow steps.'
                  )
                },
              }
            )
          } else {
            setIsWebhookConfigModalOpen(false)
            setSelectedTriggerType(null)
          }
        },
      }
    )
  }

  const handleDeleteTrigger = (
    type:
      | 'WHATSAPP_MESSAGE'
      | 'WHATSAPP_CALL'
      | 'PHONE_CALL'
      | 'WEBHOOK'
      | 'CRON_JOB'
      | 'MCP_PROTOCOL'
  ) => {
    deleteTriggerMutation.mutate({
      agentId: id,
      type,
    })
  }

  const handleInformationExtractorTypeSelect = (
    type:
      | 'YES_NO_QUESTION'
      | 'SINGLE_CHOICE'
      | 'OPEN_QUESTION'
      | 'BROWSE_TEMPLATES'
  ) => {}

  const handleInformationExtractorSave = async (
    actionData: any,
    actionType: string
  ) => {
    try {
      const isEditing =
        editingActionData?.isEditing && editingActionData?.actionId

      const actionToSave = {
        id: isEditing
          ? editingActionData.actionId
          : `${actionType.toLowerCase()}_${Date.now()}`,
        name: actionData.identifier || 'Unnamed Action',
        order: 0,
        isActive: true,
        data: {
          type: actionType as
            | 'YES_NO_QUESTION'
            | 'SINGLE_CHOICE'
            | 'OPEN_QUESTION',
          input: actionData.question || actionData.prompt || '',
          description: '',
          ...(actionData.choices && {
            choices: actionData.choices.map((choice: any, index: number) => ({
              id: `choice_${index}`,
              text: choice.value || choice,
            })),
          }),
          ...(actionData.examples && {
            outputExamples: actionData.examples.map(
              (example: any, index: number) => ({
                id: `example_${index}`,
                text: example.value || example,
              })
            ),
          }),
        },
        createdAt: isEditing
          ? editingActionData.createdAt || new Date().toISOString()
          : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      let currentAfterCallActions: AfterCallActions = {
        informationExtractor: [],
        customEvaluation: [],
      }

      if (agentActions?.afterCallActions) {
        try {
          const parsed = agentActions.afterCallActions as AfterCallActions
          currentAfterCallActions = {
            informationExtractor: parsed.informationExtractor || [],
            customEvaluation: parsed.customEvaluation || [],
          }
        } catch (e) {}
      }

      let updatedActions: AfterCallActions

      if (isEditing) {
        updatedActions = {
          informationExtractor:
            currentAfterCallActions.informationExtractor.map((action) =>
              action.id === editingActionData.actionId ? actionToSave : action
            ),
          customEvaluation: currentAfterCallActions.customEvaluation,
        }
      } else {
        updatedActions = {
          informationExtractor: [
            ...currentAfterCallActions.informationExtractor,
            actionToSave,
          ],
          customEvaluation: currentAfterCallActions.customEvaluation,
        }
      }

      await updateAfterCallActionsMutation.mutateAsync({
        agentId: id,
        afterCallActions: updatedActions,
      })

      if (isEditing) {
        toast.success('Action updated successfully!')
      } else {
        toast.success('Action created successfully!')
      }

      setIsInformationExtractorDrawerOpen(false)
      setIsInformationExtractorModalOpen(false)
      setIsYesNoQuestionDrawerOpen(false)
      setIsSingleChoiceDrawerOpen(false)
      setIsOpenQuestionDrawerOpen(false)
      setEditingActionData(null)
    } catch (error) {}
  }

  const handleDeleteAction = async (
    actionId: string,
    actionType: 'information-extractor' | 'custom-evaluation'
  ) => {
    try {
      let updatedActions: AfterCallActions = {
        informationExtractor: [],
        customEvaluation: [],
      }

      if (agentActions?.afterCallActions) {
        try {
          const parsed = agentActions.afterCallActions as AfterCallActions
          updatedActions = {
            informationExtractor: parsed.informationExtractor || [],
            customEvaluation: parsed.customEvaluation || [],
          }
        } catch (e) {}
      }

      if (actionType === 'information-extractor') {
        updatedActions = {
          ...updatedActions,
          informationExtractor: updatedActions.informationExtractor.filter(
            (a) => a.id !== actionId
          ),
        }
      } else {
        updatedActions = {
          ...updatedActions,
          customEvaluation: updatedActions.customEvaluation.filter(
            (a) => a.id !== actionId
          ),
        }
      }

      await updateAfterCallActionsMutation.mutateAsync({
        agentId: id,
        afterCallActions: updatedActions,
      })

      setIsInformationExtractorDrawerOpen(false)
      setIsCustomEvaluationDrawerOpen(false)
      setIsYesNoQuestionDrawerOpen(false)
      setIsSingleChoiceDrawerOpen(false)
      setIsOpenQuestionDrawerOpen(false)
      setEditingActionData(null)

      toast.success('Action deleted permanently!')
    } catch (error) {
      toast.error('Error deleting action')
    }
  }

  const handleYesNoQuestionSave = async (data: {
    identifier: string
    question: string
  }) => {
    await handleInformationExtractorSave(data, 'YES_NO_QUESTION')
  }

  const handleSingleChoiceSave = async (data: any) => {
    await handleInformationExtractorSave(data, 'SINGLE_CHOICE')
  }

  const handleOpenQuestionSave = async (data: any) => {
    await handleInformationExtractorSave(data, 'OPEN_QUESTION')
  }

  const handleCustomEvaluationSave = async (data: {
    name: string
    prompt: string
    category: string
    expectedResult?: any
  }) => {
    try {
      const isEditing =
        editingActionData?.isEditing && editingActionData?.actionId

      const categoryMapping: Record<string, string> = {
        Numeric: 'NUMERIC',
        Descriptive: 'DESCRIPTIVE',
        'Success Eval Rubric': 'SUCCESS_EVAL_RUBRIC',
        'Pass/Fail': 'PASS_FAIL',
      }

      let categoryConfig = {}

      switch (data.category) {
        case 'Numeric':
          categoryConfig = {
            expectedResult: data.expectedResult || 1,
          }

          break
        case 'Descriptive':
          categoryConfig = {
            expectedResult: data.expectedResult || 'Excellent',
          }

          break
        case 'Success Eval Rubric':
          categoryConfig = {
            expectedResult: data.expectedResult || 'Strongly Agree',
          }
          break
        case 'Pass/Fail':
          categoryConfig = {
            expectedResult: data.expectedResult || 'True',
          }
          break
        default:
          categoryConfig = {}
      }

      const actionToSave: any = {
        id: isEditing
          ? editingActionData.actionId
          : `custom_eval_${Date.now()}`,
        name: data.name,
        order: 0,
        isActive: true,
        data: {
          category: categoryMapping[data.category] as
            | 'NUMERIC'
            | 'DESCRIPTIVE'
            | 'SUCCESS_EVAL_RUBRIC'
            | 'PASS_FAIL',
          name: data.name,
          prompt: data.prompt,
          categoryConfig: categoryConfig,
        },
        createdAt: isEditing
          ? editingActionData.createdAt || new Date().toISOString()
          : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      let currentAfterCallActions: AfterCallActions = {
        informationExtractor: [],
        customEvaluation: [],
      }

      if (agentActions?.afterCallActions) {
        try {
          const parsed = agentActions.afterCallActions as AfterCallActions
          currentAfterCallActions = {
            informationExtractor: parsed.informationExtractor || [],
            customEvaluation: parsed.customEvaluation || [],
          }
        } catch (e) {}
      }

      let updatedActions: AfterCallActions

      if (isEditing) {
        updatedActions = {
          informationExtractor: currentAfterCallActions.informationExtractor,
          customEvaluation: currentAfterCallActions.customEvaluation.map(
            (action) =>
              action.id === editingActionData.actionId ? actionToSave : action
          ),
        }
      } else {
        updatedActions = {
          informationExtractor: currentAfterCallActions.informationExtractor,
          customEvaluation: [
            ...currentAfterCallActions.customEvaluation,
            actionToSave,
          ],
        }
      }

      await updateAfterCallActionsMutation.mutateAsync({
        agentId: id,
        afterCallActions: updatedActions,
      })

      if (isEditing) {
        toast.success('Evaluation updated successfully!')
      } else {
        toast.success('Evaluation created successfully!')
      }

      setIsCustomEvaluationDrawerOpen(false)
      setIsCustomEvaluationModalOpen(false)
      setEditingActionData(null)
    } catch (error) {}
  }

  const renderTriggerTab = () => (
    <div className="card-body">
      <div className="flex justify-between py-4">
        <div>
          <h4>Trigger</h4>
          <p className="text-gray-500">
            Actions that are set to run before the call
          </p>
        </div>
        <div>
          <Dropdown position="right">
            <DropdownButton colorClass="btn btn-gray flex items-center">
              <Plus className="w-4 h-4 mr-1" />
              Add Trigger
            </DropdownButton>
            <DropdownMenu menuClass="min-w-62 bg-white border border-gray-200 dark:bg-gray-900 mt-1  rounded-sm dark:border-gray-800 z-999">
              <ul className="py-2 space-y-1 font-light text-xs ">
                <li className="hover:bg-blue-50/50">
                  <button
                    className="dropdown-item w-full text-left flex items-center px-3 py-2"
                    onClick={() => handleAddTrigger('WHATSAPP_MESSAGE')}>
                    <div className="mr-3 bg-blue-50/40 rounded-sm p-2">
                      <WhatsAppIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>WhatsApp message</div>
                  </button>
                </li>
                <li className="hover:bg-blue-50/50">
                  <button
                    className="dropdown-item w-full text-left flex items-center px-3 py-2"
                    onClick={() => handleAddTrigger('WHATSAPP_CALL')}>
                    <div className="mr-3 bg-blue-50/40 rounded-sm p-2">
                      <WhatsAppIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>WhatsApp call</div>
                  </button>
                </li>
                <li className="hover:bg-blue-50/50">
                  <button
                    className="dropdown-item w-full text-left flex items-center px-3 py-2"
                    onClick={() => handleAddTrigger('PHONE_CALL')}>
                    <div className="mr-3 bg-blue-50/40 rounded-sm p-2">
                      <Phone className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>Phone call</div>
                  </button>
                </li>
                <li className="hover:bg-blue-50/50">
                  <button
                    className="dropdown-item w-full text-left flex items-center px-3 py-2"
                    onClick={() => handleAddTrigger('WEBHOOK')}>
                    <div className="mr-3 bg-blue-50/40 rounded-sm p-2">
                      <FileSearch2 className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>Webhook</div>
                  </button>
                </li>
                <li className="hover:bg-blue-50/50">
                  <button
                    className="dropdown-item w-full text-left flex items-center px-3 py-2"
                    onClick={() => handleAddTrigger('CRON_JOB')}>
                    <div className="mr-3 bg-blue-50/40 rounded-sm p-2">
                      <ClockFading className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>CRON_JOB</div>
                  </button>
                </li>
                <li className="hover:bg-blue-50/50">
                  <button
                    className="dropdown-item w-full text-left flex items-center px-3 py-2"
                    onClick={() => handleAddTrigger('MCP_PROTOCOL')}>
                    <div className="mr-3 bg-blue-50/40 rounded-sm p-2">
                      <Bot className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>MCP_PROTOCOL</div>
                  </button>
                </li>
              </ul>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      {isTriggersLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      ) : triggers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 card card-body place-content-center place-items-center">
          {triggers.map((trigger) => {
            const getTriggerLabel = () => {
              switch (trigger.type) {
                case 'WHATSAPP_MESSAGE':
                  return 'WhatsApp Message'
                case 'WHATSAPP_CALL':
                  return 'WhatsApp Call'
                case 'PHONE_CALL':
                  return 'Phone Call'
                case 'WEBHOOK':
                  return 'Webhook'
                case 'CRON_JOB':
                  return 'Cron Job'
                case 'MCP_PROTOCOL':
                  return 'MCP Protocol'
                default:
                  return trigger.type
              }
            }

            const getCronDescription = (cronExpression: string) => {
              const parts = cronExpression.split(' ')
              if (parts.length !== 5) return cronExpression

              const [minute, hour, dayOfMonth, month, dayOfWeek] = parts

              let description = ''

              if (minute === '*') {
                description = 'Every minute'
              } else {
                description = `At minute ${minute}`
              }

              if (hour !== '*') {
                const hourNum = parseInt(hour)
                const time =
                  hourNum === 0
                    ? '00:00'
                    : `${hourNum.toString().padStart(2, '0')}:00`
                description += `, hour ${hour} (${time})`
              } else if (minute !== '*') {
                description += ' of every hour'
              }

              if (dayOfMonth !== '*') {
                description += `, day ${dayOfMonth}`
              } else if (minute !== '*' || hour !== '*') {
                description += ', every day'
              }

              if (month !== '*') {
                const monthNames = [
                  '',
                  'Jan',
                  'Feb',
                  'Mar',
                  'Apr',
                  'May',
                  'Jun',
                  'Jul',
                  'Aug',
                  'Sep',
                  'Oct',
                  'Nov',
                  'Dec',
                ]
                description += ` of ${monthNames[parseInt(month)]}`
              }

              return description
            }

            const getTriggerIcon = () => {
              if (trigger.type === 'PHONE_CALL') {
                return (
                  <Phone className="w-13 h-13 mr-3 text-blue-500 bg-primary-50 rounded-md p-1" />
                )
              }
              if (trigger.type === 'CRON_JOB') {
                return (
                  <Clock className="w-13 h-13 mr-3 text-blue-500 bg-primary-50 rounded-md p-1" />
                )
              }
              if (trigger.type === 'WEBHOOK') {
                return (
                  <FileSearch2 className="w-13 h-13 mr-3 text-purple-500 bg-purple-50 rounded-md p-1" />
                )
              }
              return (
                <WhatsAppIcon className="w-13 h-13 mr-3 text-green-500 bg-green-50 rounded-md p-1" />
              )
            }

            return (
              <div
                key={trigger.id}
                className="p-2 border rounded-md border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 group relative cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 w-53"
                onClick={() => handleAddTrigger(trigger.type)}>
                <div className="flex">
                  <div className="flex items-center w-full">
                    {getTriggerIcon()}
                    <div className="space-y-2 truncate">
                      <p className="text-[11px] text-gray-400 mt-1 font-normal badge badge-green items-center">
                        {getTriggerLabel()}
                      </p>
                      {trigger.type === 'CRON_JOB' ? (
                        <>
                          <h2 className="font-normal text-sm text-wrap">
                            {getCronDescription(
                              trigger.cronExpression || '* * * * *'
                            )}
                          </h2>
                          <p className="text-[11px] text-gray-400 truncate">
                            {trigger.cronTimezone || 'UTC'}
                          </p>
                        </>
                      ) : (
                        <>
                          <h5 className="font-normal text-sm truncate">
                            {
                              trigger.projectPhoneNumber?.phoneNumber
                                .countryCode
                            }{' '}
                            {
                              trigger.projectPhoneNumber?.phoneNumber
                                .phoneNumber
                            }
                          </h5>
                          <p className="text-[11px] text-gray-400 truncate">
                            {trigger.projectPhoneNumber?.phoneNumber
                              .friendlyName || 'No name'}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  <div
                    className="flex items-center"
                    onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleDeleteTrigger(trigger.type)}
                      disabled={deleteTriggerMutation.isPending}
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-400 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Remove trigger">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card card-body text-center">
          <p className="font-normal text-sm">
            There's no trigger yet <br />{' '}
            <span className="text-gray-500">
              Add a new trigger using the button above
            </span>
          </p>
        </div>
      )}
    </div>
  )

  const renderAfterCallTab = () => {
    if (isLoading) {
      return (
        <div className="card-body">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        </div>
      )
    }

    let afterCallActions: AfterCallActions = {
      informationExtractor: [],
      customEvaluation: [],
    }

    if (agentActions?.afterCallActions) {
      try {
        const parsed = agentActions.afterCallActions as AfterCallActions
        afterCallActions = {
          informationExtractor: parsed.informationExtractor || [],
          customEvaluation: parsed.customEvaluation || [],
        }
      } catch (e) {}
    }

    const allActions = [
      ...afterCallActions.informationExtractor.filter(
        (action: any) => action.isActive !== false
      ),
      ...afterCallActions.customEvaluation.filter(
        (action: any) => action.isActive !== false
      ),
    ]

    return (
      <div className="card-body">
        <div className="flex justify-between py-4">
          <div>
            <h4>After the Call</h4>
            <p className="text-gray-500">
              Actions that are set to run after the call
            </p>
          </div>
          <div>
            <Dropdown position="right">
              <DropdownButton colorClass="btn btn-gray flex items-center">
                <Plus className="w-4 h-4 mr-1" />
                Add Actions
              </DropdownButton>
              <DropdownMenu menuClass="min-w-62 bg-white border border-gray-200 dark:bg-gray-900 mt-1  rounded-sm dark:border-gray-800 z-999">
                <ul className="py-2 space-y-1 font-light text-xs ">
                  <li className="hover:bg-blue-50/50">
                    <button
                      className="dropdown-item w-full text-left flex items-center px-3 py-2"
                      onClick={() => handleAddAction('information-extractor')}>
                      <div className="mr-3 bg-blue-50/40 rounded-sm p-2">
                        <FileSearch2 className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        Information Extractor
                        <p className="text-gray-500">
                          Extracts information from the call
                        </p>
                      </div>
                    </button>
                  </li>
                  <li className="hover:bg-blue-50/50">
                    <button
                      className="dropdown-item w-full text-left flex items-center px-3 py-2"
                      onClick={() => handleAddAction('custom-evaluation')}>
                      <div className="mr-3 bg-blue-50/40 rounded-sm p-2">
                        <FileSearch2 className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        Custom Evaluation
                        <p className="text-gray-500">
                          Create and manage evaluation templates
                        </p>
                      </div>
                    </button>
                  </li>
                </ul>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>

        {/* Actions List or Empty State */}
        {allActions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 card card-body place-content-center place-items-center">
            {allActions.map((action) => {
              const isInformationExtractor = !('category' in action.data)

              const handleEditAction = () => {
                if (isInformationExtractor) {
                  const actionData = action.data as any
                  const drawerData = {
                    actionId: action.id,
                    isEditing: true,
                    identifier: action.name,
                    prompt: actionData.input || actionData.prompt || '',
                    type: actionData.type,
                    ...(actionData.choices && {
                      choices: actionData.choices.map(
                        (choice: any) => choice.text || choice
                      ),
                    }),
                    ...(actionData.outputExamples && {
                      examples: actionData.outputExamples.map(
                        (example: any) => example.text || example
                      ),
                    }),
                  }

                  setEditingActionData(drawerData)

                  if (actionData.type === 'YES_NO_QUESTION') {
                    setIsYesNoQuestionDrawerOpen(true)
                  } else if (actionData.type === 'SINGLE_CHOICE') {
                    setIsSingleChoiceDrawerOpen(true)
                  } else if (actionData.type === 'OPEN_QUESTION') {
                    setIsOpenQuestionDrawerOpen(true)
                  } else {
                    setIsInformationExtractorDrawerOpen(true)
                  }
                } else {
                  const actionData = action.data as any

                  const drawerData = {
                    actionId: action.id,
                    isEditing: true,
                    name: action.name,
                    prompt: actionData.prompt || '',
                    category: actionData.category,
                    expectedResult: actionData.categoryConfig?.expectedResult,
                  }

                  setEditingActionData(drawerData)
                  setIsCustomEvaluationDrawerOpen(true)
                }
              }

              const handleRemoveAction = async () => {
                try {
                  let updatedActions: AfterCallActions

                  if (isInformationExtractor) {
                    updatedActions = {
                      ...afterCallActions,
                      informationExtractor:
                        afterCallActions.informationExtractor.map((a) =>
                          a.id === action.id ? { ...a, isActive: false } : a
                        ),
                    }
                  } else {
                    updatedActions = {
                      ...afterCallActions,
                      customEvaluation: afterCallActions.customEvaluation.map(
                        (a) =>
                          a.id === action.id ? { ...a, isActive: false } : a
                      ),
                    }
                  }

                  await updateAfterCallActionsMutation.mutateAsync({
                    agentId: id,
                    afterCallActions: updatedActions,
                  })
                } catch (error) {
                  toast.error('Error removing action')
                }
              }

              return (
                <div
                  key={action.id}
                  className="p-3 border rounded-md border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 group relative cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 w-53"
                  onClick={handleEditAction}>
                  <div className="flex">
                    <div className="space-y-2 truncate">
                      <p className="text-[11px] text-gray-400 mt-1 font-normal badge badge-green flex items-center w-36">
                        <FileSearch2 className="w-3 h-3 mr-1" />
                        {'category' in action.data
                          ? `Custom Evaluation`
                          : `Information Extractor`}
                      </p>
                      <h5 className="font-normal text-sm truncate">
                        {action.name}
                      </h5>
                      <p className="text-[11px] text-gray-400 ">
                        Extracts information from the call
                      </p>
                    </div>
                    <div
                      className="flex items-center"
                      onClick={(e) => e.stopPropagation()}>
                      {/* Remove button - only visible on hover */}
                      <button
                        onClick={handleRemoveAction}
                        disabled={updateAfterCallActionsMutation.isPending}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-400 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove action">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="card card-body text-center">
            <p className="font-normal text-sm">
              There's no actions yet <br />{' '}
              <span className="text-gray-500">
                Add a new action using the button above
              </span>
            </p>
          </div>
        )}
      </div>
    )
  }

  if (!currentProject) {
    return (
      <div className="m-6">
        <h1 className="pb-4 text-xl">Actions</h1>
        <div className="card">
          <div className="card-body">
            <div className="text-center text-gray-500 dark:text-dark-500">
              <p>No project selected. Please select a project first.</p>
              <p className="mt-2 text-sm">
                Go to{' '}
                <a
                  href="/apps/projects/grid"
                  className="text-primary-500 hover:underline">
                  Projects
                </a>{' '}
                to select a project.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isNavigating || isCurrentProjectAgentsLoading) {
    return (
      <div className="m-6">
        <h1 className="pb-4 text-xl">Actions</h1>
        <div className="card">
          <div className="card-body">
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isAgentLoading) {
    return (
      <div className="m-6">
        <h1 className="pb-4 text-xl">Actions</h1>
        <div className="card">
          <div className="card-body">
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (agentError || !agent || agent.project.id !== currentProject.id) {
    return (
      <div className="m-6">
        <h1 className="pb-4 text-xl">Actions</h1>
        <div className="card">
          <div className="card-body">
            <div className="text-center text-red-500">
              <p>
                {agentError
                  ? `Error loading agent: ${agentError.message}`
                  : 'Agent not found or does not belong to the current project.'}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Please verify the agent exists and belongs to your current
                project.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="m-6">
      <h1 className="pb-4 text-xl">Actions</h1>
      <div className="card">
        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              type="button"
              onClick={() => setActiveTab('trigger')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'trigger'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}>
              <Clock className="w-4 h-4 mr-1" />
              Trigger
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('after-call')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'after-call'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}>
              <CheckCircle className="w-4 h-4 mr-1" />
              After the Call
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'trigger' && renderTriggerTab()}
        {activeTab === 'after-call' && renderAfterCallTab()}
      </div>

      {/* Modals */}
      <ModalSelectActions
        isOpen={isInformationExtractorModalOpen}
        onClose={() => setIsInformationExtractorModalOpen(false)}
        modalType="information-extractor"
        allActions={(() => {
          if (!agentActions?.afterCallActions) return []
          try {
            const actions =
              typeof agentActions.afterCallActions === 'string'
                ? JSON.parse(agentActions.afterCallActions)
                : agentActions.afterCallActions
            return actions?.informationExtractor || []
          } catch (error) {
            return []
          }
        })()}
        activeActions={(() => {
          if (!agentActions?.afterCallActions) return new Set()
          try {
            const actions =
              typeof agentActions.afterCallActions === 'string'
                ? JSON.parse(agentActions.afterCallActions)
                : agentActions.afterCallActions
            const activeSet = new Set<string>()
            ;(actions?.informationExtractor || []).forEach((action: any) => {
              if (action.name && action.isActive !== false) {
                activeSet.add(action.name)
              }
            })
            return activeSet
          } catch (error) {
            return new Set()
          }
        })()}
        onAddActions={async (selectedActions) => {
          try {
            let currentActions: AfterCallActions = {
              informationExtractor: [],
              customEvaluation: [],
            }
            if (agentActions?.afterCallActions) {
              try {
                currentActions =
                  typeof agentActions.afterCallActions === 'string'
                    ? JSON.parse(agentActions.afterCallActions)
                    : agentActions.afterCallActions
              } catch (error) {}
            }

            const updatedActions: AfterCallActions = {
              ...currentActions,
              informationExtractor: (
                currentActions.informationExtractor || []
              ).map((action: any) =>
                selectedActions.has(action.name)
                  ? { ...action, isActive: true }
                  : action
              ),
            }

            await updateAfterCallActionsMutation.mutateAsync({
              agentId: id,
              afterCallActions: updatedActions,
            })

            toast.success(`${selectedActions.size} action(s) activated!`)
          } catch (error) {
            toast.error('Error adding selected actions')
            throw error
          }
        }}
        onCreateNew={() => setIsInformationExtractorDrawerOpen(true)}
        isLoading={updateAfterCallActionsMutation.isPending}
      />
      <ModalSelectActions
        isOpen={isCustomEvaluationModalOpen}
        onClose={() => setIsCustomEvaluationModalOpen(false)}
        modalType="custom-evaluation"
        allActions={(() => {
          if (!agentActions?.afterCallActions) return []
          try {
            const actions =
              typeof agentActions.afterCallActions === 'string'
                ? JSON.parse(agentActions.afterCallActions)
                : agentActions.afterCallActions
            return actions?.customEvaluation || []
          } catch (error) {
            return []
          }
        })()}
        activeActions={(() => {
          if (!agentActions?.afterCallActions) return new Set()
          try {
            const actions =
              typeof agentActions.afterCallActions === 'string'
                ? JSON.parse(agentActions.afterCallActions)
                : agentActions.afterCallActions
            const activeSet = new Set<string>()
            ;(actions?.customEvaluation || []).forEach((action: any) => {
              if (action.name && action.isActive !== false) {
                activeSet.add(action.name)
              }
            })
            return activeSet
          } catch (error) {
            return new Set()
          }
        })()}
        onAddActions={async (selectedActions) => {
          try {
            let currentActions: AfterCallActions = {
              informationExtractor: [],
              customEvaluation: [],
            }
            if (agentActions?.afterCallActions) {
              try {
                currentActions =
                  typeof agentActions.afterCallActions === 'string'
                    ? JSON.parse(agentActions.afterCallActions)
                    : agentActions.afterCallActions
              } catch (error) {}
            }

            const updatedActions: AfterCallActions = {
              ...currentActions,
              customEvaluation: (currentActions.customEvaluation || []).map(
                (action: any) =>
                  selectedActions.has(action.name)
                    ? { ...action, isActive: true }
                    : action
              ),
            }

            await updateAfterCallActionsMutation.mutateAsync({
              agentId: id,
              afterCallActions: updatedActions,
            })

            toast.success(`${selectedActions.size} action(s) activated!`)
          } catch (error) {
            toast.error('Error adding selected actions')
            throw error
          }
        }}
        onCreateNew={() => setIsCustomEvaluationDrawerOpen(true)}
        isLoading={updateAfterCallActionsMutation.isPending}
      />

      {/* Drawers */}
      <DrawerInformationExtractor
        isOpen={isInformationExtractorDrawerOpen}
        onClose={() => {
          setIsInformationExtractorDrawerOpen(false)
          setEditingActionData(null)
        }}
        onSelect={handleInformationExtractorTypeSelect}
        onSave={handleInformationExtractorSave}
      />
      <DrawerCustomEvaluation
        isOpen={isCustomEvaluationDrawerOpen}
        onClose={() => {
          setIsCustomEvaluationDrawerOpen(false)
          setEditingActionData(null)
        }}
        onSave={handleCustomEvaluationSave}
        onDelete={
          editingActionData?.isEditing
            ? () =>
                handleDeleteAction(
                  editingActionData.actionId,
                  'custom-evaluation'
                )
            : undefined
        }
        initialData={
          editingActionData?.isEditing && editingActionData?.category
            ? {
                name: editingActionData.name || '',
                prompt: editingActionData.prompt || '',
                category: (() => {
                  const categoryReverseMapping: Record<string, string> = {
                    NUMERIC: 'Numeric',
                    DESCRIPTIVE: 'Descriptive',
                    SUCCESS_EVAL_RUBRIC: 'Success Eval Rubric',
                    PASS_FAIL: 'Pass/Fail',
                  }
                  return (
                    categoryReverseMapping[editingActionData.category] || ''
                  )
                })(),
                expectedResult: editingActionData.expectedResult,
                isEditing: true,
              }
            : undefined
        }
      />

      {/* Specific Information Extractor Drawers */}
      <DrawerYesNoQuestion
        isOpen={isYesNoQuestionDrawerOpen}
        onClose={() => {
          setIsYesNoQuestionDrawerOpen(false)
          setEditingActionData(null)
        }}
        onSave={handleYesNoQuestionSave}
        onDelete={
          editingActionData?.isEditing
            ? () =>
                handleDeleteAction(
                  editingActionData.actionId,
                  'information-extractor'
                )
            : undefined
        }
        initialData={editingActionData}
      />

      <DrawerSingleChoice
        isOpen={isSingleChoiceDrawerOpen}
        onClose={() => {
          setIsSingleChoiceDrawerOpen(false)
          setEditingActionData(null)
        }}
        onSave={handleSingleChoiceSave}
        onDelete={
          editingActionData?.isEditing
            ? () =>
                handleDeleteAction(
                  editingActionData.actionId,
                  'information-extractor'
                )
            : undefined
        }
        initialData={editingActionData}
      />

      <DrawerOpenQuestion
        isOpen={isOpenQuestionDrawerOpen}
        onClose={() => {
          setIsOpenQuestionDrawerOpen(false)
          setEditingActionData(null)
        }}
        onSave={handleOpenQuestionSave}
        onDelete={
          editingActionData?.isEditing
            ? () =>
                handleDeleteAction(
                  editingActionData.actionId,
                  'information-extractor'
                )
            : undefined
        }
        initialData={editingActionData}
      />

      {/* Phone Number Selection Modal */}
      <ModalSelectPhoneNumber
        isOpen={isPhoneNumberModalOpen}
        onClose={() => {
          setIsPhoneNumberModalOpen(false)
          setSelectedTriggerType(null)
        }}
        phoneNumbers={
          availablePhoneNumbers
            .filter((assignment) => assignment.isActiveInProject)
            .map((assignment) => assignment.phoneNumber) || []
        }
        triggerType={
          selectedTriggerType === 'WHATSAPP_MESSAGE' ||
          selectedTriggerType === 'WHATSAPP_CALL' ||
          selectedTriggerType === 'PHONE_CALL'
            ? selectedTriggerType
            : 'WHATSAPP_MESSAGE'
        }
        currentPhoneNumberId={
          selectedTriggerType
            ? triggers.find((t) => t.type === selectedTriggerType)
                ?.projectPhoneNumber?.phoneNumber.id || null
            : null
        }
        onSave={handleSaveTrigger}
        isLoading={upsertTriggerMutation.isPending}
      />

      {/* Webhook Configuration Modal */}
      <ModalWebhookConfig
        isOpen={isWebhookConfigModalOpen}
        onClose={() => {
          setIsWebhookConfigModalOpen(false)
          setSelectedTriggerType(null)
        }}
        agentId={id}
        initialConfig={
          triggers.find((t) => t.type === 'WEBHOOK')?.webhookConfig as any
        }
        onSave={handleSaveWebhook}
        isLoading={upsertTriggerMutation.isPending}
      />

      {/* Cron Job Configuration Modal */}
      <ModalCronJob
        isOpen={isCronJobModalOpen}
        onClose={() => {
          setIsCronJobModalOpen(false)
          setSelectedTriggerType(null)
        }}
        currentCronExpression={
          triggers.find((t) => t.type === 'CRON_JOB')?.cronExpression || null
        }
        currentTimezone={
          triggers.find((t) => t.type === 'CRON_JOB')?.cronTimezone || null
        }
        onSave={handleSaveCronJob}
        onDelete={() => handleDeleteTrigger('CRON_JOB')}
        isLoading={upsertTriggerMutation.isPending}
        isDeleting={deleteTriggerMutation.isPending}
      />

      {/* MCP Protocol Configuration Modal */}
      <ModalMcpProtocol
        isOpen={isMcpProtocolModalOpen}
        onClose={() => {
          setIsMcpProtocolModalOpen(false)
          setSelectedTriggerType(null)
        }}
        onSave={(config) => {
          toast.info('MCP Protocol save functionality coming soon')
          console.log('MCP Config:', config)
        }}
        onExecute={() => {
          toast.info('MCP Protocol execute functionality...')
        }}
      />
    </div>
  )
}

export default ActionPage
