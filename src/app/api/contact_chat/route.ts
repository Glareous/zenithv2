import { NextResponse } from 'next/server'

import { ContactChatRecord } from '@src/dtos'
import fs from 'fs'
import path from 'path'

const dataFilePath = path.join(process.cwd(), 'src/apidata/chat/contact.json')

const readData = (): ContactChatRecord[] => {
  const jsonData = fs.readFileSync(dataFilePath, 'utf-8')
  return JSON.parse(jsonData)
}

const writeData = (data: ContactChatRecord[]) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing file:', error)
  }
}

// **GET Request - Fetch Contact List**
export async function GET() {
  const contactChatList = readData()
  return NextResponse.json({
    message: 'Contact List fetched successfully',
    data: contactChatList,
  })
}

// **POST Request - Create a New Contact Record**
export async function POST(req: Request) {
  try {
    const newContactChat: ContactChatRecord = await req.json()
    const contactChatList = readData()
    newContactChat.id =
      contactChatList.length > 0 ? contactChatList.length + 1 : 1
    contactChatList.push(newContactChat)
    writeData(contactChatList)
    return NextResponse.json(
      {
        message: 'New contact created successfully',
        data: newContactChat,
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

// **PUT Request - Update a Contact Record**
export async function PUT(req: Request) {
  try {
    const updatedContactChatRecord: ContactChatRecord = await req.json()
    const contactChatList = readData()
    const index = contactChatList.findIndex(
      (chat) =>
        chat.id === updatedContactChatRecord.id &&
        chat.roomId === updatedContactChatRecord.roomId
    )

    if (index !== -1) {
      contactChatList[index] = updatedContactChatRecord
      writeData(contactChatList)
      return NextResponse.json({
        message: 'Contact Record updated successfully',
        data: updatedContactChatRecord,
      })
    } else {
      return NextResponse.json(
        {
          message: 'Contact Record not found',
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

// **DELETE Request - Delete a Contact Record**
export async function DELETE(req: Request) {
  try {
    const { id }: { id: number } = await req.json()
    const contactChatList = readData()
    const filteredContactList = contactChatList.filter((chat) => chat.id !== id)

    if (contactChatList.length === filteredContactList.length) {
      return NextResponse.json(
        {
          message: `Contact Record with ID ${id} not found`,
        },
        { status: 404 }
      )
    } else {
      writeData(filteredContactList)
      return NextResponse.json({
        data: id,
        message: 'Contact record successfully deleted',
      })
    }
  } catch (error) {
    console.error('Error deleting chat:', error)
    return NextResponse.json(
      {
        message: 'Internal server error',
        data: null,
      },
      { status: 500 }
    )
  }
}
