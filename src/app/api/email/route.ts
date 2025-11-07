import { NextRequest, NextResponse } from 'next/server'

import { Email } from '@src/dtos'
import fs from 'fs'
import path from 'path'

const dataFilePath = path.join(process.cwd(), 'src/apidata/email/mailbox.json')

const readData = (): Email[] => {
  const jsonData = fs.readFileSync(dataFilePath, 'utf-8')
  return JSON.parse(jsonData)
}

const writeData = (data: Email[]) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing file:', error)
  }
}

// GET: Fetch Chat List
export async function GET() {
  try {
    const userChatList = readData()
    return NextResponse.json(
      {
        message: 'User Chat List fetched successfully',
        data: userChatList,
      },
      { status: 200 }
    )
  } catch (error) {
    console.log('error', error)
    return NextResponse.json({ message: 'Error reading data' }, { status: 500 })
  }
}

// POST: Create New Chat Record
export async function POST(req: NextRequest) {
  try {
    const body: Email = await req.json()
    const userChatList = readData()

    body.id = userChatList.length > 0 ? userChatList.length + 1 : 1
    userChatList.push(body)
    writeData(userChatList)

    return NextResponse.json(
      {
        message: 'New user chat created successfully',
        data: body,
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

// PUT: Update a Chat Record
export async function PUT(req: NextRequest) {
  try {
    const updatedChat: Email = await req.json()
    const userChatList = readData()
    const index = userChatList.findIndex((chat) => chat.id === updatedChat.id)

    if (index !== -1) {
      userChatList[index] = updatedChat
      writeData(userChatList)
      return NextResponse.json(
        {
          message: 'Chat Record updated successfully',
          data: updatedChat,
        },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { message: 'Chat Record not found' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.log('error', error)

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE: Delete a Chat Record
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json() // Expecting { "id": number } in request body
    const userChatList = readData()

    const newChatList = userChatList.filter((chat) => chat.id !== id)

    if (userChatList.length === newChatList.length) {
      return NextResponse.json(
        { message: `Chat Record with ID ${id} not found` },
        { status: 404 }
      )
    }

    writeData(newChatList)

    return NextResponse.json(
      {
        data: id,
        message: 'Chat record successfully deleted',
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
