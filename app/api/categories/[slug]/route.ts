import { NextResponse } from "next/server"
import pool from "@/lib/database"
import { RowDataPacket } from "mysql2"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM categories WHERE slug = ?`,
      [slug]
    )
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "카테고리를 찾을 수 없습니다." }, { status: 404 })
    }
    return NextResponse.json(rows[0])
  } catch (error) {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { name } = await req.json()
    await pool.execute(
      `UPDATE categories SET name = ? WHERE slug = ?`,
      [name, slug]
    )
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM categories WHERE slug = ?`,
      [slug]
    )
    return NextResponse.json(rows[0])
  } catch (error) {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    await pool.execute(
      `DELETE FROM categories WHERE slug = ?`,
      [slug]
    )
    return NextResponse.json({ message: "카테고리가 삭제되었습니다." })
  } catch (error) {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
} 