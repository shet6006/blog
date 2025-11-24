import { NextResponse } from "next/server"

export async function POST() {
  const response = NextResponse.json(
    { message: "로그아웃 성공" },
    { status: 200 }
  )

  // 쿠키 삭제 (로그인 시 설정한 것과 동일한 옵션으로)
  response.cookies.set({
    name: "token",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0, // 즉시 만료
    path: "/",
  })

  return response
} 