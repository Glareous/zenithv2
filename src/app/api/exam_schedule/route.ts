import { NextRequest, NextResponse } from 'next/server'

import { ExamSchedule } from '@src/dtos'
import fs from 'fs'
import path from 'path'

const dataFilePath = path.join(
  process.cwd(),
  'src/apidata/school/exam/exam-list.json'
)

const readData = (): ExamSchedule[] => {
  const jsonData = fs.readFileSync(dataFilePath, 'utf-8')
  return JSON.parse(jsonData)
}

const writeData = (data: ExamSchedule[]) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing file:', error)
  }
}

// GET: Fetch Exam List
export async function GET() {
  try {
    const examList = readData()
    return NextResponse.json(
      {
        message: 'Exam list fetched successfully',
        data: examList,
      },
      { status: 200 }
    )
  } catch (error) {
    console.log('error', error)

    return NextResponse.json({ message: 'Error reading data' }, { status: 500 })
  }
}

// POST: Add New Exam
export async function POST(req: NextRequest) {
  try {
    const newExam: ExamSchedule = await req.json()
    const examList = readData()

    newExam.id = examList.length > 0 ? examList.length + 1 : 1
    examList.push(newExam)
    writeData(examList)

    return NextResponse.json(
      {
        message: 'Exam added successfully',
        data: newExam,
      },
      { status: 201 }
    )
  } catch (error) {
    console.log('error', error)

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT: Update Exam Record
export async function PUT(req: NextRequest) {
  try {
    const updatedExam: ExamSchedule = await req.json()
    const examList = readData()
    const index = examList.findIndex((exam) => exam.id === updatedExam.id)

    if (index !== -1) {
      examList[index] = updatedExam
      writeData(examList)
      return NextResponse.json(
        {
          message: 'Exam updated successfully',
          data: updatedExam,
        },
        { status: 200 }
      )
    } else {
      return NextResponse.json({ message: 'Exam not found' }, { status: 404 })
    }
  } catch (error) {
    console.log('error', error)

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE: Remove Exam Record
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json() // Expecting { "id": number } in request body
    const examList = readData()

    const filteredExam = examList.filter((exam) => exam.id !== id)

    if (examList.length === filteredExam.length) {
      return NextResponse.json(
        { message: `Exam ID ${id} not found` },
        { status: 404 }
      )
    }

    writeData(filteredExam)

    return NextResponse.json(
      {
        data: id,
        message: 'Exam successfully deleted',
      },
      { status: 200 }
    )
  } catch (error) {
    console.log('error', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
