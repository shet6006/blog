"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"

interface Category {
  id: number
  name: string
  postCount: number
}

interface CategoryFilterProps {
  categories: Category[]
  basePath?: string
  onNavigateStart?: () => void
}

export function CategoryFilter({ categories, basePath = "/", onNavigateStart }: CategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedCategory = searchParams.get("category") || "All"

  const handleCategoryClick = (categoryName: string) => {
    if (categoryName === selectedCategory) return
    onNavigateStart?.()
    const params = new URLSearchParams(searchParams.toString())
    if (categoryName === "All") {
      params.delete("category")
    } else {
      params.set("category", categoryName)
    }
    params.set("page", "1") // 카테고리 변경 시 첫 페이지로
    router.push(`${basePath}?${params.toString()}`)
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold tracking-tight text-gray-950">카테고리</h3>
      <div className="border-t border-gray-200">
        <button
          onClick={() => handleCategoryClick("All")}
          className={`block w-full border-b border-gray-100 px-0 py-3 text-left text-sm transition-colors ${
            selectedCategory === "All"
              ? "border-b-blue-600 font-semibold text-blue-600"
              : "text-gray-500 hover:text-gray-950"
          }`}
        >
          전체
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.name)}
            className={`flex w-full items-center justify-between border-b border-gray-100 px-0 py-3 text-left text-sm transition-colors ${
              selectedCategory === category.name
                ? "border-b-blue-600 font-semibold text-blue-600"
                : "text-gray-500 hover:text-gray-950"
            }`}
          >
            {category.name}
            <Badge variant="secondary" className="ml-2 rounded-full bg-gray-100 text-xs font-normal text-gray-500">
              {category.postCount}
            </Badge>
          </button>
        ))}
      </div>
    </div>
  )
}
