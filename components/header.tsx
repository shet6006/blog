"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, X, Github, Settings, LogOut, PenTool } from "lucide-react"
import { toast } from "sonner"
import { LoginModal } from "./login-modal"
import { Profile } from "@/lib/profile"


export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<{ id: string; username: string } | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // 페이지 로드 시 로그인 상태 확인
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/check")
      if (response.ok) {
        const data = await response.json()
        setIsLoggedIn(true)
        setUser(data.user)
        
        // 프로필 정보 가져오기
        const profileResponse = await fetch("/api/admin/profile")
        if (profileResponse.ok) {
          const profileData = await profileResponse.json()
          setProfile(profileData.profile)
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error)
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      })

      if (response.ok) {
        setIsLoggedIn(false)
        setUser(null)
        toast.success("로그아웃 성공")
        router.push("/")
      }
    } catch (error) {
      console.error("Logout failed:", error)
      toast.error("로그아웃 중 오류가 발생했습니다.")
    }
  }

  return (
    <>
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="font-bold text-xl text-gray-900">Blog</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
                홈
              </Link>
              <Link href="/categories" className="text-gray-700 hover:text-blue-600 transition-colors">
                카테고리
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">
                소개
              </Link>
              <Link href="/api-docs" className="text-gray-700 hover:text-blue-600 transition-colors">
                API 문서
              </Link>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {isLoggedIn ? (
                <div className="flex items-center space-x-3">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/admin/write">
                      <PenTool className="w-4 h-4 mr-2" />
                      글쓰기
                    </Link>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Avatar className="cursor-pointer">
                        <AvatarImage src={profile?.avatar_url || "/placeholder.png?height=32&width=32"} />
                        <AvatarFallback>{profile?.name?.[0] || user?.username?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem asChild>
                        <Link href="/admin/dashboard">
                          <Settings className="w-4 h-4 mr-2" />
                          관리자 대시보드
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/profile">
                          <Settings className="w-4 h-4 mr-2" />
                          프로필 설정
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="w-4 h-4 mr-2" />
                        로그아웃
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <Button onClick={() => setIsLoginModalOpen(true)} size="sm">
                  로그인
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t bg-white">
              <nav className="py-4 space-y-2">
                <Link
                  href="/"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  홈
                </Link>
                <Link
                  href="/categories"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  카테고리
                </Link>
                <Link
                  href="/about"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  소개
                </Link>
                <Link
                  href="/api-docs"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  API 문서
                </Link>
                <div className="px-4 py-2">
                  {isLoggedIn ? (
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <Link href="/admin/write">
                          <PenTool className="w-4 h-4 mr-2" />
                          글쓰기
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <Link href="/admin/dashboard">
                          <Settings className="w-4 h-4 mr-2" />
                          관리자 대시보드
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
                        <LogOut className="w-4 h-4 mr-2" />
                        로그아웃
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={() => setIsLoginModalOpen(true)} size="sm" className="w-full">
                      <Github className="w-4 h-4 mr-2" />
                      GitHub 로그인
                    </Button>
                  )}
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={() => {
          setIsLoggedIn(true)
          checkAuthStatus()
        }}
      />
    </>
  )
}
