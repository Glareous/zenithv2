import { NextRequest, NextResponse } from 'next/server'

import { Patients } from '@src/dtos'
import fs from 'fs'
import path from 'path'

const dataFilePath = path.join(
  process.cwd(),
  'src/apidata/hospital/patients/patients.json'
)

const readData = (): Patients[] => {
  const jsonData = fs.readFileSync(dataFilePath, 'utf-8')
  return JSON.parse(jsonData)
}

const writeData = (data: Patients[]) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing file:', error)
  }
}

// GET: Fetch all patients
export async function GET() {
  try {
    const patientsList = readData()
    return NextResponse.json(
      {
        message: 'Patients list fetched successfully',
        data: patientsList,
      },
      { status: 200 }
    )
  } catch (error) {
    console.log('Patients list fetche api error', error)
    return NextResponse.json({ message: 'Error reading data' }, { status: 500 })
  }
}

// POST: Add a new patient
export async function POST(req: NextRequest) {
  try {
    const newPatient: Patients = await req.json()
    const patientsList = readData()

    newPatient.id = patientsList.length > 0 ? patientsList.length + 1 : 1
    patientsList.push(newPatient)
    writeData(patientsList)

    return NextResponse.json(
      {
        message: 'Patient added successfully',
        data: newPatient,
      },
      { status: 201 }
    )
  } catch (error) {
    console.log('Patients list add api error', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT: Update a patient record
export async function PUT(req: NextRequest) {
  try {
    const updatedPatient: Patients = await req.json()
    const patientsList = readData()
    const index = patientsList.findIndex(
      (patient) => patient.id === updatedPatient.id
    )

    if (index !== -1) {
      patientsList[index] = updatedPatient
      writeData(patientsList)
      return NextResponse.json(
        {
          message: 'Patient record updated successfully',
          data: updatedPatient,
        },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { message: 'Patient not found' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.log('Patients list fetche api error', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE: Remove a patient record
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json() // Expecting { "id": number } in request body
    const patientsList = readData()

    const filteredPatients = patientsList.filter((patient) => patient.id !== id)

    if (patientsList.length === filteredPatients.length) {
      return NextResponse.json(
        { message: `Patient ID ${id} not found` },
        { status: 404 }
      )
    }

    writeData(filteredPatients)

    return NextResponse.json(
      {
        data: id,
        message: 'Patient record successfully deleted',
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
