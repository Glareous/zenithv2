'use client'

import React, { useMemo, useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import BreadCrumb from '@src/components/common/BreadCrumb'
import DeleteModal from '@src/components/common/DeleteModal'
import Pagination from '@src/components/common/Pagination'
import { LAYOUT_DIRECTION } from '@src/components/constants/layout'
import TableContainer from '@src/components/custom/table/table'
import { NextPageWithLayout } from '@src/dtos'
import { RootState } from '@src/slices/reducer'
import { api } from '@src/trpc/react'
import { CirclePlus, Eye, Pencil, Search, Trash2 } from 'lucide-react'
import { useSelector } from 'react-redux'
import Select from 'react-select'
import { ToastContainer, toast } from 'react-toastify'

const RrhhList: NextPageWithLayout = () => {
  const { layoutMode, layoutDirection } = useSelector(
    (state: RootState) => state.Layout
  )
  const { currentProject } = useSelector((state: RootState) => state.Project)

  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedClass, setSelectedClass] = useState<{
    value: string
    label: string
  } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const [show, setShow] = useState<boolean>(false)
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)

  const { data, isLoading, refetch } = api.projectEmployee.getAll.useQuery(
    {
      projectId: currentProject?.id || '',
      page: currentPage,
      limit: itemsPerPage,
      search: searchQuery,
      class: selectedClass?.value || undefined,
    },
    {
      enabled: !!currentProject?.id,
    }
  )

  const { data: classes } = api.projectEmployee.getClasses.useQuery(
    {
      projectId: currentProject?.id || '',
    },
    {
      enabled: !!currentProject?.id,
    }
  )

  const deleteMutation = api.projectEmployee.delete.useMutation({
    onSuccess: () => {
      toast.success('Employee deleted successfully')
      refetch()
      setShow(false)
      setSelectedEmployee(null)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete employee')
    },
  })

  const handleDeleteList = () => {
    if (selectedEmployee) {
      deleteMutation.mutate({ id: selectedEmployee.id })
    }
  }

  const onClickEventListDelete = (employee: any) => {
    setSelectedEmployee(employee)
    setShow(true)
  }

  const toggleDelete = () => {
    setShow(false)
    setSelectedEmployee(null)
  }

  const handleEdit = (employee: any) => {
    localStorage.setItem('editEmployeeId', employee.id)
    router.push('/apps/rrhh/rrhh-admission')
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const handleClassChange = (
    selectedOption: { value: string; label: string } | null
  ) => {
    setSelectedClass(selectedOption)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const classOptions = useMemo(() => {
    if (!classes) return []
    return classes.map((cls) => ({ value: cls, label: cls }))
  }, [classes])

  const columns = useMemo(
    () => [
      {
        header: 'ID',
        accessorKey: 'employeeId',
      },
      {
        header: 'Employee Name',
        cell: ({ row }: { row: { original: any } }) => {
          const { image, firstName, lastName } = row.original
          return (
            <div className="flex items-center gap-3">
              <div className="relative text-gray-500 bg-gray-100 rounded-full dark:text-dark-500 dark:bg-dark-850 size-8">
                {image ? (
                  <Image
                    src={image}
                    alt="employeeImg"
                    className="rounded-full"
                    style={{ width: '32px', height: '32px' }}
                    width={32}
                    height={32}
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-500 bg-gray-100 rounded-full dark:text-dark-500 dark:bg-dark-850">
                    {firstName.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <h6>
                  <Link href={`/apps/rrhh/rrhh-overview?id=${row.original.id}`}>
                    {firstName} {lastName}
                  </Link>
                </h6>
              </div>
            </div>
          )
        },
      },
      {
        header: 'Gender',
        accessorKey: 'gender',
      },
      {
        header: 'Roll No',
        accessorKey: 'rollNo',
      },
      {
        header: 'Class',
        accessorKey: 'class',
      },
      {
        header: 'Phone',
        accessorKey: 'phone',
      },
      {
        header: 'Email',
        accessorKey: 'email',
      },
      {
        header: 'Birth Date',
        cell: ({ row }: { row: { original: any } }) => {
          if (!row.original.birthDate) return '-'
          return new Date(row.original.birthDate).toLocaleDateString()
        },
      },
      {
        header: 'Joining Date',
        cell: ({ row }: { row: { original: any } }) => {
          if (!row.original.admissionDate) return '-'
          return new Date(row.original.admissionDate).toLocaleDateString()
        },
      },
      {
        header: 'Action',
        cell: ({ row }: { row: { original: any } }) => (
          <div className="flex items-center gap-2">
            <button
              className="btn btn-sub-primary btn-icon !size-8"
              onClick={() => {
                router.push(`/apps/rrhh/rrhh-overview?id=${row.original.id}`)
              }}>
              <Eye className="size-4" />
            </button>
            <button
              className="btn btn-sub-gray btn-icon !size-8"
              onClick={() => handleEdit(row.original)}>
              <Pencil className="size-4" />
            </button>
            <button
              className="btn btn-sub-red btn-icon !size-8"
              onClick={(e) => {
                e.preventDefault()
                onClickEventListDelete(row.original)
              }}>
              <Trash2 className="size-4" />
            </button>
          </div>
        ),
      },
    ],
    []
  )

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Please select a project first</p>
      </div>
    )
  }

  return (
    <React.Fragment>
      <BreadCrumb title="List View" subTitle="Employees" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 card">
          <div className="card-header">
            <div className="flex flex-wrap justify-between gap-5">
              <div>
                <div className="relative group/form grow">
                  <input
                    type="text"
                    className="ltr:pl-9 rtl:pr-9 form-input ltr:group-[&.right]/form:pr-9 rtl:group-[&.right]/form:pl-9 ltr:group-[&.right]/form:pl-4 rtl:group-[&.right]/form:pr-4"
                    placeholder="Search employee, class etc. ..."
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                  <button className="absolute inset-y-0 flex items-center ltr:left-3 rtl:right-3 ltr:group-[&.right]/form:right-3 rtl:group-[&.right]/form:left-3 ltr:group-[&.right]/form:left-auto rtl:group-[&.right]/form:right-auto focus:outline-hidden">
                    <Search className="text-gray-500 size-4 fill-gray-100 dark:text-dark-500 dark:fill-dark-850" />
                  </button>
                </div>
              </div>
              <div>
                <div className="items-center gap-5 sm:flex">
                  <div id="sortingByClass" className="w-full">
                    <Select
                      classNamePrefix="select"
                      options={classOptions}
                      value={selectedClass}
                      onChange={handleClassChange}
                      placeholder="Filter by class"
                      isClearable={true}
                    />
                  </div>
                  <Link
                    href="/apps/rrhh/rrhh-admission"
                    className="mt-5 btn btn-primary shrink-0 sm:mt-0 flex items-center"
                    onClick={() => localStorage.removeItem('editEmployeeId')}>
                    <CirclePlus className="size-4 text-center mr-1" /> Add
                    Employee
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-0 card-body">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-gray-500">Loading employees...</p>
              </div>
            ) : (
              <div>
                <TableContainer
                  columns={columns || []}
                  data={data?.employees || []}
                  thClass="!font-medium cursor-pointer"
                  divClass="overflow-x-auto table-box whitespace-nowrap"
                  tableClass="table flush"
                  thtrClass="text-gray-500 bg-gray-100 dark:bg-dark-850 dark:text-dark-500"
                />
                {data && data.pagination.total > 0 && (
                  <Pagination
                    totalItems={data.pagination.total}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                  />
                )}
                {data && data.pagination.total === 0 && (
                  <div className="py-8 text-center">
                    <p className="text-gray-500">No employees found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <ToastContainer
        theme={layoutMode}
        rtl={layoutDirection === LAYOUT_DIRECTION.RTL}
        position={
          layoutDirection === LAYOUT_DIRECTION.RTL ? 'top-left' : 'top-right'
        }
      />

      <DeleteModal
        show={show}
        handleHide={toggleDelete}
        deleteModalFunction={handleDeleteList}
      />
    </React.Fragment>
  )
}

export default RrhhList
