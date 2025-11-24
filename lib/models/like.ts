import pool from "@/lib/database"
import type { RowDataPacket, ResultSetHeader } from "mysql2"

export interface Like {
  id: number
  post_id: number
  device_id: string
  created_at: string
}

export class LikeModel {
  // 좋아요 토글
  static async toggle(postId: number, deviceId: string): Promise<{ liked: boolean; count: number }> {
    // 기존 좋아요 확인
    const existingLike = await this.findByPostAndDevice(postId, deviceId)

    if (existingLike) {
      // 좋아요 취소
      await this.delete(existingLike.id)
      await pool.execute("UPDATE posts SET likes_count = likes_count - 1 WHERE id = ? AND likes_count > 0", [postId])
    } else {
      // 좋아요 추가
      await this.create(postId, deviceId)
      await pool.execute("UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?", [postId])
    }

    // 현재 좋아요 수 조회
    const count = await this.countByPostId(postId)
    return { liked: !existingLike, count }
  }

  // 게시글과 디바이스로 좋아요 조회
  static async findByPostAndDevice(postId: number, deviceId: string): Promise<Like | null> {
    const query = "SELECT * FROM likes WHERE post_id = ? AND device_id = ?"
    const [rows] = await pool.execute<RowDataPacket[]>(query, [postId, deviceId])
    return rows.length > 0 ? (rows[0] as Like) : null
  }

  // 좋아요 생성
  static async create(postId: number, deviceId: string): Promise<Like> {
    const query = "INSERT INTO likes (post_id, device_id) VALUES (?, ?)"
    const [result] = await pool.execute<ResultSetHeader>(query, [postId, deviceId])

    const newLike = await this.findById(result.insertId)
    if (!newLike) throw new Error("Failed to create like")
    return newLike
  }

  // ID로 좋아요 조회
  static async findById(id: number): Promise<Like | null> {
    const query = "SELECT * FROM likes WHERE id = ?"
    const [rows] = await pool.execute<RowDataPacket[]>(query, [id])
    return rows.length > 0 ? (rows[0] as Like) : null
  }

  // 좋아요 삭제
  static async delete(id: number): Promise<boolean> {
    const query = "DELETE FROM likes WHERE id = ?"
    const [result] = await pool.execute<ResultSetHeader>(query, [id])
    return result.affectedRows > 0
  }

  // 게시글별 좋아요 수 조회
  static async countByPostId(postId: number): Promise<number> {
    const query = "SELECT COUNT(*) as count FROM likes WHERE post_id = ?"
    const [rows] = await pool.execute<RowDataPacket[]>(query, [postId])
    return rows[0].count
  }

  // 좋아요 상태 확인
  static async isLiked(postId: number, deviceId: string): Promise<boolean> {
    const like = await this.findByPostAndDevice(postId, deviceId)
    return !!like
  }
}
