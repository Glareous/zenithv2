import { NextRequest, NextResponse } from 'next/server'

import { TeacherListList } from '@src/dtos'
import fs from 'fs'
import path from 'path'

const dataFilePath = path.join(
  process.cwd(),
  'src/apidata/school/teachers/teachers-list.json'
)

const readData = (): TeacherListList[] => {
  const jsonData = fs.readFileSync(dataFilePath, 'utf-8')
  return JSON.parse(jsonData)
}

const writeData = (data: TeacherListList[]) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing file:', error)
  }
}

// GET: Fetch all teacher list records
export async function GET() {
  try {
    const teacherList = readData()
    return NextResponse.json(
      {
        message: 'Teacher list fetched successfully',
        data: teacherList,
      },
      { status: 200 }
    )
  } catch (error) {
    console.log('Teacher list fetche api error', error)
    return NextResponse.json({ message: 'Error reading data' }, { status: 500 })
  }
}

// POST: Add a new teacher record
export async function POST(req: NextRequest) {
  try {
    const newTeacher: TeacherListList = await req.json()
    const teacherList = readData()

    newTeacher.id = teacherList.length
      ? teacherList[teacherList.length - 1].id + 1
      : 1
    teacherList.push(newTeacher)
    writeData(teacherList)

    return NextResponse.json(
      {
        message: 'Teacher added successfully',
        data: newTeacher,
      },
      { status: 201 }
    )
  } catch (error) {
    console.log('Teacher list add api error', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT: Update a teacher record
export async function PUT(req: NextRequest) {
  try {
    const updatedTeacher: TeacherListList = await req.json()
    const teacherList = readData()
    const index = teacherList.findIndex(
      (teacher) => teacher.id === updatedTeacher.id
    )

    if (index !== -1) {
      teacherList[index] = updatedTeacher
      writeData(teacherList)
      return NextResponse.json(
        {
          message: 'Teacher record updated successfully',
          data: updatedTeacher,
        },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { message: 'Teacher not found' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.log('Teacher list update api error', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE: Remove a teacher record
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json() // Expecting { "id": number } in request body
    const teacherList = readData()

    const filteredTeacherList = teacherList.filter(
      (teacher) => teacher.id !== id
    )

    if (teacherList.length === filteredTeacherList.length) {
      return NextResponse.json(
        { message: `Teacher ID ${id} not found` },
        { status: 404 }
      )
    }

    writeData(filteredTeacherList)

    return NextResponse.json(
      {
        data: id,
        message: 'Teacher successfully deleted',
      },
      { status: 200 }
    )
  } catch (error) {
    console.log('Teacher list delete api error', error)

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
