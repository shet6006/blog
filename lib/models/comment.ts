import pool from "@/lib/database"
import type { RowDataPacket, ResultSetHeader } from "mysql2"

export interface Comment {
  id: number
  post_id: number
  author_name: string
  content: string
  device_id: string
  is_admin: boolean
  created_at: string
}

export interface CreateCommentData {
  post_id: number
  author_name: string
  content: string
  device_id: string
  is_admin?: boolean
}

export class CommentModel {
  // 게시글별 댓글 조회
  static async findByPostId(postId: number): Promise<Comment[]> {
    const query = `
      SELECT * FROM comments 
      WHERE post_id = ? 
      ORDER BY created_at ASC
    `
    const [rows] = await pool.execute<RowDataPacket[]>(query, [postId])
    return rows as Comment[]
  }

  // 댓글 생성
  static async create(data: CreateCommentData): Promise<Comment> {
    const query = `
      INSERT INTO comments (post_id, author_name, content, device_id, is_admin)
      VALUES (?, ?, ?, ?, ?)
    `
    const [result] = await pool.execute<ResultSetHeader>(query, [
      data.post_id,
      data.author_name,
      data.content,
      data.device_id,
      data.is_admin || false,
    ])

    // 게시글의 댓글 수 업데이트
    await pool.execute("UPDATE posts SET comments_count = comments_count + 1 WHERE id = ?", [data.post_id])

    const newComment = await this.findById(result.insertId)
    if (!newComment) throw new Error("Failed to create comment")
    return newComment
  }

  // ID로 댓글 조회
  static async findById(id: number): Promise<Comment | null> {
    const query = "SELECT * FROM comments WHERE id = ?"
    const [rows] = await pool.execute<RowDataPacket[]>(query, [id])
    return rows.length > 0 ? (rows[0] as Comment) : null
  }

  // 댓글 삭제
  static async delete(id: number): Promise<boolean> {
    // 먼저 댓글 정보 조회
    const comment = await this.findById(id)
    if (!comment) return false

    const query = "DELETE FROM comments WHERE id = ?"
    const [result] = await pool.execute<ResultSetHeader>(query, [id])

    if (result.affectedRows > 0) {
      // 게시글의 댓글 수 업데이트
      await pool.execute("UPDATE posts SET comments_count = comments_count - 1 WHERE id = ? AND comments_count > 0", [
        comment.post_id,
      ])
      return true
    }

    return false
  }
}
