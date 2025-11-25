import { type NextRequest, NextResponse } from "next/server"
import { PostModel } from "@/lib/models/post"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const sortBy = searchParams.get("sortBy") || "created_at"
    
    // 입력 검증 및 제한
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const includePrivate = searchParams.get("includePrivate") === "true"

    // 페이지네이션 제한 (악의적 요청 방지)
    const validatedPage = page < 1 ? 1 : page > 1000 ? 1000 : page
    const validatedLimit = limit < 1 ? 10 : limit > 100 ? 100 : limit

    // 검색어 길이 제한
    const validatedSearch = search && search.length > 100 ? search.substring(0, 100) : search

    const result = await PostModel.findAll({
      isPublicOnly: !includePrivate,
      category: category || undefined,
      search: validatedSearch || undefined,
      page: validatedPage,
      limit: validatedLimit,
      sortBy: sortBy === "likes" ? "likes_count" : "created_at",
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Posts API Error:", error)
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Rate limiting (분당 5회 - 게시글 작성)
  const clientId = request.headers.get("x-forwarded-for")?.split(",")[0] || 
                   request.headers.get("x-real-ip") || 
                   "unknown"
  const rateLimitResult = require("@/lib/rate-limit").rateLimit(`posts-post-${clientId}`, 5, 60000)
  
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()
    const { title, content, category_id, github_commit_url, is_public = true } = body

    // 입력 검증
    if (!title || !content || !category_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // 길이 제한
    if (title.length > 255) {
      return NextResponse.json({ error: "제목이 너무 깁니다." }, { status: 400 })
    }

    if (content.length > 100000) {
      return NextResponse.json({ error: "내용이 너무 깁니다." }, { status: 400 })
    }

    // category_id 검증
    if (!Number.isInteger(category_id) || category_id < 1) {
      return NextResponse.json({ error: "잘못된 카테고리입니다." }, { status: 400 })
    }

    // 슬러그 생성
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")

    // 요약 생성
    const excerpt = content.replace(/[#*`]/g, "").replace(/\n/g, " ").substring(0, 150) + "..."

    const newPost = await PostModel.create({
      title,
      content,
      excerpt,
      category_id,
      slug,
      github_commit_url: github_commit_url || null,
      is_public,
      author_id: "admin",
    })

    return NextResponse.json(newPost, { status: 201 })
  } catch (error) {
    console.error("Create Post Error:", error)
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 })
  }
}
