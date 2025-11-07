import { NextResponse } from 'next/server'

import { AppointmentList } from '@src/dtos'
import fs from 'fs'
import path from 'path'

const dataFilePath = path.join(
  process.cwd(),
  'src/apidata/hospital/appointments/today_appointment.json'
)

const readData = () => {
  const jsonData = fs.readFileSync(dataFilePath, 'utf-8')
  return JSON.parse(jsonData)
}

const writeData = (data: AppointmentList[]) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing file:', error)
  }
}

// **GET - Fetch All Appointments**
export async function GET() {
  try {
    const todayAppointmentList = readData()
    return NextResponse.json({
      message: 'Appointments data fetched successfully',
      data: todayAppointmentList,
    })
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json(
      { message: 'Internal server error', data: null },
      { status: 500 }
    )
  }
}

// **POST - Add a New Appointment**
export async function POST(request: Request) {
  try {
    const newAppointment = await request.json()
    const appointmentList = readData()
    newAppointment.id =
      appointmentList.length > 0 ? appointmentList.length + 1 : 1
    appointmentList.push(newAppointment)
    writeData(appointmentList)

    return NextResponse.json(
      { message: 'Appointment added successfully', data: newAppointment },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error adding appointment:', error)
    return NextResponse.json(
      { message: 'Internal server error', data: null },
      { status: 500 }
    )
  }
}

// **PUT - Update an Appointment**
export async function PUT(request: Request) {
  try {
    const updatedAppointment = await request.json()
    const appointmentList = readData()
    const index = appointmentList.findIndex(
      (appointment: { id: number }) => appointment.id === updatedAppointment.id
    )

    if (index !== -1) {
      appointmentList[index] = updatedAppointment
      writeData(appointmentList)
      return NextResponse.json({
        message: 'Appointment updated successfully',
        data: updatedAppointment,
      })
    } else {
      return NextResponse.json(
        { message: 'Appointment not found', data: null },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Error updating appointment:', error)
    return NextResponse.json(
      { message: 'Internal server error', data: null },
      { status: 500 }
    )
  }
}

// **DELETE - Remove an Appointment**
export async function DELETE(request: Request) {
  try {
    const { id }: { id: number } = await request.json()
    const appointmentList = readData()
    const filteredList = appointmentList.filter(
      (appointment: { id: number }) => appointment.id !== id
    )

    if (appointmentList.length === filteredList.length) {
      return NextResponse.json(
        { message: `Appointment ID ${id} not found` },
        { status: 404 }
      )
    } else {
      writeData(filteredList)
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
