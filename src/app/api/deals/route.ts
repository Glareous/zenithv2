import { NextResponse } from 'next/server'

import { DealItem } from '@src/dtos'
import fs from 'fs'
import path from 'path'

const dataFilePath = path.join(process.cwd(), 'src/apidata/crm/crmdeal.json')

const readData = (): DealItem[] => {
  const jsonData = fs.readFileSync(dataFilePath, 'utf-8')
  return JSON.parse(jsonData)
}

const writeData = (data: DealItem[]) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing file:', error)
  }
}

// **GET Request - Fetch Deals**
export async function GET() {
  const deals = readData()
  return NextResponse.json({
    message: 'Deals fetched successfully',
    data: deals,
  })
}

// **POST Request - Create a New Deal**
export async function POST(req: Request) {
  try {
    const newDeal: DealItem = await req.json()
    const dealList = readData()
    newDeal.id = dealList.length > 0 ? dealList.length + 1 : 1
    dealList.push(newDeal)
    writeData(dealList)
    return NextResponse.json(
      {
        message: 'Deal created successfully',
        data: newDeal,
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

// **PUT Request - Update a Deal**
export async function PUT(req: Request) {
  try {
    const updatedDeal: DealItem = await req.json()
    const deals = readData()
    const index = deals.findIndex((deal) => deal.id === updatedDeal.id)

    if (index !== -1) {
      deals[index] = updatedDeal
      writeData(deals)
      return NextResponse.json({
        message: 'Deal updated successfully',
        data: updatedDeal,
      })
    } else {
      return NextResponse.json(
        {
          message: 'Deal not found',
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

// **DELETE Request - Delete a Deal**
export async function DELETE(req: Request) {
  try {
    const { id }: { id: number } = await req.json()
    const deals = readData()
    const filteredDeals = deals.filter((deal) => deal.id !== id)

    if (deals.length === filteredDeals.length) {
      return NextResponse.json(
        {
          message: `Deal with ID ${id} not found`,
        },
        { status: 404 }
      )
    } else {
      writeData(filteredDeals)
      return NextResponse.json({
        data: id,
        message: 'Deal record successfully deleted',
      })
    }
  } catch (error) {
    console.error('Error deleting deal:', error)
    return NextResponse.json(
      {
        message: 'Internal server error',
        data: null,
      },
      { status: 500 }
    )
  }
}
