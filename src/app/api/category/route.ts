import { NextResponse } from 'next/server'

import { EventItem } from '@src/dtos'
import fs from 'fs'
import path from 'path'

const dataFilePath = path.join(
  process.cwd(),
  'src/apidata/ecommerce/category-list.json'
)

const readData = (): EventItem[] => {
  const jsonData = fs.readFileSync(dataFilePath, 'utf-8')
  return JSON.parse(jsonData)
}

const writeData = (data: EventItem[]) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing file:', error)
  }
}

// **GET Request - Fetch Categories**
export async function GET() {
  const category = readData()
  return NextResponse.json({
    message: 'Category fetched successfully',
    data: category,
  })
}

// **POST Request - Create a Category**
export async function POST(req: Request) {
  try {
    const newCategory: EventItem = await req.json()
    const category = readData()
    newCategory.id = category.length > 0 ? category.length + 1 : 1
    category.unshift(newCategory)
    writeData(category)
    return NextResponse.json(
      {
        message: 'Category created successfully',
        data: newCategory,
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

// **PUT Request - Update a Category**
export async function PUT(req: Request) {
  try {
    const updatedCategory: EventItem = await req.json()
    const allCategories = readData()
    const index = allCategories.findIndex(
      (cat) => cat.id === updatedCategory.id
    )

    if (index !== -1) {
      allCategories[index] = updatedCategory
      writeData(allCategories)
      return NextResponse.json({
        message: 'Category updated successfully',
        data: updatedCategory,
      })
    } else {
      return NextResponse.json(
        {
          message: 'Category not found',
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

// **DELETE Request - Delete a Category**
export async function DELETE(req: Request) {
  try {
    const { id }: { id: number } = await req.json()
    const categoriesData = readData()
    const filteredCategories = categoriesData.filter((cat) => cat.id !== id)

    if (categoriesData.length === filteredCategories.length) {
      return NextResponse.json(
        {
          message: `Category with ID ${id} not found`,
        },
        { status: 404 }
      )
    } else {
      writeData(filteredCategories)
      return NextResponse.json({
        data: id,
        message: 'Category record successfully deleted',
      })
    }
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      {
        message: 'Internal server error',
        data: null,
      },
      { status: 500 }
    )
  }
}
