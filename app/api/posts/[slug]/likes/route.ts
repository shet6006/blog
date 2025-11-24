import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/database"
import { LikeModel } from "@/lib/models/like"
import { RowDataPacket } from "mysql2"
import { rateLimit, getClientIdentifier } from "@/lib/rate-limit"
import { validateSlug, validateDeviceId } from "@/lib/validation"

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params
  
  // Rate limiting
  const clientId = getClientIdentifier(request)
  const rateLimitResult = rateLimit(`likes-get-${clientId}`, 60, 60000)
  
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "요청이 너무 많습니다." },
      { status: 429 }
    )
  }

  // Slug 검증
  if (!validateSlug(slug)) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 })
  }

  const { searchParams } = new URL(request.url)
  const deviceId = searchParams.get("deviceId")
  
  if (!deviceId) {
    return NextResponse.json({ error: "deviceId가 필요합니다." }, { status: 400 })
  }

  // Device ID 검증
  if (!validateDeviceId(deviceId)) {
    return NextResponse.json({ error: "잘못된 deviceId입니다." }, { status: 400 })
  }
  const [postRows] = await pool.execute<RowDataPacket[]>(
    `SELECT id FROM posts WHERE slug = ?`,
    [slug]
  )
  if (!Array.isArray(postRows) || postRows.length === 0) {
    return NextResponse.json({ error: "게시글을 찾을 수 없습니다." }, { status: 404 })
  }
  const postId = postRows[0].id
  const liked = await LikeModel.isLiked(postId, deviceId)
  const count = await LikeModel.countByPostId(postId)
  return NextResponse.json({ liked, count })
}

export async function POST(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params
  
  // Rate limiting (분당 20회)
  const clientId = getClientIdentifier(request)
  const rateLimitResult = rateLimit(`likes-post-${clientId}`, 20, 60000)
  
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
      { status: 429 }
    )
  }

  // Slug 검증
  if (!validateSlug(slug)) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 })
  }

  const { deviceId } = await request.json()
  
  if (!deviceId) {
    return NextResponse.json({ error: "deviceId가 필요합니다." }, { status: 400 })
  }

  // Device ID 검증
  if (!validateDeviceId(deviceId)) {
    return NextResponse.json({ error: "잘못된 deviceId입니다." }, { status: 400 })
  }
  const [postRows] = await pool.execute<RowDataPacket[]>(
    `SELECT id FROM posts WHERE slug = ?`,
    [slug]
  )
  if (!Array.isArray(postRows) || postRows.length === 0) {
    return NextResponse.json({ error: "게시글을 찾을 수 없습니다." }, { status: 404 })
  }
  const postId = postRows[0].id
  const result = await LikeModel.toggle(postId, deviceId)
  const count = await LikeModel.countByPostId(postId)
  return NextResponse.json({ ...result, count })
}
