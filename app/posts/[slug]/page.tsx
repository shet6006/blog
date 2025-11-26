"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "../../../components/header"
import { CommentSection } from "../../../components/comment-section"
import { LikeButton } from "../../../components/like-button"
import { Badge } from "../../../components/ui/badge"
import { Button } from "../../../components/ui/button"
import { Card, CardContent } from "../../../components/ui/card"
import { Calendar, User, Github, ExternalLink, ArrowLeft, Heart, MessageCircle } from "lucide-react"
import Link from "next/link"
import { apiClient } from "../../../lib/api-client"
import { Post } from "../../../lib/models/post"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { CategoryFilter } from "../../../components/category-filter"
import { SearchBar } from "../../../components/search-bar"
import { hasJwtToken } from "@/lib/auth-client"

interface AdminProfile {
  isAdmin: boolean;
}

interface Category {
  id: number
  name: string
  postCount: number
}

export default function PostPage() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [stats, setStats] = useState<any>({})

  // 댓글 개수 업데이트를 위한 이벤트 리스너
  useEffect(() => {
    const handleCommentUpdate = async () => {
      // 댓글 개수만 다시 가져오기
      if (post) {
        try {
          const updatedPost = await apiClient.getPostBySlug(post.slug) as Post
          setPost(updatedPost)
        } catch (error) {
          console.error("댓글 개수 업데이트 실패:", error)
        }
      }
    }

    window.addEventListener("commentUpdated", handleCommentUpdate)
    return () => {
      window.removeEventListener("commentUpdated", handleCommentUpdate)
    }
  }, [post])

  useEffect(() => {
    let isMounted = true
    
    const fetchData = async () => {
      try {
        const slug = params.slug as string
        
        // 병렬로 데이터 가져오기 (중복 호출 방지)
        const [postData, profile, cats, statsData] = await Promise.allSettled([
          apiClient.getPostBySlug(slug),
          apiClient.getAdminProfile().catch(() => null), // 실패해도 계속 진행
          apiClient.getCategories(),
          apiClient.getStats(),
        ])

        if (!isMounted) return

        if (postData.status === "fulfilled") {
          setPost(postData.value as Post)
        } else {
          setError("게시글을 불러오는데 실패했습니다.")
          return
        }

        if (profile.status === "fulfilled" && profile.value) {
          setIsAdmin((profile.value as any)?.profile?.id === "admin")
        }

        if (cats.status === "fulfilled") {
          setCategories((cats.value as any[]).map((cat) => ({
            ...cat,
            postCount: cat.post_count ?? 0,
          })))
        }

        if (statsData.status === "fulfilled") {
          setStats(statsData.value)
        }
      } catch (error) {
        if (!isMounted) return
        console.error("Error fetching post:", error)
        setError("게시글을 불러오는데 실패했습니다.")
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }
    
    fetchData()
    
    return () => {
      isMounted = false
    }
  }, [params.slug])

  const handleDelete = async () => {
    if (!post) return
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        await apiClient.deletePost(post.slug)
        router.push("/")
      } catch (e) {
        alert("삭제에 실패했습니다.")
      }
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            {error || "게시글을 찾을 수 없습니다."}
          </h1>
          <Button variant="outline" onClick={() => window.history.back()}>
            이전 페이지로
          </Button>
        </div>
      </div>
    )
  }

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
          {/* Main Content */}
          <main className="lg:col-span-3">
            <Button variant="ghost" size="sm" className="mb-6" asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                목록으로 돌아가기
              </Link>
            </Button>
            {/* Admin 버튼 */}
            {hasJwtToken() && post && (
              <div className="flex gap-2 mb-4">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/posts/${post.slug}/edit`}>수정</Link>
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDelete}>
                  삭제
                </Button>
              </div>
            )}
            {/* Post Header + Content 통합 */}
            <Card className="mb-8">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <Badge variant="secondary" className="text-sm">
                    {post.category_name || "미분류"}
                  </Badge>
                  <LikeButton postSlug={post.slug} />
                  <span className="text-gray-500 text-sm">댓글 {post.comments_count}</span>
                  <div className="flex-1 text-right text-xs text-gray-400">
                    {new Date(post.created_at).toLocaleDateString("ko-KR")}
                  </div>
                </div>
                <div className="prose prose-lg max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {post.content}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
            {/* 댓글 */}
            <CommentSection postSlug={post.slug} />
          </main>
        </div>
      </div>
    </div>
  )
}
