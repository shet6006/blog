"use client"

import { useEffect, useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { MessageCircle, Trash2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { apiClient, getApiBaseUrl } from "@/lib/api-client"

interface Comment {
  id: number
  post_id: number
  author_name: string
  content: string
  created_at: string
  is_admin: boolean
  device_id: string
}

export function CommentSection({ postSlug }: { postSlug: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [authorName, setAuthorName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [deviceId, setDeviceId] = useState("")

  const loadComments = async () => {
    try {
      setComments(await apiClient.getComments(postSlug) as Comment[])
    } catch (error) {
      console.error("댓글 로딩 중 오류:", error)
      toast.error("댓글을 불러오는데 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const storedDeviceId = localStorage.getItem("deviceId")
    if (storedDeviceId) {
      setDeviceId(storedDeviceId)
    } else {
      const newDeviceId = Math.random().toString(36).substring(2)
      localStorage.setItem("deviceId", newDeviceId)
      setDeviceId(newDeviceId)
    }
    loadComments()
  }, [postSlug])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!newComment.trim() || !authorName.trim()) {
      toast.error("이름과 댓글 내용을 모두 입력해주세요.")
      return
    }

    try {
      await apiClient.createComment(postSlug, { authorName, content: newComment, deviceId })
      toast.success("댓글이 등록되었습니다.")
      setNewComment("")
      await loadComments()
      window.dispatchEvent(new CustomEvent("commentUpdated"))
    } catch (error) {
      console.error("댓글 등록 중 오류:", error)
      toast.error("댓글 등록 중 오류가 발생했습니다.")
    }
  }

  const handleDelete = async (commentId: string) => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/comments/${postSlug}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ commentId }),
      })
      if (!response.ok) {
        const data = await response.json()
        toast.error(data.error || "댓글 삭제에 실패했습니다.")
        return
      }
      toast.success("댓글이 삭제되었습니다.")
      await loadComments()
      window.dispatchEvent(new CustomEvent("commentUpdated"))
    } catch (error) {
      console.error("댓글 삭제 중 오류:", error)
      toast.error("댓글 삭제 중 오류가 발생했습니다.")
    }
  }

  if (isLoading) return (
    <div className="animate-pulse space-y-6 py-8" aria-hidden="true">
      <Skeleton className="h-7 w-24" /><Skeleton className="h-11 w-full" /><Skeleton className="h-28 w-full" />
      <div className="space-y-3 border-t border-slate-200 pt-6"><Skeleton className="h-4 w-28" /><Skeleton className="h-4 w-4/5" /></div>
    </div>
  )

  return (
    <section aria-labelledby="comments-heading">
      <div className="mb-8 flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-blue-600" />
        <h2 id="comments-heading" className="text-2xl font-semibold tracking-[-0.025em] text-gray-950">
          댓글 <span className="text-blue-600">{comments.length}</span>
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="border-b border-gray-200 pb-10">
        <label className="mb-5 block max-w-xs">
          <span className="mb-2 block text-sm font-medium text-gray-700">이름</span>
          <Input
            value={authorName}
            onChange={(event) => setAuthorName(event.target.value)}
            placeholder="이름을 입력하세요"
            className="h-11 rounded-none border-x-0 border-t-0 px-0 shadow-none focus-visible:border-blue-600 focus-visible:ring-0"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-gray-700">댓글</span>
          <Textarea
            value={newComment}
            onChange={(event) => setNewComment(event.target.value)}
            placeholder="댓글을 입력하세요"
            rows={4}
            className="resize-none rounded-none border-gray-200 p-4 shadow-none focus-visible:border-blue-600 focus-visible:ring-1 focus-visible:ring-blue-600"
          />
        </label>
        <div className="mt-4 flex justify-end">
          <Button type="submit" className="bg-blue-600 px-5 hover:bg-blue-700">댓글 작성</Button>
        </div>
      </form>

      <div className="divide-y divide-gray-200">
        {comments.map((comment) => (
          <article key={comment.id} className="py-7">
            <div className="flex items-start justify-between">
              <div className="min-w-0 pr-5">
                <div className="mb-3 flex items-center gap-2">
                  <span className="font-semibold text-gray-950">{comment.author_name}</span>
                  {comment.is_admin && <span className="text-xs font-medium text-blue-600">관리자</span>}
                </div>
                <p className="whitespace-pre-wrap leading-7 text-gray-700">{comment.content}</p>
                <p className="mt-3 text-xs text-gray-400">{new Date(comment.created_at).toLocaleDateString("ko-KR")}</p>
              </div>
              {comment.device_id === deviceId && (
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="댓글 삭제"
                  onClick={() => handleDelete(comment.id.toString())}
                  className="text-gray-300 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </article>
        ))}
        {comments.length === 0 && <p className="py-10 text-sm text-gray-400">첫 번째 댓글을 남겨보세요.</p>}
      </div>
    </section>
  )
}
