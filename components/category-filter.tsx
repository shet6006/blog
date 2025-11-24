"use client"

import { useState } from "react"
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
  const [selectedCategory, setSelectedCategory] = useState("All")

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-900">카테고리</h3>
      <div className="space-y-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.name)}
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
