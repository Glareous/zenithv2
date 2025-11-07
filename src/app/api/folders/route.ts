import { NextRequest, NextResponse } from 'next/server'

import { FolderListRecord } from '@src/dtos/apps/filemanager'
import fs from 'fs'
import path from 'path'

const dataFilePath = path.join(
  process.cwd(),
  'src/apidata/filemanager/folders.json'
)

const readData = (): FolderListRecord[] => {
  const jsonData = fs.readFileSync(dataFilePath, 'utf-8')
  return JSON.parse(jsonData)
}

const writeData = (data: FolderListRecord[]) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing file:', error)
  }
}

// GET: Fetch folders
export async function GET() {
  const folders = readData()
  return NextResponse.json(
    {
      message: 'Folders fetched successfully',
      data: folders,
    },
    { status: 200 }
  )
}

// POST: Create a new folder record
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const newFolder: FolderListRecord = body
    const folderList = readData()
    newFolder.id = folderList.length > 0 ? folderList.length + 1 : 1
    folderList.push(newFolder)
    writeData(folderList)

    return NextResponse.json(
      {
        message: 'Folder created successfully',
        data: newFolder,
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

// PUT: Update a folder record
export async function PUT(req: NextRequest) {
  try {
    const updatedFolder: FolderListRecord = await req.json()
    const allFolders = readData()
    const index = allFolders.findIndex(
      (folder) => folder.id === updatedFolder.id
    )

    if (index !== -1) {
      allFolders[index] = updatedFolder
      writeData(allFolders)
      return NextResponse.json(
        {
          message: 'Folder updated successfully',
          data: updatedFolder,
        },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        {
          message: 'Folder not found',
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

// DELETE: Remove a folder record
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json()
    const id: number = parseInt(body.id)
    const foldersData = readData()

    const filteredFolders = foldersData.filter((folder) => folder.id !== id)

    if (foldersData.length === filteredFolders.length) {
      return NextResponse.json(
        {
          message: `Folder with ID ${id} not found`,
        },
        { status: 404 }
      )
    } else {
      writeData(filteredFolders)
      return NextResponse.json(
        {
          data: id,
          message: 'Folder successfully deleted',
        },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error('Error deleting folder:', error)
    return NextResponse.json(
      {
        message: 'Internal server error',
        data: null,
      },
      { status: 500 }
    )
  }
}
