"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Save, X } from "lucide-react"
import { toast } from "sonner"
import { apiClient } from "@/lib/api-client"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AboutPage {
  id: number
  title: string
  content: string
  tech_stack: string[]
  updated_at: string
}

export default function AboutPage() {
  const [about, setAbout] = useState<AboutPage | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [editData, setEditData] = useState({
    title: "",
    content: "",
    tech_stack: [] as string[],
  })
  const [newTech, setNewTech] = useState("")

  useEffect(() => {
    loadAbout()
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    try {
      const response = await fetch("/api/auth/check", {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        // authenticated 필드로 확인
        setIsAdmin(data.authenticated && data.user?.id === "admin")
      }
    } catch (error) {
      console.error("Admin check failed:", error)
    }
  }

  const loadAbout = async () => {
    try {
      const response = await fetch("/api/about")
      if (response.ok) {
        const data = await response.json()
        setAbout(data)
        setEditData({
          title: data.title,
          content: data.content,
          tech_stack: data.tech_stack || [],
        })
      }
    } catch (error) {
      console.error("Failed to load about page:", error)
      toast.error("소개 페이지를 불러오는데 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const response = await fetch("/api/about", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
        },
        credentials: "include", // 쿠키 자동 전송
        body: JSON.stringify(editData),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success("소개 페이지가 업데이트되었습니다.")
        setIsEditing(false)
        // 응답 데이터로 상태 업데이트
        setAbout(data)
        setEditData({
          title: data.title,
          content: data.content,
          tech_stack: data.tech_stack || [],
        })
      } else {
        const errorData = await response.json().catch(() => ({ error: "알 수 없는 오류" }))
        console.error("Update failed:", errorData)
        toast.error(errorData.error || errorData.details || "업데이트에 실패했습니다.")
      }
    } catch (error: any) {
      console.error("Update error:", error)
      toast.error("업데이트 중 오류가 발생했습니다: " + (error?.message || "알 수 없는 오류"))
    }
  }

  const handleAddTech = () => {
    if (newTech.trim() && !editData.tech_stack.includes(newTech.trim())) {
      setEditData({
        ...editData,
        tech_stack: [...editData.tech_stack, newTech.trim()],
      })
      setNewTech("")
    }
  }

  const handleRemoveTech = (tech: string) => {
    setEditData({
      ...editData,
      tech_stack: editData.tech_stack.filter((t) => t !== tech),
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">로딩 중...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{about?.title || "소개"}</CardTitle>
              {isAdmin && (
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                        <X className="w-4 h-4 mr-2" />
                        취소
                      </Button>
                      <Button size="sm" onClick={handleSave}>
                        <Save className="w-4 h-4 mr-2" />
                        저장
                      </Button>
                    </>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit className="w-4 h-4 mr-2" />
                      수정
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">제목</Label>
                  <Input
                    id="title"
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">내용 (마크다운)</Label>
                  <Textarea
                    id="content"
                    value={editData.content}
                    onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                    rows={20}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label>기술 스택</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newTech}
                      onChange={(e) => setNewTech(e.target.value)}
                      placeholder="기술 스택 추가"
                      onKeyPress={(e) => e.key === "Enter" && handleAddTech()}
                    />
                    <Button type="button" onClick={handleAddTech}>
                      추가
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editData.tech_stack.map((tech) => (
                      <Badge key={tech} variant="secondary" className="flex items-center gap-1">
                        {tech}
                        <button
                          onClick={() => handleRemoveTech(tech)}
                          className="ml-1 hover:text-red-500"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="prose prose-lg max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{about?.content || ""}</ReactMarkdown>
                </div>
                {about?.tech_stack && about.tech_stack.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">기술 스택</h3>
                    <div className="flex flex-wrap gap-2">
                      {about.tech_stack.map((tech) => (
                        <Badge key={tech} variant="secondary">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

