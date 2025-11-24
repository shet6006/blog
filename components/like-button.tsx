"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/components/ui/use-toast"
import { getDeviceId } from "@/lib/device-id"

interface LikeButtonProps {
  postSlug: string
  initialCount?: number
  initialLiked?: boolean
}

export function LikeButton({ postSlug, initialCount = 0, initialLiked = false }: LikeButtonProps) {
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
      } catch (error) {
        console.error("좋아요 상태 조회 실패:", error)
      }
    }

    fetchLikeStatus()
  }, [postSlug, deviceId])

  const handleLike = async () => {
    if (isLoading) return

    try {
      setIsLoading(true)
      const response = await apiClient.toggleLike(postSlug, deviceId) as { liked: boolean; count: number }
      setLiked(response.liked)
      setCount(response.count)
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
      size="sm"
      onClick={handleLike}
      disabled={isLoading}
      className={liked ? "bg-red-500 hover:bg-red-600" : "text-gray-500 hover:text-red-500"}
    >
      <Heart className={`w-4 h-4 mr-2 ${liked ? "fill-current" : ""}`} />
      {count}
    </Button>
  )
}
