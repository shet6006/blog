"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getApiBaseUrl } from "@/lib/api-client";
import { useEffect, useState } from "react";
import { Header } from "@/components/header"
import { PostCard } from "@/components/post-card"
import { CategoryFilter } from "@/components/category-filter"
import { SearchBar } from "@/components/search-bar"
import { BlogRightRail } from "@/components/blog-right-rail"
import { PostPagination } from "@/components/post-pagination"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowRight, Github } from "lucide-react"
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
  const [isLoading, setIsLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      setShowSkeleton(false)
      return
    }

    // 최초 진입 이후의 빠른 필터 전환에서는 스켈레톤이 순간적으로 번쩍이지 않게 한다.
    if (showSkeleton) return
    const timer = window.setTimeout(() => setShowSkeleton(true), 220)
    return () => window.clearTimeout(timer)
  }, [isLoading, showSkeleton])

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
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
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
    
    // 방문자 추적 (페이지 로드 시 한 번만)
    fetch(`${getApiBaseUrl()}/api/visitors/track`, { method: "POST", credentials: "include" }).catch(() => {});
  }, [category, search, page, sortBy]);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {showSkeleton ? (
        <main aria-hidden="true">
          <section className="border-b border-gray-200">
            <div className="mx-auto max-w-[1480px] px-5 py-8 lg:px-8 lg:py-9">
              <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 sm:flex-row">
                <Skeleton className="h-24 w-24 shrink-0 rounded-full" />
                <div className="w-full space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-9 w-40" />
                  <Skeleton className="h-5 w-4/5" />
                  <Skeleton className="h-4 w-52" />
                </div>
              </div>
            </div>
          </section>
          <div className="mx-auto max-w-[1480px] px-5 py-10 lg:px-8 lg:py-12">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[210px_minmax(0,1fr)] xl:grid-cols-[210px_minmax(0,860px)_210px] xl:justify-between xl:gap-12">
              <aside className="space-y-8"><Skeleton className="h-10 w-full" /><Skeleton className="h-5 w-24" /><Skeleton className="h-4 w-32" /><Skeleton className="h-4 w-28" /></aside>
              <section className="min-w-0 space-y-7">
                <div className="flex items-center justify-between border-b border-gray-200 pb-5"><Skeleton className="h-8 w-32" /><Skeleton className="h-9 w-36" /></div>
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="space-y-4 border-b border-slate-200 pb-7">
                    <Skeleton className="h-4 w-24" /><Skeleton className="h-8 w-3/4" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" />
                  </div>
                ))}
              </section>
              <aside className="hidden space-y-5 xl:block"><Skeleton className="h-5 w-28" /><Skeleton className="h-24 w-full" /><Skeleton className="h-5 w-24" /><Skeleton className="h-36 w-full" /></aside>
            </div>
          </div>
        </main>
      ) : (
        <>

      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-[1480px] px-5 py-8 lg:px-8 lg:py-9">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
            <img
              src={profile?.avatar_url || "/default-profile.svg"}
              alt={`${profile?.name || "관리자"} 프로필`}
              className="h-24 w-24 shrink-0 rounded-full border border-slate-200 bg-white object-cover shadow-sm"
            />
            <div className="min-w-0">
              <p className="mb-1 text-sm font-semibold text-blue-600">개발자 블로그</p>
              <h1 className="mb-2 text-3xl font-semibold tracking-[-0.04em] text-gray-950">{profile?.name || "DDONG's"}</h1>
              <p className="max-w-2xl text-base leading-7 text-gray-500">{profile?.bio || "개발하며 배우고 경험한 내용을 기록합니다."}</p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-gray-500 sm:justify-start">
                {profile?.github_username && (
                  <a
                    href={`https://github.com/${profile.github_username.replace(/^@/, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 transition-colors hover:text-blue-600"
                  >
                    <Github className="h-4 w-4 text-blue-600" />@{profile.github_username.replace(/^@/, "")}
                  </a>
                )}
                <Link href="/about" className="flex items-center gap-1 text-gray-500 transition-colors hover:text-blue-600">
                  더 보기 <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
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
              <SearchBar onNavigateStart={() => setIsLoading(true)} />
              <CategoryFilter categories={categories} onNavigateStart={() => setIsLoading(true)} />
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
                  onClick={() => {
                    if (sortBy === "latest") return
                    setIsLoading(true)
                    setSortBy("latest")
                  }}
                >
                  최신순
                </Button>
                <Button
                  variant={sortBy === "popular" ? "default" : "outline"}
                  size="sm"
                  className={sortBy === "popular" ? "bg-blue-600 hover:bg-blue-700" : ""}
                  onClick={() => {
                    if (sortBy === "popular") return
                    setIsLoading(true)
                    setSortBy("popular")
                  }}
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
                {posts.pagination && <PostPagination currentPage={posts.pagination.page} totalPages={posts.pagination.totalPages} onNavigateStart={() => setIsLoading(true)} />}
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
        </>
      )}
    </div>
  )
}
