import { NextRequest, NextResponse } from 'next/server'

import { GroupChatRecord } from '@src/dtos'
import fs from 'fs'
import path from 'path'

const dataFilePath = path.join(process.cwd(), 'src/apidata/chat/group.json')

const readData = (): GroupChatRecord[] => {
  const jsonData = fs.readFileSync(dataFilePath, 'utf-8')
  return JSON.parse(jsonData)
}

const writeData = (data: GroupChatRecord[]) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing file:', error)
  }
}

// GET: Fetch Group Chat List
export async function GET() {
  try {
    const groupChatList = readData()
    return NextResponse.json(
      {
        message: 'Group chat list fetched successfully',
        data: groupChatList,
      },
      { status: 200 }
    )
  } catch (error) {
    console.log('Group chat error', error)

    return NextResponse.json({ message: 'Error reading data' }, { status: 500 })
  }
}

// POST: Add New Group Chat
export async function POST(req: NextRequest) {
  try {
    const newGroupChat: GroupChatRecord = await req.json()
    const groupChatList = readData()

    newGroupChat.id = groupChatList.length > 0 ? groupChatList.length + 1 : 1
    groupChatList.push(newGroupChat)
    writeData(groupChatList)

    return NextResponse.json(
      {
        message: 'New group chat created successfully',
        data: newGroupChat,
      },
      { status: 201 }
    )
  } catch (error) {
    console.log('New group chat api error', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT: Update Group Chat Record
export async function PUT(req: NextRequest) {
  try {
    const updateGroupChat: GroupChatRecord = await req.json()
    const groupChatList = readData()
    const index = groupChatList.findIndex(
      (chat) => chat.id === updateGroupChat.id
    )

    if (index !== -1) {
      groupChatList[index] = updateGroupChat
      writeData(groupChatList)
      return NextResponse.json(
        {
          message: 'Group chat record updated successfully',
          data: updateGroupChat,
        },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { message: 'Group chat record not found' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.log('Group chat record api error', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE: Remove Group Chat Record
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json() // Expecting { "id": number } in request body
    const groupChatList = readData()

    const filteredChatList = groupChatList.filter((chat) => chat.id !== id)

    if (groupChatList.length === filteredChatList.length) {
      return NextResponse.json(
        { message: `Group chat record with ID ${id} not found` },
        { status: 404 }
      )
    }

    writeData(filteredChatList)

    return NextResponse.json(
      {
        data: id,
        message: 'Group chat record successfully deleted',
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
