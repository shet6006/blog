"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Image as ImageIcon } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { apiClient, getApiBaseUrl } from "@/lib/api-client"
import { Textarea } from "@/components/ui/textarea"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

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

  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)


  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  const checkAuthAndLoadData = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/auth/check`, {
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
      const categoriesResponse = await fetch(`${getApiBaseUrl()}/api/admin/categories`, {
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
      // 제목을 H1 태그로 변환하여 content 앞에 추가
      const contentWithTitle = post.content.trim().startsWith('#') 
        ? post.content 
        : `# ${post.title}\n\n${post.content}`
      
      const response = await fetch(`${getApiBaseUrl()}/api/admin/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...post,
          content: contentWithTitle,
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
      // 제목을 H1 태그로 변환하여 content 앞에 추가
      const contentWithTitle = post.content.trim().startsWith('#') 
        ? post.content 
        : `# ${post.title}\n\n${post.content}`
      
      const response = await fetch(`${getApiBaseUrl()}/api/admin/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...post,
          content: contentWithTitle,
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

  const insertAtCursor = (snippet: string) => {
    const textarea = textareaRef.current
    if (!textarea) {
      setPost(prev => ({ ...prev, content: (prev.content || "") + snippet }))
      return
    }
    const { selectionStart, selectionEnd } = textarea
    const start = selectionStart ?? post.content.length
    const end = selectionEnd ?? post.content.length
    const before = post.content.slice(0, start)
    const after = post.content.slice(end)
    const newContent = `${before}${snippet}${after}`
    setPost(prev => ({ ...prev, content: newContent }))

    // 커서 위치를 새로 삽입된 뒤로 이동
    requestAnimationFrame(() => {
      const pos = start + snippet.length
      textarea.selectionStart = textarea.selectionEnd = pos
      textarea.focus()
    })
  }

  const handleImageUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return

    try {
      setIsUploadingImage(true)
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(`${getApiBaseUrl()}/api/uploads/image`, {
        method: "POST",
        credentials: "include",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok || !data.url) {
        throw new Error(data.error || "이미지 업로드에 실패했습니다.")
      }

      const imageUrl = `${getApiBaseUrl()}${data.url}`
      const snippet = `\n\n![이미지 설명](${imageUrl})\n\n`
      insertAtCursor(snippet)
    } catch (error: any) {
      console.error("이미지 업로드 실패:", error)
      toast.error(error.message || "이미지 업로드에 실패했습니다.")
    } finally {
      setIsUploadingImage(false)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">로딩 중...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
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
                <div className="space-y-2">
                  <Label htmlFor="title">제목 (H1 태그로 저장됩니다)</Label>
                  <Input
                    id="title"
                    placeholder="게시글 제목을 입력하세요"
                    value={post.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                  />
                  <p className="text-sm text-gray-500">제목은 자동으로 H1 태그(# 제목)로 저장됩니다.</p>
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="content">내용 (마크다운)</Label>
                    <div className="flex items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageSelected}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleImageUploadClick}
                        disabled={isUploadingImage}
                      >
                        <ImageIcon className="w-4 h-4 mr-1" />
                        {isUploadingImage ? "업로드 중..." : "이미지 업로드"}
                      </Button>
                    </div>
                  </div>
                  <div className="border rounded-lg overflow-hidden" style={{ minHeight: "600px" }}>
                    <div className="grid grid-cols-2 h-[600px]">
                      <div className="border-r">
                        <Textarea
                          id="content"
                          placeholder="마크다운으로 게시글을 작성하세요..."
                          value={post.content}
                          onChange={(e) => setPost({ ...post, content: e.target.value })}
                          ref={textareaRef}
                          className="h-full font-mono border-0 rounded-none resize-none"
                        />
                      </div>
                      <div className="overflow-auto p-6 prose prose-lg max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {post.content || "*내용을 입력하세요...*"}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
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
