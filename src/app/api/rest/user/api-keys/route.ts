import { NextRequest, NextResponse } from 'next/server'

import { createTRPCContext } from '@src/server/api/trpc'
import { createHash, randomBytes } from 'crypto'

export async function GET(req: NextRequest) {
  try {
    const ctx = await createTRPCContext({ headers: req.headers })
    const user = ctx.session?.user || ctx.apiKeyUser

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const apiKeys = await ctx.db.userApiKey.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        name: true,
        keyPreview: true,
        isActive: true,
        lastUsedAt: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(
      apiKeys.map((key) => ({
        ...key,
        createdAt: key.createdAt.toISOString(),
        updatedAt: key.updatedAt.toISOString(),
        lastUsedAt: key.lastUsedAt?.toISOString() || null,
        expiresAt: key.expiresAt?.toISOString() || null,
      }))
    )
  } catch (error) {
    console.error('Error in /api/rest/user/api-keys GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await createTRPCContext({ headers: req.headers })
    const user = ctx.session?.user || ctx.apiKeyUser

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, expiresAt } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Generate API key
    const apiKeyRaw = randomBytes(32).toString('hex')
    const apiKey = `ak_${apiKeyRaw}`
    const keyHash = createHash('sha256').update(apiKey).digest('hex')
    const keyPreview = `${apiKey.substring(0, 8)}...`

    // Parse expiration date if provided
    let expirationDate = null
    if (expiresAt) {
      expirationDate = new Date(expiresAt)
      if (isNaN(expirationDate.getTime()) || expirationDate <= new Date()) {
        return NextResponse.json(
          { error: 'Invalid expiration date - must be in the future' },
          { status: 400 }
        )
      }
    }

    const newApiKey = await ctx.db.userApiKey.create({
      data: {
        name: name.trim(),
        keyHash,
        keyPreview,
        userId: user.id,
        expiresAt: expirationDate,
      },
      select: {
        id: true,
        name: true,
        keyPreview: true,
        isActive: true,
        lastUsedAt: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(
      {
        ...newApiKey,
        apiKey,
        createdAt: newApiKey.createdAt.toISOString(),
        updatedAt: newApiKey.updatedAt.toISOString(),
        lastUsedAt: newApiKey.lastUsedAt?.toISOString() || null,
        expiresAt: newApiKey.expiresAt?.toISOString() || null,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in /api/rest/user/api-keys POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
