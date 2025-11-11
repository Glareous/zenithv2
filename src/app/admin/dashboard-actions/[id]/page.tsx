'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'

import { useParams } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import BreadCrumb from '@src/components/common/BreadCrumb'
import { Drawer } from '@src/components/custom/drawer/drawer'
import { type RichTextEditorRef } from '@src/components/molecules/RichTextEditor'
import ActionsFormStep1 from '@src/components/organisms/ActionsFormStep1'
import ActionsFormStep2 from '@src/components/organisms/ActionsFormStep2'
import ActionsFormStep3 from '@src/components/organisms/ActionsFormStep3'
import ActionsFormStep4 from '@src/components/organisms/ActionsFormStep4'
import ActionsFormStep5 from '@src/components/organisms/ActionsFormStep5'
import ActionsFormStep6 from '@src/components/organisms/ActionsFormStep6'
import SidebarActionsId from '@src/components/organisms/SidebarActionsId'
import { api } from '@src/trpc/react'
import { createJsonValidation } from '@src/utils/validationHelpers'
import { ArrowLeft, Menu } from 'lucide-react'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { z } from 'zod'

const actionFormSchema = z
  .object({
    apiUrl: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).default('POST'),
    endpointUrl: z
      .string()
      .url('Invalid URL format')
      .min(1, 'Endpoint URL is required'),
    headers: z
      .array(
        z
          .object({
            key: z.string().min(1, 'Header key is required'),
            value: z.string().min(1, 'Header value is required'),
          })
          .optional()
      )
      .default([])
      .optional(),
    timeout: z.number().min(0, 'Timeout must be positive').default(30000),

    authorizationNeeded: z.boolean().default(false),
    authenticationKey: z.string().default('Authorization'),
    authenticationValue: z.string().default(''),

    actionCallType: z.enum(['BEFORE_CALL', 'DURING_CALL']).default('BEFORE_CALL'),
    requestBody: createJsonValidation().default(''),
    beforeCallVariables: z
      .array(
        z.object({
          key: z
            .string()
            .min(1, 'Variable key is required')
            .refine(
              (val) => !val.includes(' '),
              'Variable key cannot contain spaces use lodash "_" instead'
            ),
          value: z.string().min(1, 'Variable value is required'),
          actionCallType: z.literal('BEFORE_CALL'),
          variable_id: z.string().min(1, 'Required'),
          type: z.string().optional().nullable(),
          required: z.boolean().default(false),
        })
      )
      .default([])
      .refine(
        (variables) => {
          const keys = variables.map((v) => v.key)
          return new Set(keys).size === keys.length
        },
        {
          message: 'Variable keys must be unique.',
          path: ['beforeCallVariables'],
        }
      ),
    duringCallVariables: z
      .array(
        z.object({
          key: z.string().min(1, 'Variable key is required'),
          value: z.string().min(1, 'Variable value is required'),
          actionCallType: z.literal('DURING_CALL'),
          type: z.string().optional().nullable(),
          description: z.string().min(1, 'Variable description is required'),
          variable_id: z.string().min(1, 'Required'),
          required: z.boolean().default(false),
        })
      )
      .default([])
      .refine(
        (variables) => {
          const keys = variables.map((v) => v.key)
          return new Set(keys).size === keys.length
        },
        {
          message: 'Variable keys must be unique.',
          path: ['duringCallVariables'],
        }
      ),
    queryParameters: z
      .array(
        z.object({
          key: z
            .string()
            .min(1, 'Query param key is required')
            .refine(
              (val) => !val.includes(' '),
              'Query param key cannot contain spaces use lodash "_" instead'
            ),
          value: z.string().min(1, 'Query param value is required'),
        })
      )
      .default([])
      .refine(
        (variables) => {
          const keys = variables.map((v) => v.key)
          return new Set(keys).size === keys.length
        },
        {
          message: 'Query params keys must be unique.',
          path: ['queryParameters'],
        }
      ),

    name: z.string().min(1, 'Action name is required'),
    description: z.string().min(1, 'Description is required'),

    agentSpeakNaturally: z.boolean().default(false),
    startMessage: z.string().default(''),
    delayMessage: z.string().default(''),
    delayThreshold: z.number().min(1).default(7),
    failureMessage: z.string().default(''),

    actionResults: z
      .array(
        z.object({
          key: z
            .string()
            .min(1, 'Result key is required')
            .refine(
              (val) => !val.includes(' '),
              'Result key cannot contain spaces use lodash "_" instead'
            ),
        })
      )
      .default([])
      .refine(
        (results) => {
          const keys = results.map((r) => r.key)
          return new Set(keys).size === keys.length
        },
        {
          message: 'Result keys must be unique.',
          path: ['actionResults'],
        }
      ),
  })
  .refine(
    (data) => {
      if (data.authorizationNeeded && !data.authenticationValue.trim()) {
        return false
      }
      return true
    },
    {
      message: 'Authentication value is required when authorization is enabled',
      path: ['authenticationValue'],
    }
  )

