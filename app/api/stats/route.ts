import { NextResponse } from "next/server"
import pool from "@/lib/database"
import { rateLimit, getClientIdentifier } from "@/lib/rate-limit"

export async function GET(request: Request) {
  // Rate limiting (분당 60회)
  const clientId = getClientIdentifier(request)
  const rateLimitResult = rateLimit(`stats-${clientId}`, 60, 60000)
  
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "요청이 너무 많습니다." },
      { status: 429 }
    )
  }

  try {
    // 총 게시글 수
    const [postsResult] = await pool.execute(
      "SELECT COUNT(*) as total FROM posts WHERE is_public = true"
    ) as any[]

    // 총 좋아요 수
    const [likesResult] = await pool.execute(
      "SELECT COUNT(*) as total FROM likes"
    ) as any[]

    // 총 댓글 수
    const [commentsResult] = await pool.execute(
      "SELECT COUNT(*) as total FROM comments"
    ) as any[]

    return NextResponse.json({
      totalPosts: postsResult[0].total,
      totalLikes: likesResult[0].total,
      totalComments: commentsResult[0].total,
    })
  } catch (error) {
    console.error("Stats API Error:", error)
    return NextResponse.json(
      { error: "통계를 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
} 