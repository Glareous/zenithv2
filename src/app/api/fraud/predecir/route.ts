import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/fraud/predecir
 * Mock endpoint for predicting fraud
 *
 * TODO: Replace this with actual API integration when available
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { transaction_id } = body

    if (!transaction_id) {
      return NextResponse.json(
        { error: 'transaction_id is required' },
        { status: 400 }
      )
    }

    // Mock prediction - random fraud score
    const fraud_score = parseFloat((Math.random()).toFixed(6))
    const prediccion = fraud_score > 0.5 ? 'FRAUDE' : 'NO FRAUDE'

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return NextResponse.json({
      fraud_score,
      prediccion,
    })
  } catch (error) {
    console.error('Error predicting fraud:', error)
    return NextResponse.json(
      { error: 'Failed to predict fraud' },
      { status: 500 }
    )
  }
}
