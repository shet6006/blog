"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"

interface PostPaginationProps {
  currentPage: number
  totalPages: number
}

function visiblePages(currentPage: number, totalPages: number) {
  const count = Math.min(totalPages, 5)
  const start = Math.max(1, Math.min(currentPage - 2, totalPages - count + 1))
  return Array.from({ length: count }, (_, index) => start + index)
}

export function PostPagination({ currentPage, totalPages }: PostPaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  const goToPage = (page: number) => {
    const nextPage = Math.max(1, Math.min(page, totalPages))
    if (nextPage === currentPage) return
    const params = new URLSearchParams(searchParams.toString())
    if (nextPage === 1) params.delete("page")
    else params.set("page", String(nextPage))
    const query = params.toString()
    router.push(`${pathname}${query ? `?${query}` : ""}#posts`)
  }

  return (
    <nav className="mt-12 flex justify-center" aria-label="게시글 페이지">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => goToPage(currentPage - 1)}>
          이전
        </Button>
        {visiblePages(currentPage, totalPages).map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            aria-current={page === currentPage ? "page" : undefined}
            onClick={() => goToPage(page)}
          >
            {page}
          </Button>
        ))}
        <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => goToPage(currentPage + 1)}>
          다음
        </Button>
      </div>
    </nav>
  )
}
