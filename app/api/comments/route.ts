import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth"
import pool from "@/lib/database"
import { RowDataPacket, OkPacket } from "mysql2"

// 댓글 목록 조회
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get("postId")

    if (!postId) {
      return NextResponse.json(
        { error: "게시글 ID가 필요합니다." },
        { status: 400 }
      )
    }

    const [comments] = await pool.execute<RowDataPacket[]>(
      `SELECT c.*,
        CASE WHEN ap.id IS NOT NULL THEN 1 ELSE 0 END as is_admin
       FROM comments c
       LEFT JOIN admin_profile ap ON c.author_name = ap.name
       WHERE c.post_id = ?
       ORDER BY c.created_at DESC`,
      [postId]
    )

    return NextResponse.json(comments)
  } catch (error) {
    console.error("댓글 조회 중 오류:", error)
    return NextResponse.json(
      { error: "댓글을 불러오는데 실패했습니다." },
      { status: 500 }
    )
  }
}

// 댓글 작성
export async function POST(request: Request) {
  try {
    const { postId, authorName, content, deviceId } = await request.json()

    if (!postId || !authorName || !content || !deviceId) {
      return NextResponse.json(
        { error: "필수 정보가 누락되었습니다." },
        { status: 400 }
      )
    }

    // 게시글 존재 여부 확인
    const [post] = await pool.execute<RowDataPacket[]>(
      "SELECT id FROM posts WHERE id = ?",
      [postId]
    )

    if (!post.length) {
      return NextResponse.json(
        { error: "존재하지 않는 게시글입니다." },
        { status: 404 }
      )
    }

    // 댓글 작성
    const [result] = await pool.execute<OkPacket>(
      "INSERT INTO comments (post_id, author_name, content, device_id, created_at) VALUES (?, ?, ?, ?, NOW())",
      [postId, authorName, content, deviceId]
    )

    return NextResponse.json({
      id: result.insertId,
      postId,
      authorName,
      content,
      deviceId,
      createdAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("댓글 작성 중 오류:", error)
    return NextResponse.json(
      { error: "댓글 작성에 실패했습니다." },
      { status: 500 }
    )
  }
}
