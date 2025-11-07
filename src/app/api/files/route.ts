import { NextResponse } from 'next/server'

import { FileListRecord } from '@src/dtos/apps/filemanager'
import fs from 'fs'
import path from 'path'

const dataFilePath = path.join(
  process.cwd(),
  'src/apidata/filemanager/files.json'
)

const readData = (): FileListRecord[] => {
  const jsonData = fs.readFileSync(dataFilePath, 'utf-8')
  return JSON.parse(jsonData)
}

const writeData = (data: FileListRecord[]) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing file:', error)
  }
}

// **GET Request - Fetch All Files**
export async function GET() {
  const files = readData()
  return NextResponse.json({
    message: 'Files fetched successfully',
    data: files,
  })
}

// **POST Request - Create a New File Record**
export async function POST(req: Request) {
  try {
    const newFile: FileListRecord = await req.json()
    const filesList = readData()
    newFile.id = filesList.length > 0 ? filesList.length + 1 : 1
    filesList.push(newFile)
    writeData(filesList)
    return NextResponse.json(
      {
        message: 'File created successfully',
        data: newFile,
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

// **PUT Request - Update a File Record**
export async function PUT(req: Request) {
  try {
    const updatedFile: FileListRecord = await req.json()
    const allFiles = readData()
    const index = allFiles.findIndex((file) => file.id === updatedFile.id)

    if (index !== -1) {
      allFiles[index] = updatedFile
      writeData(allFiles)
      return NextResponse.json({
        message: 'File updated successfully',
        data: updatedFile,
      })
    } else {
      return NextResponse.json(
        {
          message: 'File not found',
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

// **DELETE Request - Delete a File Record**
export async function DELETE(req: Request) {
  try {
    const { id }: { id: number } = await req.json()
    const filesData = readData()
    const filteredFiles = filesData.filter((file) => file.id !== id)

    if (filesData.length === filteredFiles.length) {
      return NextResponse.json(
        {
          message: `File with ID ${id} not found`,
        },
        { status: 404 }
      )
    } else {
      writeData(filteredFiles)
      return NextResponse.json({
        data: id,
        message: 'File record successfully deleted',
      })
    }
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json(
      {
        message: 'Internal server error',
        data: null,
      },
      { status: 500 }
    )
  }
}
