import { NextResponse } from 'next/server'

import { employeeSalary } from '@src/dtos'
import fs from 'fs'
import path from 'path'

const dataFilePath = path.join(
  process.cwd(),
  'src/apidata/hospital/payroll/employee_salary.json'
)

const readData = (): employeeSalary[] => {
  const jsonData = fs.readFileSync(dataFilePath, 'utf-8')
  return JSON.parse(jsonData)
}

const writeData = (data: employeeSalary[]) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing file:', error)
  }
}

// **GET Request - Fetch All Employee Salaries**
export async function GET() {
  const salaryList = readData()
  return NextResponse.json({
    message: 'Salary data fetched successfully',
    data: salaryList,
  })
}

// **POST Request - Create a New Salary Record**
export async function POST(req: Request) {
  try {
    const newSalary: employeeSalary = await req.json()
    const salaryList = readData()
    newSalary.id = salaryList.length > 0 ? salaryList.length + 1 : 1
    salaryList.unshift(newSalary)
    writeData(salaryList)
    return NextResponse.json(
      {
        message: 'Salary data added successfully',
        data: newSalary,
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

// **PUT Request - Update an Existing Salary Record**
export async function PUT(req: Request) {
  try {
    const updatedSalary: employeeSalary = await req.json()
    const salaryList = readData()
    const index = salaryList.findIndex(
      (record) => record.id === updatedSalary.id
    )

    if (index !== -1) {
      salaryList[index] = updatedSalary
      writeData(salaryList)
      return NextResponse.json({
        message: 'Salary data updated successfully',
        data: updatedSalary,
      })
    } else {
      return NextResponse.json(
        {
          message: 'Salary record not found',
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

// **DELETE Request - Remove a Salary Record**
export async function DELETE(req: Request) {
  try {
    const { id }: { id: number } = await req.json()
    const salaryList = readData()
    const filteredSalary = salaryList.filter((record) => record.id !== id)

    if (salaryList.length === filteredSalary.length) {
      return NextResponse.json(
        {
          message: `Salary ID ${id} not found`,
        },
        { status: 404 }
      )
    } else {
      writeData(filteredSalary)
      return NextResponse.json({
        data: id,
        message: 'Salary data successfully deleted',
      })
    }
  } catch (error) {
    console.error('Error deleting salary record:', error)
    return NextResponse.json(
      {
        message: 'Internal server error',
        data: null,
      },
      { status: 500 }
    )
  }
}
