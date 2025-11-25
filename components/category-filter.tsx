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
}

export function CategoryFilter({ categories }: CategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedCategory = searchParams.get("category") || "All"

  const handleCategoryClick = (categoryName: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (categoryName === "All") {
      params.delete("category")
    } else {
      params.set("category", categoryName)
    }
    params.set("page", "1") // 카테고리 변경 시 첫 페이지로
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-900">카테고리</h3>
      <div className="space-y-2">
        <button
          onClick={() => handleCategoryClick("All")}
          className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
            selectedCategory === "All"
              ? "bg-blue-100 text-blue-700"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          전체
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.name)}
            className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
              selectedCategory === category.name
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {category.name}
            <Badge variant="secondary" className="ml-2 text-xs">
              {category.postCount}
            </Badge>
          </button>
        ))}
      </div>
    </div>
  )
}
