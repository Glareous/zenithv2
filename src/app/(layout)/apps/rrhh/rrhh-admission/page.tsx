'use client'

import React, { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import BreadCrumb from '@src/components/common/BreadCrumb'
import { Tab, Tabs } from '@src/components/custom/tabs/tab'
import { NextPageWithLayout } from '@src/dtos'
import { RootState } from '@src/slices/reducer'
import { api } from '@src/trpc/react'
import ApplicationOverviewTab from '@src/views/Apps/school/studentsAdmission/ApplicationOverviewTab'
import DocumentsTab from '@src/views/Apps/school/studentsAdmission/DocumentsTab'
import EducationalBackground from '@src/views/Apps/school/studentsAdmission/EducationalBackground'
import PersonalDetailsTab from '@src/views/Apps/school/studentsAdmission/PersonalDetailsTab'
import { FormProvider, useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { z } from 'zod'

const employeeFormSchema = z.object({
  employeeId: z
    .string()
    .min(1, 'Employee ID is required')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Employee ID can only contain letters, numbers, hyphens, and underscores'
    ),
  firstName: z
    .string()
    .min(1, 'First name is required')
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/,
      'First name can only contain letters, spaces, hyphens, and apostrophes'
    ),
  middleName: z
    .string()
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]*$/,
      'Middle name can only contain letters, spaces, hyphens, and apostrophes'
    )
    .optional(),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/,
      'Last name can only contain letters, spaces, hyphens, and apostrophes'
    ),
  gender: z.string().min(1, 'Gender is required'),
  age: z.string().optional(),
  birthDate: z.string().optional(),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(
      /^[\d\s+()-]+$/,
      'Phone number can only contain numbers, spaces, plus sign, hyphens, and parentheses'
    ),
  alternativePhone: z
    .string()
    .regex(
      /^[\d\s+()-]*$/,
      'Alternative phone can only contain numbers, spaces, plus sign, hyphens, and parentheses'
    )
    .optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  nationality: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  pinCode: z.string().optional(),
  rollNo: z.string().optional(),
  class: z.string().optional(),
  admissionDate: z.string().optional(),

  religion: z.string().optional(),
  fatherName: z
    .string()
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]*$/,
      'Father name can only contain letters, spaces, hyphens, and apostrophes'
    )
    .optional(),
  motherName: z
    .string()
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]*$/,
      'Mother name can only contain letters, spaces, hyphens, and apostrophes'
    )
    .optional(),
  fatherOccupation: z.string().optional(),
  parentsPhone: z
    .string()
    .regex(
      /^[\d\s+()-]*$/,
      'Parents phone can only contain numbers, spaces, plus sign, hyphens, and parentheses'
    )
    .optional(),
})

const stepValidationFields = {
  1: [
    'employeeId',
    'firstName',
    'lastName',
    'gender',
    'phone',
  ] as (keyof EmployeeFormData)[],
  2: [] as (keyof EmployeeFormData)[],
  3: [] as (keyof EmployeeFormData)[],
  4: [] as (keyof EmployeeFormData)[],
}

export type EmployeeFormData = z.infer<typeof employeeFormSchema>

