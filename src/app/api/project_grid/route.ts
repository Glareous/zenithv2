import { NextResponse } from 'next/server'

import { ProjectList } from '@src/dtos'
import fs from 'fs'
import path from 'path'

const dataFilePath = path.join(process.cwd(), 'src/apidata/projects/grid.json')

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

// **GET Request - Fetch All Projects**
export async function GET() {
  const projectsGrid = readData()
  return NextResponse.json({
    message: 'Projects grid fetched successfully',
    data: projectsGrid,
  })
}

// **POST Request - Create a New Project**
export async function POST(req: Request) {
  try {
    const newProject: ProjectList = await req.json()
    const projectsGrid = readData()
    newProject.id = projectsGrid.length > 0 ? projectsGrid.length + 1 : 1
    projectsGrid.push(newProject)
    writeData(projectsGrid)
    return NextResponse.json(
      {
        message: 'Projects Grid created successfully',
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

// **PUT Request - Update an Existing Project**
export async function PUT(req: Request) {
  try {
    const updatedProject: ProjectList = await req.json()
    const projectsGrid = readData()
    const index = projectsGrid.findIndex(
      (project) => project.id === updatedProject.id
    )

    if (index !== -1) {
      projectsGrid[index] = updatedProject
      writeData(projectsGrid)
      return NextResponse.json({
        message: 'Projects Grid updated successfully',
        data: updatedProject,
      })
    } else {
      return NextResponse.json(
        {
          message: 'Project not found',
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

// **DELETE Request - Remove a Project**
export async function DELETE(req: Request) {
  try {
    const { id }: { id: number } = await req.json()
    const projectsGrid = readData()
    const filteredProjects = projectsGrid.filter((project) => project.id !== id)

    if (projectsGrid.length === filteredProjects.length) {
      return NextResponse.json(
        {
          message: `Project with ID ${id} not found`,
        },
        { status: 404 }
      )
    } else {
      writeData(filteredProjects)
      return NextResponse.json({
        data: id,
        message: 'Project record successfully deleted',
      })
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
