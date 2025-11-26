"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Profile } from "@/lib/profile"
import { Header } from "@/components/header"

export default function ProfilePage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [profile, setProfile] = useState<Profile | null>(null)
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

            // 프로필 데이터 로드
            const profileResponse = await fetch("/api/admin/profile", {
                credentials: "include",
            })
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

            </div>
        </div>
    )
}