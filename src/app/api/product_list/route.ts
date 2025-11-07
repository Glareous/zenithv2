import { NextRequest, NextResponse } from 'next/server'

import { ProductListItem } from '@src/dtos'
import fs from 'fs'
import path from 'path'

const dataFilePath = path.join(
  process.cwd(),
  'src/apidata/ecommerce/product/product_list.json'
)

const readData = (): ProductListItem[] => {
  const jsonData = fs.readFileSync(dataFilePath, 'utf-8')
  return JSON.parse(jsonData)
}

const writeData = (data: ProductListItem[]) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing file:', error)
  }
}

// GET: Fetch all products
export async function GET() {
  try {
    const productList = readData()
    return NextResponse.json(
      {
        message: 'Products fetched successfully',
        data: productList,
      },
      { status: 200 }
    )
  } catch (error) {
    console.log('Products fetche api error', error)

    return NextResponse.json({ message: 'Error reading data' }, { status: 500 })
  }
}

// POST: Add a new product
export async function POST(req: NextRequest) {
  try {
    const newProduct: ProductListItem = await req.json()
    const productList = readData()

    newProduct.id = productList.length > 0 ? productList.length + 1 : 1
    productList.push(newProduct)
    writeData(productList)

    return NextResponse.json(
      {
        message: 'Product created successfully',
        data: newProduct,
      },
      { status: 201 }
    )
  } catch (error) {
    console.log('Products add api error', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT: Update a product
export async function PUT(req: NextRequest) {
  try {
    const updatedProduct: ProductListItem = await req.json()
    const productList = readData()
    const index = productList.findIndex(
      (product) => product.id === updatedProduct.id
    )

    if (index !== -1) {
      productList[index] = updatedProduct
      writeData(productList)
      return NextResponse.json(
        {
          message: 'Product updated successfully',
          data: updatedProduct,
        },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.log('Products fetche api error', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE: Remove a product
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json() // Expecting { "id": number } in request body
    const productList = readData()

    const filteredProductList = productList.filter(
      (product) => product.id !== id
    )

    if (productList.length === filteredProductList.length) {
      return NextResponse.json(
        { message: `Product with ID ${id} not found` },
        { status: 404 }
      )
    }

    writeData(filteredProductList)

    return NextResponse.json(
      {
        data: id,
        message: 'Product successfully deleted',
      },
      { status: 200 }
    )
  } catch (error) {
    console.log('Products delete api error', error)

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
