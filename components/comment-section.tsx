"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MessageCircle, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { apiClient } from "@/lib/api-client"

interface Comment {
  id: number
  post_id: number
  author_name: string
  content: string
  created_at: string
  is_admin: boolean
  device_id: string
}

interface CommentSectionProps {
  postSlug: string
}

export function CommentSection({ postSlug }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [authorName, setAuthorName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [deviceId, setDeviceId] = useState("")

  useEffect(() => {
    // 디바이스 ID 생성 또는 가져오기
    const storedDeviceId = localStorage.getItem("deviceId")
    if (storedDeviceId) {
      setDeviceId(storedDeviceId)
    } else {
      const newDeviceId = Math.random().toString(36).substring(2)
      localStorage.setItem("deviceId", newDeviceId)
      setDeviceId(newDeviceId)
    }

    // 댓글 로드
    loadComments()
  }, [postSlug])

  const loadComments = async () => {
    try {
      const data = await apiClient.getComments(postSlug)
      setComments(data)
    } catch (error) {
      console.error("댓글 로딩 중 오류:", error)
      toast.error("댓글을 불러오는데 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !authorName.trim()) {
      toast.error("이름과 댓글 내용을 모두 입력해주세요.")
      return
    }

    try {
      await apiClient.createComment(postSlug, {
        authorName,
        content: newComment,
        deviceId,
      })
      toast.success("댓글이 등록되었습니다.")
      setNewComment("")
      loadComments()
    } catch (error) {
      console.error("댓글 등록 중 오류:", error)
      toast.error("댓글 등록 중 오류가 발생했습니다.")
    }
  }

  const handleDelete = async (commentId: string) => {
    try {
      await apiClient.deleteComment(postSlug)
      toast.success("댓글이 삭제되었습니다.")
      loadComments()
    } catch (error) {
      console.error("댓글 삭제 중 오류:", error)
      toast.error("댓글 삭제 중 오류가 발생했습니다.")
    }
  }

  if (isLoading) {
    return <div className="text-center py-4">댓글을 불러오는 중...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          댓글 {comments.length}개
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* 댓글 작성 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <div className="space-y-2">
            <Label htmlFor="author">이름</Label>
            <Input
              id="author"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="이름을 입력하세요"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="comment">댓글</Label>
            <Textarea
              id="comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 입력하세요"
              rows={3}
            />
          </div>
          <Button type="submit">댓글 작성</Button>
        </form>

        {/* 댓글 목록 */}
        <div className="space-y-4">
          {comments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{comment.author_name}</span>
                      {comment.is_admin && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          관리자
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {new Date(comment.created_at).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                  {comment.device_id === deviceId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(comment.id.toString())}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
