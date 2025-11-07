import { NextResponse } from 'next/server'

import { LibraryBook } from '@src/dtos'
import fs from 'fs'
import path from 'path'

const dataFilePath = path.join(
  process.cwd(),
  'src/apidata/school/library/books-list.json'
)

const readData = (): LibraryBook[] => {
  const jsonData = fs.readFileSync(dataFilePath, 'utf-8')
  return JSON.parse(jsonData)
}

const writeData = (data: LibraryBook[]) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing file:', error)
  }
}

// **GET Request - Fetch All Books**
export async function GET() {
  const bookList = readData()
  return NextResponse.json({
    message: 'Book list fetched successfully',
    data: bookList,
  })
}

// **POST Request - Create a New Book Record**
export async function POST(req: Request) {
  try {
    const newBook: LibraryBook = await req.json()
    const bookList = readData()
    newBook.id = bookList.length > 0 ? bookList.length + 1 : 1
    bookList.push(newBook)
    writeData(bookList)
    return NextResponse.json(
      {
        message: 'Book added successfully',
        data: newBook,
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

// **PUT Request - Update a Book Record**
export async function PUT(req: Request) {
  try {
    const updatedBook: LibraryBook = await req.json()
    const bookList = readData()
    const index = bookList.findIndex((book) => book.id === updatedBook.id)

    if (index !== -1) {
      bookList[index] = updatedBook
      writeData(bookList)
      return NextResponse.json({
        message: 'Book updated successfully',
        data: updatedBook,
      })
    } else {
      return NextResponse.json(
        {
          message: 'Book not found',
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

// **DELETE Request - Delete a Book Record**
export async function DELETE(req: Request) {
  try {
    const { id }: { id: number } = await req.json()
    const bookList = readData()
    const filteredBooks = bookList.filter((book) => book.id !== id)

    if (bookList.length === filteredBooks.length) {
      return NextResponse.json(
        {
          message: `Book ID ${id} not found`,
        },
        { status: 404 }
      )
    } else {
      writeData(filteredBooks)
      return NextResponse.json({
        data: id,
        message: 'Book successfully deleted',
      })
    }
  } catch (error) {
    console.error('Error deleting book:', error)
    return NextResponse.json(
      {
        message: 'Internal server error',
        data: null,
      },
      { status: 500 }
    )
  }
}
