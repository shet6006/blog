"use client";
import { useSearchParams } from "next/navigation";
import { getApiBaseUrl } from "@/lib/api-client";
import { useEffect, useState } from "react";
import { Header } from "@/components/header"
import { PostCard } from "@/components/post-card"
import { CategoryFilter } from "@/components/category-filter"
import { SearchBar } from "@/components/search-bar"
import { BlogRightRail } from "@/components/blog-right-rail"

import { Button } from "@/components/ui/button"
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
  const [popularPosts, setPopularPosts] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<"latest" | "popular">("latest");

  useEffect(() => {
    const loadData = async () => {
      try {
        const sortParam = sortBy === "popular" ? "likes" : "created_at";
        const postsData = await apiClient.getPosts({ category, search, page, limit: 10, sortBy: sortParam }).catch(() => ({ posts: [], pagination: null }));
        setPosts(postsData as any);

        const popularData = await apiClient.getPosts({ page: 1, limit: 4, sortBy: "likes" }).catch(() => ({ posts: [] }));
        setPopularPosts(Array.isArray((popularData as any).posts) ? (popularData as any).posts : []);
        
        const categoriesData = await apiClient.getCategories().catch(() => []);
        setCategories((categoriesData as any[]).map((cat) => ({
          ...cat,
          postCount: cat.post_count ?? 0,
        })));
        
        const statsData = await apiClient.getStats().catch(() => ({}));
        setStats(statsData);
        
        const profileData = await apiClient.getAdminProfile().catch(() => null);
        if (profileData) {
          setProfile((profileData as any).profile);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    
    loadData();
    
    // 방문자 추적 (페이지 로드 시 한 번만)
    fetch(`${getApiBaseUrl()}/api/visitors/track`, { method: "POST", credentials: "include" }).catch(() => {});
  }, [category, search, page, sortBy]);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-[1480px] px-5 py-12 lg:px-8 lg:py-14">
          <div className="text-center">
            <h1 className="mb-3 text-4xl font-semibold tracking-[-0.04em] text-gray-950">개발자 블로그</h1>
            <p className="mx-auto mb-6 max-w-2xl text-lg text-gray-500">{profile?.bio || "개발하며 배우고 경험한 내용을 기록합니다."}</p>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><User className="h-4 w-4 text-blue-600" />{profile?.name || "DDONG's"}</span>
              <span className="flex items-center gap-1.5"><Github className="h-4 w-4 text-blue-600" />@{profile?.github_username || "developer"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="mx-auto max-w-[1480px] px-5 py-10 lg:px-8 lg:py-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[210px_minmax(0,1fr)] xl:grid-cols-[210px_minmax(0,860px)_210px] xl:justify-between xl:gap-12">
          {/* Sidebar */}
          <aside>
            <div className="sticky top-24 space-y-10">
              <SearchBar />
              <CategoryFilter categories={categories} />
            </div>
          </aside>

          {/* Posts Grid */}
          <main id="posts" className="min-w-0 scroll-mt-24">
            <div className="mb-7 flex items-center justify-between border-b border-gray-200 pb-5">
              <h2 className="text-2xl font-semibold tracking-[-0.025em] text-gray-950">
                {category && category !== "All" ? `${category} 게시글` : "최근 게시글"}
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
