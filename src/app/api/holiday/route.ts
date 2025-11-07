import { NextResponse } from 'next/server'

import { StaffList } from '@src/dtos'
import fs from 'fs'
import path from 'path'

const dataFilePath = path.join(
  process.cwd(),
  'src/apidata/hospital/staff/holiday.json'
)

const readData = (): StaffList[] => {
  const jsonData = fs.readFileSync(dataFilePath, 'utf-8')
  return JSON.parse(jsonData)
}

const writeData = (data: StaffList[]) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing file:', error)
  }
}

// **GET Request - Fetch All Holidays**
export async function GET() {
  const holidayList = readData()
  return NextResponse.json({
    message: 'Holiday list fetched successfully',
    data: holidayList,
  })
}

// **POST Request - Create a New Holiday Record**
export async function POST(req: Request) {
  try {
    const newHoliday: StaffList = await req.json()
    const holidayList = readData()
    newHoliday.id = holidayList.length > 0 ? holidayList.length + 1 : 1
    holidayList.push(newHoliday)
    writeData(holidayList)
    return NextResponse.json(
      {
        message: 'Holiday added successfully',
        data: newHoliday,
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

// **PUT Request - Update a Holiday Record**
export async function PUT(req: Request) {
  try {
    const updatedHoliday: StaffList = await req.json()
    const holidayList = readData()
    const index = holidayList.findIndex(
      (staff) => staff.id === updatedHoliday.id
    )

    if (index !== -1) {
      holidayList[index] = updatedHoliday
      writeData(holidayList)
      return NextResponse.json({
        message: 'Holiday updated successfully',
        data: updatedHoliday,
      })
    } else {
      return NextResponse.json(
        {
          message: 'Holiday not found',
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

// **DELETE Request - Delete a Holiday Record**
export async function DELETE(req: Request) {
  try {
    const { id }: { id: number } = await req.json()
    const holidayList = readData()
    const filteredHolidays = holidayList.filter((staff) => staff.id !== id)

    if (holidayList.length === filteredHolidays.length) {
      return NextResponse.json(
        {
          message: `Holiday ID ${id} not found`,
        },
        { status: 404 }
      )
    } else {
      writeData(filteredHolidays)
      return NextResponse.json({
        data: id,
        message: 'Holiday successfully deleted',
      })
    }
  } catch (error) {
    console.error('Error deleting holiday:', error)
    return NextResponse.json(
      {
        message: 'Internal server error',
        data: null,
      },
      { status: 500 }
    )
  }
}
