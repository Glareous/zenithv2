import { NextRequest, NextResponse } from 'next/server'

import { StaffList } from '@src/dtos'
import fs from 'fs'
import path from 'path'

const dataFilePath = path.join(
  process.cwd(),
  'src/apidata/hospital/staff/staff.json'
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

// GET: Fetch all staff members
export async function GET() {
  try {
    const staffList = readData()
    return NextResponse.json(
      {
        message: 'Staff members fetched successfully',
        data: staffList,
      },
      { status: 200 }
    )
  } catch (error) {
    console.log('Staff members fetche api error', error)
    return NextResponse.json({ message: 'Error reading data' }, { status: 500 })
  }
}

// POST: Add a new staff member
export async function POST(req: NextRequest) {
  try {
    const newStaff: StaffList = await req.json()
    const staffList = readData()

    newStaff.id = staffList.length > 0 ? staffList.length + 1 : 1
    staffList.push(newStaff)
    writeData(staffList)

    return NextResponse.json(
      {
        message: 'Staff member created successfully',
        data: newStaff,
      },
      { status: 201 }
    )
  } catch (error) {
    console.log('Staff member add api error', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT: Update a staff member record
export async function PUT(req: NextRequest) {
  try {
    const updatedStaff: StaffList = await req.json()
    const staffList = readData()
    const index = staffList.findIndex((staff) => staff.id === updatedStaff.id)

    if (index !== -1) {
      staffList[index] = updatedStaff
      writeData(staffList)
      return NextResponse.json(
        {
          message: 'Staff member updated successfully',
          data: updatedStaff,
        },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { message: 'Staff member not found' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.log('Staff member update api error', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE: Remove a staff member
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json() // Expecting { "id": number } in request body
    const staffList = readData()

    const filteredStaff = staffList.filter((staff) => staff.id !== id)

    if (staffList.length === filteredStaff.length) {
      return NextResponse.json(
        { message: `Staff member ID ${id} not found` },
        { status: 404 }
      )
    }

    writeData(filteredStaff)

    return NextResponse.json(
      {
        data: id,
        message: 'Staff member successfully deleted',
      },
      { status: 200 }
    )
  } catch (error) {
    console.log('Staff member delete api error', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
