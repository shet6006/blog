"use client"

import { useState, useEffect, useRef } from "react"
import { getApiBaseUrl } from "@/lib/api-client"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MarkdownEditor } from "@/components/markdown-editor"
import { postViewHref } from "@/lib/post-routes"
import { normalizePostBody } from "@/lib/post-content"
import { getPostImageCount, getPostImageUrls, MAX_POST_IMAGES, resolvePostThumbnail } from "@/lib/post-images"
import { ArrowLeft, Image as ImageIcon, Save } from "lucide-react"
import Link from "next/link"

export default function EditPostPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const slug = searchParams.get("slug") ?? ""
  const [post, setPost] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!slug) throw new Error("missing slug")
        const categoriesRes = await fetch(`${getApiBaseUrl()}/api/categories`)
        const cats = await categoriesRes.json()
        setCategories((cats as any[]).map((cat) => ({
          ...cat,
          postCount: cat.post_count ?? 0,
        })))
        const postRes = await fetch(`${getApiBaseUrl()}/api/posts/${slug}`)
        if (!postRes.ok) throw new Error()
        const postData = await postRes.json()
        
        postData.content = normalizePostBody(postData.content, postData.title)
        
        setPost(postData)
      } catch {
        toast.error("게시글을 불러오는데 실패했습니다.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [slug])

  const insertAtCursor = (snippet: string) => {
    const textarea = textareaRef.current
    if (!textarea) {
      setPost((prev: any) => ({ ...prev, content: (prev?.content || "") + snippet }))
      return
    }
    const currentContent = (post?.content || "") as string
    const { selectionStart, selectionEnd } = textarea
    const start = selectionStart ?? currentContent.length
    const end = selectionEnd ?? currentContent.length
    const before = currentContent.slice(0, start)
    const after = currentContent.slice(end)
    const newContent = `${before}${snippet}${after}`

    setPost((prev: any) => ({ ...prev, content: newContent }))

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
    const currentCount = getPostImageCount(post?.content || "")
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
      
      const res = await fetch(`${getApiBaseUrl()}/api/posts/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: post.title,
          content: post.content,
          category_id: post.category_id,
          is_public: post.is_public ? 1 : 0, // MySQL용 변환
          slug: newSlug,
          thumbnail_url: post.thumbnail_url || null,
        }),
      })
      if (!res.ok) throw new Error()
      toast.success("게시글이 수정되었습니다.")
      router.push(postViewHref(newSlug))
    } catch {
      toast.error("게시글 수정에 실패했습니다.")
    }
  }

  if (isLoading) return <div className="flex min-h-screen items-center justify-center">로딩 중...</div>
  if (!post) return <div className="flex min-h-screen items-center justify-center">게시글을 찾을 수 없습니다.</div>

  const imageUrls = getPostImageUrls(post.content || "")
  const thumbnailPreview = resolvePostThumbnail(post.content || "", post.thumbnail_url)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={postViewHref(slug)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                게시글로 돌아가기
              </Link>
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">게시글 수정</h1>
          </div>
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <Button type="button" variant="outline" onClick={() => router.push(postViewHref(slug))}>취소</Button>
            <Button type="submit" form="edit-post-form">
              <Save className="mr-2 h-4 w-4" />
              수정 저장
            </Button>
          </div>
        </div>

        <form id="edit-post-form" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader><CardTitle>게시글 내용</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">제목</Label>
                    <Input id="title" value={post.title || ""} onChange={e => setPost({ ...post, title: e.target.value })} placeholder="게시글 제목을 입력하세요" required />
                    <p className="text-sm text-gray-500">제목과 본문은 따로 저장됩니다. 본문은 ## 소제목부터 작성하세요.</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="content">내용 (마크다운)</Label>
                      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelected} />
                      <Button type="button" variant="outline" size="sm" onClick={handleImageUploadClick} disabled={isUploadingImage}>
                        <ImageIcon className="mr-1 h-4 w-4" />
                        {isUploadingImage ? "업로드 중..." : "이미지 업로드"}
                      </Button>
                    </div>
                    <MarkdownEditor value={post.content} onChange={(content) => setPost({ ...post, content })} textareaRef={textareaRef} required onPasteImages={uploadImages} isUploadingImage={isUploadingImage} />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle>게시 설정</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">카테고리</Label>
                    <Select value={post.category_id?.toString()} onValueChange={v => setPost({ ...post, category_id: parseInt(v) })}>
                      <SelectTrigger><SelectValue placeholder="카테고리 선택" /></SelectTrigger>
                      <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="is_public">공개 게시글</Label>
                    <Switch id="is_public" checked={post.is_public} onCheckedChange={checked => setPost({ ...post, is_public: checked })} />
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

              <Card>
                <CardHeader><CardTitle>마크다운 가이드</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm text-gray-600">
                  <div><code># 제목</code> - 대제목</div>
                  <div><code>## 소제목</code> - 소제목</div>
                  <div><code>**굵게**</code> - 굵은 텍스트</div>
                  <div><code>*기울임*</code> - 기울임 텍스트</div>
                  <div><code>`코드`</code> - 인라인 코드</div>
                  <div><code>```언어</code> - 코드 블록</div>
                  <div><code>[링크](URL)</code> - 링크</div>
                  <div><code>![이미지](URL)</code> - 이미지</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 
