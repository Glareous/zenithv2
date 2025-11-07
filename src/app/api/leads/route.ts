import { NextRequest, NextResponse } from 'next/server'

import { LeadItem } from '@src/dtos'
import fs from 'fs'
import path from 'path'

const dataFilePath = path.join(process.cwd(), 'src/apidata/crm/crmlead.json')

const readData = (): LeadItem[] => {
  const jsonData = fs.readFileSync(dataFilePath, 'utf-8')
  return JSON.parse(jsonData)
}

const writeData = (data: LeadItem[]) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing file:', error)
  }
}

// GET: Fetch Lead List
export async function GET() {
  try {
    const leads = readData()
    return NextResponse.json(
      {
        message: 'Leads fetched successfully',
        data: leads,
      },
      { status: 200 }
    )
  } catch (error) {
    console.log('error', error)
    return NextResponse.json({ message: 'Error reading data' }, { status: 500 })
  }
}

// POST: Add New Lead
export async function POST(req: NextRequest) {
  try {
    const newLead: LeadItem = await req.json()
    const leadsList = readData()

    newLead.id = leadsList.length > 0 ? leadsList.length + 1 : 1
    leadsList.push(newLead)
    writeData(leadsList)

    return NextResponse.json(
      {
        message: 'Lead created successfully',
        data: newLead,
      },
      { status: 201 }
    )
  } catch (error) {
    console.log('error', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT: Update Lead Record
export async function PUT(req: NextRequest) {
  try {
    const updatedLead: LeadItem = await req.json()
    const allLeads = readData()
    const index = allLeads.findIndex((lead) => lead.id === updatedLead.id)

    if (index !== -1) {
      allLeads[index] = updatedLead
      writeData(allLeads)
      return NextResponse.json(
        {
          message: 'Lead updated successfully',
          data: updatedLead,
        },
        { status: 200 }
      )
    } else {
      return NextResponse.json({ message: 'Lead not found' }, { status: 404 })
    }
  } catch (error) {
    console.log('Lead put api error', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE: Remove Lead Record
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json() // Expecting { "id": number } in request body
    const leadsData = readData()

    const filteredLeads = leadsData.filter((lead) => lead.id !== id)

    if (leadsData.length === filteredLeads.length) {
      return NextResponse.json(
        { message: `Lead with ID ${id} not found` },
        { status: 404 }
      )
    }

    writeData(filteredLeads)

    return NextResponse.json(
      {
        data: id,
        message: 'Lead record successfully deleted',
      },
      { status: 200 }
    )
  } catch (error) {
    console.log('error', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
