import { NextResponse } from 'next/server'

import { CrmContactItems } from '@src/dtos'
import fs from 'fs'
import path from 'path'

const dataFilePath = path.join(process.cwd(), 'src/apidata/crm/crmcontact.json')

const readData = (): CrmContactItems[] => {
  const jsonData = fs.readFileSync(dataFilePath, 'utf-8')
  return JSON.parse(jsonData)
}

const writeData = (data: CrmContactItems[]) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing file:', error)
  }
}

export async function GET() {
  const contacts = readData()
  return NextResponse.json({
    message: 'Contacts fetched successfully',
    data: contacts,
  })
}

export async function POST(req: Request) {
  try {
    const newContact: CrmContactItems = await req.json()
    const contactsList = readData()
    newContact.id = contactsList.length > 0 ? contactsList.length + 1 : 1
    contactsList.push(newContact)
    writeData(contactsList)
    return NextResponse.json(
      {
        message: 'Contact created successfully',
        data: newContact,
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
    const updatedContact: CrmContactItems = await req.json()
    const allContacts = readData()
    const index = allContacts.findIndex(
      (contact) => contact.id === updatedContact.id
    )
    if (index !== -1) {
      allContacts[index] = updatedContact
      writeData(allContacts)
      return NextResponse.json({
        message: 'Contact updated successfully',
        data: updatedContact,
      })
    } else {
      return NextResponse.json(
        {
          message: 'Contact not found',
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
    const contactsData = readData()
    const filteredContacts = contactsData.filter((contact) => contact.id !== id)

    if (contactsData.length === filteredContacts.length) {
      return NextResponse.json(
        {
          message: `Contact with ID ${id} not found`,
        },
        { status: 404 }
      )
    }
    writeData(filteredContacts)
    return NextResponse.json({
      data: id,
      message: 'Contact record successfully deleted',
    })
  } catch (error) {
    console.error('Error deleting contact:', error)
    return NextResponse.json(
      {
        message: 'Internal server error',
        data: null,
      },
      { status: 500 }
    )
  }
}
