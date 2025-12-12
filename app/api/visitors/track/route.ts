import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/database"
import { getClientIdentifier } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIdentifier(request)
    
    // IP가 unknown이면 집계하지 않음
    if (ip === "unknown") {
      return NextResponse.json({ success: true, message: "IP를 확인할 수 없어 집계하지 않습니다." })
    }

    // 오늘 날짜 (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0]

    // 오늘 이미 방문했는지 확인
    const [existing] = await pool.execute(
      "SELECT id FROM visitors WHERE ip_address = ? AND visit_date = ?",
      [ip, today]
    ) as any[]

    // 오늘 첫 방문이면 추가
    if (!existing || existing.length === 0) {
      await pool.execute(
        "INSERT INTO visitors (ip_address, visit_date) VALUES (?, ?)",
        [ip, today]
      )
      return NextResponse.json({ success: true, message: "방문자 수가 증가했습니다." })
    }

    // 이미 방문했으면 집계하지 않음
    return NextResponse.json({ success: true, message: "오늘 이미 방문했습니다." })
  } catch (error) {
    console.error("Visitor tracking error:", error)
    return NextResponse.json(
      { error: "방문자 집계 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

