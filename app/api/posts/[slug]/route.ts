import { NextResponse } from "next/server"
import pool from "@/lib/database"
import { RowDataPacket } from "mysql2"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import { AdminModel } from "@/lib/models/admin"

// 인증된 관리자인지 확인
async function isAuthenticatedAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    
    if (!token || !process.env.JWT_SECRET) {
      return false
    }
    
    const decoded = verify(token, process.env.JWT_SECRET) as { userId: string }
    if (decoded?.userId) {
      return await AdminModel.isAdmin(decoded.userId)
    }
  } catch {
    // 토큰 검증 실패
  }
  return false
}

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params
  try {
    const isAdmin = await isAuthenticatedAdmin()
    
    // 관리자가 아니면 공개 게시글만 조회
    let query = `SELECT p.*, c.name as category_name FROM posts p LEFT JOIN categories c ON p.category_id = c.id WHERE p.slug = ?`
    if (!isAdmin) {
      query += ` AND p.is_public = 1`
    }
    
    const [rows] = await pool.execute<RowDataPacket[]>(query, [slug])
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "게시글을 찾을 수 없습니다." }, { status: 404 })
    }
    return NextResponse.json(rows[0])
  } catch (error) {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}

export async function PUT(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params
  
  // 관리자 인증 확인
  const isAdmin = await isAuthenticatedAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 })
  }
  
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id FROM posts WHERE slug = ?`,
      [slug]
    )
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "게시글을 찾을 수 없습니다." }, { status: 404 })
    }
    const postId = rows[0].id
    const { title, content, category_id, is_public, slug: newSlug } = await request.json()
    
    // is_public을 숫자로 변환 (MySQL 호환)
    const isPublicValue = is_public === true || is_public === 1 || is_public === "1" ? 1 : 0
    
    // slug가 변경된 경우 중복 확인
    if (newSlug && newSlug !== slug) {
      const [existingPosts] = await pool.execute<RowDataPacket[]>(
        `SELECT id FROM posts WHERE slug = ? AND id != ?`,
        [newSlug, postId]
      )
      if (Array.isArray(existingPosts) && existingPosts.length > 0) {
        return NextResponse.json({ error: "이미 사용 중인 slug입니다." }, { status: 400 })
      }
    }
    
    // excerpt 업데이트
    const excerpt = content.replace(/[#*`]/g, "").replace(/\n/g, " ").substring(0, 150) + "..."
    
    // slug 업데이트 포함
    const updateSlug = newSlug || slug
    await pool.execute(
      `UPDATE posts SET title = ?, content = ?, excerpt = ?, category_id = ?, is_public = ?, slug = ?, updated_at = NOW() WHERE id = ?`,
      [title, content, excerpt, category_id, isPublicValue, updateSlug, postId]
    )
    
    // 업데이트된 게시글 조회 (새 slug로)
    const [updatedRows] = await pool.execute<RowDataPacket[]>(
      `SELECT p.*, c.name as category_name FROM posts p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?`,
      [postId]
    )
    return NextResponse.json(updatedRows[0])
  } catch (error) {
    console.error("Update post error:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params
  
  // 관리자 인증 확인
  const isAdmin = await isAuthenticatedAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 })
  }
  
  try {
    await pool.execute(
      `DELETE FROM posts WHERE slug = ?`,
      [slug]
    )
    return NextResponse.json({ message: "게시글이 삭제되었습니다." })
  } catch (error) {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
} 