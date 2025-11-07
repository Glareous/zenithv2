import { NextResponse } from 'next/server'

import { StudentList } from '@src/dtos'
import fs from 'fs'
import path from 'path'

const dataFilePath = path.join(
  process.cwd(),
  'src/apidata/school/students/students-list.json'
)

const readData = (): StudentList[] => {
  const jsonData = fs.readFileSync(dataFilePath, 'utf-8')
  return JSON.parse(jsonData)
}

const writeData = (data: StudentList[]) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing file:', error)
  }
}

// **GET Request - Fetch All Students**
export async function GET() {
  const studentList = readData()
  return NextResponse.json({
    message: 'Student list fetched successfully',
    data: studentList,
  })
}

// **POST Request - Add a New Student**
export async function POST(req: Request) {
  try {
    const newStudent: StudentList = await req.json()
    const studentList = readData()
    newStudent.id = studentList.length > 0 ? studentList.length + 1 : 1
    studentList.push(newStudent)
    writeData(studentList)
    return NextResponse.json(
      {
        message: 'Student added successfully',
        data: newStudent,
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

// **PUT Request - Update a Student Record**
export async function PUT(req: Request) {
  try {
    const updatedStudent: StudentList = await req.json()
    const studentList = readData()
    const index = studentList.findIndex(
      (student) => student.id === updatedStudent.id
    )

    if (index !== -1) {
      studentList[index] = updatedStudent
      writeData(studentList)
      return NextResponse.json({
        message: 'Student list updated successfully',
        data: updatedStudent,
      })
    } else {
      return NextResponse.json(
        {
          message: 'Student not found',
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

// **DELETE Request - Remove a Student**
export async function DELETE(req: Request) {
  try {
    const { id }: { id: number } = await req.json()
    const studentList = readData()
    const filteredStudentList = studentList.filter(
      (student) => student.id !== id
    )

    if (studentList.length === filteredStudentList.length) {
      return NextResponse.json(
        {
          message: `Student with ID ${id} not found`,
        },
        { status: 404 }
      )
    } else {
      writeData(filteredStudentList)
      return NextResponse.json({
        data: id,
        message: 'Student successfully deleted',
      })
    }
  } catch (error) {
    console.error('Error deleting student:', error)
    return NextResponse.json(
      {
        message: 'Internal server error',
        data: null,
      },
      { status: 500 }
    )
  }
}
