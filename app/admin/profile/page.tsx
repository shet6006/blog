"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Profile } from "@/lib/profile"
import { getApiBaseUrl } from "@/lib/api-client"
import { Header } from "@/components/header"
import { FormSkeleton } from "@/components/page-skeleton"
import { ImageIcon, Upload } from "lucide-react"

export default function ProfilePage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
    const avatarInputRef = useRef<HTMLInputElement | null>(null)
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
            const response = await fetch(`${getApiBaseUrl()}/api/auth/check`, {
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
            const profileResponse = await fetch(`${getApiBaseUrl()}/api/admin/profile`, {
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
            const response = await fetch(`${getApiBaseUrl()}/api/admin/profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
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

    const handleAvatarSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        event.target.value = ""
        if (!file) return

        const formData = new FormData()
        formData.append("file", file)
        try {
            setIsUploadingAvatar(true)
            const response = await fetch(`${getApiBaseUrl()}/api/uploads/image`, {
                method: "POST",
                credentials: "include",
                body: formData,
            })
            const data = await response.json()
            if (!response.ok || !data.url) throw new Error(data.error || "이미지 업로드에 실패했습니다.")
            const avatarUrl = `${getApiBaseUrl()}${data.url}`
            setNewProfile((current) => ({ ...current, avatar_url: avatarUrl }))
            toast.success("프로필 이미지가 업로드됐습니다. 프로필 업데이트를 눌러 저장해주세요.")
        } catch (error: any) {
            toast.error(error.message || "프로필 이미지 업로드에 실패했습니다.")
        } finally {
            setIsUploadingAvatar(false)
        }
    }

    if (isLoading) {
        return <FormSkeleton />
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
                        <div className="space-y-3">
                            <Label htmlFor="avatar_url">프로필 이미지</Label>
                            <div className="flex flex-col gap-5 rounded-xl border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center">
                                <img
                                    src={newProfile.avatar_url || "/default-profile.svg"}
                                    alt="프로필 미리보기"
                                    className="h-28 w-28 shrink-0 rounded-full border border-slate-200 bg-white object-cover"
                                />
                                <div className="min-w-0 flex-1 space-y-3">
                                    <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="hidden" onChange={handleAvatarSelected} />
                                    <div className="flex flex-wrap gap-2">
                                        <Button type="button" variant="outline" onClick={() => avatarInputRef.current?.click()} disabled={isUploadingAvatar}>
                                            <Upload className="mr-2 h-4 w-4" />
                                            {isUploadingAvatar ? "업로드 중..." : "사진 선택"}
                                        </Button>
                                        {newProfile.avatar_url && (
                                            <Button type="button" variant="ghost" onClick={() => setNewProfile({ ...newProfile, avatar_url: "" })}>기본 이미지로 변경</Button>
                                        )}
                                    </div>
                                    <p className="text-sm leading-6 text-slate-500">JPG, PNG, GIF, WebP 파일을 업로드할 수 있습니다. 정사각형 이미지가 가장 자연스럽습니다.</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="avatar_url" className="text-xs text-slate-500">이미지 URL (선택)</Label>
                                <div className="relative">
                                    <ImageIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input id="avatar_url" className="pl-9" value={newProfile.avatar_url} onChange={(e) => setNewProfile({ ...newProfile, avatar_url: e.target.value })} placeholder="직접 URL을 입력해도 됩니다." />
                                </div>
                            </div>
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
