import { NextResponse } from "next/server"
import pool from "@/lib/database"

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const categoryId = parseInt(id)

    // 해당 카테고리를 사용하는 게시글이 있는지 확인
    const [posts] = await pool.execute(
      "SELECT COUNT(*) as count FROM posts WHERE category_id = ?",
      [categoryId]
    ) as any[]

    if (posts[0].count > 0) {
      return NextResponse.json(
        { error: "이 카테고리를 사용하는 게시글이 있어 삭제할 수 없습니다." },
        { status: 400 }
      )
    }

    await pool.execute("DELETE FROM categories WHERE id = ?", [categoryId])

    return NextResponse.json({ message: "카테고리가 삭제되었습니다." })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json(
      { error: "카테고리 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
} 