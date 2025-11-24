import pool from "@/lib/database"
import type { RowDataPacket } from "mysql2"

export interface AdminProfile {
  id: string
  name: string
  email: string
  avatar_url: string
  github_username: string
  created_at: string
  updated_at: string
}

export interface BlogStats {
  totalPosts: number
  totalLikes: number
  totalComments: number
  monthlyViews: number
}

export class AdminModel {
  // 관리자 프로필 조회
  static async getProfile(): Promise<AdminProfile | null> {
    const query = "SELECT * FROM admin_profile WHERE id = ?"
    const [rows] = await pool.execute<RowDataPacket[]>(query, ["admin"])
    return rows.length > 0 ? (rows[0] as AdminProfile) : null
  }

  // 관리자 프로필 업데이트
  static async updateProfile(updates: Partial<AdminProfile>): Promise<AdminProfile | null> {
    const fields = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(", ")
    const values = Object.values(updates)

    const query = `UPDATE admin_profile SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
    await pool.execute(query, [...values, "admin"])

    return this.getProfile()
  }

  // 블로그 통계 조회
  static async getStats(): Promise<BlogStats> {
    // 총 공개 게시글 수
    const [postsResult] = await pool.execute<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM posts WHERE is_public = true",
    )

    // 총 좋아요 수
    const [likesResult] = await pool.execute<RowDataPacket[]>("SELECT COUNT(*) as count FROM likes")

    // 총 댓글 수
    const [commentsResult] = await pool.execute<RowDataPacket[]>("SELECT COUNT(*) as count FROM comments")

    // 월간 조회수 (임시 데이터)
    const monthlyViews = Math.floor(Math.random() * 10000) + 5000

    return {
      totalPosts: postsResult[0].count,
      totalLikes: likesResult[0].count,
      totalComments: commentsResult[0].count,
      monthlyViews,
    }
  }
}
