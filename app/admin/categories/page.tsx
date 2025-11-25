"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface Category {
  id: number
  name: string
  slug: string
}

export default function CategoriesManagementPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newCategory, setNewCategory] = useState({ name: "", slug: "" })

  useEffect(() => {
    checkAuthAndLoadCategories()
  }, [])

  const checkAuthAndLoadCategories = async () => {
    try {
      const response = await fetch("/api/auth/check")
      if (!response.ok) {
        router.push("/")
        toast.error("권한이 필요한 페이지입니다.")
        return
      }

      loadCategories()
    } catch (error) {
      console.error("Error:", error)
      toast.error("데이터를 불러오는 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error("Failed to load categories:", error)
      toast.error("카테고리를 불러오는데 실패했습니다.")
    }
  }

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error("카테고리 이름을 입력해주세요.")
      return
    }

    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory),
      })

      if (response.ok) {
        const data = await response.json()
        setCategories([...categories, data.category])
        setNewCategory({ name: "", slug: "" })
        toast.success("카테고리가 추가되었습니다.")
      } else {
        const error = await response.json()
        toast.error(error.error || "카테고리 추가에 실패했습니다.")
      }
    } catch (error) {
      toast.error("카테고리 추가 중 오류가 발생했습니다.")
    }
  }

  const handleDeleteCategory = async (categoryId: number) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setCategories(categories.filter((cat) => cat.id !== categoryId))
        toast.success("카테고리가 삭제되었습니다.")
      } else {
        const error = await response.json()
        toast.error(error.error || "카테고리 삭제에 실패했습니다.")
      }
    } catch (error) {
      toast.error("카테고리 삭제 중 오류가 발생했습니다.")
    }
  }

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
            <div>
              <h1 className="text-3xl font-bold text-gray-900">카테고리 관리</h1>
              <p className="text-gray-600 mt-1">카테고리를 추가, 수정, 삭제하세요</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>카테고리 추가</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category-name">카테고리 이름</Label>
                    <Input
                      id="category-name"
                      value={newCategory.name}
                      onChange={(e) =>
                        setNewCategory({
                          ...newCategory,
                          name: e.target.value,
                          slug: e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9가-힣]/g, "-")
                            .replace(/-+/g, "-")
                            .replace(/^-|-$/g, ""),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category-slug">슬러그</Label>
                    <Input
                      id="category-slug"
                      value={newCategory.slug}
                      onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={handleAddCategory}>
                  <Plus className="w-4 h-4 mr-2" />
                  카테고리 추가
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>현재 카테고리</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>이름</TableHead>
                      <TableHead>슬러그</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.length > 0 ? (
                      categories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{category.slug}</Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCategory(category.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-gray-500">
                          카테고리가 없습니다.
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

