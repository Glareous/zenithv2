import { NextResponse } from 'next/server'

import { StaffLeaves } from '@src/dtos'
import fs from 'fs'
import path from 'path'

const dataFilePath = path.join(
  process.cwd(),
  'src/apidata/hospital/staff/leaves.json'
)

const readData = (): StaffLeaves[] => {
  const jsonData = fs.readFileSync(dataFilePath, 'utf-8')
  return JSON.parse(jsonData)
}

const writeData = (data: StaffLeaves[]) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing file:', error)
  }
}

// GET: Fetch staff leave records
export async function GET() {
  const staffLeave = readData()
  return NextResponse.json({
    message: 'Staff Leave fetched successfully',
    data: staffLeave,
  })
}

// POST: Add a new staff leave record
export async function POST(request: Request) {
  try {
    const newStaffLeave: StaffLeaves = await request.json()
    const staffLeave = readData()
    newStaffLeave.id = staffLeave.length
      ? staffLeave[staffLeave.length - 1].id + 1
      : 1
    staffLeave.push(newStaffLeave)
    writeData(staffLeave)

    return NextResponse.json(
      {
        message: 'Staff Leave created successfully',
        data: newStaffLeave,
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

// PUT: Update a staff leave record
export async function PUT(request: Request) {
  try {
    const updatedStaffLeave: StaffLeaves = await request.json()
    const staffLeave = readData()
    const index = staffLeave.findIndex(
      (staff) => staff.id === updatedStaffLeave.id
    )

    if (index !== -1) {
      staffLeave[index] = updatedStaffLeave
      writeData(staffLeave)
      return NextResponse.json({
        message: 'Staff Leave updated successfully',
        data: updatedStaffLeave,
      })
    } else {
      return NextResponse.json(
        {
          message: 'Staff Leave not found',
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

// DELETE: Remove a staff leave record
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()
    const staffLeave = readData()
    const filteredStaff = staffLeave.filter((staff) => staff.id !== id)

    if (staffLeave.length === filteredStaff.length) {
      return NextResponse.json(
        {
          message: `Staff Member ID ${id} not found`,
        },
        { status: 404 }
      )
    } else {
      writeData(filteredStaff)
      return NextResponse.json({
        data: id,
        message: 'Staff Leave successfully deleted',
      })
    }
  } catch (error) {
    console.error('Error deleting staff leave:', error)
    return NextResponse.json(
      {
        message: 'Internal server error',
        data: null,
      },
      { status: 500 }
    )
  }
}
