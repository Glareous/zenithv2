import { NextResponse } from 'next/server'

import { EventGrid } from '@src/dtos'
import fs from 'fs'
import path from 'path'

const dataFilePath = path.join(
  process.cwd(),
  'src/apidata/events/events_grid.json'
)

const readData = (): EventGrid[] => {
  const jsonData = fs.readFileSync(dataFilePath, 'utf-8')
  return JSON.parse(jsonData)
}

const writeData = (data: EventGrid[]) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing file:', error)
  }
}

// **GET Request - Fetch All Event Grids**
export async function GET() {
  const eventListGrid = readData()
  return NextResponse.json({
    message: 'Event Grid fetched successfully',
    data: eventListGrid,
  })
}

// **POST Request - Create a New Event Grid**
export async function POST(req: Request) {
  try {
    const newEventGrid: EventGrid = await req.json()
    const eventGrid = readData()
    newEventGrid.id = eventGrid.length > 0 ? eventGrid.length + 1 : 1
    eventGrid.push(newEventGrid)
    writeData(eventGrid)
    return NextResponse.json(
      {
        message: 'Event Grid created successfully',
        data: newEventGrid,
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

// **PUT Request - Update an Event Grid**
export async function PUT(req: Request) {
  try {
    const updatedEventGrid: EventGrid = await req.json()
    const eventGrid = readData()
    const index = eventGrid.findIndex(
      (event) => event.id === updatedEventGrid.id
    )

    if (index !== -1) {
      eventGrid[index] = updatedEventGrid
      writeData(eventGrid)
      return NextResponse.json({
        message: 'Event Grid updated successfully',
        data: updatedEventGrid,
      })
    } else {
      return NextResponse.json(
        {
          message: 'Event Grid not found',
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

// **DELETE Request - Delete an Event Grid**
export async function DELETE(req: Request) {
  try {
    const { id }: { id: number } = await req.json()
    const eventList = readData()
    const filteredEventGrid = eventList.filter((event) => event.id !== id)

    if (eventList.length === filteredEventGrid.length) {
      return NextResponse.json(
        {
          message: `Event Grid ID ${id} not found`,
        },
        { status: 404 }
      )
    } else {
      writeData(filteredEventGrid)
      return NextResponse.json({
        data: id,
        message: 'Event Grid successfully deleted',
      })
    }
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      {
        message: 'Internal server error',
        data: null,
      },
      { status: 500 }
    )
  }
}
