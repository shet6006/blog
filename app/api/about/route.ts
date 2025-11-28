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
      
      // tech_stack 안전하게 파싱
      let parsedTechStack: string[] = []
      if (about.tech_stack) {
        try {
          if (typeof about.tech_stack === 'string') {
            const trimmed = about.tech_stack.trim()
            if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') {
              parsedTechStack = []
            } else {
              if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
                parsedTechStack = JSON.parse(trimmed)
              } else {
                parsedTechStack = [trimmed]
              }
            }
          } else if (Array.isArray(about.tech_stack)) {
            parsedTechStack = about.tech_stack
          }
        } catch (parseError) {
          console.error("tech_stack 파싱 오류:", parseError, "원본 값:", about.tech_stack)
          parsedTechStack = []
        }
      }
      
      return NextResponse.json({
        ...about,
        tech_stack: parsedTechStack,
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
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 })
    }

    // admin_profile 테이블에 존재하는 사용자인지 확인
    const { AdminModel } = await import("@/lib/models/admin")
    const isAdmin = await AdminModel.isAdmin(decoded.userId)
    if (!isAdmin) {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 })
    }

    const body = await req.json()
    const { title, content, tech_stack } = body

    // 입력 검증
    if (!title || !content) {
      return NextResponse.json(
        { error: "제목과 내용은 필수입니다." },
        { status: 400 }
      )
    }

    // 기존 데이터 확인
    const [existingRows] = await pool.execute<RowDataPacket[]>(
      "SELECT * FROM about_page ORDER BY id DESC LIMIT 1"
    )

    let aboutId: number

    if (Array.isArray(existingRows) && existingRows.length > 0) {
      // 업데이트
      aboutId = existingRows[0].id
      await pool.execute(
        "UPDATE about_page SET title = ?, content = ?, tech_stack = ?, updated_at = NOW() WHERE id = ?",
        [title, content, JSON.stringify(tech_stack || []), aboutId]
      )
    } else {
      // 생성
      const [result] = await pool.execute(
        "INSERT INTO about_page (title, content, tech_stack) VALUES (?, ?, ?)",
        [title, content, JSON.stringify(tech_stack || [])]
      ) as any[]
      
      // insertId 확인 (mysql2의 ResultSetHeader)
      if (result && result.insertId) {
        aboutId = result.insertId
      } else {
        // insertId가 없으면 다시 조회
        const [newRows] = await pool.execute<RowDataPacket[]>(
          "SELECT id FROM about_page ORDER BY id DESC LIMIT 1"
        )
        if (Array.isArray(newRows) && newRows.length > 0) {
          aboutId = newRows[0].id
        } else {
          throw new Error("생성된 데이터를 찾을 수 없습니다.")
        }
      }
    }

    // 업데이트된 데이터 조회
    const [updatedRows] = await pool.execute<RowDataPacket[]>(
      "SELECT * FROM about_page WHERE id = ?",
      [aboutId]
    )

    if (!Array.isArray(updatedRows) || updatedRows.length === 0) {
      console.error("Updated data not found, id:", aboutId)
      return NextResponse.json(
        { error: "업데이트된 데이터를 찾을 수 없습니다." },
        { status: 500 }
      )
    }

    const updated = updatedRows[0]

    // tech_stack 안전하게 파싱
    let parsedTechStack: string[] = []
    if (updated.tech_stack) {
      try {
        // 이미 문자열인 경우와 JSON 문자열인 경우 모두 처리
        if (typeof updated.tech_stack === 'string') {
          const trimmed = updated.tech_stack.trim()
          if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') {
            parsedTechStack = []
          } else {
            // JSON 형식인지 확인 (배열로 시작하는지)
            if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
              parsedTechStack = JSON.parse(trimmed)
            } else {
              // 단일 문자열인 경우 배열로 변환
              parsedTechStack = [trimmed]
            }
          }
        } else if (Array.isArray(updated.tech_stack)) {
          // 이미 배열인 경우
          parsedTechStack = updated.tech_stack
        } else {
          // 객체인 경우
          parsedTechStack = []
        }
      } catch (parseError) {
        console.error("tech_stack 파싱 오류:", parseError, "원본 값:", updated.tech_stack)
        parsedTechStack = []
      }
    }

    return NextResponse.json({
      id: updated.id,
      title: updated.title,
      content: updated.content,
      tech_stack: parsedTechStack,
      updated_at: updated.updated_at,
    })
  } catch (error: any) {
    console.error("Update about page error:", error)
    console.error("Error details:", {
      message: error?.message,
      code: error?.code,
      stack: error?.stack,
    })
    return NextResponse.json(
      { 
        error: "소개 페이지 업데이트에 실패했습니다.",
        details: process.env.NODE_ENV === "development" ? error?.message : undefined
      },
      { status: 500 }
    )
  }
}

