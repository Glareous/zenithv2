import { NextResponse } from 'next/server'

import { EventList } from '@src/dtos'
import fs from 'fs'
import path from 'path'

const dataFilePath = path.join(
  process.cwd(),
  'src/apidata/events/events_list.json'
)

const readData = (): EventList[] => {
  const jsonData = fs.readFileSync(dataFilePath, 'utf-8')
  return JSON.parse(jsonData)
}

const writeData = (data: EventList[]) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing file:', error)
  }
}

// **GET Request - Fetch All Event Lists**
export async function GET() {
  const eventList = readData()
  return NextResponse.json({
    message: 'Event List fetched successfully',
    data: eventList,
  })
}

// **POST Request - Create a New Event**
export async function POST(req: Request) {
  try {
    const newEvent: EventList = await req.json()
    const eventList = readData()
    newEvent.id = eventList.length > 0 ? eventList.length + 1 : 1
    eventList.push(newEvent)
    writeData(eventList)
    return NextResponse.json(
      {
        message: 'Event created successfully',
        data: newEvent,
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

// **PUT Request - Update an Event**
export async function PUT(req: Request) {
  try {
    const updatedEvent: EventList = await req.json()
    const eventList = readData()
    const index = eventList.findIndex((event) => event.id === updatedEvent.id)

    if (index !== -1) {
      eventList[index] = updatedEvent
      writeData(eventList)
      return NextResponse.json({
        message: 'Event updated successfully',
        data: updatedEvent,
      })
    } else {
      return NextResponse.json(
        {
          message: 'Event not found',
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

// **DELETE Request - Delete an Event**
export async function DELETE(req: Request) {
  try {
    const { id }: { id: number } = await req.json()
    const eventList = readData()
    const filteredEvents = eventList.filter((event) => event.id !== id)

    if (eventList.length === filteredEvents.length) {
      return NextResponse.json(
        {
          message: `Event ID ${id} not found`,
        },
        { status: 404 }
      )
    } else {
      writeData(filteredEvents)
      return NextResponse.json({
        data: id,
        message: 'Event successfully deleted',
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
