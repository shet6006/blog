"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Trash2, Search } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface Comment {
  id: number
  post_id: number
  post_title: string
  post_slug: string
  author_name: string
  content: string
  is_admin: boolean
  created_at: string
}

export default function CommentsManagementPage() {
  const router = useRouter()
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    checkAuthAndLoadComments()
  }, [])

  const checkAuthAndLoadComments = async () => {
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

      loadComments()
    } catch (error) {
      console.error("Error:", error)
      toast.error("데이터를 불러오는 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const loadComments = async () => {
    try {
      const response = await fetch("/api/admin/comments")
      if (response.ok) {
        const data = await response.json()
        setComments(data.comments || [])
      }
    } catch (error) {
      console.error("Failed to load comments:", error)
      toast.error("댓글을 불러오는데 실패했습니다.")
    }
  }

  const handleDelete = async (commentId: number, postSlug: string) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return

    try {
      const response = await fetch(`/api/comments/${postSlug}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId }),
      })

      if (response.ok) {
        toast.success("댓글이 삭제되었습니다.")
        loadComments()
      } else {
        const error = await response.json()
        toast.error(error.error || "삭제에 실패했습니다.")
      }
    } catch (error) {
      toast.error("삭제 중 오류가 발생했습니다.")
    }
  }

  const filteredComments = comments.filter(
    (comment) =>
      comment.author_name.toLowerCase().includes(search.toLowerCase()) ||
      comment.content.toLowerCase().includes(search.toLowerCase()) ||
      comment.post_title?.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">로딩 중...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-1">
            <AdminSidebar />
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">댓글 관리</h1>
                <p className="text-gray-600 mt-1">모든 댓글을 관리하세요</p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>댓글 목록</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="검색..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8 w-64"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>게시글</TableHead>
                      <TableHead>작성자</TableHead>
                      <TableHead>내용</TableHead>
                      <TableHead>작성일</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredComments.length > 0 ? (
                      filteredComments.map((comment) => (
                        <TableRow key={comment.id}>
                          <TableCell>
                            <Link href={`/posts/${comment.post_slug}`} className="hover:text-blue-600">
                              {comment.post_title || "제목 없음"}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>{comment.author_name}</span>
                              {comment.is_admin && (
                                <Badge variant="default" className="text-xs">
                                  관리자
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-md truncate">{comment.content}</TableCell>
                          <TableCell>{new Date(comment.created_at).toLocaleDateString("ko-KR")}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(comment.id, comment.post_slug)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500">
                          댓글이 없습니다.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

