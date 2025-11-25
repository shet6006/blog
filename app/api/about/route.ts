import { NextResponse } from "next/server"
import pool from "@/lib/database"
import { RowDataPacket } from "mysql2"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"

export async function GET() {
  try {
    // 테이블 존재 여부 확인
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        "SELECT * FROM about_page ORDER BY id DESC LIMIT 1"
      )

      if (rows.length === 0) {
        return NextResponse.json({
          id: 0,
          title: "소개",
          content: "# 소개\n\n소개 페이지를 작성해주세요.",
          tech_stack: [],
          updated_at: new Date().toISOString(),
        })
      }

      const about = rows[0]
      return NextResponse.json({
        ...about,
        tech_stack: about.tech_stack ? JSON.parse(about.tech_stack) : [],
      })
    } catch (tableError: any) {
      // 테이블이 없는 경우 기본값 반환
      if (tableError?.code === "ER_NO_SUCH_TABLE" || tableError?.code === 1146) {
        return NextResponse.json({
          id: 0,
          title: "소개",
          content: "# 소개\n\n소개 페이지를 작성해주세요.",
          tech_stack: [],
          updated_at: new Date().toISOString(),
        })
      }
      throw tableError
    }
  } catch (error) {
    console.error("About page error:", error)
    // 에러가 발생해도 기본값 반환
    return NextResponse.json({
      id: 0,
      title: "소개",
      content: "# 소개\n\n소개 페이지를 작성해주세요.",
      tech_stack: [],
      updated_at: new Date().toISOString(),
    })
  }
}

export async function PUT(req: Request) {
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

    const { title, content, tech_stack } = await req.json()

    // 기존 데이터 확인
    const [existing] = await pool.execute<RowDataPacket[]>(
      "SELECT * FROM about_page ORDER BY id DESC LIMIT 1"
    )

    if (existing.length > 0) {
      // 업데이트
      await pool.execute(
        "UPDATE about_page SET title = ?, content = ?, tech_stack = ? WHERE id = ?",
        [title, content, JSON.stringify(tech_stack || []), existing[0].id]
      )
    } else {
      // 생성
      await pool.execute(
        "INSERT INTO about_page (title, content, tech_stack) VALUES (?, ?, ?)",
        [title, content, JSON.stringify(tech_stack || [])]
      )
    }

    const [updated] = await pool.execute<RowDataPacket[]>(
      "SELECT * FROM about_page ORDER BY id DESC LIMIT 1"
    )

    return NextResponse.json({
      ...updated[0],
      tech_stack: updated[0].tech_stack ? JSON.parse(updated[0].tech_stack) : [],
    })
  } catch (error) {
    console.error("Update about page error:", error)
    return NextResponse.json({ error: "소개 페이지 업데이트에 실패했습니다." }, { status: 500 })
  }
}

