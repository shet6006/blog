"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { getDeviceId } from "@/lib/device-id"

interface LikeButtonProps {
  postSlug: string
  initialCount?: number
  initialLiked?: boolean
  onCountChange?: (count: number) => void
}

export function LikeButton({ postSlug, initialCount = 0, initialLiked = false, onCountChange }: LikeButtonProps) {
  const [count, setCount] = useState(initialCount)
  const [liked, setLiked] = useState(initialLiked)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const deviceId = getDeviceId()

  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        const response = await apiClient.getLikeStatus(postSlug, deviceId) as { liked: boolean; count: number }
        setCount(response.count)
        setLiked(response.liked)
        onCountChange?.(response.count)
      } catch (error) {
        console.error("좋아요 상태 조회 실패:", error)
      }
    }

    fetchLikeStatus()
  }, [postSlug, deviceId, onCountChange])

  const handleLike = async () => {
    if (isLoading) return

    try {
      setIsLoading(true)
      const response = await apiClient.toggleLike(postSlug, deviceId) as { liked: boolean; count: number }
      setLiked(response.liked)
      setCount(response.count)
      onCountChange?.(response.count)
      toast({
        title: response.liked ? "좋아요를 눌렀습니다." : "좋아요를 취소했습니다.",
      })
    } catch (error) {
      console.error("좋아요 처리 실패:", error)
      toast({
        title: "좋아요 처리에 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={liked ? "default" : "outline"}
      onClick={handleLike}
      disabled={isLoading}
      className={liked
        ? "h-11 rounded-full bg-blue-600 px-6 text-white hover:bg-blue-700"
        : "h-11 rounded-full border-gray-300 px-6 text-gray-600 hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600"}
    >
      <Heart className={`mr-2 h-4 w-4 ${liked ? "fill-current" : ""}`} />
      좋아요 {count}
    </Button>
  )
}
