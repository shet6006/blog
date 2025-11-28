import { NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import path from "path"
import { mkdir } from "fs/promises"
import pool from "@/lib/database"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import { AdminModel } from "@/lib/models/admin"

// 파일 파서용
export const config = {
  api: {
    bodyParser: false,
  },
}

async function parseFormData(req: Request): Promise<{
  fields: Record<string, string>
  file?: { buffer: Buffer; filename: string }
}> {
  const boundary = req.headers.get("content-type")?.split("boundary=")?.[1]
  if (!boundary) throw new Error("multipart/form-data boundary not found")

  const reader = req.body?.getReader()
  const decoder = new TextDecoder()
  const chunks: Uint8Array[] = []

  if (reader) {
    let result
    while (!(result = await reader.read()).done) {
      chunks.push(result.value)
    }
  }

  // ⚠️ 실제 production에선 formidable이나 multiparty 같은 패키지를 쓰는 게 안정적임.
  throw new Error("multipart 파서는 간략화된 예시입니다. `formidable`로 대체 권장")
}

// JWT 토큰에서 userId 가져오기
async function getAuthenticatedUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  
  if (!token || !process.env.JWT_SECRET) {
    return null
  }
  
  try {
    const decoded = verify(token, process.env.JWT_SECRET) as { userId: string }
    if (decoded?.userId) {
      const isAdmin = await AdminModel.isAdmin(decoded.userId)
      if (isAdmin) {
        return decoded.userId
      }
    }
  } catch {
    // 토큰 검증 실패
  }
  
  return null
}

// 📌 프로필 조회
export async function GET() {
  try {
    const userId = await getAuthenticatedUserId()
    
    if (!userId) {
      // 인증되지 않은 경우 첫 번째 관리자 프로필 반환 (공개 정보)
      const [profiles] = await pool.execute(
        "SELECT id, name, email, avatar_url, github_username, bio, created_at, updated_at FROM admin_profile LIMIT 1"
      ) as any[]

      if (profiles.length === 0) {
        return NextResponse.json({ error: "프로필을 찾을 수 없습니다." }, { status: 404 })
      }

      return NextResponse.json({ profile: profiles[0] })
    }

    // 인증된 경우 해당 사용자의 프로필 반환
    const [profiles] = await pool.execute(
      "SELECT id, name, email, avatar_url, github_username, bio, created_at, updated_at FROM admin_profile WHERE id = ?",
      [userId]
    ) as any[]

    if (profiles.length === 0) {
      return NextResponse.json({ error: "프로필을 찾을 수 없습니다." }, { status: 404 })
    }

    return NextResponse.json({ profile: profiles[0] })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: "프로필을 불러오는 중 오류가 발생했습니다." }, { status: 500 })
  }
}

// 📌 프로필 업데이트
export async function PUT(req: Request) {
  try {
    const userId = await getAuthenticatedUserId()
    
    if (!userId) {
      return NextResponse.json({ error: "인증되지 않은 요청입니다." }, { status: 401 })
    }

    const { name, email, avatar_url, github_username, bio } = await req.json()

    if (!name) {
      return NextResponse.json(
        { error: "이름은 필수입니다." },
        { status: 400 }
      )
    }

    await pool.execute(
      `UPDATE admin_profile 
       SET name = ?, 
           email = ?, 
           avatar_url = ?, 
           github_username = ?,
           bio = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, email, avatar_url, github_username, bio, userId]
    )

    const [updatedProfile] = await pool.execute(
      "SELECT id, name, email, avatar_url, github_username, bio, created_at, updated_at FROM admin_profile WHERE id = ?",
      [userId]
    ) as any[]

    return NextResponse.json({ profile: updatedProfile[0] })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "프로필 업데이트 중 오류가 발생했습니다." }, { status: 500 })
  }
}
