import { NextResponse } from 'next/server'

import { EventItem } from '@src/dtos'
import fs from 'fs'
import path from 'path'

const dataFilePath = path.join(
  process.cwd(),
  'src/apidata/calendar/calendar.json'
)

const readData = (): EventItem[] => {
  const jsonData = fs.readFileSync(dataFilePath, 'utf-8')
  return JSON.parse(jsonData)
}

const writeData = (data: EventItem[]) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing file:', error)
  }
}

// GET Request - Fetch Calendar Data
export async function GET() {
  const calendar = readData()
  return NextResponse.json({
    message: 'Calendar fetched successfully',
    data: calendar,
  })
}

// POST Request - Create a Calendar Record
export async function POST(req: Request) {
  try {
    const newProject: EventItem = await req.json()
    const calendar = readData()
    newProject.id = calendar.length > 0 ? calendar.length + 1 : 1
    calendar.unshift(newProject)
    writeData(calendar)
    return NextResponse.json(
      {
        message: 'Calendar created successfully',
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

// PUT Request - Update a Calendar Record
export async function PUT(req: Request) {
  try {
    const updatedProject: EventItem = await req.json()
    const allCalendars = readData()
    const index = allCalendars.findIndex(
      (project) => project.id === updatedProject.id
    )

    if (index !== -1) {
      allCalendars[index] = updatedProject
      writeData(allCalendars)
      return NextResponse.json({
        message: 'Calendar updated successfully',
        data: updatedProject,
      })
    } else {
      return NextResponse.json(
        {
          message: 'Calendar not found',
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

// DELETE Request - Delete a Calendar Record
export async function DELETE(req: Request) {
  try {
    const { id }: { id: number } = await req.json()
    const calendarsData = readData()
    const filteredCalendars = calendarsData.filter(
      (project) => project.id !== id
    )

    if (calendarsData.length === filteredCalendars.length) {
      return NextResponse.json(
        {
          message: `Project with ID ${id} not found`,
        },
        { status: 404 }
      )
    } else {
      writeData(filteredCalendars)
      return NextResponse.json({
        data: id,
        message: 'Calendar record successfully deleted',
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
