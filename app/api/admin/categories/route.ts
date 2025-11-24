import { NextResponse } from "next/server"
import pool from "@/lib/database"

// 카테고리 목록 조회
export async function GET() {
  try {
    const [categories] = await pool.execute(
      "SELECT * FROM categories ORDER BY created_at DESC"
    )

    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      { error: "카테고리를 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

// 새 카테고리 추가
export async function POST(req: Request) {
  try {
    const { name, slug } = await req.json()

    if (!name || !slug) {
      return NextResponse.json(
        { error: "카테고리 이름과 슬러그는 필수입니다." },
        { status: 400 }
      )
    }

    // 중복 체크
    const [existing] = await pool.execute(
      "SELECT * FROM categories WHERE name = ? OR slug = ?",
      [name, slug]
    ) as any[]

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "이미 존재하는 카테고리 이름 또는 슬러그입니다." },
        { status: 400 }
      )
    }

    const [result] = await pool.execute(
      "INSERT INTO categories (name, slug) VALUES (?, ?)",
      [name, slug]
    ) as any[]

    const [newCategory] = await pool.execute(
      "SELECT * FROM categories WHERE id = ?",
      [result.insertId]
    ) as any[]

    return NextResponse.json({ category: newCategory[0] })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json(
      { error: "카테고리 생성 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
} 