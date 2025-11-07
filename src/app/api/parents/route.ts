import { NextRequest, NextResponse } from 'next/server'

import { Parents } from '@src/dtos'
import fs from 'fs'
import path from 'path'

const dataFilePath = path.join(
  process.cwd(),
  'src/apidata/school/parents/parents-list.json'
)

const readData = (): Parents[] => {
  const jsonData = fs.readFileSync(dataFilePath, 'utf-8')
  return JSON.parse(jsonData)
}

const writeData = (data: Parents[]) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing file:', error)
  }
}

// GET: Fetch all parents
export async function GET() {
  const parentsList = readData()
  return NextResponse.json(
    {
      message: 'Parents List fetched successfully',
      data: parentsList,
    },
    { status: 200 }
  )
}

// POST: Add a new parent
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const newParent: Parents = body
    const parentsList = readData()
    newParent.id = parentsList.length > 0 ? parentsList.length + 1 : 1
    parentsList.push(newParent)
    writeData(parentsList)

    return NextResponse.json(
      {
        message: 'Parent added successfully',
        data: newParent,
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

// PUT: Update a parent record
export async function PUT(req: NextRequest) {
  try {
    const updatedParent: Parents = await req.json()
    const parentsList = readData()
    const index = parentsList.findIndex(
      (parent) => parent.id === updatedParent.id
    )

    if (index !== -1) {
      parentsList[index] = updatedParent
      writeData(parentsList)
      return NextResponse.json(
        {
          message: 'Parent updated successfully',
          data: updatedParent,
        },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        {
          message: 'Parent not found',
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

// DELETE: Remove a parent record
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json()
    const id: number = parseInt(body.id)
    const parentsList = readData()
    const filteredParents = parentsList.filter((parent) => parent.id !== id)

    if (parentsList.length === filteredParents.length) {
      return NextResponse.json(
        {
          message: `Parent ID ${id} not found`,
        },
        { status: 404 }
      )
    } else {
      writeData(filteredParents)
      return NextResponse.json(
        {
          data: id,
          message: 'Parent successfully deleted',
        },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error('Error deleting parent:', error)
    return NextResponse.json(
      {
        message: 'Internal server error',
        data: null,
      },
      { status: 500 }
    )
  }
}
