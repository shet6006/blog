"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CalendarDays, Heart, MessageCircle, Pencil, Trash2 } from "lucide-react"
import { Header } from "@/components/header"
import { CommentSection } from "@/components/comment-section"
import { LikeButton } from "@/components/like-button"
import { MarkdownArticle, extractArticleHeadings } from "@/components/markdown-article"
import { TableOfContents } from "@/components/table-of-contents"
import { SearchBar } from "@/components/search-bar"
import { CategoryFilter } from "@/components/category-filter"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { apiClient, getApiBaseUrl } from "@/lib/api-client"
import type { Post } from "@/lib/models/post"
import { normalizePostBody } from "@/lib/post-content"
import { postEditHref } from "@/lib/post-routes"

export default function PostPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const slug = searchParams.get("slug") ?? ""
  const [post, setPost] = useState<Post | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [likeCount, setLikeCount] = useState(0)

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
        const [postResult, authResult, categoriesResult] = await Promise.allSettled([
          apiClient.getPostBySlug(slug),
          fetch(`${getApiBaseUrl()}/api/auth/check`, { credentials: "include" }).then((response) => response.json()),
          apiClient.getCategories(),
        ])
        if (!isMounted) return
        if (postResult.status !== "fulfilled") throw new Error("post request failed")
        setPost(postResult.value as Post)
        setLikeCount((postResult.value as Post).likes_count ?? 0)
        if (authResult.status === "fulfilled") setIsAuthenticated(authResult.value?.authenticated === true)
        if (categoriesResult.status === "fulfilled") {
          setCategories((categoriesResult.value as any[]).map((category) => ({
            ...category,
            postCount: category.post_count ?? 0,
          })))
        }
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
      <div className="min-h-screen bg-white">
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
      <div className="min-h-screen bg-white">
        <Header />
        <div className="mx-auto max-w-2xl px-5 py-24 text-center">
          <h1 className="mb-6 text-2xl font-bold text-slate-900">{error || "게시글을 찾을 수 없습니다."}</h1>
          <Button variant="outline" onClick={() => window.history.back()}>이전 페이지로</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <Header />
      <main className="mx-auto max-w-[1480px] px-5 pb-24 pt-10 lg:px-8 lg:pt-14">
        <Link href="/" className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-950">
          <ArrowLeft className="h-4 w-4" />글 목록
        </Link>

        <div className="grid gap-10 lg:grid-cols-[210px_minmax(0,1fr)] xl:grid-cols-[210px_minmax(0,860px)_210px] xl:justify-between xl:gap-12 xl:items-start">
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-10">
              <SearchBar />
              <CategoryFilter categories={categories} />
            </div>
          </aside>

          <article className="min-w-0">
            <header className="mb-12 border-b border-slate-200 pb-10">
              <Badge variant="secondary" className="mb-5 rounded-none bg-transparent px-0 text-gray-700 hover:bg-transparent">{post.category_name || "미분류"}</Badge>
              <h1 className="text-balance text-4xl font-semibold leading-[1.18] tracking-[-0.04em] text-slate-950 md:text-5xl">{post.title}</h1>
              <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />{new Date(post.created_at).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}</span>
                <span className="inline-flex items-center gap-1.5"><MessageCircle className="h-4 w-4" />댓글 {post.comments_count}</span>
                <span className="inline-flex items-center gap-1.5"><Heart className="h-4 w-4" />좋아요 {likeCount}</span>
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
            <div className="mt-16 flex flex-col items-center border-y border-slate-200 py-10 text-center">
              <p className="mb-4 text-sm text-gray-500">이 글이 도움이 되었나요?</p>
              <LikeButton postSlug={post.slug} initialCount={likeCount} onCountChange={setLikeCount} />
            </div>
            <div className="mt-14"><CommentSection postSlug={post.slug} /></div>
          </article>

          <aside className="sticky top-24 hidden xl:block"><TableOfContents headings={headings} /></aside>
        </div>
      </main>
    </div>
  )
}
