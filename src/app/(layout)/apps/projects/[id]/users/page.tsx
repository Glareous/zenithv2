'use client'

import React, { ReactElement, useMemo, useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import { NextPageWithLayout } from '@src/dtos'
import Layout from '@src/layout/Layout'
import { api } from '@src/trpc/react'
import BasicAvatar from '@src/views/UiElements/Ui-Avatar/BasicAvatar'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Select from 'react-select'

interface ProjectMember {
  id: string
  role: 'ADMIN' | 'MEMBER'
  joinedAt: Date
  user: {
    id: string
    firstName: string
    lastName: string
    email: string | null
    image: string | null
  }
  project: {
    id: string
    name: string
  }
}

const options = [
  { label: 'All', value: 'All' },
  { label: 'This Month', value: 'This Month' },
  { label: 'Last Month', value: 'Last Month' },
  { label: 'Last Year', value: 'Last Year' },
  { label: 'Last Week', value: 'Last Week' },
  { label: 'This Year', value: 'This Year' },
]

const ProjectsUsers: NextPageWithLayout = () => {
  const params = useParams()
  const id = params.id as string
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(8)
  const [filter] = useState('')

  // Fetch project members using tRPC
  const {
    data: members = [],
    isLoading,
    error,
  } = api.projectMember.getAll.useQuery({ projectId: id })

  const filteredMembers = useMemo(() => {
    const now = new Date()
    const filterOptions: { [key: string]: () => ProjectMember[] } = {
      'Last Month': () => {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        return members.filter(
          (member) => new Date(member.joinedAt) >= lastMonth
        )
      },
      'This Month': () => {
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        return members.filter(
          (member) => new Date(member.joinedAt) >= thisMonth
        )
      },
      'Last Week': () => {
        const lastWeek = new Date()
        lastWeek.setDate(now.getDate() - 7)
        return members.filter((member) => new Date(member.joinedAt) >= lastWeek)
      },
      'Last Year': () => {
        const lastYear = new Date(
          now.getFullYear() - 1,
          now.getMonth(),
          now.getDate()
        )
        return members.filter((member) => new Date(member.joinedAt) >= lastYear)
      },
      'This Year': () => {
        const thisYear = new Date(now.getFullYear(), 0, 1)
        return members.filter((member) => new Date(member.joinedAt) >= thisYear)
      },
    }
    return filter === '' ? members : filterOptions[filter]()
  }, [filter, members])

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage)
  const displayedMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  return (
    <React.Fragment>
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h6>Users ({filteredMembers.length})</h6>
          <div className="w-36">
            <Select
              className="react-select-container"
              classNamePrefix="react-select"
              options={options}
              isMulti={false}
              isClearable={true}
              placeholder="Select"
              id="preselectMultipleValue"
            />
          </div>{' '}
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-space mt-space">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="card">
                <div className="text-center card-body">
                  <div className="mx-auto mb-4 bg-gray-200 rounded-full dark:bg-dark-850 size-14 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-dark-850 rounded mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 dark:bg-dark-850 rounded mb-1 animate-pulse w-16 mx-auto"></div>
                  <div className="h-3 bg-gray-200 dark:bg-dark-850 rounded animate-pulse w-20 mx-auto"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-8 text-red-500">
            Error loading project members: {error.message}
          </div>
        )}

        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-space mt-space">
            {displayedMembers.map((member: ProjectMember) => (
              <div key={member.id} className="card">
                <div className="text-center card-body">
                  {member.user.image ? (
                    <Image
                      src={member.user.image}
                      alt="userImg"
                      width={56}
                      height={56}
                      className="mx-auto mb-4 rounded-full size-14 lazy"
                    />
                  ) : (
                    <div className="mx-auto mb-4 bg-gray-200 rounded-full dark:bg-dark-850 size-14 flex items-center justify-center text-gray-500">
                      {member.user.firstName?.[0] ||
                        member.user.email?.[0]?.toUpperCase() ||
                        '?'}
                    </div>
                  )}
                  <h6>
                    <Link href={`/page/user/${member.user.id}`}>
                      {member.user.firstName && member.user.lastName
                        ? `${member.user.firstName} ${member.user.lastName}`
                        : member.user.email || 'Unknown User'}
                    </Link>
                  </h6>
                  <p className="mt-1 text-gray-500 dark:text-dark-500">
                    {member.role}
                  </p>
                  <p className="mt-1 text-xs text-gray-400 dark:text-dark-400">
                    Joined: {new Date(member.joinedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-12 gap-5 mb-5">
          <div className="col-span-12 md:col-span-6">
            <p className="text-gray-500 dark:text-dark-500">
              Showing <b>{(currentPage - 1) * itemsPerPage + 1}</b> -
              <b>
                {Math.min(currentPage * itemsPerPage, filteredMembers.length)}
              </b>{' '}
              of
              <b>{filteredMembers.length}</b> Results
            </p>
          </div>
          <div className="col-span-12 md:col-span-6">
            <div className="flex justify-end pagination pagination-primary">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="pagination-pre">
                <ChevronLeft className="mr-1 ltr:inline-block rtl:hidden size-4" />
                <ChevronRight className="ml-1 ltr:hidden rtl:inline-block size-4" />
                Prev
              </button>
              {[...Array(totalPages)].map((_, pageIndex) => (
                <button
                  key={pageIndex}
                  onClick={() => setCurrentPage(pageIndex + 1)}
                  className={`pagination-item ${currentPage === pageIndex + 1 ? 'active' : ''}`}>
                  {pageIndex + 1}
                </button>
              ))}
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="pagination-next">
                Next
                <ChevronRight className="ml-1 ltr:inline-block rtl:hidden size-4" />
                <ChevronLeft className="mr-1 ltr:hidden rtl:inline-block size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

ProjectsUsers.getLayout = (page: ReactElement) => {
  return <Layout>{page}</Layout>
}

export default ProjectsUsers
