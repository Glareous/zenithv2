'use client'

import React from 'react'

import Image from 'next/image'

import { RootState } from '@src/slices/reducer'
import { api } from '@src/trpc/react'
import { useSelector } from 'react-redux'
import SimpleBar from 'simplebar-react'

interface EmployeeMenuProps {
  selectedEmployeeId: string | null
  onSelectEmployee: (employeeId: string) => void
}

const EmployeeMenu: React.FC<EmployeeMenuProps> = ({
  selectedEmployeeId,
  onSelectEmployee,
}) => {
  const { currentProject } = useSelector((state: RootState) => state.Project)

  const { data: employeesData, isLoading } =
    api.projectEmployee.getAll.useQuery(
      { projectId: currentProject?.id || '', limit: 100 },
      { enabled: !!currentProject?.id }
    )

  const employees = employeesData?.employees || []

  if (isLoading) {
    return (
      <div className="col-span-12 2xl:col-span-1 card">
        <div className="card-body flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!currentProject) {
    return (
      <div className="col-span-12 2xl:col-span-1 card">
        <div className="card-body text-center text-sm text-gray-500">
          No project selected
        </div>
      </div>
    )
  }

  return (
    <React.Fragment>
      <div className="col-span-12 2xl:col-span-1 card">
        <SimpleBar className="max-h-[calc(100vh_-_13rem)]">
          <div className="flex gap-4 2xl:flex-col *:shrink-0 card-body">
            {employees && employees.length > 0 ? (
              employees.map((employee) => {
                const isActive = selectedEmployeeId === employee.id
                const employeeName = `${employee.firstName} ${employee.lastName}`
                const initials = `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`

                return (
                  <button
                    key={employee.id}
                    onClick={() => onSelectEmployee(employee.id)}
                    title={employeeName}
                    className={`relative flex items-center justify-center font-semibold transition duration-200 ease-linear bg-gray-100 rounded-full dark:bg-dark-850 size-14 hover:ring-2 hover:ring-offset-2 dark:hover:ring-offset-dark-900 hover:ring-primary-500 ${
                      isActive
                        ? 'ring-2 ring-offset-2 dark:ring-offset-dark-900 ring-primary-500'
                        : ''
                    }`}>
                    {employee.image ? (
                      <Image
                        src={employee.image}
                        alt={employeeName}
                        className="rounded-full size-14 object-cover"
                        width={56}
                        height={56}
                      />
                    ) : (
                      <span className="text-sm">{initials}</span>
                    )}
                    {employee.isActive && (
                      <span className="absolute bottom-0 bg-green-500 border-2 border-white rounded-full dark:border-dark-900 right-1 size-3"></span>
                    )}
                  </button>
                )
              })
            ) : (
              <div className="text-center text-sm text-gray-500 p-4">
                No employees found
              </div>
            )}
          </div>
        </SimpleBar>
      </div>
    </React.Fragment>
  )
}

export default EmployeeMenu
