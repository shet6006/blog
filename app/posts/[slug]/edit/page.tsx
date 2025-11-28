"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Header } from "@/components/header"
import { CategoryFilter } from "@/components/category-filter"
import { Card, CardContent } from "@/components/ui/card"
import { SearchBar } from "@/components/search-bar"

export default function EditPostPage() {
  const params = useParams()
  const router = useRouter()
  const { slug } = params as { slug: string }
  const [post, setPost] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<any>({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesRes = await fetch("/api/categories")
        const cats = await categoriesRes.json()
        setCategories((cats as any[]).map((cat) => ({
          ...cat,
          postCount: cat.post_count ?? 0,
        })))
        const postRes = await fetch(`/api/posts/${slug}`)
        if (!postRes.ok) throw new Error()
        setPost(await postRes.json())
        const statsRes = await fetch("/api/admin/stats")
        setStats(await statsRes.json())
      } catch {
        toast.error("게시글을 불러오는데 실패했습니다.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [slug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!post) return
    
    if (!post.title?.trim()) {
      toast.error("제목을 입력해주세요.")
      return
    }
    
    try {
      // 제목에서 slug 생성
      const newSlug = post.title
        .toLowerCase()
        .replace(/[^a-z0-9가-힣]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
      
      const res = await fetch(`/api/posts/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: post.title,
          content: post.content,
          category_id: post.category_id,
          is_public: post.is_public ? 1 : 0, // MySQL용 변환
          slug: newSlug,
        }),
      })
      if (!res.ok) throw new Error()
      toast.success("게시글이 수정되었습니다.")
      router.push(`/posts/${newSlug}`)
    } catch {
      toast.error("게시글 수정에 실패했습니다.")
    }
  }

  if (isLoading) return <div>로딩 중...</div>
  if (!post) return <div>게시글을 찾을 수 없습니다.</div>

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
            <h1 className="text-2xl font-bold mb-6">게시글 수정</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">제목</Label>
                <Input
                  id="title"
                  value={post.title || ""}
                  onChange={e => setPost({ ...post, title: e.target.value })}
                  placeholder="게시글 제목"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">내용</Label>
                <Textarea
                  id="content"
                  value={post.content}
                  onChange={e => setPost({ ...post, content: e.target.value })}
                  className="min-h-[300px]"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">카테고리</Label>
                <Select value={post.category_id?.toString()} onValueChange={v => setPost({ ...post, category_id: parseInt(v) })}>
                  <SelectTrigger>
                    <SelectValue placeholder="카테고리 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="is_public" checked={post.is_public} onCheckedChange={checked => setPost({ ...post, is_public: checked })} />
                <Label htmlFor="is_public">공개</Label>
              </div>
              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => router.push(`/posts/${slug}`)}>취소</Button>
                <Button type="submit">수정</Button>
              </div>
            </form>
          </main>
        </div>
      </div>
    </div>
  )
} 