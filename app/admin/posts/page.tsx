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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Eye, EyeOff, Search } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

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

export default function PostsManagementPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    checkAuthAndLoadPosts()
  }, [])

  const checkAuthAndLoadPosts = async () => {
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

      loadPosts()
    } catch (error) {
      console.error("Error:", error)
      toast.error("데이터를 불러오는 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const loadPosts = async () => {
    try {
      const response = await fetch("/api/admin/posts", {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts || [])
      } else {
        setPosts([]) // 에러 발생 시 빈 배열로 설정
        const errorData = await response.json().catch(() => ({}))
        console.error("Failed to load posts:", response.status, errorData)
        toast.error(errorData.error || "게시글을 불러오는데 실패했습니다.")
      }
    } catch (error) {
      setPosts([]) // 네트워크 에러 시에도 빈 배열로 설정
      console.error("Failed to load posts:", error)
      toast.error("게시글을 불러오는데 실패했습니다.")
    }
  }

  const handleDelete = async (postId: number, slug: string) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return

    try {
      const response = await fetch(`/api/posts/${slug}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("게시글이 삭제되었습니다.")
        loadPosts()
      } else {
        const error = await response.json()
        toast.error(error.error || "삭제에 실패했습니다.")
      }
    } catch (error) {
      toast.error("삭제 중 오류가 발생했습니다.")
    }
  }

  const toggleVisibility = async (postId: number, slug: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/posts/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_public: !currentStatus }),
      })

      if (response.ok) {
        toast.success(`게시글이 ${!currentStatus ? "공개" : "비공개"}로 변경되었습니다.`)
        loadPosts()
      } else {
        const error = await response.json()
        toast.error(error.error || "변경에 실패했습니다.")
      }
    } catch (error) {
      toast.error("변경 중 오류가 발생했습니다.")
    }
  }

  const filteredPosts = posts.filter(
    (post) => post.title.toLowerCase().includes(search.toLowerCase()) || post.category_name?.toLowerCase().includes(search.toLowerCase())
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
                <h1 className="text-3xl font-bold text-gray-900">게시글 관리</h1>
                <p className="text-gray-600 mt-1">모든 게시글을 관리하세요</p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>게시글 목록</CardTitle>
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
                    {filteredPosts.length > 0 ? (
                      filteredPosts.map((post) => (
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
                                <DropdownMenuItem onClick={() => toggleVisibility(post.id, post.slug, post.is_public)}>
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

