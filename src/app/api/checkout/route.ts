import { NextResponse } from 'next/server'

import { CheckoutProductAddress } from '@src/dtos'
import fs from 'fs'
import path from 'path'

const dataFilePath = path.join(
  process.cwd(),
  'src/apidata/ecommerce/checkout.init.json'
)

const readData = (): CheckoutProductAddress[] => {
  const jsonData = fs.readFileSync(dataFilePath, 'utf-8')
  return JSON.parse(jsonData)
}

const writeData = (data: CheckoutProductAddress[]) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing file:', error)
  }
}

// **GET Request - Fetch Checkout Addresses**
export async function GET() {
  const checkoutAddress = readData()
  return NextResponse.json({
    message: 'All checkout addresses fetched successfully',
    data: checkoutAddress,
  })
}

// **POST Request - Create a Checkout Address**
export async function POST(req: Request) {
  try {
    const newAddress: CheckoutProductAddress = await req.json()
    const checkoutAddress = readData()
    newAddress.id = checkoutAddress.length > 0 ? checkoutAddress.length + 1 : 1
    checkoutAddress.push(newAddress)
    writeData(checkoutAddress)
    return NextResponse.json(
      {
        message: 'New address created successfully',
        data: newAddress,
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

// **PUT Request - Update a Checkout Address**
export async function PUT(req: Request) {
  try {
    const updatedAddress: CheckoutProductAddress = await req.json()
    const checkoutAddress = readData()
    const index = checkoutAddress.findIndex(
      (address) => address.id === updatedAddress.id
    )

    if (index !== -1) {
      checkoutAddress[index] = updatedAddress
      writeData(checkoutAddress)
      return NextResponse.json({
        message: 'Address updated successfully',
        data: updatedAddress,
      })
    } else {
      return NextResponse.json(
        {
          message: 'Address not found',
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

// **DELETE Request - Delete a Checkout Address**
export async function DELETE(req: Request) {
  try {
    const { id }: { id: number } = await req.json()
    const checkoutAddress = readData()
    const filteredAddress = checkoutAddress.filter(
      (address) => address.id !== id
    )

    if (checkoutAddress.length === filteredAddress.length) {
      return NextResponse.json(
        {
          message: `Address with ID ${id} not found`,
        },
        { status: 404 }
      )
    } else {
      writeData(filteredAddress)
      return NextResponse.json({
        data: id,
        message: 'Address successfully deleted',
      })
    }
  } catch (error) {
    console.error('Error deleting address:', error)
    return NextResponse.json(
      {
        message: 'Internal server error',
        data: null,
      },
      { status: 500 }
    )
  }
}
