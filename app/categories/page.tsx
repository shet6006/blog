"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { PostCard } from "@/components/post-card"
import { CategoryFilter } from "@/components/category-filter"
import { SearchBar } from "@/components/search-bar"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api-client"
import { BlogRightRail } from "@/components/blog-right-rail"
import { PostPagination } from "@/components/post-pagination"

export default function CategoriesPage() {
  const searchParams = useSearchParams()
  const category = searchParams.get("category") || ""
  const search = searchParams.get("search") || ""
  const page = Number.parseInt(searchParams.get("page") || "1")

  const [posts, setPosts] = useState<any>({ posts: [], pagination: null })
  const [categories, setCategories] = useState<any[]>([])
  const [popularPosts, setPopularPosts] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  const [sortBy, setSortBy] = useState<"latest" | "popular">("latest")

  useEffect(() => {
    const loadData = async () => {
      try {
        const sortParam = sortBy === "popular" ? "likes" : "created_at"
        const postsData = await apiClient
          .getPosts({ category, search, page, limit: 10, sortBy: sortParam })
          .catch(() => ({ posts: [], pagination: null }))
        setPosts(postsData as any)

        const popularData = await apiClient.getPosts({ page: 1, limit: 4, sortBy: "likes" }).catch(() => ({ posts: [] }))
        setPopularPosts(Array.isArray((popularData as any).posts) ? (popularData as any).posts : [])

        const categoriesData = await apiClient.getCategories().catch(() => [])
        setCategories(
          (categoriesData as any[]).map((cat) => ({
            ...cat,
            postCount: cat.post_count ?? 0,
          }))
        )

        setStats(await apiClient.getStats().catch(() => ({})))
      } catch (error) {
        console.error("Error loading data:", error)
      }
    }

    loadData()
  }, [category, search, page, sortBy])

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="mx-auto max-w-[1480px] px-5 py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[210px_minmax(0,1fr)] xl:grid-cols-[210px_minmax(0,860px)_210px] xl:justify-between xl:gap-12">
          {/* Sidebar */}
          <aside>
            <div className="sticky top-24 space-y-10">
              <SearchBar />
              <CategoryFilter categories={categories} basePath="/categories" />
            </div>
          </aside>

          {/* Posts Grid */}
          <main id="posts" className="min-w-0 scroll-mt-24">
            <div className="mb-7 flex items-center justify-between border-b border-gray-200 pb-5">
              <h2 className="text-2xl font-semibold tracking-[-0.025em] text-gray-950">
                {category && category !== "All" ? `${category} 게시글` : "모든 카테고리"}
                {search && ` - "${search}" 검색 결과`}
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  variant={sortBy === "latest" ? "default" : "outline"}
                  size="sm"
                  className={sortBy === "latest" ? "bg-blue-600 hover:bg-blue-700" : ""}
                  onClick={() => setSortBy("latest")}
                >
                  최신순
                </Button>
                <Button
                  variant={sortBy === "popular" ? "default" : "outline"}
                  size="sm"
                  className={sortBy === "popular" ? "bg-blue-600 hover:bg-blue-700" : ""}
                  onClick={() => setSortBy("popular")}
                >
                  인기순
                </Button>
              </div>
            </div>

            {Array.isArray(posts.posts) && posts.posts.length > 0 ? (
              <>
                <div className="grid gap-7">
                  {posts.posts.map((post: any) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
                {/* Pagination */}
                {posts.pagination && <PostPagination currentPage={posts.pagination.page} totalPages={posts.pagination.totalPages} />}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  {search ? `"${search}"에 대한 검색 결과가 없습니다.` : "게시글이 없습니다."}
                </p>
              </div>
            )}
          </main>

          <aside className="hidden xl:block">
            <div className="sticky top-24">
              <BlogRightRail popularPosts={popularPosts} stats={stats} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
