import { NextRequest, NextResponse } from 'next/server'

import fs from 'fs'
import path from 'path'

const dataFilePath = path.join(
  process.cwd(),
  'src/apidata/hospital/staff/attendance.json'
)

interface Attendance {
  id: number
  name: string
  date: string
  status: string
}

const readData = (): Attendance[] => {
  const jsonData = fs.readFileSync(dataFilePath, 'utf-8')
  return JSON.parse(jsonData)
}

const writeData = (data: Attendance[]) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing file:', error)
  }
}

export async function GET(): Promise<NextResponse> {
  const staffAttendance = readData()
  return NextResponse.json({
    message: 'Staff attendance fetched successfully',
    data: staffAttendance,
  })
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const newAttendance: Attendance = await req.json()
    const staffAttendance = readData()
    newAttendance.id =
      staffAttendance.length > 0 ? staffAttendance.length + 1 : 1
    staffAttendance.push(newAttendance)
    writeData(staffAttendance)
    return NextResponse.json(
      {
        message: 'Attendance added successfully',
        data: newAttendance,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error', error)
    return NextResponse.json(
      {
        message: 'Internal server error',
        data: null,
      },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest): Promise<NextResponse> {
  try {
    const updatedStaffAttendance: Attendance = await req.json()
    const staffAttendance = readData()
    const index = staffAttendance.findIndex(
      (staff) => staff.id === updatedStaffAttendance.id
    )
    if (index !== -1) {
      staffAttendance[index] = updatedStaffAttendance
      writeData(staffAttendance)
      return NextResponse.json({
        message: 'Attendance updated successfully',
        data: updatedStaffAttendance,
      })
    } else {
      return NextResponse.json(
        {
          message: 'Attendance not found',
          data: null,
        },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Error', error)
    return NextResponse.json(
      {
        message: 'Internal server error',
        data: null,
      },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const { id }: { id: number } = await req.json()
    const staffAttendance = readData()
    const filteredAttendance = staffAttendance.filter(
      (staff) => staff.id !== id
    )

    if (staffAttendance.length === filteredAttendance.length) {
      return NextResponse.json(
        {
          message: `Attendance member ID ${id} not found`,
        },
        { status: 404 }
      )
    } else {
      writeData(filteredAttendance)
      return NextResponse.json({
        data: id,
        message: 'Attendance successfully deleted',
      })
    }
  } catch (error) {
    console.error('Error deleting attendance:', error)
    return NextResponse.json(
      {
        message: 'Internal server error',
        data: null,
      },
      { status: 500 }
    )
  }
}
