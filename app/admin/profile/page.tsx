"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Plus, Trash2 } from "lucide-react"
import { Profile } from "@/lib/profile"
import { Header } from "@/components/header"

interface Category {
    id: number
    name: string
    slug: string
}

export default function ProfilePage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [categories, setCategories] = useState<Category[]>([])
    const [profile, setProfile] = useState<Profile | null>(null)
    const [newCategory, setNewCategory] = useState({ name: "", slug: "" })
    const [newProfile, setNewProfile] = useState({
        name: "",
        email: "",
        avatar_url: "",
        github_username: "",
        bio: ""
    })

    useEffect(() => {
        checkAuthAndLoadData()
    }, [])

    const checkAuthAndLoadData = async () => {
        try {
            const response = await fetch("/api/auth/check")
            if (!response.ok) {
                router.push("/")
                toast.error("권한이 필요한 페이지입니다.")
                return
            }

            // 카테고리 데이터 로드
            const categoriesResponse = await fetch("/api/admin/categories")
            if (categoriesResponse.ok) {
                const data = await categoriesResponse.json()
                setCategories(data.categories)
            }

            // 프로필 데이터 로드
            const profileResponse = await fetch("/api/admin/profile")
            if (profileResponse.ok) {
                const data = await profileResponse.json()
                setProfile(data.profile)
                setNewProfile({
                    name: data.profile.name,
                    email: data.profile.email || "",
                    avatar_url: data.profile.avatar_url || "",
                    github_username: data.profile.github_username || "",
                    bio: data.profile.bio || ""
                })
            }

            setIsLoading(false)
        } catch (error) {
            console.error("Error loading data:", error)
            toast.error("데이터를 불러오는 중 오류가 발생했습니다.")
        }
    }

    const handleAddCategory = async () => {
        try {
            const response = await fetch("/api/admin/categories", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
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
        try {
            const response = await fetch(`/api/admin/categories/${categoryId}`, {
                method: "DELETE",
            })

            if (response.ok) {
                setCategories(categories.filter(cat => cat.id !== categoryId))
                toast.success("카테고리가 삭제되었습니다.")
            } else {
                const error = await response.json()
                toast.error(error.error || "카테고리 삭제에 실패했습니다.")
            }
        } catch (error) {
            toast.error("카테고리 삭제 중 오류가 발생했습니다.")
        }
    }

    const handleUpdateProfile = async () => {
        try {
            const response = await fetch("/api/admin/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newProfile),
            })

            if (response.ok) {
                const data = await response.json()
                setProfile(data.profile)
                toast.success("프로필이 업데이트되었습니다.")
            } else {
                const error = await response.json()
                toast.error(error.error || "프로필 업데이트에 실패했습니다.")
            }
        } catch (error) {
            toast.error("프로필 업데이트 중 오류가 발생했습니다.")
        }
    }

    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen">로딩 중...</div>
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="container mx-auto py-8 space-y-8">
                <h1 className="text-3xl font-bold mb-8">프로필 설정</h1>

                {/* 프로필 설정 */}
                <Card>
                    <CardHeader>
                        <CardTitle>프로필 정보</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">이름</Label>
                            <Input
                                id="name"
                                value={newProfile.name}
                                onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">이메일</Label>
                            <Input
                                id="email"
                                type="email"
                                value={newProfile.email}
                                onChange={(e) => setNewProfile({ ...newProfile, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="avatar_url">프로필 이미지 URL</Label>
                            <Input
                                id="avatar_url"
                                value={newProfile.avatar_url}
                                onChange={(e) => setNewProfile({ ...newProfile, avatar_url: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="github_username">GitHub 사용자명</Label>
                            <Input
                                id="github_username"
                                value={newProfile.github_username}
                                onChange={(e) => setNewProfile({ ...newProfile, github_username: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bio">소개</Label>
                            <Textarea
                                id="bio"
                                value={newProfile.bio}
                                onChange={(e) => setNewProfile({ ...newProfile, bio: e.target.value })}
                                placeholder="자신을 소개해주세요..."
                                className="min-h-[100px]"
                            />
                        </div>
                        <Button onClick={handleUpdateProfile}>프로필 업데이트</Button>
                    </CardContent>
                </Card>

                {/* 카테고리 관리 */}
                <Card>
                    <CardHeader>
                        <CardTitle>카테고리 관리</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="category-name">카테고리 이름</Label>
                                <Input
                                    id="category-name"
                                    value={newCategory.name}
                                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
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

                        <div className="space-y-2">
                            <h3 className="font-semibold">현재 카테고리</h3>
                            <div className="space-y-2">
                                {categories.map((category) => (
                                    <div
                                        key={category.id}
                                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                                    >
                                        <div>
                                            <span className="font-medium">{category.name}</span>
                                            <span className="text-gray-500 ml-2">({category.slug})</span>
                                        </div>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDeleteCategory(category.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}