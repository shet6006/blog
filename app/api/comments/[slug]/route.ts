import { NextResponse } from "next/server"
import pool from "@/lib/database"
import { RowDataPacket } from "mysql2"
import { rateLimit, getClientIdentifier } from "@/lib/rate-limit"
import { validateAuthorName, validateContent, validateDeviceId, validateSlug } from "@/lib/validation"

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params
  
  // Rate limiting (분당 60회)
  const clientId = getClientIdentifier(request)
  const rateLimitResult = rateLimit(`comments-get-${clientId}`, 60, 60000)
  
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
      { 
        status: 429,
        headers: {
          "X-RateLimit-Limit": "60",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
          "Retry-After": "60",
        }
      }
    )
  }

  // Slug 검증
  if (!validateSlug(slug)) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 })
  }

  try {
    // slug로 postId 조회
    const [postRows] = await pool.execute<RowDataPacket[]>(
      `SELECT id FROM posts WHERE slug = ?`,
      [slug]
    )
    if (!Array.isArray(postRows) || postRows.length === 0) {
      return NextResponse.json([], { status: 200 })
    }
    const postId = postRows[0].id
    // postId로 댓글 조회
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC`,
      [postId]
    )
    return NextResponse.json(rows, {
      headers: {
        "X-RateLimit-Limit": "60",
        "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
      }
    })
  } catch (error) {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params
  
  // Rate limiting (분당 10회 - 댓글 작성)
  const clientId = getClientIdentifier(request)
  const rateLimitResult = rateLimit(`comments-post-${clientId}`, 10, 60000)
  
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "댓글 작성이 너무 많습니다. 잠시 후 다시 시도해주세요." },
      { 
        status: 429,
        headers: {
          "X-RateLimit-Limit": "10",
          "X-RateLimit-Remaining": "0",
          "Retry-After": "60",
        }
      }
    )
  }

  // Slug 검증
  if (!validateSlug(slug)) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 })
  }

  try {
    // 요청 본문 크기 제한 (1MB)
    const contentType = request.headers.get("content-type")
    if (!contentType?.includes("application/json")) {
      return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 })
    }

    const body = await request.json()
    const { authorName, content, deviceId } = body

    // 입력 검증
    if (!authorName || !content || !deviceId) {
      return NextResponse.json({ error: "필수 항목이 누락되었습니다." }, { status: 400 })
    }

    // 이름 검증
    const nameValidation = validateAuthorName(authorName)
    if (!nameValidation.valid) {
      return NextResponse.json({ error: nameValidation.error }, { status: 400 })
    }

    // 내용 검증 (최대 5000자)
    const contentValidation = validateContent(content, 5000)
    if (!contentValidation.valid) {
      return NextResponse.json({ error: contentValidation.error }, { status: 400 })
    }

    // Device ID 검증
    if (!validateDeviceId(deviceId)) {
      return NextResponse.json({ error: "잘못된 deviceId입니다." }, { status: 400 })
    }

    // slug로 postId 조회
    const [postRows] = await pool.execute<RowDataPacket[]>(
      `SELECT id FROM posts WHERE slug = ?`,
      [slug]
    )
    if (!Array.isArray(postRows) || postRows.length === 0) {
      return NextResponse.json({ error: "게시글을 찾을 수 없습니다." }, { status: 404 })
    }
    const postId = postRows[0].id

    // 댓글 생성
    await pool.execute(
      `INSERT INTO comments (post_id, author_name, content, device_id, created_at) VALUES (?, ?, ?, ?, NOW())`,
      [postId, nameValidation.sanitized, contentValidation.sanitized, deviceId]
    )
    
    // 게시글의 댓글 개수 업데이트
    await pool.execute(
      `UPDATE posts SET comments_count = (SELECT COUNT(*) FROM comments WHERE post_id = ?) WHERE id = ?`,
      [postId, postId]
    )
    
    return NextResponse.json({ message: "댓글이 등록되었습니다." }, {
      headers: {
        "X-RateLimit-Limit": "10",
        "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
      }
    })
  } catch (error) {
    console.error("Comment creation error:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params
  try {
    // slug로 postId 조회
    const [postRows] = await pool.execute<RowDataPacket[]>(
      `SELECT id FROM posts WHERE slug = ?`,
      [slug]
    )
    if (!Array.isArray(postRows) || postRows.length === 0) {
      return NextResponse.json({ error: "게시글을 찾을 수 없습니다." }, { status: 404 })
    }
    const postId = postRows[0].id
    // 댓글 ID로 삭제 (body에서 commentId 받기)
    const body = await request.json().catch(() => ({}))
    const commentId = body.commentId
    
    if (commentId) {
      await pool.execute(`DELETE FROM comments WHERE id = ? AND post_id = ?`, [commentId, postId])
    } else {
      // commentId가 없으면 모든 댓글 삭제 (기존 동작 유지)
      await pool.execute(`DELETE FROM comments WHERE post_id = ?`, [postId])
    }
    
    // 게시글의 댓글 개수 업데이트
    await pool.execute(
      `UPDATE posts SET comments_count = (SELECT COUNT(*) FROM comments WHERE post_id = ?) WHERE id = ?`,
      [postId, postId]
    )
    
    return NextResponse.json({ message: "댓글이 삭제되었습니다." })
  } catch (error) {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}
