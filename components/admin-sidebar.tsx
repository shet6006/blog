"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { LayoutDashboard, FileText, FolderOpen, MessageCircle, Settings, BarChart3 } from "lucide-react"

const menuItems = [
  {
    href: "/admin/dashboard",
    label: "대시보드",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/posts",
    label: "게시글 관리",
    icon: FileText,
  },
  {
    href: "/admin/categories",
    label: "카테고리 관리",
    icon: FolderOpen,
  },
  {
    href: "/admin/comments",
    label: "댓글 관리",
    icon: MessageCircle,
  },
  {
    href: "/admin/analytics",
    label: "통계",
    icon: BarChart3,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <Card>
      <CardContent className="p-6">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </CardContent>
    </Card>
  )
}
