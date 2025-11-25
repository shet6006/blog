import { NextResponse } from "next/server"

export async function POST(req: Request) {
  // 실제 프로토콜 확인 (프록시 환경 대응)
  const forwardedProto = req.headers.get("x-forwarded-proto")
  const isHttps = forwardedProto === "https" || 
                  (process.env.NODE_ENV === "production" && !forwardedProto)
  // 환경 변수로 명시적 제어 가능
  const shouldUseSecure = process.env.COOKIE_SECURE === "true" || 
                          (process.env.COOKIE_SECURE !== "false" && isHttps)

  const response = NextResponse.json(
    { message: "로그아웃 성공" },
    { status: 200 }
  )

  // 쿠키 삭제 (로그인 시 설정한 것과 동일한 옵션으로)
  response.cookies.set({
    name: "token",
    value: "",
    httpOnly: true,
    secure: shouldUseSecure, // 실제 프로토콜 기반 설정
    sameSite: process.env.COOKIE_SAME_SITE === "none" ? "none" : 
              process.env.COOKIE_SAME_SITE === "strict" ? "strict" : "lax",
    maxAge: 0, // 즉시 만료
    path: "/",
  })

  return response
} 