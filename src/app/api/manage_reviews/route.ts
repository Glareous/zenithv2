import { NextRequest, NextResponse } from 'next/server'

import { UserReviewRecord } from '@src/dtos'
import fs from 'fs'
import path from 'path'

const dataFilePath = path.join(
  process.cwd(),
  'src/apidata/ecommerce/manage-reviews.json'
)

const readData = (): UserReviewRecord[] => {
  const jsonData = fs.readFileSync(dataFilePath, 'utf-8')
  return JSON.parse(jsonData)
}

const writeData = (data: UserReviewRecord[]) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing file:', error)
  }
}

// GET: Fetch user reviews
export async function GET() {
  const reviews = readData()
  return NextResponse.json(
    {
      message: 'User Reviews fetched successfully',
      data: reviews,
    },
    { status: 200 }
  )
}

// POST: Create a user review
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const newUserReview: UserReviewRecord = body
    const reviewList = readData()
    newUserReview.id = reviewList.length > 0 ? reviewList.length + 1 : 1
    reviewList.push(newUserReview)
    writeData(reviewList)

    return NextResponse.json(
      {
        message: 'User Review created successfully',
        data: newUserReview,
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

// PUT: Update a user review
export async function PUT(req: NextRequest) {
  try {
    const updatedReview: UserReviewRecord = await req.json()
    const allUserReviews = readData()
    const index = allUserReviews.findIndex(
      (review) => review.id === updatedReview.id
    )

    if (index !== -1) {
      allUserReviews[index] = updatedReview
      writeData(allUserReviews)
      return NextResponse.json(
        {
          message: 'Review updated successfully',
          data: updatedReview,
        },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        {
          message: 'Review not found',
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

// DELETE: Remove a user review
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json()
    const id: number = parseInt(body.id)
    const allUserReviews = readData()
    const filteredReviews = allUserReviews.filter((review) => review.id !== id)

    if (allUserReviews.length === filteredReviews.length) {
      return NextResponse.json(
        {
          message: `User Review with ID ${id} not found`,
        },
        { status: 404 }
      )
    } else {
      writeData(filteredReviews)
      return NextResponse.json(
        {
          data: id,
          message: 'Review successfully deleted',
        },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json(
      {
        message: 'Internal server error',
        data: null,
      },
      { status: 500 }
    )
  }
}
