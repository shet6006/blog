"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement search functionality
    console.log("Searching for:", searchQuery)
  }

  return (
    <form onSubmit={handleSearch} className="space-y-2">
      <h3 className="font-semibold text-gray-900">검색</h3>
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="게시글 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="sm" variant="outline">
          <Search className="w-4 h-4" />
        </Button>
      </div>
    </form>
  )
}
