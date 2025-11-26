"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Eye } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { apiClient } from "@/lib/api-client"

interface Category {
  id: number
  name: string
  slug: string
}

export default function WritePage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [post, setPost] = useState({
    title: "",
    content: "",
    category_id: "",
    is_public: true,
    slug: "",
  })

  const [isPreview, setIsPreview] = useState(false)

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  const checkAuthAndLoadData = async () => {
    try {
      const response = await fetch("/api/auth/check", {
        credentials: "include",
      })
      
      if (!response.ok) {
        router.push("/")
        toast.error("권한이 필요한 페이지입니다.")
        return
      }

      const authData = await response.json()
      
      // authenticated 필드로 권한 확인
      if (!authData.authenticated) {
        router.push("/")
        toast.error("권한이 필요한 페이지입니다.")
        return
      }

      // 카테고리 데이터 로드
      const categoriesResponse = await fetch("/api/admin/categories", {
        credentials: "include",
      })
      if (categoriesResponse.ok) {
        const data = await categoriesResponse.json()
        setCategories(data.categories)
      }

      setIsLoading(false)
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("데이터를 불러오는 중 오류가 발생했습니다.")
    }
  }

  const handleSave = async () => {
    try {
      const response = await fetch("/api/admin/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...post,
          category_id: Number.parseInt(post.category_id) || 0,
          is_public: false, // 임시저장은 항상 비공개
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("게시글이 임시저장되었습니다.")
      } else {
        console.error("게시글 저장 실패:", data)
        toast.error(data.error || "게시글 저장에 실패했습니다.")
      }
    } catch (error) {
      console.error("게시글 저장 중 오류:", error)
      toast.error("게시글 저장 중 오류가 발생했습니다.")
    }
  }

  const handlePublish = async () => {
    try {
      const response = await fetch("/api/admin/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...post,
          category_id: Number.parseInt(post.category_id) || 0,
          is_public: true,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("게시글이 발행되었습니다.")
        router.push("/admin/dashboard")
      } else {
        console.error("게시글 발행 실패:", data)
        toast.error(data.error || "게시글 발행에 실패했습니다.")
      }
    } catch (error) {
      console.error("게시글 발행 중 오류:", error)
      toast.error("게시글 발행 중 오류가 발생했습니다.")
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
  }

  const handleTitleChange = (title: string) => {
    setPost({
      ...post,
      title,
      slug: generateSlug(title),
    })
  }

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">로딩 중...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                대시보드로 돌아가기
              </Link>
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">새 글 작성</h1>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setIsPreview(!isPreview)}>
              <Eye className="w-4 h-4 mr-2" />
              {isPreview ? "편집" : "미리보기"}
            </Button>
            <Button variant="outline" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              임시저장
            </Button>
            <Button onClick={handlePublish}>게시하기</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Editor */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>게시글 작성</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {!isPreview ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="title">제목</Label>
                      <Input
                        id="title"
                        placeholder="게시글 제목을 입력하세요"
                        value={post.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="slug">URL 슬러그</Label>
                      <Input
                        id="slug"
                        placeholder="url-slug"
                        value={post.slug}
                        onChange={(e) => setPost({ ...post, slug: e.target.value })}
                      />
                      <p className="text-sm text-gray-500">게시글 URL: /posts/{post.slug || "url-slug"}</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="content">내용 (마크다운)</Label>
                      <Textarea
                        id="content"
                        placeholder="마크다운으로 게시글을 작성하세요..."
                        value={post.content}
                        onChange={(e) => setPost({ ...post, content: e.target.value })}
                        rows={20}
                        className="font-mono"
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title || "제목을 입력하세요"}</h1>
                      <div className="prose prose-lg max-w-none">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: post.content.replace(/\n/g, "<br>") || "내용을 입력하세요...",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Settings */}
            <Card>
              <CardHeader>
                <CardTitle>게시 설정</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">카테고리</Label>
                  <Select value={post.category_id} onValueChange={(value) => setPost({ ...post, category_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="카테고리 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="public">공개 게시글</Label>
                  <Switch
                    id="public"
                    checked={post.is_public}
                    onCheckedChange={(checked) => setPost({ ...post, is_public: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Writing Tips */}
            <Card>
              <CardHeader>
                <CardTitle>마크다운 가이드</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-2">
                <div>
                  <code># 제목</code> - 대제목
                </div>
                <div>
                  <code>## 소제목</code> - 소제목
                </div>
                <div>
                  <code>**굵게**</code> - 굵은 텍스트
                </div>
                <div>
                  <code>*기울임*</code> - 기울임 텍스트
                </div>
                <div>
                  <code>`코드`</code> - 인라인 코드
                </div>
                <div>
                  <code>```언어</code> - 코드 블록
                </div>
                <div>
                  <code>[링크](URL)</code> - 링크
                </div>
                <div>
                  <code>![이미지](URL)</code> - 이미지
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
