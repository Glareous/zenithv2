import { NextResponse } from 'next/server'

import { StaffList } from '@src/dtos'
import fs from 'fs'
import path from 'path'

const dataFilePath = path.join(
  process.cwd(),
  'src/apidata/school/teachers/payroll.json'
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

// GET: Fetch teacher payroll records
export async function GET() {
  const payrollList = readData()
  return NextResponse.json({
    message: 'Teacher payroll members fetched successfully',
    data: payrollList,
  })
}

// POST: Add a new teacher payroll record
export async function POST(request: Request) {
  try {
    const newPayroll: StaffList = await request.json()
    const payrollList = readData()
    newPayroll.id = payrollList.length > 0 ? payrollList.length + 1 : 1
    payrollList.push(newPayroll)
    writeData(payrollList)

    return NextResponse.json(
      {
        message: 'Teacher payroll created successfully',
        data: newPayroll,
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

// PUT: Update a teacher payroll record
export async function PUT(request: Request) {
  try {
    const updatedPayroll: StaffList = await request.json()
    const payrollList = readData()
    const index = payrollList.findIndex(
      (staff) => staff.id === updatedPayroll.id
    )

    if (index !== -1) {
      payrollList[index] = updatedPayroll
      writeData(payrollList)
      return NextResponse.json({
        message: 'Teacher payroll updated successfully',
        data: updatedPayroll,
      })
    } else {
      return NextResponse.json(
        {
          message: 'Teacher payroll not found',
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

// DELETE: Remove a teacher payroll record
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()
    const payrollList = readData()
    const filteredPayroll = payrollList.filter((staff) => staff.id !== id)

    if (payrollList.length === filteredPayroll.length) {
      return NextResponse.json(
        {
          message: `Payroll ID ${id} not found`,
        },
        { status: 404 }
      )
    } else {
      writeData(filteredPayroll)
      return NextResponse.json({
        data: id,
        message: 'Payroll successfully deleted',
      })
    }
  } catch (error) {
    console.error('Error deleting payroll:', error)
    return NextResponse.json(
      {
        message: 'Internal server error',
        data: null,
      },
      { status: 500 }
    )
  }
}
