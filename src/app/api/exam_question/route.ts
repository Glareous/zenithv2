import { NextRequest, NextResponse } from 'next/server'

import { ExamQuestion } from '@src/dtos'
import fs from 'fs'
import path from 'path'

const dataFilePath = path.join(
  process.cwd(),
  'src/apidata/school/exam/question.json'
)

const readData = (): ExamQuestion[] => {
  const jsonData = fs.readFileSync(dataFilePath, 'utf-8')
  return JSON.parse(jsonData)
}

const writeData = (data: ExamQuestion[]) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing file:', error)
  }
}

// GET: Fetch exam questions
export async function GET() {
  const questionList = readData()
  return NextResponse.json(
    {
      message: 'Exam question list fetched successfully',
      data: questionList,
    },
    { status: 200 }
  )
}

// POST: Add a new question
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const newQuestion: ExamQuestion = body
    const questionList = readData()
    newQuestion.id = questionList.length > 0 ? questionList.length + 1 : 1
    questionList.push(newQuestion)
    writeData(questionList)

    return NextResponse.json(
      {
        message: 'Question created successfully',
        data: newQuestion,
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

// PUT: Update an existing question
export async function PUT(req: NextRequest) {
  try {
    const updatedQuestion: ExamQuestion = await req.json()
    const questionList = readData()
    const index = questionList.findIndex((q) => q.id === updatedQuestion.id)

    if (index !== -1) {
      questionList[index] = updatedQuestion
      writeData(questionList)
      return NextResponse.json(
        {
          message: 'Question updated successfully',
          data: updatedQuestion,
        },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        {
          message: 'Question not found',
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

// DELETE: Remove a question
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json()
    const id: number = parseInt(body.id)
    const questionList = readData()

    const filteredQuestion = questionList.filter((q) => q.id !== id)

    if (questionList.length === filteredQuestion.length) {
      return NextResponse.json(
        {
          message: `Question ID ${id} not found`,
        },
        { status: 404 }
      )
    } else {
      writeData(filteredQuestion)
      return NextResponse.json(
        {
          data: id,
          message: 'Question successfully deleted',
        },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error('Error deleting question:', error)
    return NextResponse.json(
      {
        message: 'Internal server error',
        data: null,
      },
      { status: 500 }
    )
  }
}
