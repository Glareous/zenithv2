import { NextResponse } from 'next/server'

/**
 * GET /api/fraud/transaccion/random
 * Mock endpoint for getting a random fraud transaction
 *
 * TODO: Replace this with actual API integration when available
 */
export async function GET() {
  try {
    // Mock random transaction data
    const mockTransaction = {
      transaction_id: Math.floor(Math.random() * 10000),
      user: Math.floor(Math.random() * 100),
      card: Math.floor(Math.random() * 100),
      year: 2020 + Math.floor(Math.random() * 5),
      month: 1 + Math.floor(Math.random() * 12),
      day: 1 + Math.floor(Math.random() * 28),
      time: `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      amount: parseFloat((Math.random() * 1000).toFixed(2)),
      use_chip: ['Swipe Transaction', 'Chip Transaction', 'Online Transaction'][Math.floor(Math.random() * 3)],
      merchant_name: Math.random().toString().slice(2, 18),
      merchant_city: ['La Verne', 'Los Angeles', 'San Francisco', 'New York', 'Chicago'][Math.floor(Math.random() * 5)],
      merchant_state: ['CA', 'NY', 'TX', 'FL', 'IL'][Math.floor(Math.random() * 5)],
      zip: 90000 + Math.floor(Math.random() * 9999),
      mcc: 5000 + Math.floor(Math.random() * 1000),
    }

    return NextResponse.json(mockTransaction)
  } catch (error) {
    console.error('Error generating random transaction:', error)
    return NextResponse.json(
      { error: 'Failed to generate random transaction' },
      { status: 500 }
    )
  }
}
