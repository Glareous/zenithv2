import { NextResponse } from 'next/server'

import { OrderListItem } from '@src/dtos'
import fs from 'fs'
import path from 'path'

const dataFilePath = path.join(
  process.cwd(),
  'src/apidata/ecommerce/order/orders-list.json'
)

const readData = (): OrderListItem[] => {
  const jsonData = fs.readFileSync(dataFilePath, 'utf-8')
  return JSON.parse(jsonData)
}

const writeData = (data: OrderListItem[]) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing file:', error)
  }
}

// **GET Request - Fetch All Orders**
export async function GET() {
  const ordersList = readData()
  return NextResponse.json({
    message: 'Order List fetched successfully',
    data: ordersList,
  })
}

// **POST Request - Create a New Order**
export async function POST(req: Request) {
  try {
    const newOrder: OrderListItem = await req.json()
    const ordersList = readData()
    newOrder.id = ordersList.length > 0 ? ordersList.length + 1 : 1
    ordersList.unshift(newOrder)
    writeData(ordersList)
    return NextResponse.json(
      {
        message: 'Order added successfully',
        data: newOrder,
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

// **PUT Request - Update an Order**
export async function PUT(req: Request) {
  try {
    const updatedOrder: OrderListItem = await req.json()
    const ordersList = readData()
    const index = ordersList.findIndex((order) => order.id === updatedOrder.id)

    if (index !== -1) {
      ordersList[index] = updatedOrder
      writeData(ordersList)
      return NextResponse.json({
        message: 'Order updated successfully',
        data: updatedOrder,
      })
    } else {
      return NextResponse.json(
        {
          message: 'Order not found',
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

// **DELETE Request - Delete an Order**
export async function DELETE(req: Request) {
  try {
    const { id }: { id: number } = await req.json()
    const ordersList = readData()
    const filteredOrders = ordersList.filter((order) => order.id !== id)

    if (ordersList.length === filteredOrders.length) {
      return NextResponse.json(
        {
          message: `Order with ID ${id} not found`,
        },
        { status: 404 }
      )
    } else {
      writeData(filteredOrders)
      return NextResponse.json({
        data: id,
        message: 'Order successfully deleted',
      })
    }
  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json(
      {
        message: 'Internal server error',
        data: null,
      },
      { status: 500 }
    )
  }
}
