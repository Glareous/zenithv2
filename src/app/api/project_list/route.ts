import { NextRequest, NextResponse } from 'next/server'

import { ProjectList } from '@src/dtos'
import fs from 'fs'
import path from 'path'

const dataFilePath = path.join(process.cwd(), 'src/apidata/projects/list.json')

const readData = (): ProjectList[] => {
  const jsonData = fs.readFileSync(dataFilePath, 'utf-8')
  return JSON.parse(jsonData)
}

const writeData = (data: ProjectList[]) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing file:', error)
  }
}

// GET: Fetch all projects
export async function GET() {
  const projectsList = readData()
  return NextResponse.json(
    {
      message: 'Projects List fetched successfully',
      data: projectsList,
    },
    { status: 200 }
  )
}

// POST: Add a new project
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const newProject: ProjectList = body
    const projectsList = readData()
    newProject.id = projectsList.length > 0 ? projectsList.length + 1 : 1
    projectsList.push(newProject)
    writeData(projectsList)

    return NextResponse.json(
      {
        message: 'Projects List created successfully',
        data: newProject,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      {
        message: 'Internal server error',
        data: null,
      },
      { status: 500 }
    )
  }
}

// PUT: Update a project record
export async function PUT(req: NextRequest) {
  try {
    const updatedProject: ProjectList = await req.json()
    const projectsList = readData()
    const index = projectsList.findIndex(
      (project) => project.id === updatedProject.id
    )

    if (index !== -1) {
      projectsList[index] = updatedProject
      writeData(projectsList)
      return NextResponse.json(
        {
          message: 'Projects List updated successfully',
          data: updatedProject,
        },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        {
          message: 'Projects List not found',
          data: null,
        },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      {
        message: 'Internal server error',
        data: null,
      },
      { status: 500 }
    )
  }
}

// DELETE: Remove a project record
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json()
    const id: number = parseInt(body.id)
    const projectsList = readData()
    const filteredProjects = projectsList.filter((project) => project.id !== id)

    if (projectsList.length === filteredProjects.length) {
      return NextResponse.json(
        {
          message: `Project with ID ${id} not found`,
        },
        { status: 404 }
      )
    } else {
      writeData(filteredProjects)
      return NextResponse.json(
        {
          data: id,
          message: 'Projects List record successfully deleted',
        },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      {
        message: 'Internal server error',
        data: null,
      },
      { status: 500 }
    )
  }
}
