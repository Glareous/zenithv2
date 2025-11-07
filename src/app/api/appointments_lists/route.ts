import { NextResponse } from 'next/server'

import { StaffList } from '@src/dtos'
import fs from 'fs'
import path from 'path'

const dataFilePath = path.join(
  process.cwd(),
  'src/apidata/hospital/appointments/appointments.json'
)

const readData = (): StaffList[] => {
  const jsonData = fs.readFileSync(dataFilePath, 'utf-8')
  return JSON.parse(jsonData)
}

const writeData = (data: StaffList[]) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing file:', error)
  }
}

export async function GET() {
  const appointmentList = readData()
  return NextResponse.json({
    message: 'Appointments data fetched successfully',
    data: appointmentList,
  })
}

export async function POST(req: Request) {
  try {
    const newAppointments: StaffList = await req.json()
    const AppointmentsList = readData()
    newAppointments.id =
      AppointmentsList.length > 0 ? AppointmentsList.length + 1 : 1
    AppointmentsList.push(newAppointments)
    writeData(AppointmentsList)
    return NextResponse.json(
      {
        message: 'Appointment added successfully',
        data: newAppointments,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { message: 'Internal server error', data: null },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
  try {
    const updatedAppointments: StaffList = await req.json()
    const appointmentList = readData()
    const index = appointmentList.findIndex(
      (appointment) => appointment.id === updatedAppointments.id
    )

    if (index !== -1) {
      appointmentList[index] = updatedAppointments
      writeData(appointmentList)
      return NextResponse.json({
        message: 'Appointment updated successfully',
        data: updatedAppointments,
      })
    } else {
      return NextResponse.json(
        { message: 'Appointment not found', data: null },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { message: 'Internal server error', data: null },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json()
    const appointmentList = readData()
    const filteredAppointment = appointmentList.filter(
      (appointment) => appointment.id !== id
    )

    if (appointmentList.length === filteredAppointment.length) {
      return NextResponse.json(
        { message: `Appointment ID ${id} not found` },
        { status: 404 }
      )
    } else {
      writeData(filteredAppointment)
      return NextResponse.json({
        data: id,
        message: 'Appointment record successfully deleted',
      })
    }
  } catch (error) {
    console.error('Error deleting appointment:', error)
    return NextResponse.json(
      { message: 'Internal server error', data: null },
      { status: 500 }
    )
  }
}
