import { NextRequest, NextResponse } from 'next/server'

import { UserReviewRecord } from '@src/dtos'
import fs from 'fs'
import path from 'path'

const dataFilePath = path.join(
  process.cwd(),
  'src/apidata/hospital/overview/medicine.json'
)

const readData = (): UserReviewRecord[] => {
  const jsonData = fs.readFileSync(dataFilePath, 'utf-8')
  return JSON.parse(jsonData)
}

const writeData = (data: UserReviewRecord[]) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing file:', error)
  }
}

// GET: Fetch Reports
export async function GET() {
  try {
    const reports = readData()
    return NextResponse.json(
      {
        message: 'Reports fetched successfully',
        data: reports,
      },
      { status: 200 }
    )
  } catch (error) {
    console.log('Reports fetche api error', error)
    return NextResponse.json({ message: 'Error reading data' }, { status: 500 })
  }
}

// POST: Add New Report
export async function POST(req: NextRequest) {
  try {
    const newReport: UserReviewRecord = await req.json()
    const reportsList = readData()

    newReport.id = reportsList.length > 0 ? reportsList.length + 1 : 1
    reportsList.unshift(newReport)
    writeData(reportsList)

    return NextResponse.json(
      {
        message: 'Report created successfully',
        data: newReport,
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

// PUT: Update Report Record
export async function PUT(req: NextRequest) {
  try {
    const updatedReport: UserReviewRecord = await req.json()
    const allReports = readData()
    const index = allReports.findIndex(
      (report) => report.id === updatedReport.id
    )

    if (index !== -1) {
      allReports[index] = updatedReport
      writeData(allReports)
      return NextResponse.json(
        {
          message: 'Report updated successfully',
          data: updatedReport,
        },
        { status: 200 }
      )
    } else {
      return NextResponse.json({ message: 'Report not found' }, { status: 404 })
    }
  } catch (error) {
    console.log('Reports fetche api error', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE: Remove Report Record
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json() // Expecting { "id": number } in request body
    const allReports = readData()

    const filteredReports = allReports.filter((report) => report.id !== id)

    if (allReports.length === filteredReports.length) {
      return NextResponse.json(
        { message: `Report with ID ${id} not found` },
        { status: 404 }
      )
    }

    writeData(filteredReports)

    return NextResponse.json(
      {
        data: id,
        message: 'Report successfully deleted',
      },
      { status: 200 }
    )
  } catch (error) {
    console.log('Reports fetche api error', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
