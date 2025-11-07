import { NextRequest, NextResponse } from 'next/server'

import { InvoiceList } from '@src/dtos'
import fs from 'fs'
import path from 'path'

const dataFilePath = path.join(
  process.cwd(),
  'src/apidata/invoice/invoices-list.json'
)

const readData = (): InvoiceList[] => {
  const jsonData = fs.readFileSync(dataFilePath, 'utf-8')
  return JSON.parse(jsonData)
}

const writeData = (data: InvoiceList[]) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing file:', error)
  }
}

// GET: Fetch invoice list
export async function GET() {
  const invoiceList = readData()
  return NextResponse.json(
    {
      message: 'Invoice list fetched successfully',
      data: invoiceList,
    },
    { status: 200 }
  )
}

// POST: Create a new invoice record
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const newInvoice: InvoiceList = body
    const invoiceList = readData()
    newInvoice.id = invoiceList.length > 0 ? invoiceList.length + 1 : 1
    invoiceList.push(newInvoice)
    writeData(invoiceList)

    return NextResponse.json(
      {
        message: 'Invoice record created successfully',
        data: newInvoice,
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

// PUT: Update an invoice record
export async function PUT(req: NextRequest) {
  try {
    const updatedInvoice: InvoiceList = await req.json()
    const invoiceList = readData()
    const index = invoiceList.findIndex(
      (invoice) => invoice.id === updatedInvoice.id
    )

    if (index !== -1) {
      invoiceList[index] = updatedInvoice
      writeData(invoiceList)
      return NextResponse.json(
        {
          message: 'Invoice record updated successfully',
          data: updatedInvoice,
        },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        {
          message: 'Invoice record not found',
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

// DELETE: Remove an invoice record
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json()
    const id: number = parseInt(body.id)
    const invoiceList = readData()

    const filteredInvoiceList = invoiceList.filter(
      (invoice) => invoice.id !== id
    )

    if (invoiceList.length === filteredInvoiceList.length) {
      return NextResponse.json(
        {
          message: `Invoice record with ID ${id} not found`,
        },
        { status: 404 }
      )
    } else {
      writeData(filteredInvoiceList)
      return NextResponse.json(
        {
          data: id,
          message: 'Invoice record successfully deleted',
        },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error('Error deleting invoice:', error)
    return NextResponse.json(
      {
        message: 'Internal server error',
        data: null,
      },
      { status: 500 }
    )
  }
}
