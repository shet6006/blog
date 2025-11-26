"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"

interface AuthContextType {
  isLoggedIn: boolean
  user: { id: string; name: string } | null
  isLoading: boolean
  checkAuth: () => Promise<void>
  clearAuth: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// 인증 상태 캐시 (전역)
let authCache: {
  isLoggedIn: boolean
  user: { id: string; name: string } | null
  timestamp: number
} | null = null

const CACHE_DURATION = 60000 // 1분 캐시

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<{ id: string; name: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkAuth = useCallback(async () => {
    // 캐시 확인
    if (authCache && Date.now() - authCache.timestamp < CACHE_DURATION) {
      setIsLoggedIn(authCache.isLoggedIn)
      setUser(authCache.user)
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/check", {
        credentials: "include",
      })
      
      if (response.ok) {
        const data = await response.json()
        const authData = {
          isLoggedIn: true,
          user: data.user,
          timestamp: Date.now(),
        }
        authCache = authData
        setIsLoggedIn(true)
        setUser(data.user)
      } else {
        const authData = {
          isLoggedIn: false,
          user: null,
          timestamp: Date.now(),
        }
        authCache = authData
        setIsLoggedIn(false)
        setUser(null)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      const authData = {
        isLoggedIn: false,
        user: null,
        timestamp: Date.now(),
      }
      authCache = authData
      setIsLoggedIn(false)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearAuth = useCallback(() => {
    authCache = null
    setIsLoggedIn(false)
    setUser(null)
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, isLoading, checkAuth, clearAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

