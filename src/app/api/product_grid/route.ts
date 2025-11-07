import { NextRequest, NextResponse } from 'next/server'

import { ProductGridItem } from '@src/dtos'
import fs from 'fs'
import path from 'path'

const dataFilePath = path.join(
  process.cwd(),
  'src/apidata/ecommerce/product/product-grid.json'
)

const readData = (): ProductGridItem[] => {
  const jsonData = fs.readFileSync(dataFilePath, 'utf-8')
  return JSON.parse(jsonData)
}

const writeData = (data: ProductGridItem[]) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing file:', error)
  }
}

// GET: Fetch all product grids
export async function GET() {
  const productGrids = readData()
  return NextResponse.json(
    {
      message: 'Products fetched successfully',
      data: productGrids,
    },
    { status: 200 }
  )
}

// POST: Add a new product grid
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const newProductGrid: ProductGridItem = body
    const productGridsList = readData()
    newProductGrid.id =
      productGridsList.length > 0 ? productGridsList.length + 1 : 1
    productGridsList.push(newProductGrid)
    writeData(productGridsList)

    return NextResponse.json(
      {
        message: 'Product grid created successfully',
        data: newProductGrid,
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

// PUT: Update a product grid record
export async function PUT(req: NextRequest) {
  try {
    const updatedProductGrid: ProductGridItem = await req.json()
    const productGridsList = readData()
    const index = productGridsList.findIndex(
      (grid) => grid.id === updatedProductGrid.id
    )

    if (index !== -1) {
      productGridsList[index] = updatedProductGrid
      writeData(productGridsList)
      return NextResponse.json(
        {
          message: 'Product grid updated successfully',
          data: updatedProductGrid,
        },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        {
          message: 'Product grid not found',
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

// DELETE: Remove a product grid record
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json()
    const id: number = parseInt(body.id)
    const productGridsList = readData()
    const filteredProductGrid = productGridsList.filter(
      (grid) => grid.id !== id
    )

    if (productGridsList.length === filteredProductGrid.length) {
      return NextResponse.json(
        {
          message: `Product with ID ${id} not found`,
        },
        { status: 404 }
      )
    } else {
      writeData(filteredProductGrid)
      return NextResponse.json(
        {
          data: id,
          message: 'Product record successfully deleted',
        },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      {
        message: 'Internal server error',
        data: null,
      },
      { status: 500 }
    )
  }
}
