"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Eye, EyeOff } from "lucide-react"

interface Post {
  id: number
  title: string
  category_name: string
  is_public: boolean
  created_at: string
  likes_count: number
  comments_count: number
  slug: string
}

export function PostsTable() {
  const [postList, setPostList] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      const response = await fetch("/api/admin/posts")
      if (response.ok) {
        const data = await response.json()
        setPostList((data.posts || []).slice(0, 5)) // 최근 5개만
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error("Failed to load posts:", response.status, errorData)
      }
    } catch (error) {
      console.error("Failed to load posts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number, slug: string) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return

    try {
      const response = await fetch(`/api/posts/${slug}`, {
        method: "DELETE",
      })

      if (response.ok) {
        loadPosts()
      }
    } catch (error) {
      console.error("Failed to delete post:", error)
    }
  }

  const toggleStatus = async (id: number, slug: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/posts/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_public: !currentStatus }),
      })

      if (response.ok) {
        loadPosts()
      }
    } catch (error) {
      console.error("Failed to toggle status:", error)
    }
  }

  if (isLoading) {
    return <div className="text-center py-4">로딩 중...</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>제목</TableHead>
          <TableHead>카테고리</TableHead>
          <TableHead>상태</TableHead>
          <TableHead>작성일</TableHead>
          <TableHead>좋아요</TableHead>
          <TableHead>댓글</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {postList.length > 0 ? (
          postList.map((post) => (
            <TableRow key={post.id}>
              <TableCell className="font-medium">
                <Link href={`/posts/${post.slug}`} className="hover:text-blue-600">
                  {post.title}
                </Link>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{post.category_name || "미분류"}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={post.is_public ? "default" : "outline"}>
                  {post.is_public ? "공개" : "비공개"}
                </Badge>
              </TableCell>
              <TableCell>{new Date(post.created_at).toLocaleDateString("ko-KR")}</TableCell>
              <TableCell>{post.likes_count || 0}</TableCell>
              <TableCell>{post.comments_count || 0}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/posts/${post.slug}/edit`}>
                        <Edit className="w-4 h-4 mr-2" />
                        수정
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleStatus(post.id, post.slug, post.is_public)}>
                      {post.is_public ? (
                        <>
                          <EyeOff className="w-4 h-4 mr-2" />
                          비공개로 변경
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-2" />
                          공개로 변경
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(post.id, post.slug)} className="text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" />
                      삭제
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-gray-500">
              게시글이 없습니다.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
