"use client"

import { useState, useEffect, type FormEvent } from "react"
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
import { Menu, X, Github, Settings, LogOut, PenTool, Search } from "lucide-react"
import { toast } from "sonner"
import { LoginModal } from "./login-modal"
import { Profile } from "@/lib/profile"
import { getApiBaseUrl } from "@/lib/api-client"


export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<{ id: string; username: string } | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  useEffect(() => {
    // 페이지 로드 시 로그인 상태 확인
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      // 개발 환경에서만 상세 로깅
      if (process.env.NODE_ENV === "development") {
        console.log("🔍 [Header] 인증 상태 확인:", {
          url: "/api/auth/check",
          cookies: document.cookie,
        })
      }
      
      const response = await fetch(`${getApiBaseUrl()}/api/auth/check`, {
        credentials: "include", // 쿠키 자동 전송
      })
      
      if (process.env.NODE_ENV === "development") {
        console.log("📡 [Header] 응답:", {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
        })
      }
      
      if (response.ok) {
        const data = await response.json()
        
        // authenticated 필드로 로그인 상태 확인
        if (data.authenticated && data.user) {
          setIsLoggedIn(true)
          setUser(data.user)
          
          // 프로필 정보 가져오기
          const profileResponse = await fetch(`${getApiBaseUrl()}/api/admin/profile`, {
            credentials: "include",
          })
          if (profileResponse.ok) {
            const profileData = await profileResponse.json()
            setProfile(profileData.profile)
          }
        } else {
          // 로그인하지 않은 상태 (정상)
          setIsLoggedIn(false)
          setUser(null)
        }
      } else {
        // 응답이 ok가 아닌 경우 (서버 오류 등)
        if (process.env.NODE_ENV === "development") {
          console.warn("⚠️ [Header] 인증 확인 실패:", response.status)
        }
        setIsLoggedIn(false)
        setUser(null)
      }
    } catch (error) {
      console.error("❌ [Header] 인증 확인 중 오류:", error)
      setIsLoggedIn(false)
      setUser(null)
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
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

  const handleSearch = (event: FormEvent) => {
    event.preventDefault()
    const query = searchQuery.trim()
    router.push(query ? `/?search=${encodeURIComponent(query)}` : "/")
    setIsMenuOpen(false)
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-blue-700 bg-blue-600">
        <div className="mx-auto max-w-[1480px] px-5 lg:px-8">
          <div className="relative flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
                <span className="text-sm font-bold text-blue-600">D</span>
              </div>
              <span className="text-xl font-bold text-white">DDONG's</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-10 md:flex">
              <Link href="/" className="text-blue-100 transition-colors hover:text-white">
                홈
              </Link>
              <span aria-hidden="true" className="text-blue-200/60">·</span>
              <Link href="/categories" className="text-blue-100 transition-colors hover:text-white">
                카테고리
              </Link>
              <span aria-hidden="true" className="text-blue-200/60">·</span>
              <Link href="/portfolio" className="text-blue-100 transition-colors hover:text-white">
                포트폴리오
              </Link>
              <span aria-hidden="true" className="text-blue-200/60">·</span>
              <Link href="/about" className="text-blue-100 transition-colors hover:text-white">
                소개
              </Link>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden items-center space-x-3 md:flex">
              <form onSubmit={handleSearch} className="hidden h-9 items-center rounded-md border border-white/30 bg-white/10 px-3 lg:flex">
                <Search className="h-4 w-4 shrink-0 text-blue-100" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  aria-label="게시글 검색"
                  placeholder="검색"
                  className="w-28 bg-transparent px-2 text-sm text-white outline-none placeholder:text-blue-100/80 xl:w-36"
                />
              </form>
              {isLoggedIn ? (
                <div className="flex items-center space-x-3">
                  <Button variant="outline" size="sm" className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white" asChild>
                    <Link href="/admin/write">
                      <PenTool className="w-4 h-4 mr-2" />
                      글쓰기
                    </Link>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Avatar className="cursor-pointer">
                        <AvatarImage
                          src={profile?.avatar_url || "/default-profile.svg"}
                          alt={profile?.name ? `${profile.name} 프로필` : "기본 프로필"}
                        />
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
                <Button onClick={() => setIsLoginModalOpen(true)} size="sm" className="bg-white text-blue-700 hover:bg-blue-50">
                  로그인
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button className="p-2 text-white md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="border-t border-blue-500 bg-blue-600 md:hidden">
              <nav className="py-4 space-y-2">
                <form onSubmit={handleSearch} className="mx-4 mb-4 flex h-10 items-center rounded-md border border-white/30 bg-white/10 px-3">
                  <Search className="h-4 w-4 text-blue-100" />
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    aria-label="게시글 검색"
                    placeholder="게시글 검색"
                    className="min-w-0 flex-1 bg-transparent px-2 text-sm text-white outline-none placeholder:text-blue-100/80"
                  />
                </form>
                <Link
                  href="/"
                  className="block px-4 py-2 text-blue-50 hover:bg-white/10"
                  onClick={() => setIsMenuOpen(false)}
                >
                  홈
                </Link>
                <Link
                  href="/categories"
                  className="block px-4 py-2 text-blue-50 hover:bg-white/10"
                  onClick={() => setIsMenuOpen(false)}
                >
                  카테고리
                </Link>
                <Link
                  href="/portfolio"
                  className="block px-4 py-2 text-blue-50 hover:bg-white/10"
                  onClick={() => setIsMenuOpen(false)}
                >
                  포트폴리오
                </Link>
                <Link
                  href="/about"
                  className="block px-4 py-2 text-blue-50 hover:bg-white/10"
                  onClick={() => setIsMenuOpen(false)}
                >
                  소개
                </Link>
                <div className="px-4 py-2">
                  {isLoggedIn ? (
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white" asChild>
                        <Link href="/admin/write">
                          <PenTool className="w-4 h-4 mr-2" />
                          글쓰기
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" className="w-full border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white" asChild>
                        <Link href="/admin/dashboard">
                          <Settings className="w-4 h-4 mr-2" />
                          관리자 대시보드
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" className="w-full border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white" onClick={handleLogout}>
                        <LogOut className="w-4 h-4 mr-2" />
                        로그아웃
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={() => setIsLoginModalOpen(true)} size="sm" className="w-full bg-white text-blue-700 hover:bg-blue-50">
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

      <div aria-hidden="true" className="h-16" />

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
