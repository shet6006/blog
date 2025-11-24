import { type NextRequest, NextResponse } from "next/server"
import { CategoryModel } from "@/lib/models/category"

export async function GET() {
  try {
    const categories = await CategoryModel.findAll()
    return NextResponse.json(categories)
  } catch (error) {
    console.error("Categories API Error:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name } = body

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 })
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")

    const newCategory = await CategoryModel.create(name, slug)
    return NextResponse.json(newCategory, { status: 201 })
  } catch (error) {
    console.error("Create Category Error:", error)
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
  }
}