const stepValidationFields = {
  1: ['apiUrl', 'endpointUrl', 'headers', 'timeout'] as const,
  2: [
    'authorizationNeeded',
    'authenticationKey',
    'authenticationValue',
  ] as const,
  3: [
    'actionCallType',
    'requestBody',
    'beforeCallVariables',
    'duringCallVariables',
    'queryParameters',
  ] as const,
  4: ['name', 'description'] as const,
  5: [
    'agentSpeakNaturally',
    'startMessage',
    'delayMessage',
    'delayThreshold',
    'failureMessage',
  ] as const,
  6: ['actionResults'] as const,
}

export type ActionFormData = z.infer<typeof actionFormSchema>

const EditActionPage = () => {
  const editorRef = useRef<RichTextEditorRef>(null)
  const params = useParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const methods = useForm<ActionFormData>({
    resolver: zodResolver(actionFormSchema as any),
    mode: 'onChange',
    defaultValues: {
      apiUrl: 'POST',
      endpointUrl: '',
      headers: [],
      timeout: 30000,
      authorizationNeeded: false,
      authenticationKey: 'Authorization',
      authenticationValue: '',
      actionCallType: 'BEFORE_CALL',
      requestBody: '',
      name: '',
      description: '',
      agentSpeakNaturally: false,
      startMessage: '',
      delayMessage: '',
      delayThreshold: 7,
      failureMessage: '',
      beforeCallVariables: [],
      duringCallVariables: [],
      queryParameters: [],
      actionResults: [],
    },
  })

  const {
    data: currentAction,
    isLoading: isLoadingCurrentAction,
    refetch: refetchAction,
  } = api.projectAction.getById.useQuery(
    {
      id: params.id as string,
    },
    {
      enabled: !!params.id,
    }
  )

  const allVariables = [
    ...methods.watch('beforeCallVariables'),
    ...methods.watch('duringCallVariables'),
  ]
  const availableActions: any[] = useMemo(() => {
    return [
      {
        id: currentAction?.id || 'current-action',
        name: currentAction?.name || 'Current Action',
        variables: [],
        results: allVariables,
      },
    ]
  }, [JSON.stringify(allVariables)])

  useEffect(() => {
    if (currentAction) {
      if (editorRef?.current?.editor) {
        editorRef?.current?.editor!.commands.setContent(
          currentAction.requestBody ? JSON.parse(currentAction.requestBody) : ''
        )
      }
      methods.reset({
        apiUrl: (currentAction.apiUrl as any) || 'POST',
        endpointUrl: currentAction.endpointUrl || '',
        headers: currentAction.headers ? (currentAction.headers as any) : [],
        timeout: currentAction.timeout || 30000,
        authorizationNeeded: currentAction.authorizationNeeded || false,
        authenticationKey: currentAction.authenticationKey || 'Authorization',
        authenticationValue: currentAction.authenticationValue || '',
        actionCallType: (currentAction.actionCallType as any) || 'BEFORE_CALL',
        requestBody: (currentAction.requestBody as any) || '',
        name: currentAction.name || '',
        description: currentAction.description || '',

        agentSpeakNaturally: currentAction.agentSpeakNaturally || false,
        startMessage: currentAction.startMessage || '',
        delayMessage: currentAction.delayMessage || '',
        delayThreshold: currentAction.delayThreshold || 7,
        failureMessage: currentAction.failureMessage || '',

        beforeCallVariables: currentAction.variables
          ? (currentAction.variables as any[]).filter(
              (v: any) => v.actionCallType === 'BEFORE_CALL'
            )
          : [],
        duringCallVariables: currentAction.variables
          ? (currentAction.variables as any[]).filter(
              (v: any) => v.actionCallType === 'DURING_CALL'
            )
          : [],

        queryParameters: (currentAction.queryParameters as any[]) || [],
        actionResults: (currentAction.results as any[]) || [],
      })
    }
  }, [JSON.stringify(currentAction), methods, currentStep])

  const updateAction = api.projectAction.update.useMutation({
    onSuccess: (updatedAction) => {
      refetchAction()
      toast.success('Action updated successfully')
    },
    onError: (error) => {
      toast.error(`Error updating action: ${error.message}`)
    },
  })

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen)
  }

  const closeDrawer = () => {
    setIsDrawerOpen(false)
  }

  const handleDirectNavigation = (newStep: number) => {
    setCurrentStep(newStep)

    setIsDrawerOpen(false)
  }

  const handleNextStep = async () => {
    const nextStep = currentStep + 1

    const currentStepFields =
      stepValidationFields[currentStep as keyof typeof stepValidationFields]

    const isValid = await methods.trigger(currentStepFields)

    if (!isValid) {
      return
    }

    const formData = methods.getValues()

    const mergedVariables = [
      ...formData.beforeCallVariables,
      ...formData.duringCallVariables,
    ]

    if (!currentAction?.id) {
      console.error('No current action ID available')
      return
    }

    try {
      await updateAction.mutateAsync({
        id: currentAction.id,
        ...formData,
        headers: formData.headers,

        variables: mergedVariables,
        queryParameters: formData.queryParameters,
        results: formData.actionResults,
      })

      if (nextStep === 7) {
        return
      }

      setCurrentStep(nextStep)
    } catch (error) {
      return
    }
  }

  const handlePreviousStep = () => {
    const previousStep = currentStep - 1
    setCurrentStep(previousStep)
    methods.clearErrors()
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ActionsFormStep1
            onNextStep={handleNextStep}
            isLoading={updateAction.isPending}
            setCurrentStep={setCurrentStep}
          />
        )
      case 2:
        return (
          <ActionsFormStep2
            onPreviousStep={handlePreviousStep}
            onNextStep={handleNextStep}
            isLoading={updateAction.isPending}
          />
        )
      case 3:
        return (
          <ActionsFormStep3
            editorRef={editorRef}
            onPreviousStep={handlePreviousStep}
            onNextStep={handleNextStep}
            isLoading={updateAction.isPending}
            availableActions={availableActions}
          />
        )
      case 4:
        return (
          <ActionsFormStep4
            onPreviousStep={handlePreviousStep}
            onNextStep={handleNextStep}
            isLoading={updateAction.isPending}
          />
        )
      case 5:
        return (
          <ActionsFormStep5
            onPreviousStep={handlePreviousStep}
            onNextStep={handleNextStep}
            isLoading={updateAction.isPending}
          />
        )
      case 6:
        return (
          <ActionsFormStep6
            action={currentAction}
            onPreviousStep={handlePreviousStep}
            onNextStep={handleNextStep}
            isLoading={updateAction.isPending}
          />
        )
      default:
        return null
    }
  }

  return (
    <FormProvider {...methods}>
      <div>
        {/* Mobile Menu Button - Only visible on mobile */}
        <div className="lg:hidden mb-4">
          <button
            onClick={toggleDrawer}
            className="btn btn-outline-primary flex items-center gap-2"
            aria-label="Open navigation menu">
            <Menu className="size-5" />
            Navigation
          </button>
        </div>

        <BreadCrumb title="Edit Action" subTitle="Custom Action" />

        {/* Loading indicator */}
        {updateAction.isPending && (
          <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow-lg z-50">
            Saving...
          </div>
        )}

        <div className="flex gap-6">
          {/* Desktop Sidebar - Hidden on mobile */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <SidebarActionsId
              action={currentAction}
              currentStep={currentStep}
              onStepChange={handleDirectNavigation}
            />
          </div>

          {/* Main Content - Full width on mobile */}
          <div className="flex-1">
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h6 className="card-title">
                    Edit Action - Step {currentStep}
                  </h6>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        window.history.back()
                      }}
                      className="btn btn-primary flex items-center gap-2">
                      <ArrowLeft className="size-4" />
                      Back to Dashboard
                    </button>
                  </div>
                </div>
              </div>
              <div className="card-body !p-2">{renderCurrentStep()}</div>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        <Drawer
          isOpen={isDrawerOpen}
          onClose={closeDrawer}
          position="left"
          size="medium"
          title="Navigation"
          content={
            <SidebarActionsId
              action={currentAction}
              currentStep={currentStep}
              onStepChange={handleDirectNavigation}
              removeBorder={true}
            />
          }
        />
      </div>
    </FormProvider>
  )
}

export default EditActionPage
