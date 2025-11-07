import { NextResponse } from 'next/server'

import { CustomerRecord } from '@src/dtos'
import fs from 'fs'
import path from 'path'

const dataFilePath = path.join(
  process.cwd(),
  'src/apidata/ecommerce/customer/customers_list.json'
)

const readData = (): CustomerRecord[] => {
  const jsonData = fs.readFileSync(dataFilePath, 'utf-8')
  return JSON.parse(jsonData)
}

const writeData = (data: CustomerRecord[]) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing file:', error)
  }
}

export async function GET() {
  const customers = readData()
  return NextResponse.json({
    message: 'Customers fetched successfully',
    data: customers,
  })
}

export async function POST(req: Request) {
  try {
    const newCustomer: CustomerRecord = await req.json()
    const customersList = readData()
    newCustomer.id = customersList.length > 0 ? customersList.length + 1 : 1
    customersList.push(newCustomer)
    writeData(customersList)
    return NextResponse.json(
      {
        message: 'Customer created successfully',
        data: newCustomer,
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

export async function PUT(req: Request) {
  try {
    const updatedCustomer: CustomerRecord = await req.json()
    const allCustomers = readData()
    const index = allCustomers.findIndex(
      (customer) => customer.id === updatedCustomer.id
    )
    if (index !== -1) {
      allCustomers[index] = updatedCustomer
      writeData(allCustomers)
      return NextResponse.json({
        message: 'Customer updated successfully',
        data: updatedCustomer,
      })
    } else {
      return NextResponse.json(
        {
          message: 'Customer not found',
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

export async function DELETE(req: Request) {
  try {
    const { id }: { id: number } = await req.json()
    const customersData = readData()
    const filteredCustomers = customersData.filter(
      (customer) => customer.id !== id
    )

    if (customersData.length === filteredCustomers.length) {
      return NextResponse.json(
        {
          message: `Customer with ID ${id} not found`,
        },
        { status: 404 }
      )
    }
    writeData(filteredCustomers)
    return NextResponse.json({
      data: id,
      message: 'Customer record successfully deleted',
    })
  } catch (error) {
    console.error('Error deleting customer:', error)
    return NextResponse.json(
      {
        message: 'Internal server error',
        data: null,
      },
      { status: 500 }
    )
  }
}
