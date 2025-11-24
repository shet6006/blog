"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Eye, EyeOff } from "lucide-react"

const posts = [
  {
    id: 1,
    title: "Next.js 14 App Router 완벽 가이드",
    category: "Frontend",
    status: "published",
    createdAt: "2024-01-15",
    likes: 24,
    comments: 8,
  },
  {
    id: 2,
    title: "TypeScript 고급 타입 시스템",
    category: "TypeScript",
    status: "published",
    createdAt: "2024-01-12",
    likes: 18,
    comments: 5,
  },
  {
    id: 3,
    title: "React Server Components 심화",
    category: "React",
    status: "draft",
    createdAt: "2024-01-10",
    likes: 31,
    comments: 12,
  },
]

export function PostsTable() {
  const [postList, setPostList] = useState(posts)

  const handleDelete = (id: number) => {
    setPostList(postList.filter((post) => post.id !== id))
  }

  const toggleStatus = (id: number) => {
    setPostList(
      postList.map((post) =>
        post.id === id ? { ...post, status: post.status === "published" ? "draft" : "published" } : post,
      ),
    )
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
        {postList.map((post) => (
          <TableRow key={post.id}>
            <TableCell className="font-medium">
              <Link href={`/posts/${post.title.toLowerCase().replace(/\s+/g, "-")}`} className="hover:text-blue-600">
                {post.title}
              </Link>
            </TableCell>
            <TableCell>
              <Badge variant="secondary">{post.category}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={post.status === "published" ? "default" : "outline"}>
                {post.status === "published" ? "공개" : "비공개"}
              </Badge>
            </TableCell>
            <TableCell>{new Date(post.createdAt).toLocaleDateString("ko-KR")}</TableCell>
            <TableCell>{post.likes}</TableCell>
            <TableCell>{post.comments}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/write?edit=${post.id}`}>
                      <Edit className="w-4 h-4 mr-2" />
                      수정
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleStatus(post.id)}>
                    {post.status === "published" ? (
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
                  <DropdownMenuItem onClick={() => handleDelete(post.id)} className="text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" />
                    삭제
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
