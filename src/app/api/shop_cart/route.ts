import { NextResponse } from 'next/server'

import { ShopCartProduct } from '@src/dtos'
import fs from 'fs'
import path from 'path'

const dataFilePath = path.join(
  process.cwd(),
  'src/apidata/ecommerce/shop-cart.json'
)

const readData = (): ShopCartProduct[] => {
  const jsonData = fs.readFileSync(dataFilePath, 'utf-8')
  return JSON.parse(jsonData)
}

const writeData = (data: ShopCartProduct[]) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing file:', error)
  }
}

// **GET Request - Fetch All Shop Cart Items**
export async function GET() {
  const shopCartData = readData()
  return NextResponse.json({
    message: 'Shop cart data fetched successfully',
    data: shopCartData,
  })
}

// **POST Request - Add a New Item to the Shop Cart**
export async function POST(req: Request) {
  try {
    const newShopCart: ShopCartProduct = await req.json()
    const shopCartData = readData()
    newShopCart.id = shopCartData.length > 0 ? shopCartData.length + 1 : 1
    shopCartData.push(newShopCart)
    writeData(shopCartData)
    return NextResponse.json(
      {
        message: 'Shop cart data created successfully',
        data: newShopCart,
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

// **PUT Request - Update a Shop Cart Item**
export async function PUT(req: Request) {
  try {
    const updatedShopCart: ShopCartProduct = await req.json()
    const shopCartData = readData()
    const index = shopCartData.findIndex(
      (item) => item.id === updatedShopCart.id
    )

    if (index !== -1) {
      shopCartData[index] = updatedShopCart
      writeData(shopCartData)
      return NextResponse.json({
        message: 'Shop cart record updated successfully',
        data: updatedShopCart,
      })
    } else {
      return NextResponse.json(
        {
          message: 'Shop cart record not found',
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

// **DELETE Request - Remove an Item from the Shop Cart**
export async function DELETE(req: Request) {
  try {
    const { id }: { id: number } = await req.json()
    const shopCartData = readData()
    const filteredShopCartData = shopCartData.filter((item) => item.id !== id)

    if (shopCartData.length === filteredShopCartData.length) {
      return NextResponse.json(
        {
          message: `Shop cart item with ID ${id} not found`,
        },
        { status: 404 }
      )
    } else {
      writeData(filteredShopCartData)
      return NextResponse.json({
        data: id,
        message: 'Shop cart record successfully deleted',
      })
    }
  } catch (error) {
    console.error('Error deleting shop cart item:', error)
    return NextResponse.json(
      {
        message: 'Internal server error',
        data: null,
      },
      { status: 500 }
    )
  }
}
