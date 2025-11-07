'use client'

import React, { useEffect, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Check, ChevronDown } from 'lucide-react'
import 'rc-slider/assets/index.css'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Drawer } from '@/components/custom/drawer/drawer'

const evaluationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  prompt: z.string().min(1, 'Prompt is required'),
  category: z.string().min(1, 'Category is required'),
  expectedResult: z
    .union([z.number().min(1).max(10), z.string().min(1)])
    .optional(),
})

type EvaluationFormData = z.infer<typeof evaluationSchema>

interface DrawerCustomEvaluationProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: EvaluationFormData) => void
  onDelete?: () => void
  initialData?: {
    name?: string
    prompt?: string
    category?: string
    expectedResult?: any
    isEditing?: boolean
  }
}

const DrawerCustomEvaluation: React.FC<DrawerCustomEvaluationProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isExpectedResultDropdownOpen, setIsExpectedResultDropdownOpen] =
    useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    trigger,
    formState: { errors, isValid },
  } = useForm<EvaluationFormData>({
    resolver: zodResolver(evaluationSchema),
    mode: 'all',
    defaultValues: {
      name: '',
      prompt: '',
      category: '',
      expectedResult: 1,
    },
  })

  const selectedCategory = watch('category')
  const expectedResult = watch('expectedResult')

  useEffect(() => {
    if (selectedCategory) {
      setValue('expectedResult', undefined)
    }
  }, [selectedCategory, setValue])

  const descriptiveOptions = [
    { value: 'Excellent', label: 'Excellent' },
    { value: 'Good', label: 'Good' },
    { value: 'Fair', label: 'Fair' },
    { value: 'Poor', label: 'Poor' },
  ]

  const successEvalRubricOptions = [
    { value: 'Strongly Agree', label: 'Strongly Agree' },
    { value: 'Agree', label: 'Agree' },
    { value: 'Neutral', label: 'Neutral' },
    { value: 'Disagree', label: 'Disagree' },
    { value: 'Strongly Disagree', label: 'Strongly Disagree' },
  ]

  const passFailOptions = [
    { value: 'True', label: 'True' },
    { value: 'False', label: 'False' },
  ]

  const categories = [
    {
      value: 'Numeric',
      label: 'Numeric',
      description: 'A scale from 1 to 10',
    },
    {
      value: 'Descriptive',
      label: 'Descriptive',
      description: 'A scale of Excellent, Good, Fair, Poor',
    },
    {
      value: 'Success Eval Rubric',
      label: 'Success Eval Rubric',
      description: 'From Strongly Agree to Strongly Disagree.',
    },
    {
      value: 'Pass/Fail',
      label: 'Pass/Fail',
      description: 'True if passed, False if not.',
    },
  ]

  const onSubmit = (data: EvaluationFormData) => {
    onSave(data)
    reset()
    onClose()
  }

  const handleCancel = () => {
    reset()
    onClose()
  }

  const handleDelete = async () => {
    if (!onDelete) return

    setIsDeleting(true)
    try {
      await onDelete()
    } finally {
      setIsDeleting(false)
    }
  }

  React.useEffect(() => {
    if (isOpen) {
      const formData = {
        name: initialData?.name || '',
        prompt: initialData?.prompt || '',
        category: initialData?.category || '',
        expectedResult:
          initialData?.expectedResult ||
          (initialData?.category === 'Numeric' ? 1 : undefined),
      }

      reset(formData)

      if (initialData?.category) {
        setValue('category', initialData.category, { shouldValidate: true })

        setTimeout(() => {
          if (initialData?.expectedResult !== undefined) {
            setValue('expectedResult', initialData.expectedResult, {
              shouldValidate: true,
            })
          }
        }, 10)
      }

      setTimeout(() => trigger(), 100)
    }
  }, [isOpen, initialData, reset, trigger])

  const content = (
    <form
      id="evaluation-form"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6">
      {/* Name Field */}
      <div>
        <label className="block text-sm font-normal mb-2">Name</label>
        <input
          type="text"
          placeholder="Enter Name"
          {...register('name')}
          className={`w-full px-3 py-2 text-xs border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 placeholder-gray-400 ${
            errors.name ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
        )}
      </div>
      {/* Prompt Field */}
      <div>
        <label className="block text-sm font-normal mb-2">Prompt</label>
        <textarea
          placeholder="Describe the evaluation criteria, e.g. 'Did the agent greet the caller by name and resolve the issue?'"
          {...register('prompt')}
          rows={4}
          className={`w-full text-xs px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 placeholder-gray-400 resize-none ${
            errors.prompt ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {errors.prompt && (
          <p className="mt-1 text-xs text-red-600">{errors.prompt.message}</p>
        )}
      </div>
      {/* Category Field */}
      <div>
        <label className="block text-sm font-normal mb-2">Category</label>
        {/* Hidden input to register the category field */}
        <input type="hidden" {...register('category')} />
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsDropdownOpen(!isDropdownOpen)

              if (!isDropdownOpen) {
                setIsExpectedResultDropdownOpen(false)
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-left bg-white flex items-center justify-between">
            <div
              className={selectedCategory ? 'text-gray-900' : 'text-gray-400'}>
              {selectedCategory ? (
                <div>
                  <div className=" text-sm">{selectedCategory}</div>
                  <div className="text-xs text-gray-500">
                    {
                      categories.find((cat) => cat.value === selectedCategory)
                        ?.description
                    }
                  </div>
                </div>
              ) : (
                'Select Category'
              )}
            </div>
            <ChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
              <div className="py-1">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => {
                      setValue('category', cat.value, { shouldValidate: true })
                      setIsDropdownOpen(false)
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm">
                    <div>
                      <div className="text-gray-900 text-xs">{cat.label}</div>
                      <div className="text-gray-500 text-xs">
                        {cat.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        {errors.category && (
          <p className="mt-1 text-xs text-red-600">{errors.category.message}</p>
        )}
      </div>
      {/* Expected Result Field - Only show for Numeric category */}
      {selectedCategory === 'Numeric' && (
        <div>
          <label className="block text-sm font-normal mb-2">
            Expected Result
          </label>
          <div className="space-y-3 flex ">
            <div className="relative grow">
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={typeof expectedResult === 'number' ? expectedResult : 1}
                onChange={(e) =>
                  setValue('expectedResult', parseInt(e.target.value), {
                    shouldValidate: true,
                  })
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${((typeof expectedResult === 'number' ? expectedResult : 1) - 1) * 11.11}%, #e5e7eb ${((typeof expectedResult === 'number' ? expectedResult : 1) - 1) * 11.11}%, #e5e7eb 100%)`,
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1 mx-1">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
                <span>6</span>
                <span>7</span>
                <span>8</span>
                <span>9</span>
                <span>10</span>
              </div>
            </div>
            <div className="flex justify-end w-6 h-6 ml-1 ">
              <div className="bg-gray-100 w-full h-full flex justify-center pt-0.5 rounded text-sm font-medium">
                {typeof expectedResult === 'number' ? expectedResult : 1}
              </div>
            </div>
          </div>
          {errors.expectedResult && (
            <p className="mt-1 text-xs text-red-600">
              {errors.expectedResult.message}
            </p>
          )}
        </div>
      )}

      {/* Expected Result Field for Descriptive category */}
      {selectedCategory === 'Descriptive' && (
        <div>
          <label className="block text-sm font-normal mb-2">
            Expected Result
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setIsExpectedResultDropdownOpen(!isExpectedResultDropdownOpen)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-left bg-white flex items-center justify-between">
              <div
                className={
                  expectedResult && typeof expectedResult === 'string'
                    ? 'text-gray-900'
                    : 'text-gray-400'
                }>
                {expectedResult && typeof expectedResult === 'string'
                  ? expectedResult
                  : 'Select Expected Result'}
              </div>
              <ChevronDown
                className={`w-5 h-5 text-gray-400 transition-transform ${isExpectedResultDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isExpectedResultDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                <div className="py-1">
                  {descriptiveOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setValue('expectedResult', option.value, {
                          shouldValidate: true,
                        })
                        setIsExpectedResultDropdownOpen(false)
                      }}
                      className={`w-full px-3 py-2 text-left hover:bg-gray-50 text-sm flex items-center ${
                        expectedResult === option.value
                          ? 'text-blue-600'
                          : 'text-gray-900'
                      }`}>
                      {expectedResult === option.value && (
                        <Check className="w-4 h-4 mr-2" />
                      )}
                      <div className="text-xs">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          {errors.expectedResult && (
            <p className="mt-1 text-xs text-red-600">
              {errors.expectedResult.message}
            </p>
          )}
        </div>
      )}

      {/* Expected Result Field for Success Eval Rubric category */}
      {selectedCategory === 'Success Eval Rubric' && (
        <div>
          <label className="block text-sm font-normal mb-2">
            Expected Result
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setIsExpectedResultDropdownOpen(!isExpectedResultDropdownOpen)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-left bg-white flex items-center justify-between">
              <div
                className={
                  expectedResult && typeof expectedResult === 'string'
                    ? 'text-gray-900'
                    : 'text-gray-400'
                }>
                {expectedResult && typeof expectedResult === 'string'
                  ? expectedResult
                  : 'Select Expected Result'}
              </div>
              <ChevronDown
                className={`w-5 h-5 text-gray-400 transition-transform ${isExpectedResultDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isExpectedResultDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                <div className="py-1">
                  {successEvalRubricOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setValue('expectedResult', option.value, {
                          shouldValidate: true,
                        })
                        setIsExpectedResultDropdownOpen(false)
                      }}
                      className={`w-full px-3 py-2 text-left hover:bg-gray-50 text-sm flex items-center ${
                        expectedResult === option.value
                          ? 'text-blue-600'
                          : 'text-gray-900'
                      }`}>
                      {expectedResult === option.value && (
                        <Check className="w-4 h-4 mr-2" />
                      )}
                      <div className="text-xs">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          {errors.expectedResult && (
            <p className="mt-1 text-xs text-red-600">
              {errors.expectedResult.message}
            </p>
          )}
        </div>
      )}

      {/* Expected Result Field for Pass/Fail category */}
      {selectedCategory === 'Pass/Fail' && (
        <div>
          <label className="block text-sm font-normal mb-2">
            Expected Result
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setIsExpectedResultDropdownOpen(!isExpectedResultDropdownOpen)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-left bg-white flex items-center justify-between">
              <div
                className={
                  expectedResult && typeof expectedResult === 'string'
                    ? 'text-gray-900'
                    : 'text-gray-400'
                }>
                {expectedResult && typeof expectedResult === 'string'
                  ? expectedResult
                  : 'Select Expected Result'}
              </div>
              <ChevronDown
                className={`w-5 h-5 text-gray-400 transition-transform ${isExpectedResultDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isExpectedResultDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                <div className="py-1">
                  {passFailOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setValue('expectedResult', option.value, {
                          shouldValidate: true,
                        })
                        setIsExpectedResultDropdownOpen(false)
                      }}
                      className={`w-full px-3 py-2 text-left hover:bg-gray-50 text-sm flex items-center ${
                        expectedResult === option.value
                          ? 'text-blue-600'
                          : 'text-gray-900'
                      }`}>
                      {expectedResult === option.value && (
                        <Check className="w-4 h-4 mr-2" />
                      )}
                      <div className="text-xs">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          {errors.expectedResult && (
            <p className="mt-1 text-xs text-red-600">
              {errors.expectedResult.message}
            </p>
          )}
        </div>
      )}
    </form>
  )

  const footer = (
    <div className="flex justify-between">
      {/* Left side - Delete button (only in edit mode) */}
      <div>
        {initialData?.isEditing && onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="btn btn-md btn-outline-red mr-3 flex items-center gap-2">
            Delete
            {isDeleting && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-300 border-t-red-400"></div>
            )}
          </button>
        )}
      </div>

      {/* Right side - Cancel and Save buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleCancel}
          className="btn btn-md btn-gray">
          Cancel
        </button>
        <button
          type="submit"
          form="evaluation-form"
          disabled={!isValid}
          className={`btn btn-md ${
            isValid
              ? 'btn-primary'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-300'
          }`}>
          Save
        </button>
      </div>
    </div>
  )

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        initialData?.isEditing
          ? 'Edit Custom Evaluation'
          : 'Create Custom Evaluation'
      }
      position="right"
      size="large"
      content={content}
      footerClass="justify-end"
      footer={footer}
    />
  )
}

export default DrawerCustomEvaluation
