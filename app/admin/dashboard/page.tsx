import { Header } from "@/components/header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { PostsTable } from "@/components/posts-table"
import { StatsCards } from "@/components/stats-cards"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PenTool } from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <AdminSidebar />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-4 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
                <p className="text-gray-600 mt-1">블로그 관리 및 통계를 확인하세요</p>
              </div>
              <Button asChild>
                <Link href="/admin/write">
                  <PenTool className="w-4 h-4 mr-2" />새 글 작성
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <StatsCards />

            {/* Recent Posts */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>최근 게시글</CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/admin/posts">모든 게시글 보기</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <PostsTable />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
