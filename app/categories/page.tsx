"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { PostCard } from "@/components/post-card"
import { CategoryFilter } from "@/components/category-filter"
import { SearchBar } from "@/components/search-bar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api-client"

export default function CategoriesPage() {
  const searchParams = useSearchParams()
  const category = searchParams.get("category") || ""
  const search = searchParams.get("search") || ""
  const page = Number.parseInt(searchParams.get("page") || "1")

  const [posts, setPosts] = useState<any>({ posts: [], pagination: null })
  const [categories, setCategories] = useState<any[]>([])
  const [sortBy, setSortBy] = useState<"latest" | "popular">("latest")

  useEffect(() => {
    const loadData = async () => {
      try {
        const sortParam = sortBy === "popular" ? "likes" : "created_at"
        const postsData = await apiClient
          .getPosts({ category, search, page, limit: 10, sortBy: sortParam })
          .catch(() => ({ posts: [], pagination: null }))
        setPosts(postsData as any)

        const categoriesData = await apiClient.getCategories().catch(() => [])
        setCategories(
          (categoriesData as any[]).map((cat) => ({
            ...cat,
            postCount: cat.post_count ?? 0,
          }))
        )
      } catch (error) {
        console.error("Error loading data:", error)
      }
    }

    loadData()
  }, [category, search, page, sortBy])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <SearchBar />
              <CategoryFilter categories={categories} />
            </div>
          </aside>

          {/* Posts Grid */}
          <main className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900">
                {category && category !== "All" ? `${category} 게시글` : "모든 카테고리"}
                {search && ` - "${search}" 검색 결과`}
              </h1>
              <div className="flex items-center gap-2">
                <Button
                  variant={sortBy === "latest" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("latest")}
                >
                  최신순
                </Button>
                <Button
                  variant={sortBy === "popular" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("popular")}
                >
                  인기순
                </Button>
              </div>
            </div>

            {Array.isArray(posts.posts) && posts.posts.length > 0 ? (
              <>
                <div className="grid gap-6">
                  {posts.posts.map((post: any) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
                {/* Pagination */}
                {posts.pagination && posts.pagination.totalPages > 1 && (
                  <div className="flex justify-center mt-12">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" disabled={posts.pagination.page <= 1}>
                        이전
                      </Button>
                      {Array.from({ length: Math.min(posts.pagination.totalPages, 5) }, (_, i) => i + 1).map(
                        (pageNum) => (
                          <Button
                            key={pageNum}
                            variant={pageNum === posts.pagination.page ? "default" : "outline"}
                            size="sm"
                          >
                            {pageNum}
                          </Button>
                        )
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={posts.pagination.page >= posts.pagination.totalPages}
                      >
                        다음
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  {search ? `"${search}"에 대한 검색 결과가 없습니다.` : "게시글이 없습니다."}
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

