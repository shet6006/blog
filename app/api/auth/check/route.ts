import { NextResponse } from "next/server"
import { verify } from "jsonwebtoken"
import { cookies } from "next/headers"
import pool from "@/lib/database"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")

    if (!token) {
      return NextResponse.json(
        { error: "인증되지 않음" },
        { status: 401 }
      )
    }

    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { error: "서버 설정 오류가 발생했습니다." },
        { status: 500 }
      )
    }

    const decoded = verify(token.value, process.env.JWT_SECRET) as {
      userId: string
      name: string
    }

    const [users] = await pool.execute(
      'SELECT id, name FROM admin_profile WHERE id = ?',
      [decoded.userId]
    ) as any[]

    const user = users[0]

    if (!user) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      user: {
        id: user.id,
        name: user.name
      }
    }, { status: 200 })
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json(
      { error: "인증 확인 중 오류가 발생했습니다." },
      { status: 401 }
    )
  }
} 