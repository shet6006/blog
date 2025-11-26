import { NextResponse } from "next/server"
import { verify } from "jsonwebtoken"
import { cookies } from "next/headers"
import pool from "@/lib/database"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")

    // 토큰이 없으면 로그인하지 않은 상태로 정상 응답 (401 대신 200)
    if (!token) {
      return NextResponse.json(
        { 
          authenticated: false,
          user: null
        },
        { status: 200 }
      )
    }

    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { error: "서버 설정 오류가 발생했습니다." },
        { status: 500 }
      )
    }

    try {
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
        // 사용자를 찾을 수 없으면 로그인하지 않은 상태로 처리
        return NextResponse.json(
          { 
            authenticated: false,
            user: null
          },
          { status: 200 }
        )
      }

      return NextResponse.json({ 
        authenticated: true,
        user: {
          id: user.id,
          name: user.name
        }
      }, { status: 200 })
    } catch (verifyError) {
      // 토큰 검증 실패 (만료, 잘못된 토큰 등)도 로그인하지 않은 상태로 처리
      return NextResponse.json(
        { 
          authenticated: false,
          user: null
        },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error("Auth check error:", error)
    // 예상치 못한 오류도 로그인하지 않은 상태로 처리
    return NextResponse.json(
      { 
        authenticated: false,
        user: null
      },
      { status: 200 }
    )
  }
} 