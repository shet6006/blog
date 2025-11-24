import pool from "@/lib/database"
import type { RowDataPacket, ResultSetHeader } from "mysql2"

export interface Category {
  id: number
  name: string
  slug: string
  post_count: number
  created_at: string
}

export class CategoryModel {
  // 모든 카테고리 조회 (게시글 수 포함)
  static async findAll(): Promise<Category[]> {
    const query = `
      SELECT 
        c.*,
        COUNT(p.id) as post_count
      FROM categories c
      LEFT JOIN posts p ON c.id = p.category_id AND p.is_public = true
      GROUP BY c.id
      ORDER BY c.name
    `
    const [rows] = await pool.execute<RowDataPacket[]>(query)
    return rows as Category[]
  }

  // ID로 카테고리 조회
  static async findById(id: number): Promise<Category | null> {
    const query = "SELECT * FROM categories WHERE id = ?"
    const [rows] = await pool.execute<RowDataPacket[]>(query, [id])
    return rows.length > 0 ? (rows[0] as Category) : null
  }

  // 슬러그로 카테고리 조회
  static async findBySlug(slug: string): Promise<Category | null> {
    const query = "SELECT * FROM categories WHERE slug = ?"
    const [rows] = await pool.execute<RowDataPacket[]>(query, [slug])
    return rows.length > 0 ? (rows[0] as Category) : null
  }

  // 이름으로 카테고리 조회
  static async findByName(name: string): Promise<Category | null> {
    const query = "SELECT * FROM categories WHERE name = ?"
    const [rows] = await pool.execute<RowDataPacket[]>(query, [name])
    return rows.length > 0 ? (rows[0] as Category) : null
  }

  // 카테고리 생성
  static async create(name: string, slug: string): Promise<Category> {
    const query = "INSERT INTO categories (name, slug) VALUES (?, ?)"
    const [result] = await pool.execute<ResultSetHeader>(query, [name, slug])

    const newCategory = await this.findById(result.insertId)
    if (!newCategory) throw new Error("Failed to create category")
    return newCategory
  }

  // 카테고리 삭제
  static async delete(id: number): Promise<boolean> {
    const query = "DELETE FROM categories WHERE id = ?"
    const [result] = await pool.execute<ResultSetHeader>(query, [id])
    return result.affectedRows > 0
  }
}
