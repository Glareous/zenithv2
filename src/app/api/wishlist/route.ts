import { NextResponse } from 'next/server'

import { WishListProduct } from '@src/dtos'
import fs from 'fs'
import path from 'path'

const dataFilePath = path.join(
  process.cwd(),
  'src/apidata/ecommerce/wishlist.json'
)

const readData = () => {
  const jsonData = fs.readFileSync(dataFilePath, 'utf-8')
  return JSON.parse(jsonData)
}

const writeData = (data: WishListProduct[]): void => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2))
  } catch (error: unknown) {
    console.error('Error writing file:', error)
  }
}
// **GET - Fetch Wishlist**
export async function GET() {
  try {
    const wishlist = readData()
    return NextResponse.json({
      message: 'Wishlist fetched successfully',
      data: wishlist,
    })
  } catch (error) {
    console.error('Error fetching wishlist:', error)
    return NextResponse.json(
      { message: 'Internal server error', data: null },
      { status: 500 }
    )
  }
}

// **POST - Add New Wishlist Item**
export async function POST(request: Request) {
  try {
    const newWishListRecord = await request.json()
    const wishlist = readData()
    newWishListRecord.id = wishlist.length > 0 ? wishlist.length + 1 : 1
    wishlist.push(newWishListRecord)
    writeData(wishlist)

    return NextResponse.json(
      { message: 'Wishlist item added successfully', data: newWishListRecord },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error adding wishlist item:', error)
    return NextResponse.json(
      { message: 'Internal server error', data: null },
      { status: 500 }
    )
  }
}

// **PUT - Update Wishlist Item**
export async function PUT(request: Request) {
  try {
    const updatedWishListRecord = await request.json()
    const wishlist = readData()
    const index = wishlist.findIndex(
      (wish: { id: number }) => wish.id === updatedWishListRecord.id
    )

    if (index !== -1) {
      wishlist[index] = updatedWishListRecord
      writeData(wishlist)
      return NextResponse.json({
        message: 'Wishlist record updated successfully',
        data: updatedWishListRecord,
      })
    } else {
      return NextResponse.json(
        { message: 'Wishlist record not found', data: null },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Error updating wishlist:', error)
    return NextResponse.json(
      { message: 'Internal server error', data: null },
      { status: 500 }
    )
  }
}

// **DELETE - Remove Wishlist Item**
export async function DELETE(request: Request) {
  try {
    const { id }: { id: number } = await request.json()
    const wishlist = readData()
    const filteredWishlist = wishlist.filter(
      (wish: { id: number }) => wish.id !== id
    )

    if (wishlist.length === filteredWishlist.length) {
      return NextResponse.json(
        { message: `Wishlist item with ID ${id} not found` },
        { status: 404 }
      )
    } else {
      writeData(filteredWishlist)
      return NextResponse.json({
        data: id,
        message: 'Wishlist record successfully deleted',
      })
    }
  } catch (error) {
    console.error('Error deleting wishlist item:', error)
    return NextResponse.json(
      { message: 'Internal server error', data: null },
      { status: 500 }
    )
  }
}
