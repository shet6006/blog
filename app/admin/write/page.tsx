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
import { getApiBaseUrl } from "@/lib/api-client"
import { MarkdownEditor } from "@/components/markdown-editor"
import { FormSkeleton } from "@/components/page-skeleton"
import { getPostImageCount, getPostImageUrls, MAX_POST_IMAGES, resolvePostThumbnail } from "@/lib/post-images"

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
    thumbnail_url: "",
  })

  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)


  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  const validatePost = () => {
    if (!post.title.trim()) {
      toast.error("제목을 입력해주세요.")
      return false
    }
    if (!post.content.trim()) {
      toast.error("내용을 입력해주세요.")
      return false
    }
    if (!post.category_id) {
      toast.error("카테고리를 선택해주세요.")
      return false
    }
    if (getPostImageCount(post.content) > MAX_POST_IMAGES) {
      toast.error(`게시글에는 이미지를 최대 ${MAX_POST_IMAGES}장까지 넣을 수 있습니다.`)
      return false
    }
    return true
  }

  const readResponse = async (response: Response) => {
    const text = await response.text()
    if (!text) return {}
    try {
      return JSON.parse(text)
    } catch {
      return { error: text }
    }
  }

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
    if (!validatePost()) return
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/admin/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...post,
          content: post.content,
          category_id: Number.parseInt(post.category_id) || 0,
          is_public: false, // 임시저장은 항상 비공개
        }),
      })

      const data = await readResponse(response)

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
    if (!validatePost()) return
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/admin/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...post,
          content: post.content,
          category_id: Number.parseInt(post.category_id) || 0,
          is_public: true,
        }),
      })

      const data = await readResponse(response)

      if (response.ok) {
        toast.success("게시글이 발행되었습니다.")
        router.push("/admin/dashboard")
      } else {
        const message = data.error || data.message || `게시글 발행에 실패했습니다. (HTTP ${response.status})`
        console.warn("게시글 발행 실패:", response.status, message)
        toast.error(message)
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

  const uploadImages = async (files: File[]) => {
    if (files.length === 0) return
    const currentCount = getPostImageCount(post.content)
    if (currentCount + files.length > MAX_POST_IMAGES) {
      toast.error(`게시글에는 이미지를 최대 ${MAX_POST_IMAGES}장까지 넣을 수 있습니다. (현재 ${currentCount}장)`)
      return
    }
    try {
      setIsUploadingImage(true)
      const urls: string[] = []
      for (const file of files) {
        const formData = new FormData()
        formData.append("file", file)
        const response = await fetch(`${getApiBaseUrl()}/api/uploads/image`, {
          method: "POST",
          credentials: "include",
          body: formData,
        })
        const data = await response.json()
        if (!response.ok || !data.url) throw new Error(data.error || "이미지 업로드에 실패했습니다.")
        urls.push(`${getApiBaseUrl()}${data.url}`)
      }
      insertAtCursor(`\n\n${urls.map((url) => `![이미지 설명](${url})`).join("\n\n")}\n\n`)
      toast.success(`${urls.length}장의 이미지를 추가했습니다.`)
    } catch (error: any) {
      console.error("이미지 업로드 실패:", error)
      toast.error(error.message || "이미지 업로드에 실패했습니다.")
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleImageSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    e.target.value = ""
    await uploadImages(files)
  }

  const imageUrls = getPostImageUrls(post.content)
  const thumbnailPreview = resolvePostThumbnail(post.content, post.thumbnail_url)

  if (isLoading) {
    return <FormSkeleton />
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
                  <Label htmlFor="title">제목</Label>
                  <Input
                    id="title"
                    placeholder="게시글 제목을 입력하세요"
                    value={post.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                  />
                  <p className="text-sm text-gray-500">제목과 본문은 따로 저장됩니다. 본문은 ## 소제목부터 작성하세요.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">URL 슬러그</Label>
                  <Input
                    id="slug"
                    placeholder="url-slug"
                    value={post.slug}
                    onChange={(e) => setPost({ ...post, slug: e.target.value })}
                  />
                  <p className="text-sm text-gray-500">게시글 URL: /posts/view?slug={post.slug || "url-slug"}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="content">내용 (마크다운)</Label>
                    <div className="flex items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
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
                  <MarkdownEditor
                    value={post.content}
                    onChange={(content) => setPost({ ...post, content })}
                    textareaRef={textareaRef}
                    onPasteImages={uploadImages}
                    isUploadingImage={isUploadingImage}
                  />
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

                <div className="space-y-3 border-t pt-4">
                  <div>
                    <Label htmlFor="thumbnail">썸네일</Label>
                    <p className="mt-1 text-xs leading-5 text-gray-500">기본값은 본문의 첫 이미지입니다. 다른 이미지를 고르거나 사용하지 않을 수 있습니다.</p>
                  </div>
                  <Select value={post.thumbnail_url || "auto"} onValueChange={(value) => setPost({ ...post, thumbnail_url: value === "auto" ? "" : value })}>
                    <SelectTrigger id="thumbnail"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">첫 이미지 자동 사용</SelectItem>
                      <SelectItem value="none">썸네일 사용 안 함</SelectItem>
                      {imageUrls.map((url, index) => <SelectItem key={`${url}-${index}`} value={url}>이미지 {index + 1}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {thumbnailPreview && <img src={thumbnailPreview} alt="선택한 썸네일 미리보기" className="aspect-video w-full border border-gray-200 object-cover" />}
                  <p className="text-xs text-gray-500">본문 이미지 {imageUrls.length}/{MAX_POST_IMAGES}장</p>
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
