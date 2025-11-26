import { NextResponse } from "next/server"
import pool from "@/lib/database"
import { sign } from "jsonwebtoken"
import { comparePassword } from "@/lib/auth"
import { rateLimit, getClientIdentifier } from "@/lib/rate-limit"

export async function POST(req: Request) {
  // Rate limiting (분당 5회 - 무차별 대입 공격 방지)
  const clientId = getClientIdentifier(req)
  const rateLimitResult = rateLimit(`login-${clientId}`, 5, 60000)
  
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "로그인 시도가 너무 많습니다. 1분 후 다시 시도해주세요." },
      { 
        status: 429,
        headers: {
          "X-RateLimit-Limit": "5",
          "X-RateLimit-Remaining": "0",
          "Retry-After": "60",
        }
      }
    )
  }

  try {
    const { username, password } = await req.json()

    // 입력 검증
    if (!username || !password) {
      return NextResponse.json(
        { error: "아이디와 비밀번호를 입력해주세요." },
        { status: 400 }
      )
    }

    // 길이 제한 (무차별 대입 방지)
    if (username.length > 50 || password.length > 100) {
      return NextResponse.json(
        { error: "잘못된 입력입니다." },
        { status: 400 }
      )
    }

    const [users] = await pool.execute(
      'SELECT * FROM admin_profile WHERE id = ?',
      [username]
    ) as any[]

    const user = users[0]

    if (!user) {
      return NextResponse.json(
        { error: "존재하지 않는 아이디입니다." },
        { status: 404 }
      )
    }

    const isPasswordValid = await comparePassword(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "비밀번호가 일치하지 않습니다." },
        { status: 401 }
      )
    }

    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { error: "서버 설정 오류가 발생했습니다." },
        { status: 500 }
      )
    }

    const token = sign(
      { userId: user.id, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // 1시간
    )

    // 실제 프로토콜 확인 (프록시 환경 대응)
    const forwardedProto = req.headers.get("x-forwarded-proto")
    const isHttps = forwardedProto === "https" || 
                    (process.env.NODE_ENV === "production" && !forwardedProto)
    // 환경 변수로 명시적 제어 가능
    const shouldUseSecure = process.env.COOKIE_SECURE === "true" || 
                           (process.env.COOKIE_SECURE !== "false" && isHttps)

    const response = NextResponse.json(
      { 
        message: "로그인 성공", 
        user: { 
          id: user.id, 
          name: user.name
        } 
      },
      { 
        status: 200,
        headers: {
          "X-RateLimit-Limit": "5",
          "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
        }
      }
    )

    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true, // XSS 공격 방지
      secure: shouldUseSecure, // 실제 프로토콜 기반 설정
      sameSite: process.env.COOKIE_SAME_SITE === "none" ? "none" : 
                process.env.COOKIE_SAME_SITE === "strict" ? "strict" : "lax",
      maxAge: 60 * 60 * 1, // 1 hour (3600초)
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "로그인 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
} 