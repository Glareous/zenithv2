import { NextResponse } from 'next/server'

import { UserReviewRecord } from '@src/dtos'
import fs from 'fs'
import path from 'path'

const dataFilePath = path.join(
  process.cwd(),
  'src/apidata/hospital/overview/appointments.json'
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

export async function GET() {
  const appointments = readData()
  return NextResponse.json(
    {
      message: 'Appointments fetched successfully',
      data: appointments,
    },
    { status: 200 }
  )
}

export async function POST(req: Request) {
  try {
    const newAppointments: UserReviewRecord = await req.json()
    const appointmentsList = readData()
    newAppointments.id =
      appointmentsList.length > 0 ? appointmentsList.length + 1 : 1
    appointmentsList.unshift(newAppointments)
    writeData(appointmentsList)
    return NextResponse.json(
      {
        message: 'Appointments created successfully',
        data: newAppointments,
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
    const updatedAppointments: UserReviewRecord = await req.json()
    const allAppointments = readData()
    const index = allAppointments.findIndex(
      (appointment) => appointment.id === updatedAppointments.id
    )
    if (index !== -1) {
      allAppointments[index] = updatedAppointments
      writeData(allAppointments)
      return NextResponse.json(
        {
          message: 'Appointments updated successfully',
          data: updatedAppointments,
        },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        {
          message: 'Appointments not found',
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
    const { id } = await req.json()
    const allAppointments = readData()
    const filterAppointments = allAppointments.filter(
      (report) => report.id !== id
    )
    if (allAppointments.length === filterAppointments.length) {
      return NextResponse.json(
        {
          message: `Appointment with ID ${id} not found`,
        },
        { status: 404 }
      )
    } else {
      writeData(filterAppointments)
      return NextResponse.json(
        {
          data: id,
          message: 'Appointment successfully deleted',
        },
        { status: 200 }
      )
    }
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      {
        message: 'Internal server error',
        data: null,
      },
      { status: 500 }
    )
  }
}
