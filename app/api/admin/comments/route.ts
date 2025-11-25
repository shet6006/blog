import { NextResponse } from "next/server"
import pool from "@/lib/database"
import { RowDataPacket } from "mysql2"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"

export async function GET() {
  try {
    // 인증 확인
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

    // 모든 댓글 조회 (게시글 정보 포함)
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        c.*,
        p.title as post_title,
        p.slug as post_slug
      FROM comments c
      LEFT JOIN posts p ON c.post_id = p.id
      ORDER BY c.created_at DESC`
    )

    return NextResponse.json({ comments: rows })
  } catch (error) {
    console.error("Comments API Error:", error)
    return NextResponse.json({ error: "댓글을 불러오는데 실패했습니다." }, { status: 500 })
  }
}

