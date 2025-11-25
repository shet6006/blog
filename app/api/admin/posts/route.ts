import { NextResponse } from "next/server"
import pool from "@/lib/database"
import { RowDataPacket } from "mysql2"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import { generateSlug } from "@/lib/utils"
import { rateLimit, getClientIdentifier } from "@/lib/rate-limit"

export async function POST(req: Request) {
  // Rate limiting (분당 10회 - 관리자 게시글 작성)
  const clientId = getClientIdentifier(req)
  const rateLimitResult = rateLimit(`admin-posts-post-${clientId}`, 10, 60000)
  
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
      { status: 429 }
    )
  }

  try {
    // JWT 토큰 검증
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "인증되지 않은 요청입니다." }, { status: 401 })
    }

    if (!process.env.JWT_SECRET) {
      return NextResponse.json({ error: "서버 설정 오류가 발생했습니다." }, { status: 500 })
    }

    const decoded = verify(token, process.env.JWT_SECRET) as { userId: string }
    if (!decoded || decoded.userId !== "admin") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 })
    }

    const { title, content, category_id, is_public } = await req.json()

    // 필수 필드 검증
    if (!title || !content || !category_id) {
      return NextResponse.json(
        { error: "제목, 내용, 카테고리는 필수 입력 항목입니다." },
        { status: 400 }
      )
    }

    // 길이 제한
    if (title.length > 255) {
      return NextResponse.json({ error: "제목이 너무 깁니다. (최대 255자)" }, { status: 400 })
    }

    if (content.length > 100000) {
      return NextResponse.json({ error: "내용이 너무 깁니다. (최대 100,000자)" }, { status: 400 })
    }

    // category_id를 숫자로 변환 및 검증
    const categoryIdNum = Number.parseInt(category_id)
    if (isNaN(categoryIdNum) || !Number.isInteger(categoryIdNum) || categoryIdNum < 1) {
      return NextResponse.json({ error: "잘못된 카테고리입니다." }, { status: 400 })
    }

    // 슬러그 생성
    const slug = generateSlug(title)

    // 슬러그 중복 검사
    const [existingPosts] = await pool.execute<RowDataPacket[]>(
      "SELECT id FROM posts WHERE slug = ?",
      [slug]
    )

    if (existingPosts.length > 0) {
      return NextResponse.json({ error: "이미 사용 중인 슬러그입니다." }, { status: 400 })
    }

    // 요약 생성
    const excerpt = content.replace(/[#*`]/g, "").replace(/\n/g, " ").substring(0, 150) + "..."

    // 게시글 저장
    const [result] = await pool.execute(
      `INSERT INTO posts (
        title,
        content,
        excerpt,
        category_id,
        is_public,
        slug,
        author_id,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [title, content, excerpt, categoryIdNum, is_public, slug, "admin"]
    ) as any[]

    const [newPost] = await pool.execute(
      "SELECT * FROM posts WHERE id = ?",
      [result.insertId]
    ) as any[]

    return NextResponse.json(newPost[0])
  } catch (error) {
    console.error("Create Post Error:", error)
    return NextResponse.json(
      { error: "게시글 생성 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    // JWT 토큰 검증
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "인증되지 않은 요청입니다." }, { status: 401 })
    }

    if (!process.env.JWT_SECRET) {
      return NextResponse.json({ error: "서버 설정 오류가 발생했습니다." }, { status: 500 })
    }

    const decoded = verify(token, process.env.JWT_SECRET) as { userId: string }
    if (!decoded || decoded.userId !== "admin") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const page = Number(searchParams.get("page")) || 1
    const limit = Number(searchParams.get("limit")) || 10
    
    // 페이지네이션 검증
    const validatedPage = page < 1 ? 1 : page > 1000 ? 1000 : page
    const validatedLimit = limit < 1 ? 10 : limit > 100 ? 100 : limit
    const offset = (validatedPage - 1) * validatedLimit

    // 게시글 목록 조회
    const [posts] = await pool.execute<RowDataPacket[]>(
      `SELECT p.*, c.name as category_name 
       FROM posts p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.author_id = ? 
       ORDER BY p.created_at DESC 
       LIMIT ? OFFSET ?`,
      ["admin", Number(validatedLimit), Number(offset)]
    )

    // 전체 게시글 수 조회
    const [totalResult] = await pool.execute<RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM posts WHERE author_id = ?",
      ["admin"]
    )
    const total = totalResult[0].total

    return NextResponse.json({
      posts,
      pagination: {
        page: validatedPage,
        limit: validatedLimit,
        total,
        totalPages: Math.ceil(total / validatedLimit),
      },
    })
  } catch (error: any) {
    console.error("Posts API Error:", error)
    console.error("Error details:", {
      message: error?.message,
      code: error?.code,
      stack: error?.stack,
    })
    return NextResponse.json(
      { 
        error: "게시글 목록 조회 중 오류가 발생했습니다.",
        details: process.env.NODE_ENV === "development" ? error?.message : undefined
      },
      { status: 500 }
    )
  }
} 