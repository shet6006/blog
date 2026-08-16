"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CalendarDays, MessageCircle, Pencil, Trash2 } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SearchBar } from "@/components/search-bar"
import { CategoryFilter } from "@/components/category-filter"
import { CommentSection } from "@/components/comment-section"
import { LikeButton } from "@/components/like-button"
import { MarkdownArticle, extractArticleHeadings } from "@/components/markdown-article"
import { TableOfContents } from "@/components/table-of-contents"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { apiClient, getApiBaseUrl } from "@/lib/api-client"
import type { Post } from "@/lib/models/post"
import { normalizePostBody } from "@/lib/post-content"
import { postEditHref } from "@/lib/post-routes"

export default function PostPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const slug = searchParams.get("slug") ?? ""
  const [post, setPost] = useState<Post | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCommentUpdate = async () => {
      if (!post) return
      try {
        setPost(await apiClient.getPostBySlug(post.slug) as Post)
      } catch (error) {
        console.error("댓글 개수 업데이트 실패:", error)
      }
    }
    window.addEventListener("commentUpdated", handleCommentUpdate)
    return () => window.removeEventListener("commentUpdated", handleCommentUpdate)
  }, [post])

  useEffect(() => {
    let isMounted = true
    const fetchData = async () => {
      try {
        if (!slug) throw new Error("missing slug")
        const [postResult, authResult, categoriesResult, statsResult] = await Promise.allSettled([
          apiClient.getPostBySlug(slug),
          fetch(`${getApiBaseUrl()}/api/auth/check`, { credentials: "include" }).then((response) => response.json()),
          apiClient.getCategories(),
          apiClient.getStats(),
        ])
        if (!isMounted) return
        if (postResult.status !== "fulfilled") throw new Error("post request failed")
        setPost(postResult.value as Post)
        if (authResult.status === "fulfilled") setIsAuthenticated(authResult.value?.authenticated === true)
        if (categoriesResult.status === "fulfilled") setCategories((categoriesResult.value as any[]).map((item) => ({ ...item, postCount: item.post_count ?? 0 })))
        if (statsResult.status === "fulfilled") setStats(statsResult.value)
      } catch (error) {
        console.error("게시글 조회 실패:", error)
        if (isMounted) setError("게시글을 불러오는데 실패했습니다.")
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    fetchData()
    return () => { isMounted = false }
  }, [slug])

  const body = useMemo(() => normalizePostBody(post?.content, post?.title), [post?.content, post?.title])
  const headings = useMemo(() => extractArticleHeadings(body), [body])

  const handleDelete = async () => {
    if (!post || !window.confirm("정말 삭제하시겠습니까?")) return
    try {
      await apiClient.deletePost(post.slug)
      router.push("/")
    } catch {
      window.alert("삭제에 실패했습니다.")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <Header />
        <div className="mx-auto max-w-3xl animate-pulse px-5 py-20">
          <div className="mb-6 h-4 w-24 rounded bg-slate-200" />
          <div className="mb-5 h-12 w-4/5 rounded bg-slate-200" />
          <div className="mb-14 h-5 w-2/5 rounded bg-slate-200" />
          <div className="space-y-4"><div className="h-4 rounded bg-slate-200" /><div className="h-4 rounded bg-slate-200" /><div className="h-4 w-5/6 rounded bg-slate-200" /></div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <Header />
        <div className="mx-auto max-w-2xl px-5 py-24 text-center">
          <h1 className="mb-6 text-2xl font-bold text-slate-900">{error || "게시글을 찾을 수 없습니다."}</h1>
          <Button variant="outline" onClick={() => window.history.back()}>이전 페이지로</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc] text-slate-950">
      <Header />
      <main className="mx-auto w-full max-w-[1400px] flex-1 px-5 pb-20 pt-10 md:px-8">
        <Link href="/" className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-950">
          <ArrowLeft className="h-4 w-4" />글 목록
        </Link>

        <div className="grid gap-8 lg:grid-cols-[230px_minmax(0,760px)] xl:grid-cols-[230px_minmax(0,760px)_220px] xl:justify-center xl:items-start">
          <aside className="order-2 lg:order-none lg:sticky lg:top-24 lg:self-start">
            <div className="space-y-6">
              <SearchBar />
              <CategoryFilter categories={categories} />
              <Card><CardContent className="p-5"><h3 className="mb-3 font-semibold">블로그 통계</h3><div className="space-y-2 text-sm text-gray-600"><div className="flex justify-between"><span>총 게시글</span><span>{stats?.totalPosts ?? 0}</span></div><div className="flex justify-between"><span>총 좋아요</span><span>{stats?.totalLikes ?? 0}</span></div><div className="flex justify-between"><span>총 댓글</span><span>{stats?.totalComments ?? 0}</span></div></div></CardContent></Card>
            </div>
          </aside>
          <article className="min-w-0">
            <header className="mb-12 border-b border-slate-200 pb-10">
              <Badge variant="secondary" className="mb-5 rounded-full bg-blue-50 px-3 py-1 text-blue-700 hover:bg-blue-50">{post.category_name || "미분류"}</Badge>
              <h1 className="text-balance text-4xl font-extrabold leading-[1.18] tracking-[-0.035em] text-slate-950 md:text-5xl">{post.title}</h1>
              <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />{new Date(post.created_at).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}</span>
                <span className="inline-flex items-center gap-1.5"><MessageCircle className="h-4 w-4" />댓글 {post.comments_count}</span>
                <LikeButton postSlug={post.slug} />
              </div>
              {isAuthenticated && (
                <div className="mt-6 flex gap-2">
                  <Button asChild variant="outline" size="sm"><Link href={postEditHref(post.slug)}><Pencil className="mr-1.5 h-3.5 w-3.5" />수정</Link></Button>
                  <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={handleDelete}><Trash2 className="mr-1.5 h-3.5 w-3.5" />삭제</Button>
                </div>
              )}
            </header>

            <div className="mb-8 xl:hidden"><TableOfContents headings={headings} /></div>
            <MarkdownArticle content={body} />
            <div className="mt-16 border-t border-slate-200 pt-10"><CommentSection postSlug={post.slug} /></div>
          </article>

          <aside className="sticky top-24 hidden xl:block"><TableOfContents headings={headings} /></aside>
        </div>
      </main>
      <Footer />
    </div>
  )
}
