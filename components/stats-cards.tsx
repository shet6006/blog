"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Heart, MessageCircle, Users } from "lucide-react"

interface Stats {
  totalPosts: number
  totalLikes: number
  totalComments: number
  totalVisitors: number
}

export function StatsCards() {
  const [stats, setStats] = useState<Stats>({
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0,
    totalVisitors: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats")
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      }
    }

    fetchStats()
  }, [])

  const statsData = [
    {
      title: "총 게시글",
      value: stats.totalPosts.toString(),
      icon: FileText,
    },
    {
      title: "총 좋아요",
      value: stats.totalLikes.toString(),
      icon: Heart,
    },
    {
      title: "총 댓글",
      value: stats.totalComments.toString(),
      icon: MessageCircle,
    },
    {
      title: "총 방문자",
      value: stats.totalVisitors.toString(),
      icon: Users,
    },
  ]

  const gridCols = statsData.length === 4 ? "md:grid-cols-4" : "md:grid-cols-3"
  
  return (
    <div className={`grid grid-cols-1 ${gridCols} gap-6`}>
      {statsData.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
