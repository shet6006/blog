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

export class AdminModel {
  // 관리자 프로필 조회 (id로 조회, 기본값은 첫 번째 관리자)
  static async getProfile(adminId?: string): Promise<AdminProfile | null> {
    if (adminId) {
      const query = "SELECT * FROM admin_profile WHERE id = ?"
      const [rows] = await pool.execute<RowDataPacket[]>(query, [adminId])
      return rows.length > 0 ? (rows[0] as AdminProfile) : null
    }
    // adminId가 없으면 첫 번째 관리자 반환
    const query = "SELECT * FROM admin_profile LIMIT 1"
    const [rows] = await pool.execute<RowDataPacket[]>(query)
    return rows.length > 0 ? (rows[0] as AdminProfile) : null
  }

  // 관리자인지 확인 (admin_profile 테이블에 존재하는지)
  static async isAdmin(userId: string): Promise<boolean> {
    const query = "SELECT id FROM admin_profile WHERE id = ?"
    const [rows] = await pool.execute<RowDataPacket[]>(query, [userId])
    return rows.length > 0
  }

  // 관리자 프로필 업데이트
  static async updateProfile(adminId: string, updates: Partial<AdminProfile>): Promise<AdminProfile | null> {
    const fields = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(", ")
    const values = Object.values(updates)

    const query = `UPDATE admin_profile SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
    await pool.execute(query, [...values, adminId])

    return this.getProfile(adminId)
  }

}
