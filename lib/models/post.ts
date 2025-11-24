import pool from "@/lib/database"
import type { RowDataPacket, ResultSetHeader } from "mysql2"

export interface Post {
  id: number
  title: string
  content: string
  excerpt: string
  category_id: number
  category_name?: string
  slug: string
  github_commit_url?: string | null
  is_public: boolean
  author_id: string
  likes_count: number
  comments_count: number
  created_at: string
  updated_at: string
}

export interface CreatePostData {
  title: string
  content: string
  excerpt: string
  category_id: number
  slug: string
  github_commit_url?: string | null
  is_public: boolean
  author_id: string
}

export class PostModel {
  // 게시글 목록 조회 (파라미터 바인딩 수정)
  static async findAll(
    options: {
      isPublicOnly?: boolean
      category?: string
      search?: string
      page?: number
      limit?: number
    } = {},
  ) {
    const { isPublicOnly = true, category, search, page = 1, limit = 10 } = options

    let query = `
      SELECT p.*, c.name as category_name 
      FROM posts p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE 1=1
    `
    const params: any[] = []

    if (isPublicOnly) {
      query += " AND p.is_public = ?"
      params.push(1) // boolean을 숫자로 변경
    }

    if (category && category !== "All") {
      query += " AND c.name = ?"
      params.push(category)
    }

    if (search) {
      query += " AND (p.title LIKE ? OR p.content LIKE ? OR c.name LIKE ?)"
      const searchTerm = `%${search}%`
      params.push(searchTerm, searchTerm, searchTerm)
    }

    query += " ORDER BY p.created_at DESC"

    // 페이지네이션
    const offset = (page - 1) * limit
    query += ` LIMIT ${Number(limit)} OFFSET ${Number(offset)}`

    console.log("Query:", query)
    console.log("Params:", params)

    try {
      const [rows] = await pool.execute<RowDataPacket[]>(query, params)

      // 전체 개수 조회
      let countQuery = `
        SELECT COUNT(*) as total 
        FROM posts p 
        LEFT JOIN categories c ON p.category_id = c.id 
        WHERE 1=1
      `
      const countParams: any[] = []

      if (isPublicOnly) {
        countQuery += " AND p.is_public = ?"
        countParams.push(1)
      }

      if (category && category !== "All") {
        countQuery += " AND c.name = ?"
        countParams.push(category)
      }

      if (search) {
        countQuery += " AND (p.title LIKE ? OR p.content LIKE ? OR c.name LIKE ?)"
        const searchTerm = `%${search}%`
        countParams.push(searchTerm, searchTerm, searchTerm)
      }

      const [countRows] = await pool.execute<RowDataPacket[]>(countQuery, countParams)
      const total = countRows[0].total

      return {
        posts: rows as Post[],
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }
    } catch (error) {
      console.error("PostModel.findAll Error:", error)
      throw error
    }
  }

  // ID로 게시글 조회
  static async findById(id: number): Promise<Post | null> {
    try {
      const query = `
        SELECT p.*, c.name as category_name 
        FROM posts p 
        LEFT JOIN categories c ON p.category_id = c.id 
        WHERE p.id = ?
      `
      const [rows] = await pool.execute<RowDataPacket[]>(query, [id])
      return rows.length > 0 ? (rows[0] as Post) : null
    } catch (error) {
      console.error("PostModel.findById Error:", error)
      throw error
    }
  }

  // 슬러그로 게시글 조회
  static async findBySlug(slug: string): Promise<Post | null> {
    try {
      const query = `
        SELECT p.*, c.name as category_name 
        FROM posts p 
        LEFT JOIN categories c ON p.category_id = c.id 
        WHERE p.slug = ? AND p.is_public = 1
      `
      const [rows] = await pool.execute<RowDataPacket[]>(query, [slug])
      return rows.length > 0 ? (rows[0] as Post) : null
    } catch (error) {
      console.error("PostModel.findBySlug Error:", error)
      throw error
    }
  }

  // 게시글 생성
  static async create(data: CreatePostData): Promise<Post> {
    try {
      const query = `
        INSERT INTO posts (title, content, excerpt, category_id, slug, github_commit_url, is_public, author_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `
      const [result] = await pool.execute<ResultSetHeader>(query, [
        data.title,
        data.content,
        data.excerpt,
        data.category_id,
        data.slug,
        data.github_commit_url,
        data.is_public ? 1 : 0, // boolean을 숫자로 변경
        data.author_id,
      ])

      const newPost = await this.findById(result.insertId)
      if (!newPost) throw new Error("Failed to create post")
      return newPost
    } catch (error) {
      console.error("PostModel.create Error:", error)
      throw error
    }
  }

  // 게시글 수정
  static async update(id: number, data: Partial<CreatePostData>): Promise<Post | null> {
    try {
      const updateData = { ...data }
      if (typeof updateData.is_public === "boolean") {
        updateData.is_public = updateData.is_public ? 1 : 0 // boolean을 숫자로 변경
      }

      const fields = Object.keys(updateData)
        .map((key) => `${key} = ?`)
        .join(", ")
      const values = Object.values(updateData)

      const query = `UPDATE posts SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
      await pool.execute(query, [...values, id])

      return this.findById(id)
    } catch (error) {
      console.error("PostModel.update Error:", error)
      throw error
    }
  }

  // 게시글 삭제
  static async delete(id: number): Promise<boolean> {
    try {
      const query = "DELETE FROM posts WHERE id = ?"
      const [result] = await pool.execute<ResultSetHeader>(query, [id])
      return result.affectedRows > 0
    } catch (error) {
      console.error("PostModel.delete Error:", error)
      throw error
    }
  }
}