const RrhhAdmission: NextPageWithLayout = () => {
  const router = useRouter()
  const { currentProject } = useSelector((state: RootState) => state.Project)
  const [currentTab, setCurrentTab] = useState(0)
  const [editEmployeeId, setEditEmployeeId] = useState<string | null>(null)

  const methods = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeFormSchema),
    mode: 'onChange',
    defaultValues: {
      employeeId: '',
      firstName: '',
      middleName: '',
      lastName: '',
      gender: '',
      age: '',
      birthDate: '',
      phone: '',
      alternativePhone: '',
      email: '',
      nationality: '',
      address: '',
      city: '',
      country: '',
      pinCode: '',
      rollNo: '',
      class: '',
      admissionDate: '',
      religion: '',
      fatherName: '',
      motherName: '',
      fatherOccupation: '',
      parentsPhone: '',
    },
  })

  useEffect(() => {
    const storedEditId = localStorage.getItem('editEmployeeId')
    setEditEmployeeId(storedEditId)
  }, [])

  const { data: employee } = api.projectEmployee.getById.useQuery(
    { id: editEmployeeId || '' },
    { enabled: !!editEmployeeId }
  )

  useEffect(() => {
    if (employee) {
      methods.reset({
        employeeId: employee.employeeId,
        firstName: employee.firstName,
        middleName: employee.middleName || '',
        lastName: employee.lastName,
        gender: employee.gender || '',
        age: employee.age || '',
        birthDate: employee.birthDate
          ? new Date(employee.birthDate).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          : '',
        phone: employee.phone || '',
        alternativePhone: employee.alternativePhone || '',
        email: employee.email || '',
        nationality: employee.nationality || '',
        address: employee.address || '',
        city: employee.city || '',
        country: employee.country || '',
        pinCode: employee.pinCode || '',
        rollNo: employee.rollNo || '',
        class: employee.class || '',
        admissionDate: employee.admissionDate
          ? new Date(employee.admissionDate).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          : '',
        religion: employee.religion || '',
        fatherName: employee.fatherName || '',
        motherName: employee.motherName || '',
        fatherOccupation: employee.fatherOccupation || '',
        parentsPhone: employee.parentsPhone || '',
      })
    }
  }, [employee, methods])

  const createMutation = api.projectEmployee.create.useMutation({
    onError: (error) => {
      toast.error(error.message || 'Failed to create employee')
    },
  })

  const updateMutation = api.projectEmployee.update.useMutation({
    onError: (error) => {
      toast.error(error.message || 'Failed to update employee')
    },
  })

  const handleNextTab = async (tabIndex: number) => {
    const currentStepFields =
      stepValidationFields[(tabIndex + 1) as keyof typeof stepValidationFields]

    if (currentStepFields.length > 0) {
      const isValid = await methods.trigger(currentStepFields as any)
      if (!isValid) {
        toast.error('Please fill in all required fields')
        return
      }
    }

    if (!currentProject) {
      toast.error('Please select a project first')
      return
    }

    const formData = methods.getValues()

    const employeeData = {
      ...formData,
      birthDate: formData.birthDate ? new Date(formData.birthDate) : undefined,
      admissionDate: formData.admissionDate
        ? new Date(formData.admissionDate)
        : undefined,
      projectId: currentProject.id,
    }

    if (tabIndex === 0 && !editEmployeeId) {
      try {
        const newEmployee = await createMutation.mutateAsync(employeeData)

        setEditEmployeeId(newEmployee.id)
        localStorage.setItem('editEmployeeId', newEmployee.id)
        toast.success('Employee created. Continue to next step.')
        setCurrentTab(tabIndex + 1)
      } catch (error) {
        return
      }
    } else if (tabIndex >= 1 && tabIndex <= 2 && editEmployeeId) {
      try {
        await updateMutation.mutateAsync({
          id: editEmployeeId,
          ...employeeData,
        })
        setCurrentTab(tabIndex + 1)
      } catch (error) {
        return
      }
    } else if (editEmployeeId) {
      try {
        await updateMutation.mutateAsync({
          id: editEmployeeId,
          ...employeeData,
        })
        setCurrentTab(tabIndex + 1)
      } catch (error) {
        return
      }
    } else {
      setCurrentTab(tabIndex + 1)
    }
  }

  const handlePreviousTab = () => {
    setCurrentTab((prev) => Math.max(0, prev - 1))
  }

  const handleFinalSubmit = async () => {
    if (!currentProject) {
      toast.error('Please select a project first')
      return
    }

    if (!editEmployeeId) {
      toast.error('Employee not created. Please go back to step 1.')
      return
    }

    const formData = methods.getValues()

    const employeeData = {
      ...formData,
      birthDate: formData.birthDate ? new Date(formData.birthDate) : undefined,
      admissionDate: formData.admissionDate
        ? new Date(formData.admissionDate)
        : undefined,
      projectId: currentProject.id,
    }

    try {
      await updateMutation.mutateAsync({
        id: editEmployeeId,
        ...employeeData,
      })
      toast.success('Employee submitted successfully')
      localStorage.removeItem('editEmployeeId')
      router.push('/apps/rrhh/rrhh-list')
    } catch (error) {}
  }

  return (
    <FormProvider {...methods}>
      <React.Fragment>
        <BreadCrumb
          title={editEmployeeId ? 'Edit Employee' : 'Admission Form'}
          subTitle="Rrhh"
        />
        <div className="">
          <div className="col-span-12 xl:col-span-8 2xl:col-span-9">
            <div className="card">
              <div className="card-header">
                <Tabs
                  activeTab={currentTab}
                  onTabChange={setCurrentTab}
                  ulProps="overflow-x-auto tabs-pills flex justify-between items-center"
                  otherClass="nav-item [&.active]:bg-primary-500 [&.active]:text-primary-50"
                  activeTabClass="bg-primary-500 text-primary-50"
                  inactiveTabClass="text-gray-500 hover:text-primary-500"
                  contentProps="mt-4">
                  <Tab label="Personal Details">
                    <PersonalDetailsTab
                      onNextTab={() => handleNextTab(0)}
                      isLoading={
                        createMutation.isPending || updateMutation.isPending
                      }
                    />
                  </Tab>
                  <Tab label="Educational Background">
                    <EducationalBackground
                      onPreviousTab={handlePreviousTab}
                      onNextTab={() => handleNextTab(1)}
                      isLoading={
                        createMutation.isPending || updateMutation.isPending
                      }
                    />
                  </Tab>
                  <Tab label="Documents">
                    <DocumentsTab
                      onPreviousTab={handlePreviousTab}
                      onNextTab={() => handleNextTab(2)}
                      isLoading={
                        createMutation.isPending || updateMutation.isPending
                      }
                      employeeId={editEmployeeId}
                    />
                  </Tab>
                  <Tab label="Application Overview">
                    <ApplicationOverviewTab
                      onPreviousTab={handlePreviousTab}
                      onSubmit={handleFinalSubmit}
                      isLoading={
                        createMutation.isPending || updateMutation.isPending
                      }
                    />
                  </Tab>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    </FormProvider>
  )
}

export default RrhhAdmission
