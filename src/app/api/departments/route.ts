import { NextRequest, NextResponse } from 'next/server'

import { departments } from '@src/dtos'
import fs from 'fs'
import path from 'path'

const dataFilePath = path.join(
  process.cwd(),
  'src/apidata/hospital/departments/department.json'
)

const readData = (): departments[] => {
  const jsonData = fs.readFileSync(dataFilePath, 'utf-8')
  return JSON.parse(jsonData)
}

const writeData = (data: departments[]) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing file:', error)
  }
}

// GET: Fetch departments
export async function GET() {
  const departmentList = readData()
  return NextResponse.json(
    {
      message: 'departments fetched successfully',
      data: departmentList,
    },
    { status: 200 }
  )
}

// POST: Add a new department
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const newDepartment: departments = body
    const departmentList = readData()
    newDepartment.id = departmentList.length > 0 ? departmentList.length + 1 : 1
    departmentList.unshift(newDepartment)
    writeData(departmentList)

    return NextResponse.json(
      {
        message: 'department added successfully',
        data: newDepartment,
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

// PUT: Update a department
export async function PUT(req: NextRequest) {
  try {
    const updatedDepartment: departments = await req.json()
    const departmentList = readData()
    const index = departmentList.findIndex(
      (dept) => dept.id === updatedDepartment.id
    )

    if (index !== -1) {
      departmentList[index] = updatedDepartment
      writeData(departmentList)
      return NextResponse.json(
        {
          message: 'department updated successfully',
          data: updatedDepartment,
        },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        {
          message: 'department not found',
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

// DELETE: Remove a department
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json()
    const id: number = parseInt(body.id)
    const departmentList = readData()

    const filteredDepartment = departmentList.filter((dept) => dept.id !== id)

    if (departmentList.length === filteredDepartment.length) {
      return NextResponse.json(
        {
          message: `department ID ${id} not found`,
        },
        { status: 404 }
      )
    } else {
      writeData(filteredDepartment)
      return NextResponse.json(
        {
          data: id,
          message: 'department successfully deleted',
        },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error('Error deleting department:', error)
    return NextResponse.json(
      {
        message: 'Internal server error',
        data: null,
      },
      { status: 500 }
    )
  }
}
