import { NextRequest, NextResponse } from 'next/server'

import { UserReviewRecord } from '@src/dtos'
import fs from 'fs'
import path from 'path'

const dataFilePath = path.join(
  process.cwd(),
  'src/apidata/hospital/overview/report.json'
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

// GET: Fetch all reports
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

// POST: Add a new report
export async function POST(req: NextRequest) {
  try {
    const newReport: UserReviewRecord = await req.json()
    const reports = readData()

    newReport.id = reports.length > 0 ? reports.length + 1 : 1
    reports.unshift(newReport)
    writeData(reports)

    return NextResponse.json(
      {
        message: 'Report created successfully',
        data: newReport,
      },
      { status: 201 }
    )
  } catch (error) {
    console.log('Report add api error', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT: Update a report
export async function PUT(req: NextRequest) {
  try {
    const updatedReport: UserReviewRecord = await req.json()
    const reports = readData()
    const index = reports.findIndex((report) => report.id === updatedReport.id)

    if (index !== -1) {
      reports[index] = updatedReport
      writeData(reports)
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
    console.log('Report updated api error', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE: Remove a report
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json() // Expecting { "id": number } in request body
    const reports = readData()

    const filteredReports = reports.filter((report) => report.id !== id)

    if (reports.length === filteredReports.length) {
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
    console.error('Error deleting report:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
