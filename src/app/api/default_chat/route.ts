import { NextResponse } from 'next/server'

import { UserChatRecord } from '@src/dtos'
import fs from 'fs'
import path from 'path'

const dataFilePath = path.join(process.cwd(), 'src/apidata/chat/chat.json')

const readData = (): UserChatRecord[] => {
  const jsonData = fs.readFileSync(dataFilePath, 'utf-8')
  return JSON.parse(jsonData)
}

const writeData = (data: UserChatRecord[]) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing file:', error)
  }
}

// **GET Request - Fetch All Chat Records**
export async function GET() {
  const userChatList = readData()
  return NextResponse.json({
    message: 'User Chat List fetched successfully',
    data: userChatList,
  })
}

// **POST Request - Create a New Chat Record**
export async function POST(req: Request) {
  try {
    const newUserChat: UserChatRecord = await req.json()
    const userChatList = readData()
    newUserChat.id = userChatList.length > 0 ? userChatList.length + 1 : 1
    userChatList.push(newUserChat)
    writeData(userChatList)
    return NextResponse.json(
      {
        message: 'New user chat created successfully',
        data: newUserChat,
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

// **PUT Request - Update a Chat Record**
export async function PUT(req: Request) {
  try {
    const updatedChatRecord: UserChatRecord = await req.json()
    const userChatList = readData()
    const index = userChatList.findIndex(
      (chat) => chat.id === updatedChatRecord.id
    )

    if (index !== -1) {
      userChatList[index] = updatedChatRecord
      writeData(userChatList)
      return NextResponse.json({
        message: 'Chat Record updated successfully',
        data: updatedChatRecord,
      })
    } else {
      return NextResponse.json(
        {
          message: 'Chat Record not found',
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

// **DELETE Request - Delete a Chat Record**
export async function DELETE(req: Request) {
  try {
    const { id }: { id: number } = await req.json()
    const userChatList = readData()
    const filterChatList = userChatList.filter((chat) => chat.id !== id)

    if (userChatList.length === filterChatList.length) {
      return NextResponse.json(
        {
          message: `Chat Record with ID ${id} not found`,
        },
        { status: 404 }
      )
    } else {
      writeData(filterChatList)
      return NextResponse.json({
        data: id,
        message: 'Chat record successfully deleted',
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
