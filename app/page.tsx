"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Header } from "@/components/header"
import { PostCard } from "@/components/post-card"
import { CategoryFilter } from "@/components/category-filter"
import { SearchBar } from "@/components/search-bar"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { User, Github } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { Profile } from "@/lib/profile"

export default function HomePage() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";
  const page = Number.parseInt(searchParams.get("page") || "1");

  const [posts, setPosts] = useState<any>({ posts: [], pagination: null });
  const [categories, setCategories] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sortBy, setSortBy] = useState<"latest" | "popular">("latest");

  useEffect(() => {
    const sortParam = sortBy === "popular" ? "likes" : "created_at";
    apiClient.getPosts({ category, search, page, limit: 10, sortBy: sortParam }).then((res) => setPosts(res as any));
    apiClient.getCategories().then((cats) => {
      setCategories((cats as any[]).map((cat) => ({
        ...cat,
        postCount: cat.post_count ?? 0,
      })))
    });
    apiClient.getStats().then(setStats);
    apiClient.getAdminProfile().then((res) => setProfile((res as any).profile));
  }, [category, search, page, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">개발자 블로그</h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              {profile?.bio || "웹 개발, TypeScript, React 등 프론트엔드 기술에 대한 경험과 인사이트를 공유합니다."}
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{profile?.name || "김개발"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Github className="w-4 h-4" />
                <span>@{profile?.github_username || "developer"}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <SearchBar />
              <CategoryFilter categories={categories} />

              {/* Stats Card */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">블로그 통계</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">총 게시글</span>
                      <span className="font-medium">{stats?.totalPosts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">총 좋아요</span>
                      <span className="font-medium">{stats?.totalLikes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">총 댓글</span>
                      <span className="font-medium">{stats?.totalComments}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Posts Grid */}
          <main className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {category && category !== "All" ? `${category} 게시글` : "최근 게시글"}
                {search && ` - "${search}" 검색 결과`}
              </h2>
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
                        ),
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
