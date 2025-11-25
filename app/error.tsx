"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">오류가 발생했습니다</h1>
        <p className="text-gray-600 mb-8">{error.message || "알 수 없는 오류가 발생했습니다."}</p>
        <div className="flex gap-4 justify-center">
          <Button onClick={reset}>다시 시도</Button>
          <Button variant="outline" onClick={() => window.location.href = "/"}>
            홈으로 이동
          </Button>
        </div>
      </div>
    </div>
  )
}

