'use client'

import React from 'react'

import { useParams } from 'next/navigation'

import { NextPageWithLayout } from '@src/dtos'
import { api } from '@src/trpc/react'

const ProjectsOverview: NextPageWithLayout = () => {
  const params = useParams()
  const id = params.id as string

  const {
    data: project,
    isLoading,
    error,
  } = api.project.getById.useQuery({ id })

  if (isLoading) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="text-red-500">
            Error loading project: {error.message}
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="text-gray-500">Project not found</div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-12 gap-x-space">
      <div className="col-span-12 card">
        <div className="card-header">
          <h6 className="card-title">Project Overview</h6>
        </div>
        <div className="card-body">
          {project.description ? (
            <p className="text-gray-500 dark:text-dark-500">
              {project.description}
            </p>
          ) : (
            <p className="text-gray-400 dark:text-dark-400 italic">
              No description provided for this project.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProjectsOverview
